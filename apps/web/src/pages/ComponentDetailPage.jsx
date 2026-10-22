import { Link, useParams } from 'react-router-dom';
import { getComponent, listLessonsForComponent, listGlossaryForComponent } from '@trainex/educational-content';
import PageHeader from '../components/common/PageHeader.jsx';
import '../assets/styles/pages/education.css';

export default function ComponentDetailPage(){
 const {componentId}=useParams(),component=getComponent(componentId);
 if(!component)return <main className="container page"><h1>Component not found</h1><Link to="/learn" className="text-link">Back to Learn →</Link></main>;
 const lessons=listLessonsForComponent(component.id),terms=listGlossaryForComponent(component.id);
 return <main className="container page edu-page edu-reading-page">
  <Link to="/learn" className="edu-back">← All components</Link>
  <PageHeader eyebrow={component.category.toUpperCase()} title={component.title} description={component.summary}/>
  <section className="edu-reading-panel"><h2>Purpose</h2><p>{component.purpose}</p></section>
  {component.positions&&<section className="edu-reading-panel"><h2>Master-handle positions</h2><div className="edu-positions" role="list">
   {component.positions.map(p=><div role="listitem" key={p.value}><strong>{p.value}</strong><span>{p.meaning}</span></div>)}
  </div></section>}
  <details className="edu-collapsible" open><summary>How to use it</summary><ul>{component.interactions.map(p=><li key={p}>{p}</li>)}</ul></details>
  <details className="edu-collapsible"><summary>What to observe</summary><ul>{component.observations.map(p=><li key={p}>{p}</li>)}</ul></details>
  <details className="edu-collapsible edu-collapsible--caution"><summary>Safety and simulation notes</summary><ul>{component.safetyNotes.map(p=><li key={p}>{p}</li>)}</ul></details>
  <section className="edu-reading-panel"><h2>Keep learning</h2><div className="edu-chip-group">{lessons.map(l=><Link key={l.id} className="edu-chip" to={`/learn/lessons/${l.id}`}>{l.title}</Link>)}</div>
   {terms.length>0&&<p className="edu-subnote">Related terms: {terms.map(t=>t.term).join(' · ')} · <Link to="/glossary">Glossary →</Link></p>}
  </section>
 </main>;
}
