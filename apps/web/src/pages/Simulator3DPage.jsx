import "../assets/styles/pages/simulation.css";
import PageHeader from '../components/common/PageHeader.jsx';
import Trainex3DConnected from '../components/simulation/Trainex3DConnected.jsx';
export default function Simulator3DPage(){
 return <div className="container page">
  <PageHeader eyebrow="SIMULATION / 3D" title="3D Driver Cabin" description="Operate the eight-position master handle and the physical controls inside the cab. All indications share the 2D simulator's train state."/>
  <Trainex3DConnected/>
 </div>;
}
