import {getScenario,listScenarios} from '../repositories/scenarioRepository.js';
import {createTrainingStateStore} from '../state/trainingStateStore.js';
import {ScenarioRunner} from './ScenarioRunner.js';
export class TrainingManager {
 constructor({getSessionId,getTrainState}={}){
  if(typeof getSessionId!=='function'||typeof getTrainState!=='function')throw new Error('Engine session and state callbacks required.');
  this.getSessionId=getSessionId;this.getTrainState=getTrainState;this.store=createTrainingStateStore();this.runner=null;
 }
 subscribe(fn){return this.store.subscribe(fn)}
 getState(){return this.store.getState()}
 listScenarios(){return listScenarios()}
 start(scenarioId){
  const scenario=getScenario(scenarioId);if(!scenario)throw new Error('Unknown scenario.');
  const sessionId=this.getSessionId();if(!sessionId)throw new Error('Start a simulation session before training.');
  this.runner=new ScenarioRunner({scenario,sessionId});this.store.setState(this.runner.snapshot());return this.getState();
 }
 recordCommand(command,result){
  if(!this.runner)return {advanced:false,reason:'No training scenario selected'};
  const s=this.runner.observe({sessionId:this.getSessionId(),command,result,trainState:this.getTrainState(),source:command?.source??'unknown'});
  if(s.advanced)this.store.setState(s.snapshot);return s;
 }
 onStateChange(){
  if(!this.runner)return {advanced:false,reason:'No training scenario selected'};
  const s=this.runner.observe({sessionId:this.getSessionId(),trainState:this.getTrainState(),source:'engine'});
  if(s.advanced)this.store.setState(s.snapshot);return s;
 }
 stop(){this.runner=null;this.store.setState({status:'IDLE',scenarioId:null,sessionId:null,stepIndex:0,history:[],score:0})}
}
