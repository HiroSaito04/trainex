#include <Arduino.h>
#include <TrainexHardwareConfig.h>
#include "inputs/ButtonManager.h"
#include "sensors/MasterHandleAS5600.h"
#include "communication/TrainexLink.h"

// Hardware only reports controls; all safety interlocks and simulator states
// are evaluated by TRAINEX's authoritative browser simulation engine.
trainex::ButtonManager buttons;
trainex::MasterHandleAS5600 handle;
trainex::TrainexLink trainexLink;

void onButtonPress(const trainex::ButtonDefinition& button) {
  trainexLink.sendButton(button.controlId, button.stringValue);
}
void onMasterChange(const char* notch) { trainexLink.sendMaster(notch); }
void onPaired() {
  // Only position state is replayed on pairing; NEVER replay button presses.
  const char* notch = handle.stableNotch();
  if (notch) trainexLink.sendMaster(notch);
}
void setup() {
  Serial.begin(115200); delay(250);
  Serial.println("TRAINEX 7-button hardware architecture | GPIO active LOW");
  buttons.begin();
  handle.begin();
  trainexLink.begin(onPaired);
  for (size_t i = 0; i < trainex::ButtonManager::count(); ++i) {
    const auto& b = trainex::ButtonManager::definitions()[i];
    Serial.printf("PIN %-2u %s\n", b.gpio, b.name);
  }
}
void loop() {
  const uint32_t now = millis();
  buttons.poll(now, onButtonPress);
  handle.poll(now, onMasterChange);
  trainexLink.poll(now);
  delay(2);
}
