
let component = null;

// Register a React component provided by
// the independent 3D simulator package.

export function registerSimulator3D(
  SimulatorComponent
) {
  component = SimulatorComponent;
}

export function getSimulator3D() {
  return component;
}
