# TRAINEX Educational Content — train driving concepts

The **Learn** page teaches driver-cab layout, traction, service braking, emergency braking, passenger doors, driver instruments and railway safety. It does **not** teach website navigation or TRAINEX architecture.

- Nine ordered lessons with objectives, short sections and review questions
- Five cab component references
- Railway operational glossary; no software architecture definitions
- Simulator, hardware and troubleshooting guides remain in `src/data/guides/` and belong under **About / Guide**

The EB–B3–B2–B1–N–P1–P2–P3 controller is this teaching cab's layout. It is not a universal train standard. Pressure numbers and operating responses in this prototype are illustrative, not certified measurements or real train operating instructions.

```sh
npm run test --workspace=@trainex/educational-content
```
