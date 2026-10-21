// Preserve the existing front-facing driver eye as the starting view.
// Interior-only rectangular collision envelope; 360 degree yaw is unrestricted.
export const CAMERA_CONFIG=Object.freeze({
 fov:66,near:.03,far:35,
 driverPosition:[0,1.67,1.76],driverTarget:[0,1.55,-.52],
 bounds:{x:[-1.65,1.75],y:[1.32,1.85],z:[-1.25,1.76]},
 moveSpeed:.72,lookSensitivity:.0042,pitchLimit:1.44
});
