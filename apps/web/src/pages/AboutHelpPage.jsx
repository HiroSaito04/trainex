import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader.jsx';
import '../assets/styles/pages/education.css';

export default function AboutHelpPage(){
  return <main className="container page edu-page">
    <PageHeader eyebrow="ABOUT TRAINEX" title="About & support" description="TRAINEX is a browser-based training prototype for practicing core driver-cab controls and learning how they work." />
    <div className="edu-page-links" aria-label="Other areas"><Link to="/learn">Learn · Materials →</Link><Link to="/train">Train · Scenarios →</Link><span className="edu-current">About / Guide · Support</span></div>
    <section className="about-overview">
      <article className="edu-group"><p className="edu-kicker">OUR PURPOSE</p><h2>Learn and practice in one place</h2><p>Explore the controls in 2D or 3D, study the five required cab components, and use training scenarios to rehearse their simulated operation. The Simulation Engine supplies the train state for each active session.</p>
       <Link className="edu-action-link" to="/simulators">Explore simulators →</Link></article>
      <article className="edu-group"><p className="edu-kicker">NEED HELP?</p><h2>Step-by-step guides</h2><p>Get instructions for simulator controls, hardware connection, and troubleshooting—separate from lessons and exercises.</p><Link className="edu-primary-link" to="/about/guide">Browse all guides →</Link></article>
    </section>
    <section className="edu-group"><p className="edu-kicker">IMPORTANT</p><h2>Training use and compatibility</h2><p>TRAINEX is an educational prototype, not an authorized railway driving or operational safety system. The 3D view requires a compatible browser and a loaded GLB; supported hardware can communicate by secure WebSocket relay or compatible USB serial connections.</p></section>
  </main>;
}
