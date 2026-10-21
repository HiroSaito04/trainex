
import HeroSection from "../components/home/HeroSection.jsx";

import FeatureCards from "../components/home/FeatureCards.jsx";

import SimulatorPreview from "../components/home/SimulatorPreview.jsx";

export default function HomePage() {
  return (
    <div className="container">
      <HeroSection />

      <FeatureCards />

      <SimulatorPreview />
    </div>
  );
}
