import {listGlossaryEntries} from '../repositories/glossaryRepository.js';
const clean=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function searchGlossary(query='',options={}){
 const {category=null,limit=Infinity}=options;
 const selected=clean(category); const words=clean(query).split(/\s+/).filter(Boolean);
 const matches=listGlossaryEntries().filter(entry=>{
  if(selected && clean(entry.category)!==selected)return false;
  const haystack=clean([entry.term,entry.category,entry.definition,...entry.relatedComponentIds].join(' '));
  return words.every(word=>haystack.includes(word));
 });
 // Stable, intuitive ranking: exact term, starts-with term, then alphabetical.
 const needle=clean(query);
 matches.sort((a,b)=>{
  const score=item=>item.term.toLowerCase()===needle?0:item.term.toLowerCase().startsWith(needle)?1:2;
  return score(a)-score(b)||a.term.localeCompare(b.term);
 });
 const number=Number(limit);
 return Number.isFinite(number) ? matches.slice(0,Math.max(0,Math.floor(number))) : matches;
}
