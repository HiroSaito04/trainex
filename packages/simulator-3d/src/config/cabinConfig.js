export const CABIN_MODEL_URL='/models/cabin/trainex_cabin.glb';
export const CABIN_DISPLAY_NAME='TRAINEX Driver Cabin';
// Driver faces negative Z. Brake positions tilt toward +Z/rear; power tilts toward -Z/front.
export const CABIN_ANIMATION=Object.freeze({
 masterHandle:{axis:'x',angles:{EB:.65,B3:.49,B2:.33,B1:.17,N:0,P1:-.17,P2:-.33,P3:-.50}},
 buttonPress:{axis:'y',distance:.008},
 speedometer:{maxKmh:120,minAngle:-2.10,maxAngle:2.10}
});
