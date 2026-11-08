#include "TrainexLink.h"
#if TRAINEX_ENABLE_NETWORK
#include <ArduinoJson.h>
#include <time.h>
#include <Secrets.h>
#include <TrainexRootCA.h>
#include <TrainexHardwareConfig.h>
namespace trainex {
TrainexLink* TrainexLink::self_ = nullptr;
void TrainexLink::begin(PairedCallback onPaired) {
  self_ = this;
  onPaired_ = onPaired;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  configTime(0, 0, "pool.ntp.org", "time.google.com");
  ws_.beginSslWithCA(RELAY_HOST, 443, "/ws", TRAINEX_RELAY_CA_PEM);
  ws_.setReconnectInterval(5000);
  ws_.onEvent([](WStype_t type, uint8_t* p, size_t n) {
    if (self_) self_->handleEvent(type, p, n);
  });
  ws_.enableHeartbeat(25000, 5000, 2);
}
void TrainexLink::sendMessage(const String& json) {
  if (isPaired() && ws_.isConnected()) ws_.sendTXT(json);
}
void TrainexLink::sendButton(const char* id, const char* side) {
  Serial.printf("BUTTON %s %s %s\n", id, side ? side : "true", isPaired() ? "(paired)" : "(offline)");
  if (!isPaired()) return;
  JsonDocument doc;
  doc["type"] = "input";
  doc["deviceId"] = RELAY_DEVICE_ID;
  doc["sessionId"] = sessionId_;
  doc["sequence"] = sequence_++;
  doc["controlId"] = id;
  if (side) doc["value"] = side; else doc["value"] = true;
  String data; serializeJson(doc, data); sendMessage(data);
}
void TrainexLink::sendMaster(const char* notch) {
  Serial.printf("MASTER_HANDLE %s %s\n", notch, isPaired() ? "(paired)" : "(offline)");
  if (!isPaired()) return;
  JsonDocument doc;
  doc["type"] = "input";
  doc["deviceId"] = RELAY_DEVICE_ID;
  doc["sessionId"] = sessionId_;
  doc["sequence"] = sequence_++;
  doc["controlId"] = "MASTER_HANDLE";
  doc["value"] = notch;
  String data; serializeJson(doc, data); sendMessage(data);
}
void TrainexLink::handleEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED: {
      authenticated_ = false; sessionId_ = "";
      JsonDocument doc;
      doc["type"] = "auth";
      doc["role"] = "device";
      doc["deviceId"] = RELAY_DEVICE_ID;
      doc["token"] = RELAY_DEVICE_TOKEN;
      String out; serializeJson(doc, out); ws_.sendTXT(out);
      Serial.println("WSS connected; authenticating...");
      break;
    }
    case WStype_TEXT: {
      JsonDocument doc;
      if (deserializeJson(doc, payload, length)) { Serial.println("WSS invalid JSON"); return; }
      const String typeName = doc["type"] | "";
      if (typeName == "authenticated") { authenticated_ = true; Serial.println("Authenticated. Pair from Hardware tab."); }
      else if (typeName == "paired") {
        sessionId_ = String(doc["sessionId"] | ""); sequence_ = 0;
        Serial.println("Paired session: " + sessionId_);
        if (onPaired_) onPaired_();
      } else if (typeName == "unpaired") { sessionId_ = ""; Serial.println("Unpaired"); }
      else if (typeName == "error") { Serial.println(String("WSS error: ") + (doc["reason"] | "unknown")); }
      break;
    }
    case WStype_DISCONNECTED:
      authenticated_ = false; sessionId_ = "";
      Serial.println("Relay disconnected"); break;
    default: break;
  }
}
void TrainexLink::poll(uint32_t now) {
  if (WiFi.status() != WL_CONNECTED && now - lastWiFiRetry_ >= TRAINEX_WIFI_RETRY_MS) {
    lastWiFiRetry_ = now;
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.println("Reconnecting 2.4GHz Wi-Fi...");
  }
  if (WiFi.status() == WL_CONNECTED && time(nullptr) > 1700000000) ws_.loop();
  if (isPaired() && now - lastHeartbeat_ >= TRAINEX_HEARTBEAT_MS) {
    lastHeartbeat_ = now;
    JsonDocument doc; doc["type"] = "heartbeat";
    String data; serializeJson(doc, data); sendMessage(data);
  }
}
}

#else // Serial-only bench build: no network libraries, no credentials required.
namespace trainex {
void TrainexLink::begin(PairedCallback /*onPaired*/) {
  Serial.println("TRAINEX BENCH MODE: no Wi-Fi or relay required");
  Serial.println("Each button should print once per press; release is silent.");
}
void TrainexLink::poll(uint32_t /*now*/) {}
void TrainexLink::sendButton(const char* id, const char* side) {
  Serial.printf("BUTTON %s %s (bench)\n", id, side ? side : "true");
}
void TrainexLink::sendMaster(const char* notch) {
  Serial.printf("MASTER_HANDLE %s (bench)\n", notch);
}
} // namespace trainex
#endif
