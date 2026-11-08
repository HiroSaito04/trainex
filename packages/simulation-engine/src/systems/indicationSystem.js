/** All doors closed means BOTH banks have finished closing and locking. */
export function updateIndications(state){
 const left=state.leftDoorState,right=state.rightDoorState;
 const bothClosed=left==='CLOSED'&&right==='CLOSED';
 let doorState=left===right?left:(left==='OPENING'||right==='OPENING')?'OPENING':
 (left==='CLOSING'||right==='CLOSING')?'CLOSING':'MIXED';
 return {...state,doorState,doorProgress:Math.max(state.leftDoorProgress,state.rightDoorProgress),allDoorsClosed:bothClosed};
}
