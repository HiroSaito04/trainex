import { Link } from 'react-router-dom';
import { getComponentHelp } from '../../integrations/educationalContentAdapter.js';

/** Optional reusable link for 2D/3D component inspectors, without affecting controls. */
export default function ComponentHelpLink({componentId,className='text-link'}){
 const help=getComponentHelp(componentId);
 if(!help)return null;
 return <Link to={help.href} className={className} aria-label={`Learn about ${help.title}`}>
  Learn about {help.title} →
 </Link>;
}
