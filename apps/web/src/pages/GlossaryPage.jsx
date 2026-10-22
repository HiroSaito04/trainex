import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchGlossary, listGlossaryCategories } from '@trainex/educational-content';
import PageHeader from '../components/common/PageHeader.jsx';
import '../assets/styles/pages/education.css';

export default function GlossaryPage(){
 const [params,setParams]=useSearchParams();
 const [category,setCategory]=useState('');
 const query=params.get('q')??'';
 const results=useMemo(()=>searchGlossary(query,{category}),[query,category]);
 const categories=listGlossaryCategories();
 function changeQuery(next){const copy=new URLSearchParams(params);if(next)copy.set('q',next);else copy.delete('q');setParams(copy,{replace:true});}
 return <main className="container page edu-page edu-reading-page">
  <Link to="/learn" className="edu-back">← Back to Learn</Link>
  <PageHeader eyebrow="LEARN / REFERENCE" title="Railway glossary" description="Find a definition without reading an entire lesson. Open any term to see more." />
  <form className="edu-search-bar" role="search" onSubmit={e=>e.preventDefault()}>
   <label><span>Search terms</span><input id="glossary-search" type="search" placeholder="Braking, doors, traction…" value={query} onChange={e=>changeQuery(e.target.value)}/></label>
   <label><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
  </form>
  <section className="edu-group"><div className="edu-section-heading"><h2>Matching terms</h2><span className="edu-count" role="status">{results.length} {results.length===1?'result':'results'}</span></div>
   <div className="edu-glossary-list">{results.map(entry=><details key={entry.slug} className="edu-glossary-item">
     <summary><span><strong>{entry.term}</strong><small>{entry.category}</small></span><span aria-hidden="true">+</span></summary>
     <p>{entry.definition}</p>
    </details>)}</div>
   {results.length===0&&<p className="edu-empty">No matching terms. Try another keyword or category.</p>}
  </section>
 </main>;
}
