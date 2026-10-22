import {sendJson} from '../routing/MessageRouter.js';
import {validateDeviceInput} from '../validation/relayMessageValidator.js';
export function handleDeviceMessage({client,msg,router,rateLimiter}){
 if(msg.type==='heartbeat'){sendJson(client.ws,{type:'heartbeat',timestamp:Date.now()});return}
 if(msg.type!=='input'){sendJson(client.ws,{type:'error',reason:'Device message type denied'});return}
 const check=validateDeviceInput(msg,client.deviceId);
 if(!check.valid){sendJson(client.ws,{type:'error',reason:check.reason});return}
 if(!rateLimiter.allow(client.deviceId)){sendJson(client.ws,{type:'error',reason:'Rate limit exceeded'});return}
 const result=router.forwardDeviceInput(client.deviceId,msg);
 if(!result.ok)sendJson(client.ws,{type:'error',reason:result.reason});
}
