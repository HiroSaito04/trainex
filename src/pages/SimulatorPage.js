
export function createSimulatorPage() {
  const page = document.createElement("div");
  page.className = "page simulator-page";

  page.innerHTML = `
    <section class="page-intro container">
      <div>
        <p class="eyebrow">
          INTERACTIVE RAILWAY ENGINEERING PLATFORM
        </p>

        <h1>
          Train Driver's
          <span>Cab Simulator</span>
        </h1>

        <p class="intro-description">
          Learn train operation through an interactive
          software-based Arduino simulation.
        </p>
      </div>

      <div class="intro-label">
        <span class="status-dot"></span>
        TRAINEX LABORATORY
      </div>
    </section>

    <section id="simulator" class="container simulator-section">
      <div class="simulator-layout">
        <!-- MAIN CIRCUIT WORKSPACE -->
        <div class="workspace">
          <div class="workspace-header">
            <div class="workspace-heading">
              <span class="workspace-icon">⌘</span>

              <div>
                <h2>Virtual Driver's Cab</h2>
                <p>Arduino Uno · ATmega328P</p>
              </div>
            </div>

            <div class="workspace-actions">
              <span
                id="status"
                class="simulation-status"
                data-state="loading"
                role="status"
                aria-live="polite"
              >
                Initializing
              </span>

              <button
                id="muteButton"
                type="button"
                class="workspace-button"
                aria-pressed="false"
              >
                ♪ Sound On
              </button>

              <button
                id="fullscreenButton"
                type="button"
                class="workspace-button"
              >
                ⛶ Fullscreen
              </button>

              <button
                id="resetButton"
                type="button"
                class="workspace-button workspace-button-accent"
              >
                ↻ Reset
              </button>
            </div>
          </div>

          <div
            id="circuitViewport"
            class="circuit-viewport"
            tabindex="0"
            aria-label="Interactive electronic circuit workspace"
          >
            <div id="circuit"></div>
          </div>

          <div class="workspace-bottom">
            <span>
              <span class="status-dot"></span>
              SOFTWARE-BASED SIMULATION
            </span>

            <span>
              Scroll to explore the circuit
            </span>
          </div>
        </div>

        <!-- RIGHT SIDEBAR -->
        <aside class="simulator-sidebar">
          <div class="sidebar-heading">
            <h2>Train Monitor</h2>
            <p>Live readings from Arduino firmware</p>
          </div>

          <div class="metric-card speed-card">
            <span class="metric-label">SIMULATED SPEED</span>

            <div class="speed-value">
              <output id="speedValue">0</output>
              <span>km/h</span>
            </div>

            <div class="speed-bar">
              <div id="speedFill"></div>
            </div>

            <div class="speed-scale">
              <span>0</span>
              <span>80 km/h</span>
            </div>
          </div>

          <div class="metric-grid">
            <div class="metric-card">
              <span class="metric-label">NOTCH</span>
              <strong id="notchDisplay">N</strong>
            </div>

            <div class="metric-card">
              <span class="metric-label">MODE</span>
              <strong id="modeStatus">COAST</strong>
            </div>

            <div class="metric-card">
              <span class="metric-label">DOORS</span>
              <strong id="doorStatus">CLOSED</strong>
            </div>

            <div class="metric-card">
              <span class="metric-label">EB STATUS</span>
              <strong id="emergencyStatus">OFF</strong>
            </div>
          </div>

          <div class="indicator-card">
            <div class="indicator-lamp" id="doorLamp"></div>

            <div>
              <strong>All Doors Closed</strong>
              <p id="lampStatus">Checking status...</p>
            </div>
          </div>

          <div class="sidebar-note">
            <strong>Training Reminder</strong>
            <p>
              Apply traction only when the passenger
              doors are fully closed. Emergency braking
              has priority over the master control handle.
            </p>
          </div>
        </aside>
      </div>
    </section>

    <!-- DRIVER CONTROLS -->
    <section id="controls" class="container content-section">
      <div class="section-heading">
        <p class="eyebrow">TRAINING MODULE 01</p>
        <h2>Driver Controls</h2>
        <p>
          Operate the circuit directly or use these
          accessible software controls.
        </p>
      </div>

      <div class="control-layout">
        <div class="content-card">
          <div class="card-heading">
            <span class="card-number">01</span>
            <div>
              <h3>Master Control Handle</h3>
              <p>Traction and service braking</p>
            </div>
          </div>

          <div class="handle-readout">
            <span>SELECTED NOTCH</span>
            <strong id="handleNotch">N</strong>
          </div>

          <label for="handleInput" class="field-label">
            Move controller
          </label>

          <input
            id="handleInput"
            type="range"
            min="0"
            max="1023"
            step="1"
            value="448"
            class="handle-range"
          />

          <div class="notch-labels">
            <span>B3</span><span>B2</span>
            <span>B1</span><span>N</span>
            <span>P1</span><span>P2</span>
            <span>P3</span><span>P4</span>
          </div>
        </div>

        <div class="content-card">
          <div class="card-heading">
            <span class="card-number">02</span>
            <div>
              <h3>Door Controls</h3>
              <p>Passenger door operation</p>
            </div>
          </div>

          <div class="action-grid">
            <button
              type="button"
              data-button="btn_open"
              class="action-button action-green"
            >
              ⇤ Open Doors
            </button>

            <button
              type="button"
              data-button="btn_close"
              class="action-button action-yellow"
            >
              ⇥ Close Doors
            </button>
          </div>

          <p class="card-help">
            Doors only open when the train has stopped.
            Door movement takes approximately 2 seconds.
          </p>
        </div>

        <div class="content-card">
          <div class="card-heading">
            <span class="card-number">03</span>
            <div>
              <h3>Emergency Controls</h3>
              <p>Emergency braking procedure</p>
            </div>
          </div>

          <div class="action-grid">
            <button
              type="button"
              data-button="btn_eb"
              class="action-button action-red"
            >
              ! Emergency Brake
            </button>

            <button
              type="button"
              data-button="btn_rst"
              class="action-button action-blue"
            >
              ↺ EB Reset
            </button>
          </div>

          <p class="card-help">
            Reset requires the train to be stopped,
            with the handle at N or a brake notch.
          </p>
        </div>
      </div>
    </section>

    <!-- LEARNING GUIDE -->
    <section id="learn" class="container content-section">
      <div class="section-heading">
        <p class="eyebrow">TRAINING MODULE 02</p>
        <h2>Learn the Cab Systems</h2>
        <p>
          Understand the essential controls and safety rules.
        </p>
      </div>

      <div class="learning-grid">
        <article class="content-card learning-card">
          <span class="learning-icon">↗</span>
          <h3>Traction & Braking</h3>
          <p>
            Observe how power notches accelerate the train,
            while service braking reduces its speed.
          </p>
        </article>

        <article class="content-card learning-card">
          <span class="learning-icon">⇆</span>
          <h3>Door Interlocking</h3>
          <p>
            Discover why traction is prevented whenever
            the doors are not fully closed.
          </p>
        </article>

        <article class="content-card learning-card">
          <span class="learning-icon">!</span>
          <h3>Emergency Braking</h3>
          <p>
            Practice emergency brake application and the
            required conditions for resetting the system.
          </p>
        </article>
      </div>
    </section>
  `;

  return page;
}
