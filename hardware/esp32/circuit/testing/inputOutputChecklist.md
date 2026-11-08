# TRAINEX hardware functional test checklist

- [ ] (FUTURE ONLY) `AS5600 RAW` sensor reads valid values with magnet near sensor.
- [ ] (FUTURE ONLY) Physical N calibrated; `TRAINEX_AS5600_NEUTRAL_RAW` in [0,4095].
- [ ] (FUTURE ONLY) Every detent reads: EB B7 B6 B5 B4 B3 B2 B1 N P1 P2 P3 P4.
- [ ] GPIO18 LEFT ENABLE emits `DOOR_ENABLE_LEFT=true` once per press.
- [ ] GPIO26 LEFT OPEN emits `DOORS_OPEN=LEFT` once per press.
- [ ] GPIO27 LEFT CLOSE emits `DOORS_CLOSE=LEFT` once per press.
- [ ] GPIO19 RIGHT ENABLE emits `DOOR_ENABLE_RIGHT=true` once per press.
- [ ] GPIO25 RIGHT OPEN emits `DOORS_OPEN=RIGHT` once per press.
- [ ] GPIO33 RIGHT CLOSE emits `DOORS_CLOSE=RIGHT` once per press.
- [ ] GPIO23 VIGILANCE emits `VIGILANCE_ACKNOWLEDGE=true` once per press.
- [ ] Release events do not trigger additional commands; no phantom events while idle.
- [ ] Website + relay validators accept side strings (`LEFT` / `RIGHT`) only for door open/close; all other button values true.
- [ ] Website engine rejects opening unless matching door side enabled at standstill with master N.
- [ ] Left door button only changes left bank; right only right bank; upper TMS row LEFT, lower row RIGHT.
- [ ] All doors closed and open indicators update from engine state, not physical GPIOs.
- [ ] Vigilance warning and acknowledgement work; master EB applies emergency braking.
- [ ] Session starts from Hardware tab, browser/ESP32 authenticated and paired to same ID.
- [ ] Physical hardware test and platform firmware compilation have been completed before claiming end-to-end operation.
