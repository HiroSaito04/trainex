/** PNR Train Sets – Technical Specifications reference, CDRL vigilance/dead-man sequence.
 * Times are simulated seconds of qualifying operation (speed >= 10 km/h).
 * Verify any further UIC 641 / fleet-specific requirements with railway experts.
 */
export const VIGILANCE_CONFIGURATION = Object.freeze({
  warningAfterSeconds: 30,
  buzzerAfterSeconds: 32.5,
  tripAfterSeconds: 35,
  movementThresholdKmh: 10,
});
