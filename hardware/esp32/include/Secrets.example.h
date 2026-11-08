#pragma once
// Copy this file to Secrets.h and edit only the private copy (it is gitignored).
// Never commit Wi-Fi credentials or relay tokens.
#define WIFI_SSID "YOUR_2G_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define RELAY_HOST "relay.example.com"       // hostname only; no wss:// or /ws
#define RELAY_DEVICE_ID "trainex-esp32-01"    // must match relay registration
#define RELAY_DEVICE_TOKEN "REPLACE_WITH_SECRET_DEVICE_TOKEN"
