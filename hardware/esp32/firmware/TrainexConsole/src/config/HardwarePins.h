#pragma once
#include <Arduino.h>
// Classic ESP32-WROOM DEVKIT, 3.3 V logic (not ESP32-S2/S3/C3)
static constexpr uint8_t kHandlePins[8]={13,14,16,17,18,19,21,22}; // EB B3 B2 B1 N P1 P2 P3
static constexpr char const* kHandleValues[8]={"EB","B3","B2","B1","N","P1","P2","P3"};
static constexpr uint8_t kPinEmergency=23;
static constexpr uint8_t kPinEmergencyReset=25;
static constexpr uint8_t kPinDoorOpen=26;
static constexpr uint8_t kPinDoorClose=27;
static constexpr uint8_t kPinAllDoorsClosedLed=32;
static constexpr uint8_t kPinEmergencyLed=33;
