import {authenticateDevice} from '../authentication/deviceAuthentication.js';
import {authenticateBrowser} from '../authentication/sessionAuthentication.js';
import {sendJson} from '../routing/MessageRouter.js';
import {handleDeviceMessage} from '../handlers/DeviceMessageHandler.js';
import {handleBrowserMessage} from '../handlers/BrowserMessageHandler.js';
import {isAllowedBrowserOrigin} from '../security/originPolicy.js';
import {logEvent} from '../monitoring/logger.js';

const maximumBytes=4096;
export function createConnectionHandler({config,devices,sessions,router,pairing,rateLimiter}){
 return (ws,request)=>{
  const origin=request.headers.origin;
  // Device clients generally omit Origin; browser must supply an allowed Origin.
  const peer={ws,role:null,deviceId:null,lastSeen:Date.now()};
  let authenticated=false;
  const timeout=setTimeout(()=>{if(!authenticated)ws.close(4001,'Authentication timeout')},5000);
  const timeoutMonitor=setInterval(()=>{if(Date.now()-peer.lastSeen>config.heartbeatTimeoutMs)ws.close(4002,'Heartbeat timeout')},15000);
  ws.on('message',(data,isBinary)=>{
   peer.lastSeen=Date.now();
   if(isBinary||data.byteLength>maximumBytes){ws.close(1009,'Message too large');return}
   let msg;try{msg=JSON.parse(data.toString('utf8'))}catch{sendJson(ws,{type:'error',reason:'Invalid JSON'});return}
   if(!msg||typeof msg!=='object'||Array.isArray(msg)){ws.close(1008,'Invalid message');return}
   if(!authenticated){
    if(msg.type!=='auth'||!['browser','device'].includes(msg.role)){ws.close(1008,'Authentication required');return}
    if(msg.role==='browser'){
      if(!isAllowedBrowserOrigin(origin,config.origins)||!authenticateBrowser(msg.token,config.browserTokens)){ws.close(4001,'Not authorized');return}
      peer.role='browser';
    }else{
      // Device socket must not claim a web Origin; use configured per-device credentials.
      if(origin||!authenticateDevice(msg.deviceId,msg.token,config.devices)){ws.close(4001,'Not authorized');return}
      peer.role='device';peer.deviceId=msg.deviceId;devices.add(msg.deviceId,ws);
    }
    authenticated=true;clearTimeout(timeout);sendJson(ws,{type:'authenticated',role:peer.role,deviceId:peer.deviceId});logEvent('authenticated',{role:peer.role,deviceId:peer.deviceId});return;
   }
   if(peer.role==='device')handleDeviceMessage({client:peer,msg,router,rateLimiter});
   else handleBrowserMessage({client:peer,msg,pairing,router,sessions});
  });
  ws.on('close',()=>{
    clearTimeout(timeout);clearInterval(timeoutMonitor);
    if(peer.role==='device'){
      devices.remove(peer.deviceId,ws);
      const paired=sessions.devicePair(peer.deviceId);
      if(paired?.deviceSocket===ws){sessions.removeDevice(peer.deviceId);sendJson(paired.browserSocket,{type:'unpaired',reason:'Device disconnected'});}
    }else if(peer.role==='browser'){
      const paired=sessions.removeBrowser(ws);if(paired)sendJson(paired.deviceSocket,{type:'unpaired'});
    }
  });
  ws.on('error',()=>{});
 };
}
