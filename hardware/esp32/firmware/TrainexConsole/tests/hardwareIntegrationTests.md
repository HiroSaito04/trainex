# Integration tests — no physical LEDs
1. Start a TRAINEX simulation session and connect the ESP32 using **one** transport.
2. Verify all four buttons send distinct commands: Vigilance / EB Reset / Door Open / Door Close.
3. Set all eight master positions and verify website state. **EB** activates emergency braking.
4. Verify the Emergency Brake Reset button does not reset until stopped, N selected, and any vigilance trip acknowledged.
5. Verify the website (not physical LEDs) displays all-doors-closed and emergency state.
6. Allow the prototype vigilance timer to warn/trip while moving; acknowledge and verify reset workflow.
7. Verify reconnection, mismatched session rejection and duplicate sequence rejection.
8. When a buzzer is installed, test the agreed sound rules independently.

6. With authenticated state feedback active, observe buzzer silence before 32.5 s, audible tone from 32.5 s until the 35 s trip, and silence afterward. Press Vigilance Acknowledge during the buzzer stage to stop sound and clear warnings.
