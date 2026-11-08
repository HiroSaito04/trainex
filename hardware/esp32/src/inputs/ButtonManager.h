#pragma once
#include <Arduino.h>

namespace trainex {
struct ButtonDefinition {
  uint8_t gpio;
  const char* name;
  const char* controlId;
  const char* stringValue;  // nullptr means JSON true; LEFT or RIGHT for door open/close.
};
class ButtonManager {
public:
  using PressCallback = void (*)(const ButtonDefinition&);
  void begin();
  void poll(uint32_t now, PressCallback onPress);
  static const ButtonDefinition* definitions();
  static size_t count();
private:
  struct ButtonState { bool stableHigh; bool pendingHigh; uint32_t changedAt; };
  ButtonState state_[7] = {};
};
}
