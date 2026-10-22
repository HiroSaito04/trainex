import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listScenarios } from '@trainex/training-module';
import PageHeader from '../components/common/PageHeader.jsx';
import '../assets/styles/pages/education.css';
import '../assets/styles/pages/driver-cab-learning.css';

/** Scenario previews are self-guided. Live assessment remains with TrainingManager. */
export default function TrainingPage(){
  const scenarios=useMemo(()=>listScenarios(),[]);
  const [params,setParams]=useSearchParams();
  const chosen=scenarios.find(x=>x.id===params.get('scenario')) ?? scenarios[0];
  const [completed,setCompleted]=useState({});
  const done=completed[chosen?.id] ?? {};
  const completedCount=Object.values(done).filter(Boolean).length;
  function choose(id){setParams({scenario:id});}
  function toggleStep(i, checked){setCompleted(prev=>({...prev,[chosen.id]:{...(prev[chosen.id]??{}),[i]:checked}}));}
  return <main className="container page edu-page">
    <PageHeader eyebrow="TRAIN / PRACTICE" title="Practice train-driving skills" description="Explore realistic driver-cab operating concepts through guided exercises: control identification, traction, braking, passenger doors and emergency response." />
    <div className="edu-page-links" aria-label="Other learning areas">
      <Link to="/learn">Learn · Study concepts →</Link><span className="edu-current">Train · Scenarios</span>
     </div>
    <div className="train-workspace">
      <section className="train-catalog" aria-label="Available scenarios">
        <div className="edu-section-heading"><div><p className="edu-kicker">SELECT AN EXERCISE</p><h2>Scenario library</h2></div><span className="edu-count">{scenarios.length}</span></div>
        <div className="train-catalog-list">
          {scenarios.map((s,index)=><button type="button" key={s.id} className={`train-scenario-choice ${chosen?.id===s.id?'is-selected':''}`}
            aria-pressed={chosen?.id===s.id} onClick={()=>choose(s.id)}>
            <span className="train-choice-index">{String(index+1).padStart(2,'0')}</span>
            <span><strong>{s.title}</strong><small>{s.steps.length} steps · {s.description}</small></span>
            <span aria-hidden="true">›</span>
          </button>)}
        </div>
      </section>
      <section className="train-detail" aria-live="polite" aria-label="Selected scenario">
        {chosen ? <>
          <div className="train-detail-head"><p className="edu-kicker">DRIVER-CAB EXERCISE</p><h2>{chosen.title}</h2><p>{chosen.description}</p></div>
          {chosen.learningObjective && <section className="train-learning-objective" aria-label="Learning objective"><strong>Learning objective</strong><p>{chosen.learningObjective}</p></section>}
          {(chosen.operatingConditions?.length > 0) && <details className="edu-collapsible train-brief-disclosure" open><summary>Before you begin</summary><div className="edu-collapsible-body"><ul>{chosen.operatingConditions.map(item=><li key={item}>{item}</li>)}</ul></div></details>}
          <div className="train-progress"><span>{completedCount} / {chosen.steps.length} practice steps reviewed (self-check)</span>
            <div className="train-progress-track" role="progressbar" aria-label="Self-review progress" aria-valuemin={0} aria-valuemax={chosen.steps.length} aria-valuenow={completedCount}><span style={{width:`${(completedCount/chosen.steps.length)*100}%`}}/></div>
          </div>
          <ol className="train-step-list">{chosen.steps.map((step,index)=><li key={step.id} className={done[index]?'is-complete':''}>
            <label><input type="checkbox" checked={!!done[index]} onChange={e=>toggleStep(index,e.target.checked)}/><span><strong>{step.instruction}</strong><small>Step {index+1}</small></span></label>
          </li>)}</ol>
          {chosen.expectedObservations?.length > 0 && <details className="edu-collapsible train-brief-disclosure"><summary>What to observe in the cab</summary><div className="edu-collapsible-body"><ul>{chosen.expectedObservations.map(item=><li key={item}>{item}</li>)}</ul></div></details>}
          {chosen.debriefQuestions?.length > 0 && <details className="edu-collapsible train-brief-disclosure"><summary>Questions to review after the exercise</summary><div className="edu-collapsible-body"><ol>{chosen.debriefQuestions.map(item=><li key={item}>{item}</li>)}</ol></div></details>}
          <div className="train-action-row"><Link className="edu-primary-link" to="/simulators/2d">Open 2D simulator →</Link><Link className="edu-secondary-link" to="/simulators/3d">Open 3D simulator ↗</Link></div>
          <p className="train-fineprint">These checkmarks record only your personal practice review. They are not live assessment or proof of competence. For actual railway operation, follow authorized driver training and vehicle-specific rules.</p>
        </> : <p>No scenarios available.</p>}
      </section>
    </div>
  </main>;
}
