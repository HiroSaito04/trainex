
let component = null;

// Register a React component provided by
// the independent 2D simulator package.

export function registerSimulator2D(
  SimulatorComponent
) {
  component = SimulatorComponent;
}

export function getSimulator2D() {
  return component;
}
