import "../assets/styles/pages/simulation.css";
import PageHeader from '../components/common/PageHeader.jsx';
import Trainex2DConnected from '../components/simulation/Trainex2DConnected.jsx';

export default function Simulator2DPage(){
 return <div className="container page">
   <PageHeader eyebrow="SIMULATION / 2D" title="2D Driver Control Desk"
     description="Operate the driver cab controls, monitor train instruments, and tap any part to learn its purpose."/>
   <Trainex2DConnected/>
 </div>;
}
