import {timingSafeEqual} from 'node:crypto';
export function safeEqual(a,b){
 if(typeof a!=='string'||typeof b!=='string')return false;
 const left=Buffer.from(a),right=Buffer.from(b);
 return left.length===right.length && timingSafeEqual(left,right);
}
export function authenticateDevice(deviceId,token,devices){
 const known=devices[deviceId];return !!known && safeEqual(token,known.token);
}
