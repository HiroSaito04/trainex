import {useEffect,useState} from 'react';
export default function TrainingScenarioPanel({bridge}){
 const trainer=bridge?.trainer;
 const [snap,setSnap]=useState(trainer?.getState()??{});
 const [scenario,setScenario]=useState('trainStartup');const [error,setError]=useState('');
 useEffect(()=>trainer?.subscribe(setSnap),[trainer]);
 if(!trainer)return <p>Training manager unavailable.</p>;
 const scenarios=trainer.listScenarios();
 function start(){try{setError('');trainer.start(scenario)}catch(e){setError(e.message)}}
 return <section aria-label="TRAINEX training scenario">
  <h2>Training Scenario</h2>
  <label>Scenario <select value={scenario} onChange={e=>setScenario(e.target.value)}>{scenarios.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
  <button type="button" onClick={start}>Start scenario</button>
  <button type="button" onClick={()=>trainer.stop()}>End training</button>
  {error&&<p role="alert">{error}</p>}
  <p role="status">{snap.status??'IDLE'} · Step {(snap.stepIndex??0)+1}/{snap.totalSteps??0} · Score {snap.score??0}</p>
  {snap.currentStep&&<p>{snap.currentStep.instruction}</p>}
  {snap.status==='COMPLETED'&&<p>Scenario completed.</p>}
 </section>;
}
