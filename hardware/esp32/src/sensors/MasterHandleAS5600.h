#pragma once
#include <Arduino.h>
namespace trainex {
class MasterHandleAS5600 {
public:
  using PositionCallback = void (*)(const char* notch);
  void begin();
  void poll(uint32_t now, PositionCallback callback);
  const char* stableNotch() const;
  bool available() const;
private:
  int readRaw();
  bool magnetPresent();
  int stable_ = -1;
  int pending_ = -1;
  uint32_t changedAt_ = 0;
  uint32_t lastPoll_ = 0;
  uint32_t lastDiagnostic_ = 0;
  bool available_ = false;
};
}
