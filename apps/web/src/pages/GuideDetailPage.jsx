import { Link, useParams } from 'react-router-dom';
import { getGuide } from '@trainex/educational-content';
import PageHeader from '../components/common/PageHeader.jsx';
import '../assets/styles/pages/education.css';

export default function GuideDetailPage(){
 const {guideId}=useParams(),guide=getGuide(guideId);
 if(!guide)return <main className="container page"><h1>Guide not found</h1><Link to="/about/guide" className="text-link">All guides →</Link></main>;
 return <main className="container page edu-page edu-reading-page">
  <Link to="/about/guide" className="edu-back">← All guides</Link>
  <PageHeader eyebrow="HOW-TO GUIDE" title={guide.title} description={guide.summary}/>
  {guide.prerequisites.length>0&&<section className="edu-reading-panel"><h2>Before you start</h2><ul>{guide.prerequisites.map(item=><li key={item}>{item}</li>)}</ul></section>}
  <section className="edu-reading-panel"><h2>Instructions</h2><ol className="edu-steps">{guide.steps.map(step=><li key={step.title}><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol></section>
  {guide.notes.length>0&&<details className="edu-collapsible"><summary>Important notes</summary><ul>{guide.notes.map(item=><li key={item}>{item}</li>)}</ul></details>}
  <div className="edu-footer-link"><div><strong>Ready to use TRAINEX?</strong><p>Launch a simulator or return to the guide library.</p></div><Link className="edu-primary-link" to="/simulators">Go to simulators →</Link></div>
 </main>;
}
