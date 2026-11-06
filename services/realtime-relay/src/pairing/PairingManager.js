import {authorizePairing} from '../authentication/pairingAuthorization.js';
import {safeEqual} from '../authentication/deviceAuthentication.js';
import {sendJson} from '../routing/MessageRouter.js';

export class PairingManager {
  constructor({devices,deviceRegistry,sessionRegistry}) {
    this.devices = devices;
    this.deviceRegistry = deviceRegistry;
    this.sessions = sessionRegistry;
  }
  resolveDeviceId(message) {
    if (typeof message.deviceId === 'string' && message.deviceId) return message.deviceId;
    // The TRAINEX UI has no separate device ID field. A unique pairing code
    // can select the connected console without exposing a device directory.
    const matches = Object.entries(this.devices).filter(([,d]) =>
      typeof message.pairingCode === 'string' && safeEqual(d.pairingCode,message.pairingCode));
    return matches.length === 1 ? matches[0][0] : null;
  }
  pair(browser,message) {
    const deviceId = this.resolveDeviceId(message);
    const {sessionId,pairingCode} = message;
    if (!deviceId || !authorizePairing({deviceId,sessionId,pairingCode},this.devices))
      return {ok:false,reason:'Invalid device, session or pairing code'};
    const already = this.sessions.devicePair(deviceId);
    if (already && already.browserSocket !== browser)
      return {ok:false,reason:'Device is already paired'};
    const socket = this.deviceRegistry.get(deviceId);
    if (!socket || socket.readyState !== 1) return {ok:false,reason:'Device offline'};
    const existing = this.sessions.browserPair(browser);
    if (existing && existing.deviceId !== deviceId) {
      this.sessions.removeBrowser(browser);
      sendJson(existing.deviceSocket,{type:'unpaired'});
    }
    const pair = this.sessions.pair({deviceId,sessionId,browserSocket:browser,deviceSocket:socket});
    sendJson(browser,{type:'paired',deviceId,sessionId});
    sendJson(socket,{type:'paired',deviceId,sessionId});
    return {ok:true,pair};
  }
}
