export function sendJson(ws,value){if(ws?.readyState===1)ws.send(JSON.stringify(value))}
export class MessageRouter {
 constructor({sessions}){this.sessions=sessions}
 forwardDeviceInput(deviceId,msg){
  const pair=this.sessions.devicePair(deviceId);
  if(!pair||pair.sessionId!==msg.sessionId||pair.deviceSocket?.readyState!==1||pair.browserSocket?.readyState!==1)return {ok:false,reason:'Device is not paired to active browser'};
  if(!Number.isSafeInteger(msg.sequence)||msg.sequence<0||msg.sequence<=pair.lastSequence)return {ok:false,reason:'Input sequence replay'};
  pair.lastSequence=msg.sequence;
  sendJson(pair.browserSocket,msg);return {ok:true};
 }
 forwardFeedback(browser,msg){
  const pair=this.sessions.browserPair(browser);
  if(!pair||msg.sessionId!==pair.sessionId)return {ok:false,reason:'No matching paired session'};
  sendJson(pair.deviceSocket,msg);return {ok:true};
 }
}
