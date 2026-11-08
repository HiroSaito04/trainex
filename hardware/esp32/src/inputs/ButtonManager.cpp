#include "ButtonManager.h"
#include <TrainexHardwareConfig.h>
namespace trainex {
namespace {
constexpr ButtonDefinition kButtons[] = {
  {TRAINEX_PIN_LEFT_ENABLE,   "Left Enable",  "DOOR_ENABLE_LEFT",      nullptr},
  {TRAINEX_PIN_LEFT_OPEN,     "Left Open",    "DOORS_OPEN",            "LEFT"},
  {TRAINEX_PIN_LEFT_CLOSE,    "Left Close",   "DOORS_CLOSE",           "LEFT"},
  {TRAINEX_PIN_RIGHT_ENABLE,  "Right Enable", "DOOR_ENABLE_RIGHT",     nullptr},
  {TRAINEX_PIN_RIGHT_OPEN,    "Right Open",   "DOORS_OPEN",            "RIGHT"},
  {TRAINEX_PIN_RIGHT_CLOSE,   "Right Close",  "DOORS_CLOSE",           "RIGHT"},
  {TRAINEX_PIN_VIGILANCE,     "Vigilance",    "VIGILANCE_ACKNOWLEDGE", nullptr}
};
static_assert(sizeof(kButtons)/sizeof(kButtons[0]) == 7, "Requires 7 physical buttons");
}
const ButtonDefinition* ButtonManager::definitions() { return kButtons; }
size_t ButtonManager::count() { return sizeof(kButtons)/sizeof(kButtons[0]); }
void ButtonManager::begin() {
  for (size_t i = 0; i < count(); ++i) {
    pinMode(kButtons[i].gpio, INPUT_PULLUP);
    const bool high = digitalRead(kButtons[i].gpio) == HIGH;
    state_[i] = {high, high, static_cast<uint32_t>(millis())};
  }
}
void ButtonManager::poll(uint32_t now, PressCallback onPress) {
  for (size_t i = 0; i < count(); ++i) {
    const bool high = digitalRead(kButtons[i].gpio) == HIGH;
    ButtonState& s = state_[i];
    if (high != s.pendingHigh) { s.pendingHigh = high; s.changedAt = now; }
    if (s.pendingHigh != s.stableHigh && now - s.changedAt >= TRAINEX_BUTTON_DEBOUNCE_MS) {
      s.stableHigh = s.pendingHigh;
      // PRESS (HIGH->LOW) only. RELEASE does not produce a train action.
      if (!s.stableHigh && onPress) onPress(kButtons[i]);
    }
  }
}
}
