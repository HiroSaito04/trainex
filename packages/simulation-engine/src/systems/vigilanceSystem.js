/** Authoritative vigilance monitoring: no component or ESP32 may keep its own
 * penalty timer. Only qualifying movement/acknowledgement resets the timer.
 * Trip is latched until a separate explicit vigilance acknowledgement; the
 * emergency brake remains latched and requires its normal reset procedure.
 */
export function advanceVigilance(state, seconds, config) {
  if (state.vigilanceTrip) return state;
  // PNR requirement: active at speeds >= 10 km/h. Do not accumulate time
  // while below threshold; a later qualifying run begins a fresh interval.
  if (state.speed < config.movementThresholdKmh) {
    return (state.vigilanceElapsedSeconds === 0 && !state.vigilanceWarning && !state.vigilanceBuzzer)
      ? state
      : {...state, vigilanceElapsedSeconds: 0, vigilanceWarning: false, vigilanceBuzzer: false};
  }
  const elapsed = Math.min(config.tripAfterSeconds, state.vigilanceElapsedSeconds + seconds);
  const trip = elapsed + 1e-8 >= config.tripAfterSeconds;
  return {
    ...state,
    vigilanceElapsedSeconds: elapsed,
    vigilanceWarning: elapsed + 1e-8 >= config.warningAfterSeconds,
    // Buzzer starts AFTER the 2.5-second visual-only interval. On penalty
    // application it stops; the latched trip indicator remains visible.
    vigilanceBuzzer: !trip && elapsed + 1e-8 >= config.buzzerAfterSeconds,
    vigilanceTrip: trip,
    emergencyBrake: state.emergencyBrake || trip,
  };
}
