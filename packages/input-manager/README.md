# @trainex/input-manager

Single input entry point. `createInputManager({ dispatchCommand, getSessionId })` returns an object with `submit(event): Promise<{accepted,reason?}>`.

2D and 3D inputs use canonical TRAINEX commands. Keyboard events use `source: 'keyboard', key: 't'|'c'|'b'|'e'|'r'|'o'|'p'`. Hardware events require `source:'hardware'`, authenticated routing *outside* this library, a `deviceId`, monotonically increasing `sequence`, and a `controlId`.

This package does **not** determine braking safety, door interlocks, or train dynamics: the engine does. It also does not authenticate hardware.
