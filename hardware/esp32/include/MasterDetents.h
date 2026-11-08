#pragma once
#include <cmath>
#include <cstdint>

namespace trainex {
static constexpr int kMasterDetentCount = 13;
static constexpr const char* kDetentNames[kMasterDetentCount] = {
  "EB", "B7", "B6", "B5", "B4", "B3", "B2", "B1", "N", "P1", "P2", "P3", "P4"
};
static constexpr float kDetentAngles[kMasterDetentCount] = {
  -96, -84, -72, -60, -48, -36, -24, -12, 0, 12, 24, 36, 48
};
inline int nearestDetent(int raw, int neutralRaw, bool reverse, float toleranceDeg) {
  if (raw < 0 || raw > 4095 || neutralRaw < 0 || neutralRaw > 4095) return -1;
  int delta = raw - neutralRaw;
  while (delta > 2048) delta -= 4096;
  while (delta < -2048) delta += 4096;
  const float degrees = (reverse ? -1.0f : 1.0f) * (float)delta * 360.0f / 4096.0f;
  int best = -1;
  float minError = 1e6f;
  for (int i = 0; i < kMasterDetentCount; ++i) {
    float error = std::fabs(degrees - kDetentAngles[i]);
    if (error < minError) { minError = error; best = i; }
  }
  return minError <= toleranceDeg ? best : -1;
}
}
