
import PageHeader from
  "../components/common/PageHeader.jsx";

import Trainex2DConnected from
  "../components/simulation/Trainex2DConnected.jsx";

export default function Simulator2DPage() {
  return (
    <div className="container page">
      <PageHeader
        eyebrow="SIMULATION / 2D"
        title="2D Driver Console"
        description="Operate the TRAINEX driver controls, monitor train movement, and observe simulated operating indications."
      />

      <Trainex2DConnected />
    </div>
  );
}
