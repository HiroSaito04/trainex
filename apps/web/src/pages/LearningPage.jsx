import { Link } from 'react-router-dom';
import { listLessons, listComponents } from '@trainex/educational-content';
import PageHeader from '../components/common/PageHeader.jsx';
import '../assets/styles/pages/education.css';

export default function LearningPage() {
  const lessons = listLessons();
  const components = listComponents();
  return <main className="container page edu-page">
    <PageHeader eyebrow="LEARN / KNOWLEDGE" title="Learn the train driver cab" description="Study real driver-cab equipment and railway operating concepts: traction, braking, instruments, doors and safety." />
    <div className="edu-page-links" aria-label="Other learning areas">
      <span className="edu-current">Learn · Reference</span>
      <Link to="/train">Train · Practice scenarios →</Link>
     </div>
    <section className="edu-group edu-group--lessons" aria-labelledby="learn-lessons-heading">
      <div className="edu-section-heading"><div><p className="edu-kicker">START HERE</p><h2 id="learn-lessons-heading">Lessons</h2><p>Nine focused railway lessons. Read a section at a time, then check your understanding.</p></div><span className="edu-count">{lessons.length} lessons</span></div>
      <div className="edu-resource-grid">
        {lessons.map((lesson, index) => <article className="edu-resource-card" key={lesson.id}>
          <span className="edu-number">{String(index + 1).padStart(2,'0')}</span>
          <div className="edu-resource-body"><span className="edu-meta">{lesson.level} · {lesson.estimatedMinutes} min</span>
            <h3><Link to={`/learn/lessons/${lesson.id}`}>{lesson.title}</Link></h3>
            <p>{lesson.summary}</p>
            <Link className="edu-action-link" to={`/learn/lessons/${lesson.id}`}>Read lesson <span aria-hidden="true">→</span></Link>
          </div>
        </article>)}
      </div>
    </section>
    <section className="edu-group edu-group--components" aria-labelledby="learn-components-heading">
      <div className="edu-section-heading"><div><p className="edu-kicker">REFERENCE</p><h2 id="learn-components-heading">Driver cab components</h2><p>Understand the purpose of each cab control and indicator, not the software behind it.</p></div><span className="edu-count">{components.length} components</span></div>
      <div className="edu-reference-grid">
        {components.map((component, index) => <Link className="edu-reference-item" key={component.id} to={`/learn/components/${component.slug}`}>
          <span className="edu-reference-index">{String(index+1).padStart(2,'0')}</span>
          <span><strong>{component.title}</strong><small>{component.summary}</small></span>
          <span className="edu-arrow" aria-hidden="true">↗</span>
        </Link>)}
      </div>
    </section>
    <section className="edu-footer-link" aria-labelledby="learn-glossary-heading">
      <div><p className="edu-kicker">QUICK REFERENCE</p><h2 id="learn-glossary-heading">Looking for a railway term?</h2><p>Search definitions by keyword or category in the dedicated glossary.</p></div>
      <Link className="edu-primary-link" to="/glossary">Open glossary →</Link>
    </section>
    <p className="edu-disclaimer">The control layout in these lessons is a teaching example. Actual cab equipment and railway procedures vary; these lessons are not an official operating manual.</p>
  </main>;
}
