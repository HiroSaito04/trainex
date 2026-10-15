
const NAV_ITEMS = Object.freeze([
  {
    label: "Simulator",
    href: "/#simulator",
  },
  {
    label: "Controls",
    href: "/#controls",
  },
  {
    label: "Learning Guide",
    href: "/#learn",
  },
]);

export function createNavbar() {
  const header = document.createElement("header");
  header.className = "site-header";

  const links = NAV_ITEMS.map(
    ({ label, href }) => `
      <a href="${href}" data-route class="nav-link">
        ${label}
      </a>
    `
  ).join("");

  header.innerHTML = `
    <div class="nav-container">
      <a href="/" data-route class="brand"
         aria-label="TRAINEX home">
        <span class="brand-mark" aria-hidden="true">
          T
        </span>

        <span>
          TRAIN<span class="brand-accent">EX</span>
        </span>
      </a>

      <nav class="desktop-nav" aria-label="Main navigation">
        ${links}
      </nav>

      <div class="nav-actions">
        <button
          type="button"
          class="theme-button"
          data-theme-toggle
        >
          Toggle theme
        </button>

        <details class="mobile-menu">
          <summary aria-label="Toggle navigation">
            <span aria-hidden="true">☰</span>
            Menu
          </summary>

          <nav aria-label="Mobile navigation">
            ${links}
          </nav>
        </details>
      </div>
    </div>
  `;

  const mobileMenu = header.querySelector(".mobile-menu");

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.open = false;
    });
  });

  return header;
}
