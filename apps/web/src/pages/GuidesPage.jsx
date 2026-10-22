import { Link } from 'react-router-dom';
import { listGuides } from '@trainex/educational-content';
import PageHeader from '../components/common/PageHeader.jsx';
import '../assets/styles/pages/education.css';

export default function GuidesPage(){
 const guides=listGuides();
 return <main className="container page edu-page">
  <Link className="edu-back" to="/about">← About TRAINEX</Link>
  <PageHeader eyebrow="ABOUT / GUIDE" title="How-to guides" description="Only setup instructions, simulator walkthroughs and troubleshooting belong here."/>
  <div className="edu-group">
   <div className="edu-section-heading"><div><p className="edu-kicker">CHOOSE A GUIDE</p><h2>Find the help you need</h2></div><span className="edu-count">{guides.length} guides</span></div>
   <div className="edu-resource-grid">{guides.map((g,i)=><article className="edu-resource-card" key={g.id}>
     <span className="edu-number">{String(i+1).padStart(2,'0')}</span><div className="edu-resource-body"><h3><Link to={`/about/guide/${g.id}`}>{g.title}</Link></h3><p>{g.summary}</p><Link className="edu-action-link" to={`/about/guide/${g.id}`}>Read guide →</Link></div>
   </article>)}</div>
  </div>
  <p className="edu-disclaimer">For lessons, visit <Link to="/learn">Learn</Link>. For training exercises, visit <Link to="/train">Train</Link>.</p>
 </main>;
}
