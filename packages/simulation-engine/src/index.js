export { TrainSimulationEngine } from './core/TrainSimulationEngine.js';
export { createEngine } from './core/createEngine.js';
export { TRAIN_DYNAMICS } from './config/trainDynamics.js';
export { DOOR_CONFIGURATION } from './config/doorConfiguration.js';
export { OPERATING_RULES } from './config/operatingRules.js';
export { createInitialState } from './state/createInitialState.js';
export {
  selectSpeed, selectMasterHandle, selectDoorState,
  selectAllDoorsClosed, selectEmergencyBrake, selectDisplayState,
} from './state/stateSelectors.js';
