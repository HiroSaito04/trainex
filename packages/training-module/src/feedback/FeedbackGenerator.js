export function generateFeedback(session,result){
 if(result.advanced)return result.completed?`Scenario complete: ${session.score}/${session.scenario.steps.length} steps.`:`Step ${session.stepIndex}/${session.scenario.steps.length} complete.`;
 return result.reason??'Waiting for the expected action.';
}
