
export function createFooter() {
  const footer = document.createElement("footer");

  footer.className = "site-footer";

  footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-description">
          <a href="/" data-route class="brand">
            <span class="brand-mark" aria-hidden="true">
              T
            </span>

            <span>
              TRAIN<span class="brand-accent">EX</span>
            </span>
          </a>

          <p>
            An Interactive Train Driver's Cab Mockup
            for Railway Engineering Education.
          </p>
        </div>

        <div class="footer-column">
          <h3>Explore</h3>

          <a href="/#simulator" data-route>Simulator</a>
          <a href="/#controls" data-route>Train Controls</a>
          <a href="/#learn" data-route>Learning Guide</a>
        </div>

        <div class="footer-column">
          <h3>Technologies</h3>

          <span>Vite + Tailwind CSS</span>
          <span>AVR8js</span>
          <span>Wokwi Elements</span>
          <span>Arduino Uno</span>
        </div>
      </div>

      <div class="footer-bottom">
        <span>
          © ${new Date().getFullYear()} TRAINEX
        </span>

        <span>
          Educational simulation only.
          Not for real train operation.
        </span>
      </div>
    </div>
  `;

  return footer;
}
