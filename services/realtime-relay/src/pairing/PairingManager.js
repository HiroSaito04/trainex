import {authorizePairing} from '../authentication/pairingAuthorization.js';
import {sendJson} from '../routing/MessageRouter.js';
export class PairingManager {
 constructor({devices,deviceRegistry,sessionRegistry}){this.devices=devices;this.deviceRegistry=deviceRegistry;this.sessions=sessionRegistry}
 pair(browser,message){
  const {deviceId,sessionId,pairingCode}=message;
  if(!authorizePairing({deviceId,sessionId,pairingCode},this.devices))return {ok:false,reason:'Invalid device/session or pairing code'};
  const already=this.sessions.devicePair(deviceId);
  if(already&&already.browserSocket!==browser)return {ok:false,reason:'Device is already paired'};
  const device=this.deviceRegistry.get(deviceId);
  if(!device||device.readyState!==1)return {ok:false,reason:'Device offline'};
  const pair=this.sessions.pair({deviceId,sessionId,browserSocket:browser,deviceSocket:device});
  sendJson(browser,{type:'paired',deviceId,sessionId});
  sendJson(device,{type:'paired',deviceId,sessionId});
  return {ok:true,pair};
 }
}
