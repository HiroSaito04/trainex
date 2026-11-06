# Digital input tests
1. Verify eight positions: EB, B3, B2, B1, N, P1, P2, P3; one `MASTER_HANDLE` event per valid change.
2. No contact or two closed contacts must not emit a new master position. Check 35 ms debounce.
3. Each pushbutton should emit one controlId on press, not release: GPIO23 `VIGILANCE_ACKNOWLEDGE`; GPIO25 `EMERGENCY_BRAKE_RESET`; GPIO26 `DOORS_OPEN`; GPIO27 `DOORS_CLOSE`.
4. Verify no GPIO is exposed to 5 V. No LED outputs should be required.
