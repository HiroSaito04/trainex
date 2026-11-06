import {sendJson} from '../routing/MessageRouter.js';

export function handleBrowserMessage({client,msg,pairing,router,sessions,rateLimiter}) {
  if (msg.type === 'heartbeat') {
    sendJson(client.ws,{type:'heartbeat',timestamp:Date.now()});
    return;
  }
  if (msg.type === 'pair') {
    if (!rateLimiter.allow(`pair:${client.ip}`)) {
      sendJson(client.ws,{type:'error',reason:'Too many pairing attempts'});
      client.ws.close(1008,'Rate limit');
      return;
    }
    if (client.authMode === 'pair-code' &&
        (typeof msg.pairingCode !== 'string' || msg.pairingCode.length < 16)) {
      sendJson(client.ws,{type:'error',reason:'Pairing code required'});
      return;
    }
    const result = pairing.pair(client.ws,msg);
    if (!result.ok) sendJson(client.ws,{type:'error',reason:result.reason});
    return;
  }
  if (msg.type === 'unpair') {
    const old=sessions.removeBrowser(client.ws);
    if (old) sendJson(old.deviceSocket,{type:'unpaired'});
    sendJson(client.ws,{type:'unpaired'});
    return;
  }
  if (msg.type === 'state_feedback') {
    const result=router.forwardFeedback(client.ws,msg);
    if (!result.ok) sendJson(client.ws,{type:'error',reason:result.reason});
    return;
  }
  sendJson(client.ws,{type:'error',reason:'Browser message type denied'});
}
