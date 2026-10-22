1. Select 8 distinct rotary positions and verify `MASTER_HANDLE` events are emitted with EB,B3,B2,B1,N,P1,P2,P3.
2. No contact: no new event. Two closed contacts: no event. Debounce limits bouncing.
3. Press and release each momentary button once; expect one event.
4. Verify GPIO never sees more than 3.3 V.
