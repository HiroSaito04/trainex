export function validateTrainingAction(step,command,result,trainState){
 if(!step)return {matched:false,reason:'No active step'};
 if(!result?.accepted)return {matched:false,reason:result?.reason??'Command rejected by engine'};
 const expect=step.expect??{};
 if(expect.commandType&&command?.type!==expect.commandType)return {matched:false,reason:'Wrong control'};
 if('value' in expect && command?.value!==expect.value)return {matched:false,reason:'Wrong control setting'};
 return validateTrainingState(step,trainState,{hasAction:!!command});
}
export function validateTrainingState(step,trainState,{hasAction=false}={}){
 const expect=step?.expect??{};
 if(expect.commandType&&!hasAction)return {matched:false,reason:'Waiting for control input'};
 if(!trainState)return {matched:false,reason:'Train state unavailable'};
 if(expect.doorsClosed!==undefined && trainState.allDoorsClosed!==expect.doorsClosed)return {matched:false,reason:'Door indication does not match'};
 if(expect.emergencyBrake!==undefined && trainState.emergencyBrake!==expect.emergencyBrake)return {matched:false,reason:'Emergency state does not match'};
 if(expect.speedAtMost!==undefined && !(trainState.speed<=expect.speedAtMost))return {matched:false,reason:'Speed too high'};
 if(expect.speedAtLeast!==undefined && !(trainState.speed>=expect.speedAtLeast))return {matched:false,reason:'Speed too low'};
 if(expect.doorState && trainState.doorState!==expect.doorState)return {matched:false,reason:'Door transition in progress'};
 if(expect.masterHandle && trainState.masterHandle!==expect.masterHandle)return {matched:false,reason:'Wrong master handle position'};
 return {matched:true};
}
