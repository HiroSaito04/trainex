export class ScenarioSession {
 constructor({scenario,sessionId}){
   if(!scenario?.steps?.length)throw new Error('Scenario has no steps');
   if(!sessionId)throw new Error('An active simulation session is required');
   this.scenario=scenario;this.sessionId=sessionId;this.stepIndex=0;this.history=[];this.status='RUNNING';this.score=0;
 }
 get currentStep(){return this.scenario.steps[this.stepIndex]??null}
 snapshot(){return Object.freeze({scenarioId:this.scenario.id,sessionId:this.sessionId,stepIndex:this.stepIndex,totalSteps:this.scenario.steps.length,status:this.status,score:this.score,history:this.history.map(h=>({...h})),currentStep:this.currentStep})}
}
