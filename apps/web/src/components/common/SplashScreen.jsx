/**
 * TRAINEX five-second in-app launch splash.
 * Artwork stays in /public/images/ so Vite and the existing offline precache
 * both include it in the installed PWA.
 */
import "../../assets/styles/components/SplashScreen.css";

export const SPLASH_DURATION_MS = 5000;

export default function SplashScreen() {
  return (
    <main className="trainex-splash" role="status" aria-live="polite" aria-label="TRAINEX is opening">
      <div className="trainex-splash__ambient trainex-splash__ambient--one" aria-hidden="true" />
      <div className="trainex-splash__ambient trainex-splash__ambient--two" aria-hidden="true" />

      <header className="trainex-splash__branding">
        <img className="trainex-splash__app-icon" src="/icon-192.png" alt="" width="64" height="64" />
        <p className="trainex-splash__eyebrow">RAILWAY DRIVER TRAINING SYSTEM</p>
        <h1 className="trainex-splash__wordmark">TRAIN<span>EX</span></h1>
        <p className="trainex-splash__tagline">Experience the journey from the driver's cab.</p>
      </header>

      <div className="trainex-splash__rail-scene" aria-hidden="true">
        <div className="trainex-splash__motion-trails" />
        <img
          className="trainex-splash__train"
          src="/images/train-side.svg"
          alt=""
          width="1600"
          height="500"
          draggable="false"
          fetchPriority="high"
        />
        <div className="trainex-splash__rail trainex-splash__rail--top" />
        <div className="trainex-splash__rail trainex-splash__rail--bottom" />
        <div className="trainex-splash__sleepers" />
      </div>

      <footer className="trainex-splash__footer">
        <div className="trainex-splash__progress-heading">
          <span>WELCOME ABOARD</span>
          <span className="trainex-splash__progress-count">TRAINEX · STARTING</span>
        </div>
        <div className="trainex-splash__progress-track" aria-hidden="true">
          <div className="trainex-splash__progress-fill" />
        </div>
        <p>Preparing your training experience…</p>
      </footer>
    </main>
  );
}
