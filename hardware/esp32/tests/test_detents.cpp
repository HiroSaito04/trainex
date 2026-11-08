#include <MasterDetents.h>
#include <cassert>
#include <cmath>
#include <iostream>
int main() {
  using namespace trainex;
  const int neutral = 2048;
  for (int i = 0; i < kMasterDetentCount; ++i) {
    int raw = (int)std::round(neutral + (kDetentAngles[i] * 4096.0 / 360.0));
    raw = (raw % 4096 + 4096) % 4096;
    assert(nearestDetent(raw, neutral, false, 5.0f) == i);
  }
  assert(nearestDetent(2048, -1, false, 5.f) == -1);
  assert(nearestDetent(-1, neutral, false, 5.f) == -1);
  assert(nearestDetent(2700, neutral, false, 5.f) == -1);
  assert(nearestDetent(1000, 1000, false, 5.f) == 8); // Neutral wrap calibration
  std::cout << "13-notch AS5600 quantizer PASS\n";
}
