/** Only authoritative status; the previous vigilance flags are intentionally removed. */
export function makeHardwareFeedback(state){return Object.freeze({
 type:'state_feedback',allDoorsClosed:state.allDoorsClosed===true,
 leftDoorState:state.leftDoorState??'UNKNOWN',rightDoorState:state.rightDoorState??'UNKNOWN',
 emergencyBrake:state.emergencyBrake===true,emergencyBrakeReleasing:state.emergencyBrakeReleasing===true,
 speed:Number.isFinite(state.speed)?state.speed:null,
});}
