// Exact reference-inspired dial art: brake cylinder/pipe ticks, pointer and labels;
// speedometer has red permit-speed and white current-speed readout as supplied.
function base(ctx,c){ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#353535';ctx.fillRect(0,0,c.width,c.height);}
function center(ctx,t,y,sz=28,color='#f5f5f5'){ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${sz>=30?'bold ':''}${sz}px Arial,sans-serif`;ctx.fillStyle=color;ctx.fillText(String(t),256,y,470);}
function circle(ctx){ctx.beginPath();ctx.arc(256,255,238,0,Math.PI*2);ctx.fillStyle='#0b0b0b';ctx.fill();ctx.beginPath();ctx.arc(256,255,223,0,Math.PI*2);ctx.fillStyle='#484848';ctx.fill();}
function ticks(ctx,colors=false){for(let i=0;i<=35;i++){const a=(-.76*Math.PI)+(i/35)*1.52*Math.PI;const r1=i%5===0?177:193;const r2=216;ctx.beginPath();ctx.moveTo(256+Math.cos(a)*r1,255+Math.sin(a)*r1);ctx.lineTo(256+Math.cos(a)*r2,255+Math.sin(a)*r2);ctx.lineWidth=i%5===0?7:4;ctx.strokeStyle=colors?(i<14?'#fe4154':'#18d584'):'#f4f4f4';ctx.stroke();}}
function needle(ctx,angle,color){ctx.save();ctx.translate(256,255);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(170,0);ctx.lineWidth=9;ctx.strokeStyle=color;ctx.stroke();ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.restore();}
function drawSpeed({canvas,ctx,texture},s){base(ctx,canvas);circle(ctx);ticks(ctx,true);
 center(ctx,'PERMIT SPEED',148,19);center(ctx,'15',195,48,'#ff4350');center(ctx,'CURRENT SPEED',250,20);
 center(ctx,Number.isFinite(s.speed)?Math.round(s.speed):'–',324,51,'#ffffff');center(ctx,'km/h',372,20);texture.needsUpdate=true;
}
function drawBrake(r,key,name,s){const {canvas,ctx,texture}=r;base(ctx,canvas);circle(ctx);ticks(ctx,false);
 const val=key==='cylinder'?s.brakeCylinderPressureKpa:s.brakePipePressureKpa;
 const has=typeof val==='number'&&Number.isFinite(val)&&val>=0;
 const angle=(-.77+(has?Math.min(val/1000,1):0)*1.54)*Math.PI;
 needle(ctx,angle,key==='cylinder'?'#f9d631':'#ff4456');
 center(ctx,name,427,37);center(ctx,has?Math.round(val)+' kPa':'N/A kPa',476,25);texture.needsUpdate=true;
}
function drawMain(r,s){const {canvas,ctx,texture}=r;ctx.fillStyle='#071116';ctx.fillRect(0,0,1024,620);
 ctx.strokeStyle='#49545b';ctx.lineWidth=6;ctx.strokeRect(12,12,1000,596);ctx.fillStyle='#dfc66f';ctx.textBaseline='middle';ctx.font='bold 42px Arial';ctx.fillText('TRAINEX  /  DRIVER INFORMATION',44,76);
 ctx.fillStyle='#a3b3ba';ctx.font='30px Arial';ctx.fillText('CURRENT SPEED',50,165);
 ctx.fillStyle='#ffffff';ctx.font='bold 124px monospace';ctx.fillText(Number.isFinite(s.speed)?s.speed.toFixed(1):'—',45,285);
 ctx.font='31px Arial';ctx.fillText('km/h',520,264);
 ctx.fillStyle='#152630';ctx.fillRect(42,339,940,223);
 ctx.font='bold 38px Arial';ctx.fillStyle='#e9f0f1';ctx.fillText('MASTER  '+(s.masterHandle??'—'),68,400);
 ctx.fillText('DOORS   '+(s.doorState??'—'),68,463);
 ctx.fillStyle=s.emergencyBrake?'#ff6870':'#85e6a8';ctx.fillText('EB  '+(s.emergencyBrake?'ACTIVE':'CLEAR'),68,524);
 ctx.fillStyle='#e9f0f1';ctx.font='30px Arial';ctx.fillText(s.allDoorsClosed?'ALL DOORS CLOSED':s.doorState==='OPEN'?'ALL DOORS OPEN':'DOOR STATUS UNAVAILABLE',544,465);
 texture.needsUpdate=true;
}
export function createLiveInstruments(readouts){let prev='';return {update(state){if(!state)return;const d=state.display??state;const values={...d,brakeCylinderPressureKpa:state.brakeCylinderPressureKpa??state.pressures?.brakeCylinderKpa??d.brakeCylinderPressureKpa,brakePipePressureKpa:state.brakePipePressureKpa??state.pressures?.brakePipeKpa??d.brakePipePressureKpa};
 const key=JSON.stringify([values.speed,values.masterHandle,values.emergencyBrake,values.doorState,values.allDoorsClosed,values.brakeCylinderPressureKpa,values.brakePipePressureKpa]);if(key===prev)return;prev=key;
 if(readouts.speed)drawSpeed(readouts.speed,values);if(readouts.cylinder)drawBrake(readouts.cylinder,'cylinder','BRAKE CYLINDER',values);if(readouts.pipe)drawBrake(readouts.pipe,'pipe','BRAKE PIPE',values);if(readouts.main)drawMain(readouts.main,values);
 },dispose(){}};}
