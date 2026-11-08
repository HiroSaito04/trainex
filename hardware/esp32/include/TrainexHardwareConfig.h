#pragma once

// Build profiles: 0 = serial-only bench test, 1 = Wi-Fi/relay paired control.
#ifndef TRAINEX_ENABLE_NETWORK
#define TRAINEX_ENABLE_NETWORK 0
#endif
// Physical prototype scope: precisely seven normally-open switches to GND.
// Inputs LOW=pressed using internal pull-ups. Other cab controls remain web-only.
#define TRAINEX_PIN_LEFT_ENABLE 18
#define TRAINEX_PIN_LEFT_OPEN   26
#define TRAINEX_PIN_LEFT_CLOSE  27
#define TRAINEX_PIN_RIGHT_ENABLE 19
#define TRAINEX_PIN_RIGHT_OPEN   25
#define TRAINEX_PIN_RIGHT_CLOSE  33
#define TRAINEX_PIN_VIGILANCE    23

// Reserved AS5600 magnetic sensor for 13-notch handle; not installed yet.
// Change ENABLE_AS5600 to 1 ONLY after the module and shaft magnet are installed.
#define TRAINEX_ENABLE_AS5600 0
#define TRAINEX_AS5600_SDA 21
#define TRAINEX_AS5600_SCL 22
#define TRAINEX_AS5600_ADDRESS 0x36
// Read RAW at physical neutral first; -1 blocks all uncalibrated handle commands.
#ifndef TRAINEX_AS5600_NEUTRAL_RAW
#define TRAINEX_AS5600_NEUTRAL_RAW -1
#endif
#ifndef TRAINEX_AS5600_REVERSE
#define TRAINEX_AS5600_REVERSE 0
#endif
#ifndef TRAINEX_AS5600_TOLERANCE_DEG
#define TRAINEX_AS5600_TOLERANCE_DEG 5.0f
#endif

#define TRAINEX_BUTTON_DEBOUNCE_MS 35U
#define TRAINEX_SENSOR_SETTLE_MS 45U
#define TRAINEX_SENSOR_POLL_MS 25U
#define TRAINEX_DIAGNOSTIC_PERIOD_MS 1000U
#define TRAINEX_HEARTBEAT_MS 20000U
#define TRAINEX_WIFI_RETRY_MS 5000U
