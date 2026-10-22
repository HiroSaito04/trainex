import {ScenarioSession} from './ScenarioSession.js';
import {ScenarioEvaluator} from '../evaluation/ScenarioEvaluator.js';
import {generateFeedback} from '../feedback/FeedbackGenerator.js';
export class ScenarioRunner {
 constructor({scenario,sessionId}){this.session=new ScenarioSession({scenario,sessionId});this.evaluator=new ScenarioEvaluator()}
 observe({sessionId,command=null,result=null,trainState=null,source='unknown'}={}){
  if(sessionId!==this.session.sessionId)return {advanced:false,reason:'Event belongs to a different simulation session.'};
  const evaluated=this.evaluator.evaluate(this.session,{command,result,trainState,source});
  return {...evaluated,feedback:generateFeedback(this.session,evaluated),snapshot:this.session.snapshot()};
 }
 snapshot(){return this.session.snapshot()}
}
