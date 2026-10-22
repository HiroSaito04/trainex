import {validateTrainingAction,validateTrainingState} from './ActionValidator.js';
import {checkCompletion} from './CompletionChecker.js';
export class ScenarioEvaluator {
 evaluate(session,{command=null,result=null,trainState=null,source='unknown'}={}){
  if(session.status!=='RUNNING')return {advanced:false,reason:'Training is not running'};
  const step=session.currentStep;
  const validation=command?validateTrainingAction(step,command,result,trainState):validateTrainingState(step,trainState);
  if(!validation.matched)return {advanced:false,reason:validation.reason};
  session.history.push({stepId:step.id,source,commandType:command?.type??null,value:command?.value??null});
  session.stepIndex++;session.score++;
  if(checkCompletion(session))session.status='COMPLETED';
  return {advanced:true,completed:session.status==='COMPLETED',score:session.score};
 }
}
