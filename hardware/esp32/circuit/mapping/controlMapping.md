# Physical control to TRAINEX contract

| Physical control | Control ID | Value | Engine command |
|---|---|---|---|
| Eight-stop master lever | `MASTER_HANDLE` | `EB`, `B3`, `B2`, `B1`, `N`, `P1`, `P2`, `P3` | `MASTER_HANDLE_SET` |
| Emergency brake | `EMERGENCY_BRAKE` | — | `EMERGENCY_BRAKE_ACTIVATE` |
| Emergency reset | `EMERGENCY_BRAKE_RESET` | — | `EMERGENCY_BRAKE_RESET` |
| Open doors | `DOORS_OPEN` | — | `DOOR_OPEN_REQUEST` |
| Close doors | `DOORS_CLOSE` | — | `DOOR_CLOSE_REQUEST` |

The software InputManager enforces 2D/3D/hardware session and command validation. Door control currently operates the combined system, not individual side selection.
