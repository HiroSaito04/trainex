export function advancePassengerDoors(state,dt,config){
 const next={...state};
 for(const prefix of ['left','right']){
  const key=`${prefix}DoorState`,progressKey=`${prefix}DoorProgress`;
  if(next[key]==='OPENING'){
   next[progressKey]=Math.min(1,next[progressKey]+dt/config.openingSeconds);
   if(next[progressKey]>=1)next[key]='OPEN';
  }else if(next[key]==='CLOSING'){
   next[progressKey]=Math.max(0,next[progressKey]-dt/config.closingSeconds);
   if(next[progressKey]<=0){next[key]='CLOSED';next[`${prefix}DoorEnabled`]=false;}
  }
 }
 return next;
}
