export function createInitialState() {
  return {
    speed: 0,               // km/h
    distanceMeters: 0,
    accelerationMps2: 0,
    elapsedSeconds: 0,
    sessionStatus: 'IDLE',
    sessionId: null,
    masterHandle: 'N',  // EB | B3 | B2 | B1 | N | P1 | P2 | P3
    doorState: 'CLOSED',   // CLOSED | OPENING | OPEN | CLOSING
    doorProgress: 0,       // 0=closed, 1=open
    allDoorsClosed: true,
    emergencyBrake: false,
  };
}
