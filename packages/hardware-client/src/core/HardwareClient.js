import {parseHardwareMessage} from '../messages/parseHardwareMessage.js';
import {validateInboundHardwareMessage} from '../messages/hardwareMessageValidator.js';
import {createConnectionStateStore} from './connectionStateStore.js';
import {InputSequenceTracker} from '../synchronization/InputSequenceTracker.js';
import {PairingClient} from '../pairing/PairingClient.js';
import {createHardwareEventLog} from '../monitoring/hardwareEventLog.js';
import {makeHardwareFeedback} from '@trainex/contracts';

/** One HardwareClient per browser session. The browser's existing InputManager
 * must be supplied by the website; this client NEVER sends commands directly to the engine.
 */
export class HardwareClient {
  constructor({transport,inputManager,getSessionId,getTrainState,mode='wss',browserToken=null}){
    if(!transport||typeof inputManager?.submit!=='function')throw new Error('Transport and InputManager required.');
    if(typeof getSessionId!=='function'||typeof getTrainState!=='function')throw new Error('Session/state callbacks required.');
    this.transport=transport;this.inputManager=inputManager;this.getSessionId=getSessionId;this.getTrainState=getTrainState;
    this.mode=mode;this.browserToken=browserToken;
    this.store=createConnectionStateStore();this.sequence=new InputSequenceTracker();this.log=createHardwareEventLog();
    this.pairing=new PairingClient({send:m=>this.transport.send(m)});
    this.onMessage=raw=>this.handleMessage(raw);
    this.unsubscribe=transport.onMessage(this.onMessage);
  }
  getState(){return this.store.getState()}
  subscribe(fn){return this.store.subscribe(fn)}
  async connect(){
    this.store.update({status:'CONNECTING',error:null});
    try {
      await this.transport.connect();
      if(this.mode==='wss'){
        if(!this.browserToken)throw new Error('Browser auth token required. Obtain a short-lived token from your trusted backend.');
        this.transport.send({type:'auth',role:'browser',token:this.browserToken});
      }else{
        this.store.update({status:'CONNECTED'});
      }
    }catch(error){this.store.update({status:'ERROR',error:error.message});await this.transport.close();throw error}
  }
  pair({deviceId,pairingCode}){
    const sessionId=this.getSessionId();if(!sessionId)throw new Error('Start a TRAINEX simulation session first.');
    if(this.mode==='serial'){
      // USB port was selected by the user, no relay pairing challenge exists.
      this.store.update({status:'PAIRED',deviceId:deviceId??'trainex-esp32',sessionId});return;
    }
    this.pairing.pair({deviceId,sessionId,pairingCode});
  }
  async handleMessage(raw){
    const parsed=parseHardwareMessage(raw);
    if(!parsed.ok){this.log.append('rejected',{reason:parsed.reason});return}
    const m=parsed.message;
    if(m.type==='authenticated'){this.store.update({status:'CONNECTED'});return}
    if(m.type==='paired'){
      if(m.sessionId!==this.getSessionId()){this.log.append('pair_rejected',{reason:'Session changed'});return}
      this.sequence.reset();this.store.update({status:'PAIRED',deviceId:m.deviceId,sessionId:m.sessionId});this.sendFeedback();return;
    }
    if(m.type==='unpaired'){this.sequence.reset();this.store.update({status:'CONNECTED',deviceId:null,sessionId:null,error:m.reason??null});return}
    if(m.type==='transport_closed'){this.store.update({status:'DISCONNECTED',deviceId:null,sessionId:null});return}
    if(m.type==='error'){this.log.append('relay_error',{reason:m.reason});this.store.update({error:m.reason});return}
    if(m.type!=='input')return;
    const paired=this.getState();
    // USB serial messages have no session until the browser binds them after a user-controlled port connection.
    const event=this.mode==='serial'?{...m,deviceId:m.deviceId??paired.deviceId,sessionId:this.getSessionId()}:m;
    if(paired.status!=='PAIRED'||this.getSessionId()!==paired.sessionId){this.log.append('rejected',{reason:'Not paired to active session'});return}
    const valid=validateInboundHardwareMessage(event,{deviceId:paired.deviceId,sessionId:paired.sessionId});
    if(!valid.valid){this.log.append('rejected',{reason:valid.reason});return}
    if(!this.sequence.check(event.deviceId,event.sequence)){this.log.append('rejected',{reason:'Old or duplicate sequence'});return}
    this.sequence.commit(event.deviceId,event.sequence);
    const result=await this.inputManager.submit(valid.event);
    this.log.append('input',{controlId:event.controlId??event.control,sequence:event.sequence,accepted:result.accepted,reason:result.reason??null});
    this.sendFeedback(result);
  }
  sendFeedback(result){
    const state=this.getTrainState();if(!state||this.getState().status!=='PAIRED')return;
    const feedback={...makeHardwareFeedback(state.display??state),sessionId:this.getSessionId()};
    if(result){feedback.accepted=result.accepted;feedback.reason=result.reason??null}
    try{this.transport.send(feedback)}catch(e){this.log.append('feedback_error',{reason:e.message})}
  }
  async disconnect(){try{if(this.mode==='wss'&&this.getState().status==='PAIRED')this.pairing.unpair()}catch{}await this.transport.close();this.sequence.reset();this.store.update({status:'DISCONNECTED',sessionId:null,deviceId:null})}
  async destroy(){await this.disconnect();this.unsubscribe?.()}
}
