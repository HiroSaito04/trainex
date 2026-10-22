import {HardwareClient,SecureWebSocketTransport,WebSerialTransport} from '@trainex/hardware-client';
import {TrainingManager} from '@trainex/training-module';

/** Instantiate once in the active TRAINEX runtime, not once per 2D/3D page.
 * Existing input manager remains authoritative: calls the same sendTrainexInput.
 * No Vite-exposed browser relay token: caller supplies it from trusted auth at runtime.
 */
export function createHardwareTrainingBridge({getSnapshot,subscribeSnapshot,sendTrainexInput}){
 if(!getSnapshot||!subscribeSnapshot||!sendTrainexInput)throw new Error('TRAINEX runtime integration callbacks required.');
 const getSessionId=()=>getSnapshot()?.sessionId??null;
 const getTrainState=()=>getSnapshot()?.trainState??null;
 const trainer=new TrainingManager({getSessionId,getTrainState});
 let hardware=null;
 const unsub=subscribeSnapshot(()=>{trainer.onStateChange();hardware?.sendFeedback()});
 const submit=async event=>{
   const result=await sendTrainexInput(event);
   // Events on the wire are hardware control IDs. Training uses canonical engine commands.
   const mapping={MASTER_HANDLE:'MASTER_HANDLE_SET',EMERGENCY_BRAKE:'EMERGENCY_BRAKE_ACTIVATE',EMERGENCY_BRAKE_RESET:'EMERGENCY_BRAKE_RESET',DOORS_OPEN:'DOOR_OPEN_REQUEST',DOORS_CLOSE:'DOOR_CLOSE_REQUEST'};
   trainer.recordCommand({type:mapping[event.controlId]??event.type,value:event.value,source:event.source},result);
   return result;
 };
 return {
  trainer,
  async connectWss({url,token,deviceId,pairingCode}){
    if(hardware)await hardware.destroy();
    hardware=new HardwareClient({transport:new SecureWebSocketTransport({url}),inputManager:{submit},getSessionId,getTrainState,mode:'wss',browserToken:token});
    await hardware.connect();
    // Pair only after the authenticated response. Caller can invoke pair() when connected.
    if(deviceId&&pairingCode) return {hardware,pair:()=>hardware.pair({deviceId,pairingCode})};
    return {hardware};
  },
  async connectUsb({deviceId='trainex-esp32-01'}={}){
    if(hardware)await hardware.destroy();
    hardware=new HardwareClient({transport:new WebSerialTransport(),inputManager:{submit},getSessionId,getTrainState,mode:'serial'});
    await hardware.connect();hardware.pair({deviceId});return hardware;
  },
  get hardware(){return hardware},
  async disconnect(){if(hardware)await hardware.destroy();hardware=null},
  async destroy(){unsub();if(hardware)await hardware.destroy();trainer.stop();hardware=null},
  // Use to record 2D/3D input too, by calling bridge.submitInput instead of the raw sender.
  submitInput:submit,
 };
}
