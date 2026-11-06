import {authenticateDevice} from '../authentication/deviceAuthentication.js';
import {authenticateBrowser} from '../authentication/sessionAuthentication.js';
import {sendJson} from '../routing/MessageRouter.js';
import {handleDeviceMessage} from '../handlers/DeviceMessageHandler.js';
import {handleBrowserMessage} from '../handlers/BrowserMessageHandler.js';
import {isAllowedBrowserOrigin} from '../security/originPolicy.js';
import {logEvent} from '../monitoring/logger.js';

const MAX_BYTES=4096;
export function createConnectionHandler({config,devices,sessions,router,pairing,rateLimiter}) {
  return (ws,request) => {
    const origin=request.headers.origin;
    const ip=request.socket.remoteAddress || 'unknown';
    const peer={ws,role:null,deviceId:null,authMode:null,ip,lastSeen:Date.now()};
    let authenticated=false;
    const authTimer=setTimeout(() => { if(!authenticated) ws.close(4001,'Authentication timeout'); },7000);
    const monitor=setInterval(() => {
      if(Date.now()-peer.lastSeen>config.heartbeatTimeoutMs) ws.close(4002,'Heartbeat timeout');
    },10000);

    ws.on('message',(data,isBinary) => {
      if(isBinary || data.byteLength>MAX_BYTES) { ws.close(1009,'Message too large'); return; }
      if(!rateLimiter.allow(`msg:${ip}`,Date.now())) { ws.close(1008,'Rate limit'); return; }
      peer.lastSeen=Date.now();
      let msg;
      try { msg=JSON.parse(data.toString('utf8')); }
      catch { sendJson(ws,{type:'error',reason:'Invalid JSON'}); return; }
      if(!msg || typeof msg!=='object' || Array.isArray(msg)) { ws.close(1008,'Invalid message'); return; }
      if(!authenticated) {
        if(msg.type!=='auth' || !['browser','device'].includes(msg.role)) {
          ws.close(1008,'Authentication required'); return;
        }
        if(msg.role==='browser') {
          if(!isAllowedBrowserOrigin(origin,config.origins)) { ws.close(4001,'Origin denied'); return; }
          const isToken=authenticateBrowser(msg.token,config.browserTokens);
          if(!isToken && !config.allowPairCodeBrowserAuth) { ws.close(4001,'Not authorized'); return; }
          peer.role='browser';
          peer.authMode=isToken ? 'token' : 'pair-code';
        } else {
          // The ESP32 firmware clears the WebSockets library's default Origin header.
          if(origin || !authenticateDevice(msg.deviceId,msg.token,config.devices)) {
            ws.close(4001,'Not authorized'); return;
          }
          peer.role='device';peer.deviceId=msg.deviceId;
          devices.add(msg.deviceId,ws);
        }
        authenticated=true;
        clearTimeout(authTimer);
        sendJson(ws,{type:'authenticated',role:peer.role,deviceId:peer.deviceId});
        logEvent('authenticated',{role:peer.role,deviceId:peer.deviceId,authMode:peer.authMode});
        return;
      }
      if(peer.role==='device') handleDeviceMessage({client:peer,msg,router,rateLimiter});
      else handleBrowserMessage({client:peer,msg,pairing,router,sessions,rateLimiter});
    });
    ws.on('close',() => {
      clearTimeout(authTimer);clearInterval(monitor);
      if(peer.role==='device') {
        devices.remove(peer.deviceId,ws);
        const old=sessions.devicePair(peer.deviceId);
        if(old?.deviceSocket===ws) {
          sessions.removeDevice(peer.deviceId);
          sendJson(old.browserSocket,{type:'unpaired',reason:'Device disconnected'});
        }
      } else if(peer.role==='browser') {
        const old=sessions.removeBrowser(ws);
        if(old) sendJson(old.deviceSocket,{type:'unpaired',reason:'Browser disconnected'});
      }
    });
    ws.on('error',() => {});
  };
}
