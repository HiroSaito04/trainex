// TRAINEX essential parameters: acceleration figure is specified for 0–30 km/h only.
// Constant traction above 30 km/h is an explicitly provisional simulator approximation.
export const TRAIN_DYNAMICS=Object.freeze({
 maxSpeedKmh:120, tractionAccelerationMps2:0.916667,
 serviceBrakeDecelerationMps2:1.166667,emergencyBrakeDecelerationMps2:1.305556,
 coastingResistanceMps2:0.08, jerkLimitMps3:1.1,
 emergencyReleaseSeconds:3,serviceApplicationSeconds:1.5,serviceReleaseSeconds:2,
 emergencyApplicationSeconds:1.5,
 // DISPLAY-ONLY training approximations; no NSCR cylinder/pipe pressure curve provided.
 referenceBrakeCylinderKpa:350,referenceBrakePipeKpa:500,
});
