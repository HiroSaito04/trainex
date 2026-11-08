from pathlib import Path
import csv, re
root = Path(__file__).resolve().parents[1]
rows = list(csv.DictReader((root / 'circuit/mapping/gpioMapping.csv').open()))
buttons = [r for r in rows if r['kind'] == 'BUTTON']
assert len(buttons) == 7, f'Expected seven buttons, got {len(buttons)}'
pins = [int(r['gpio']) for r in buttons]
assert len(pins) == len(set(pins)), 'GPIO reused across button inputs'
assert set(pins) == {18,19,23,25,26,27,33}, pins
assert {21,22}.isdisjoint(pins)
source = (root / 'src/inputs/ButtonManager.cpp').read_text()
for row in buttons:
    assert row['control_id'] in source, row
    assert row['config_define'] in source, row
assert (root/'include/TrainexHardwareConfig.h').read_text().count('#define TRAINEX_ENABLE_AS5600 0') == 1
# A developer may legitimately create Secrets.h locally or a .pio/build cache.
# Distribution scrubbing is checked when packaging; both are ignored by Git.
assert 'include/Secrets.h' in (root/'.gitignore').read_text()
print('GPIO, event ID, reserved pins, and private file checks PASS')
