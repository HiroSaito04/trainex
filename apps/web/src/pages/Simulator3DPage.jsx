import "../assets/styles/pages/simulation.css";
import PageHeader from '../components/common/PageHeader.jsx';
import Trainex3DConnected from '../components/simulation/Trainex3DConnected.jsx';
export default function Simulator3DPage(){
 return <div className="container page">
  <PageHeader eyebrow="SIMULATION / 3D" title="3D Driver Cabin" description="Enter the 3D driver cabin. Use touch navigation or WASD, and operate the existing train controls."/>
  <Trainex3DConnected/>
 </div>;
}
