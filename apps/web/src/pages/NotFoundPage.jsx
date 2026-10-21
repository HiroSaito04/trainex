
import Button from "../components/common/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="container not-found">
      <p className="eyebrow">
        ERROR 404
      </p>

      <h1>
        Page not found
      </h1>

      <p>
        The TRAINEX page you requested
        does not exist.
      </p>

      <Button to="/">
        Back to Home
      </Button>
    </div>
  );
}
