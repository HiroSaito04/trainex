# TRAINEX

**An Interactive Train Driver's Cab Mockup for Railway Engineering Education**

TRAINEX is a browser-based educational railway simulation platform designed to demonstrate the operation and interaction of selected primary train driver's cab components.

The application combines a responsive web interface with virtual Arduino hardware, allowing students to explore train control operations without physical electronic equipment.

## Features

- Interactive master control handle with eight notches: B3, B2, B1, N, P1, P2, P3, and P4.
- Simulated train acceleration and braking.
- Emergency brake activation and reset conditions.
- Passenger door opening and closing controls.
- Door interlock and All Doors Closed indicator.
- Virtual 20×4 LCD and buzzer.
- Responsive desktop and mobile interfaces.
- Light and dark themes.
- Educational information about railway cab operation.

## Technology Stack

| Technology | Purpose |
|---|---|
| Vite | Frontend development and build system |
| Vanilla JavaScript | Application logic and reusable components |
| Tailwind CSS | Interface styling |
| Arduino C++ | Original train control firmware |
| AVR8js | Browser-based AVR microcontroller emulation |
| Wokwi Elements | Visual electronic components |
| Web Workers | Background firmware execution |

## Getting Started

**Requirements:** Node.js, npm, and Arduino CLI for compiling firmware.

1. Clone the repository.
2. Run `npm install`.
3. Ensure the compiled Arduino firmware exists at `public/firmware/trainex.hex`.
4. Run `npm run dev`.
5. Open the local address provided by Vite.

To create a production build, run `npm run build`.

## Project Purpose

TRAINEX is intended as an accessible instructional tool for railway engineering students, particularly for understanding train control interfaces, component interaction, door interlocking, and emergency brake procedures.

## Project Status

**In development.** The browser-based AVR emulator and peripheral integrations require end-to-end testing against the compiled Arduino firmware.

## Disclaimer

TRAINEX demonstrates simplified train control behavior for educational purposes. It is not a certified railway training simulator and must not be used for actual railway operations or driver certification.