function textNum(value,digits=0){return Number.isFinite(value)?Number(value).toFixed(digits):'—';}
export function normalize3DDisplayState(trainState){
 const d=trainState?.display??trainState??{};
 return {
  speed:d.speed,masterHandle:d.masterHandle,doorState:d.doorState,
  allDoorsClosed:d.allDoorsClosed,emergencyBrake:d.emergencyBrake,
  brakeCylinderPressureKpa:d.brakeCylinderPressureKpa??trainState?.brakeCylinderPressureKpa,
  brakePipePressureKpa:d.brakePipePressureKpa??trainState?.brakePipePressureKpa,
 };
}
export default function TrainReadings({trainState}){
 const s=normalize3DDisplayState(trainState);
 const values=[
  ['SPEED',textNum(s.speed,1),'km/h'],
  ['MASTER HANDLE',s.masterHandle??'—',''],
  ['BRAKE CYLINDER',textNum(s.brakeCylinderPressureKpa),'kPa'],
  ['BRAKE PIPE',textNum(s.brakePipePressureKpa),'kPa'],
  ['DOORS',s.doorState??'—',''],
  ['EMERGENCY BRAKE',s.emergencyBrake==null?'—':s.emergencyBrake?'ACTIVE':'CLEAR',''],
 ];
 return <div className="t3d-instruments" aria-label="Live train operating readings">
  {values.map(([name,value,unit])=><div key={name} className="t3d-reading">
   <span>{name}</span><strong>{value}{unit&&<small> {unit}</small>}</strong>
  </div>)}
 </div>;
}
