import "./BrandWordmark.css";

export default function BrandWordmark({
  className = "",
}) {
  return (
    <span
      className={`brand-wordmark ${className}`.trim()}
    >
      <span className="brand-wordmark-train">
        TRAIN
      </span>

      <span className="brand-wordmark-ex">
        EX
      </span>
    </span>
  );
}
