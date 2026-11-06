/** TRAINEX browser pairing-code prototype client.
 * Match onInput with the centralized TRAINEX input management API.
 * No long-lived server/device secret is placed in browser code.
 */
export function connectTrainexRelay({endpoint,sessionId,pairingCode,onStatus,onInput,onError,deviceId}) {
  if(!endpoint.startsWith('wss://'))throw new Error('Use a secure wss:// URL');
  if(!/^[A-Za-z0-9_-]{1,128}$/.test(sessionId))throw new Error('Invalid session ID');
  if(!pairingCode || pairingCode.length<16)throw new Error('Pairing code required');
  let closed=false,paired=false;
  const ws=new WebSocket(endpoint);
  let lastMessage=Date.now();
  const status=(value)=>onStatus?.(value);
  const heartbeat=window.setInterval(()=>{
    if(ws.readyState===WebSocket.OPEN) ws.send(JSON.stringify({type:'heartbeat'}));
    if(Date.now()-lastMessage>90000) status('stale');
  },20000);
  status('connecting');
  ws.addEventListener('open',()=>{
    ws.send(JSON.stringify({type:'auth',role:'browser'}));
    status('authenticating');
  });
  ws.addEventListener('message',evt=>{
    lastMessage=Date.now();
    let msg;
    try{msg=JSON.parse(evt.data);}catch{return;}
    switch(msg.type){
      case 'authenticated':
        ws.send(JSON.stringify({type:'pair',sessionId,pairingCode,...(deviceId?{deviceId}:{})}));
        status('pairing');break;
      case 'paired':paired=true;status('paired');break;
      case 'input':
        if(paired && msg.sessionId===sessionId)onInput?.(msg);
        break;
      case 'unpaired':paired=false;status('unpaired');break;
      case 'error':onError?.(msg.reason||'Relay error');break;
    }
  });
  ws.addEventListener('close',evt=>{window.clearInterval(heartbeat);status('disconnected');if(!closed)onError?.(`Connection closed: ${evt.code}`);});
  ws.addEventListener('error',()=>onError?.('WebSocket connection failed'));
  return {
    disconnect(){closed=true;window.clearInterval(heartbeat);if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type:'unpair'}));ws.close();},
    sendFeedback(value){if(paired && ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type:'state_feedback',sessionId,...value}));},
    get connected(){return paired && ws.readyState===WebSocket.OPEN;}
  };
}
