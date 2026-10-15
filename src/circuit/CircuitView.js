
import "@wokwi/elements";
import diagram from "./diagram.json";

const SVG_NS = "http://www.w3.org/2000/svg";

const PART_TYPES = new Set([
  "wokwi-arduino-uno",
  "wokwi-lcd2004",
  "wokwi-slide-potentiometer",
  "wokwi-pushbutton",
  "wokwi-led",
  "wokwi-resistor",
  "wokwi-buzzer",
]);

const WIRE_COLORS = {
  black: "#475569",
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
  yellow: "#eab308",
  purple: "#a855f7",
  orange: "#f97316",
  gray: "#94a3b8",
};

export class CircuitView {
  #elements = new Map();
  #canvas = null;
  #wires = null;

  constructor(container) {
    this.container = container;
  }

  get(id) {
    return this.#elements.get(id) ?? null;
  }

  async mount() {
    const canvas = document.createElement("div");
    canvas.className = "circuit-canvas";
    canvas.style.width = "1100px";
    canvas.style.height = "780px";

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "1100");
    svg.setAttribute("height", "780");
    svg.setAttribute("viewBox", "0 0 1100 780");

    Object.assign(svg.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      zIndex: "1",
    });

    canvas.append(svg);
    this.container.append(canvas);

    this.#canvas = canvas;
    this.#wires = svg;

    const minX = Math.min(
      ...diagram.parts.map(p => p.left ?? 0)
    );

    const minY = Math.min(
      ...diagram.parts.map(p => p.top ?? 0)
    );

    for (const part of diagram.parts) {
      if (!PART_TYPES.has(part.type)) {
        throw new Error(
          `Unsupported part: ${part.type}`
        );
      }

      const element = document.createElement(part.type);

      for (const [name, value] of Object.entries(
        part.attrs ?? {}
      )) {
        element.setAttribute(name, String(value));
      }

      Object.assign(element.style, {
        position: "absolute",
        left: `${part.left - minX + 70}px`,
        top: `${part.top - minY + 65}px`,
        zIndex: "2",
      });

      canvas.append(element);
      this.#elements.set(part.id, element);
    }

    await Promise.all(
      [...this.#elements.values()].map(async element => {
        await customElements.whenDefined(
          element.localName
        );
        await element.updateComplete;
      })
    );

    // Ensure pin positions can be measured.
    await new Promise(resolve =>
      requestAnimationFrame(resolve)
    );

    this.drawWires();

    return this;
  }

  #findPin(endpoint) {
    const [partId, pinName] = endpoint.split(":");
    const element = this.get(partId);

    if (!element) return null;

    const pin = element.pinInfo?.find(
      item => item.name === pinName
    );

    if (!pin) {
      console.warn("Missing circuit pin:", endpoint);
      return null;
    }

    const partRect = element.getBoundingClientRect();
    const canvasRect = this.#canvas.getBoundingClientRect();

    return {
      x: partRect.left - canvasRect.left + pin.x,
      y: partRect.top - canvasRect.top + pin.y,
    };
  }

  drawWires() {
    this.#wires.replaceChildren();

    for (const connection of diagram.connections) {
      const [source, destination, color] = connection;

      const from = this.#findPin(source);
      const to = this.#findPin(destination);

      if (!from || !to) continue;

      const middleX = (from.x + to.x) / 2;

      const path = document.createElementNS(
        SVG_NS, "path"
      );

      path.setAttribute(
        "d",
        `M ${from.x} ${from.y}
         L ${middleX} ${from.y}
         L ${middleX} ${to.y}
         L ${to.x} ${to.y}`
      );

      path.setAttribute(
        "stroke",
        WIRE_COLORS[color] ?? "#64748b"
      );
      path.setAttribute("stroke-width", "2.5");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("fill", "none");

      this.#wires.append(path);
    }
  }
}
