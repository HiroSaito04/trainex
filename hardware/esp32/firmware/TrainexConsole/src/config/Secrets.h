#pragma once
// Copy to Secrets.h and fill locally. Secrets.h is git-ignored.
// Never commit Wi-Fi credentials, device token, or the trusted CA certificate.
#define TRAINEX_WIFI_SSID "YOUR_WIFI_SSID"
#define TRAINEX_WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define TRAINEX_DEVICE_TOKEN "PASTE_RANDOM_DEVICE_TOKEN_FROM_RELAY_CONFIG"
// PEM-encoded certificate of the CA that signs your relay endpoint's TLS certificate.
// If omitted, the firmware must NOT open a WSS connection.
static const char TRAINEX_ROOT_CA[] = R"PEM(-----BEGIN CERTIFICATE-----
PASTE_REAL_CERTIFICATE_HERE
-----END CERTIFICATE-----)PEM";
