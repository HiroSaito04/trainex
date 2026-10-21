
# TRAINEX 2D Simulator

Interactive railway driver console implemented
as an independent React package.

## Scope

The package contains:

- Front Display Panel
- All Doors Closed Indicating Lamp
- Master Control Handle
- Emergency Brake Switch
- Passenger Door Controls
- Component Explorer
- Educational Control Diagram

## Architecture

The simulator is a presentation and input module.

It does not calculate train movement, determine
operating interlocks, or maintain authoritative
simulation state.

## Component API

Simulator2D accepts:

- trainState: engine state snapshot
- sendInput: standardized command callback
- ready: engine connection/readiness
- sessionId: active simulation session ID

## Integration

Import Simulator2D from
@trainex/simulator-2d.

Connect sendInput to Centralized Input Management.

Pass trainState from the shared Train Simulation
Engine.

## Development

npm install
npm test

## Important

The present console layout is provisional.

Exact control geometry, detents, labels, and
indication colors must be checked against
the approved TRAINEX driver console reference.