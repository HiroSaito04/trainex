import { TRAIN_DYNAMICS } from '../config/trainDynamics.js';
import { DOOR_CONFIGURATION } from '../config/doorConfiguration.js';
import { OPERATING_RULES } from '../config/operatingRules.js';
import { createInitialState } from '../state/createInitialState.js';
import { createStateStore } from './stateStore.js';
import { processCommand } from './commandProcessor.js';
import { createTickScheduler } from './tickScheduler.js';
import { createSimulationEventPublisher } from '../events/simulationEventPublisher.js';
import { SessionManager } from '../sessions/SessionManager.js';
import { advancePassengerDoors } from '../systems/passengerDoorSystem.js';
import { updateIndications } from '../systems/indicationSystem.js';
import { advanceMotion } from '../systems/motionSystem.js';

function numericConfig(base, override, label) {
  const config = { ...base, ...override };
  for (const [key, value] of Object.entries(config)) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`${label}.${key} must be a positive finite number.`);
    }
  }
  return Object.freeze(config);
}

export class TrainSimulationEngine {
  #store;
  #events;
  #sessions;
  #scheduler;
  #dynamics;
  #doors;
  #rules;

  constructor({ autoTick = false, dynamics = {}, doors = {}, rules = {} } = {}) {
    this.#dynamics = numericConfig(TRAIN_DYNAMICS, dynamics, 'dynamics');
    this.#doors = numericConfig(DOOR_CONFIGURATION, doors, 'doors');
    this.#rules = Object.freeze({ ...OPERATING_RULES, ...rules });
    this.#store = createStateStore(createInitialState());
    this.#events = createSimulationEventPublisher();
    this.#sessions = new SessionManager();
    this.#scheduler = autoTick ? createTickScheduler((dt) => this.step(dt)) : null;
  }

  getState = () => this.#store.getState();
  subscribe = (listener) => this.#store.subscribe(listener);
  onEvent = (listener) => this.#events.subscribe(listener);
  getSessionStatus = () => this.#sessions.getStatus();
  getSessionInfo = () => this.#sessions.getInfo();

  #notifySessionChange() {
    const session = this.#sessions.getInfo();
    this.#store.setState({ ...this.getState(), sessionStatus: session.status, sessionId: session.sessionId });
  }

  startSession = (options = {}) => {
    const started = this.#sessions.start(options.sessionId);
    if (!started.ok) return { accepted: false, reason: started.reason };
    this.#store.setState({ ...createInitialState(), sessionStatus: 'RUNNING', sessionId: started.sessionId });
    this.#scheduler?.start();
    this.#events.emit({ type: 'SESSION_STARTED', sessionId: started.sessionId });
    return { accepted: true, sessionId: started.sessionId };
  };

  pauseSession = () => {
    const result = this.#sessions.pause();
    if (!result.ok) return { accepted: false, reason: result.reason };
    this.#scheduler?.stop();
    this.#notifySessionChange();
    this.#events.emit({ type: 'SESSION_PAUSED' });
    return { accepted: true };
  };

  resumeSession = () => {
    const result = this.#sessions.resume();
    if (!result.ok) return { accepted: false, reason: result.reason };
    this.#scheduler?.start();
    this.#notifySessionChange();
    this.#events.emit({ type: 'SESSION_RESUMED' });
    return { accepted: true };
  };

  resetSession = () => {
    const result = this.#sessions.reset();
    if (!result.ok) return { accepted: false, reason: result.reason };
    this.#scheduler?.stop();
    this.#store.setState({ ...createInitialState(), sessionStatus: 'PAUSED', sessionId: this.#sessions.getSessionId() });
    this.#events.emit({ type: 'SESSION_RESET' });
    return { accepted: true };
  };

  endSession = () => {
    const result = this.#sessions.end();
    if (!result.ok) return { accepted: false, reason: result.reason };
    this.#scheduler?.stop();
    this.#notifySessionChange();
    this.#events.emit({ type: 'SESSION_ENDED' });
    return { accepted: true };
  };

  sendCommand = (command) => {
    if (this.getSessionStatus() !== 'RUNNING') {
      return { accepted: false, reason: 'Session must be running.' };
    }
    if (command?.sessionId != null && command.sessionId !== this.#sessions.getSessionId()) {
      return { accepted: false, reason: 'Command targets a different session.' };
    }
    const result = processCommand(this.getState(), command, {
      doors: this.#doors, rules: this.#rules,
    });
    if (!result.accepted) {
      this.#events.emit({ type: 'COMMAND_REJECTED', commandType: command?.type, reason: result.reason });
      return { accepted: false, reason: result.reason };
    }
    const before = this.getState();
    const next = updateIndications(result.nextState);
    this.#store.setState(next);
    if (next.doorState !== before.doorState) {
      this.#events.emit({ type: 'DOOR_STATE_CHANGED', doorState: next.doorState });
    }
    this.#events.emit({ type: 'COMMAND_ACCEPTED', commandType: result.type, source: command.source ?? null });
    return { accepted: true };
  };

  // Deterministic simulation stepping; use autoTick=true only when mounted.
  step = (seconds) => {
    if (this.getSessionStatus() !== 'RUNNING') return false;
    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 3600) {
      throw new RangeError('step(seconds) requires a value in (0, 3600].');
    }
    // Fixed maximum substeps make large manual steps behave like small ones.
    let remaining = seconds;
    const initialDoorState = this.getState().doorState;
    let state = this.getState();
    while (remaining > 0) {
      const dt = Math.min(0.05, remaining);
      const withDoors = updateIndications(advancePassengerDoors(state, dt, this.#doors));
      const moved = advanceMotion(withDoors, dt, this.#dynamics, this.#rules);
      state = { ...moved, elapsedSeconds: moved.elapsedSeconds + dt };
      remaining = Math.max(0, remaining - dt);
    }
    this.#store.setState(state);
    if (state.doorState !== initialDoorState) {
      this.#events.emit({ type: 'DOOR_STATE_CHANGED', doorState: state.doorState });
    }
    this.#events.emit({ type: 'STATE_UPDATED', elapsedSeconds: state.elapsedSeconds });
    return true;
  };

  destroy = () => {
    this.#scheduler?.stop();
  };
}
