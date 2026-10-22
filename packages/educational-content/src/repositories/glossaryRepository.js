import brakingSystems from '../data/glossary/brakingSystems.json' with { type: 'json' };
import passengerDoors from '../data/glossary/passengerDoors.json' with { type: 'json' };
import railwayOperations from '../data/glossary/railwayOperations.json' with { type: 'json' };
import railwaySafety from '../data/glossary/railwaySafety.json' with { type: 'json' };
import trainControls from '../data/glossary/trainControls.json' with { type: 'json' };

const entries=Object.freeze([
 ...trainControls,...brakingSystems,...passengerDoors,...railwayOperations,...railwaySafety,
]);
export function listGlossaryEntries(){return [...entries].sort((a,b)=>a.term.localeCompare(b.term));}
export function listGlossaryCategories(){return [...new Set(entries.map(item=>item.category))].sort();}
export function getGlossaryEntry(slugOrTerm){
 if(typeof slugOrTerm!=='string')return null;
 const query=slugOrTerm.trim().toLowerCase();
 return entries.find(entry=>entry.slug===query || entry.term.toLowerCase()===query)??null;
}
export function listGlossaryForComponent(componentId){return entries.filter(entry=>entry.relatedComponentIds.includes(componentId));}
