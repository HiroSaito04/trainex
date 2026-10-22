#pragma once
#include <Arduino.h>
// Wi-Fi WSS and USB serial are mutually independent transports. Both may be enabled
// for debugging, but use ONE browser source to avoid duplicate physical controls.
static constexpr bool kEnableWiFi=true;
static constexpr bool kEnableUsbSerial=true;
static constexpr uint32_t kSerialBaud=115200;
static constexpr uint32_t kDebounceMs=35;
static constexpr char kDeviceId[]="trainex-esp32-01";
static constexpr char kRelayHost[]="YOUR-RELAY-DOMAIN.example.com";
static constexpr uint16_t kRelayPort=443;
static constexpr char kRelayPath[]="/ws";
