import {safeEqual} from './deviceAuthentication.js';
import {validSessionId} from './sessionAuthentication.js';
export function authorizePairing({deviceId,sessionId,pairingCode},devices){
 return validSessionId(sessionId)&&!!devices[deviceId]&&safeEqual(devices[deviceId].pairingCode,pairingCode);
}
