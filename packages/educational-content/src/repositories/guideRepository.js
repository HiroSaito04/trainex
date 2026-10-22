import simulator2D from '../data/guides/simulator2D.json' with { type: 'json' };
import simulator3D from '../data/guides/simulator3D.json' with { type: 'json' };
import hardwareConnection from '../data/guides/hardwareConnection.json' with { type: 'json' };
import troubleshooting from '../data/guides/troubleshooting.json' with { type: 'json' };

const guides=Object.freeze([simulator2D,simulator3D,hardwareConnection,troubleshooting]);
export function listGuides(){return [...guides];}
export function getGuide(id){return typeof id==='string' ? (guides.find(guide=>guide.id===id)??null) : null;}
