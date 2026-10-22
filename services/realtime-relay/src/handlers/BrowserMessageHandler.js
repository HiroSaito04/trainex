import {sendJson} from '../routing/MessageRouter.js';
export function handleBrowserMessage({client,msg,pairing,router,sessions}){
 if(msg.type==='pair'){
  const result=pairing.pair(client.ws,msg);
  if(!result.ok)sendJson(client.ws,{type:'error',reason:result.reason});return;
 }
 if(msg.type==='unpair'){
  const pair=sessions.removeBrowser(client.ws);if(pair)sendJson(pair.deviceSocket,{type:'unpaired'});
  sendJson(client.ws,{type:'unpaired'});return;
 }
 if(msg.type==='state_feedback'){
  const result=router.forwardFeedback(client.ws,msg);
  if(!result.ok)sendJson(client.ws,{type:'error',reason:result.reason});return;
 }
 if(!['pair','unpair','state_feedback','heartbeat'].includes(msg.type))sendJson(client.ws,{type:'error',reason:'Browser message type denied'});
}
