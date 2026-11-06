# TRAINEX physical controls to software commands

| Physical control | Hardware `controlId` | `value` | Engine command |
|---|---|---|---|
| 8-position master lever | `MASTER_HANDLE` | `EB`, `B3`, `B2`, `B1`, `N`, `P1`, `P2`, `P3` | `MASTER_HANDLE_SET` |
| Vigilance acknowledge (GPIO23) | `VIGILANCE_ACKNOWLEDGE` | none | `VIGILANCE_ACKNOWLEDGE` |
| Emergency Brake Reset (GPIO25) | `EMERGENCY_BRAKE_RESET` | none | `EMERGENCY_BRAKE_RESET` |
| Door Open (GPIO26) | `DOORS_OPEN` | none | `DOOR_OPEN_REQUEST` |
| Door Close (GPIO27) | `DOORS_CLOSE` | none | `DOOR_CLOSE_REQUEST` |

**No physical emergency-brake activation button.** Select `EB` on the master handle to trigger it. No physical LED controls or LED output pins are assigned. The buzzer is not wired or programmed yet; agree on sound rules and the buzzer electrical specifications first.
