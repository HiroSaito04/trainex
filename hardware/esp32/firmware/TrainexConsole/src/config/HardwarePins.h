#pragma once
#include <Arduino.h>
// Classic ESP32-WROOM DEVKIT, 3.3 V logic (not ESP32-S2/S3/C3)
static constexpr uint8_t kHandlePins[8]={13,14,16,17,18,19,21,22}; // EB B3 B2 B1 N P1 P2 P3
static constexpr char const* kHandleValues[8]={"EB","B3","B2","B1","N","P1","P2","P3"};
static constexpr uint8_t kPinVigilance=23; // NO push button to GND, INPUT_PULLUP
static constexpr uint8_t kPinEmergencyReset=25;
static constexpr uint8_t kPinDoorOpen=26;
static constexpr uint8_t kPinDoorClose=27;
// Optional PASSIVE PIEZO buzzer: low-current, 3.3V-compatible device on GPIO32.
// For higher-current or active buzzer, use a correctly rated transistor driver.
static constexpr uint8_t kPinBuzzer=32; // GPIO32 -> buzzer input (+), buzzer (-) -> GND
