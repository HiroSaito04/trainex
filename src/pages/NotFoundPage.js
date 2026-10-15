
export function createNotFoundPage() {
  const page = document.createElement("div");

  page.className = "notfound-page container";

  page.innerHTML = `
    <div class="notfound-content">
      <div class="notfound-code">404</div>

      <p class="eyebrow">
        ROUTE NOT FOUND
      </p>

      <h1>You've reached the end of the line.</h1>

      <p class="notfound-description">
        The page you're looking for doesn't exist.
        Return to the TRAINEX simulator to continue
        your railway engineering training.
      </p>

      <a
        href="/"
        data-route
        class="primary-button"
      >
        ← Return to Simulator
      </a>
    </div>

    <div class="notfound-illustration" aria-hidden="true">
      <div class="notfound-track"></div>
      <span>END OF ROUTE</span>
    </div>
  `;

  return page;
}
