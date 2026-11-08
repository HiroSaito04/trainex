from pathlib import Path
root=Path(__file__).resolve().parents[1]
assert (root/'platformio.ini').exists()
assert (root/'src/main.cpp').exists()
assert 'default_envs = esp32dev' in (root/'platformio.ini').read_text()
assert 'TRAINEX_ENABLE_NETWORK=0' in (root/'platformio.ini').read_text()
assert 'TRAINEX_ENABLE_NETWORK=1' in (root/'platformio.ini').read_text()
assert 'include/Secrets.h' in (root/'.gitignore').read_text()
assert not (root/'firmware/TrainexConsole').exists()
# The .pio directory is allowed locally after a PlatformIO build.
assert (root/'include/Secrets.example.h').exists()
print('Build profiles, single active firmware, safe distribution PASS')
