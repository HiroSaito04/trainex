import { Link, useParams } from 'react-router-dom';
import { getLesson, getComponent } from '@trainex/educational-content';
import PageHeader from '../components/common/PageHeader.jsx';
import ReviewQuestions from '../components/education/ReviewQuestions.jsx';
import '../assets/styles/pages/education.css';

export default function LessonDetailPage(){
 const {lessonId}=useParams(),lesson=getLesson(lessonId);
 if(!lesson)return <main className="container page"><h1>Lesson not found</h1><Link to="/learn" className="text-link">Back to Learn →</Link></main>;
 return <main className="container page edu-page edu-reading-page">
  <Link to="/learn" className="edu-back">← All lessons</Link>
  <PageHeader eyebrow={`${lesson.level.toUpperCase()} · ${lesson.estimatedMinutes} MIN`} title={lesson.title} description={lesson.summary}/>
  <section className="edu-reading-panel"><h2>What you will learn</h2><ul>{lesson.objectives.map(s=><li key={s}>{s}</li>)}</ul></section>
  <section className="edu-reading-group" aria-labelledby="lesson-sections-title"><h2 id="lesson-sections-title">Lesson sections</h2><p>Open a section to read it. Sections can be reviewed in any order.</p>
    {lesson.sections.map((section,index)=><details className="edu-collapsible" key={section.heading} open={index===0}>
      <summary><span className="edu-number">{String(index+1).padStart(2,'0')}</span>{section.heading}</summary>
      <div className="edu-collapsible-body"><p>{section.body}</p>{section.points?.length>0&&<ul>{section.points.map(point=><li key={point}>{point}</li>)}</ul>}</div>
    </details>)}
  </section>
  <ReviewQuestions key={lesson.id} questions={lesson.reviewQuestions}/>
  <section className="edu-reading-panel"><h2>Related components</h2><div className="edu-chip-group">
   {lesson.componentIds.map(id=>{const c=getComponent(id);return c?<Link key={id} className="edu-chip" to={`/learn/components/${c.slug}`}>{c.title}</Link>:null})}
  </div></section>
 </main>;
}
