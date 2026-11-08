#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python tests/test_mappings.py
python tests/test_project_layout.py
out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT
c++ -std=c++17 -Iinclude tests/test_detents.cpp -o "$out/detents"
"$out/detents"
c++ -std=c++17 -DTRAINEX_ENABLE_NETWORK=0 -Itests/host_mocks -Iinclude -Isrc \
  src/main.cpp src/inputs/ButtonManager.cpp src/sensors/MasterHandleAS5600.cpp \
  src/communication/TrainexLink.cpp tests/test_button_bench.cpp -o "$out/button_test"
"$out/button_test"
