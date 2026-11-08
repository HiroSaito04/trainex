export function createInitialState(){return {
 speed:0,distanceMeters:0,accelerationMps2:0,elapsedSeconds:0,sessionStatus:'IDLE',sessionId:null,
 masterHandle:'N', doorState:'CLOSED',doorProgress:0,allDoorsClosed:true,
 leftDoorState:'CLOSED',rightDoorState:'CLOSED',leftDoorProgress:0,rightDoorProgress:0,
 leftDoorEnabled:false,rightDoorEnabled:false,
 emergencyBrake:false,emergencyBrakeReleasing:false,emergencyReleaseElapsed:0,
 vigilanceElapsedSeconds:0,vigilanceWarning:false,vigilanceBuzzer:false,vigilanceTrip:false,
 hornActive:false,
 brakePressureRatio:0,brakeCylinderPressureKpa:0,brakePipePressureKpa:500,
};}
