#pragma once
#include <Arduino.h>
#include <TrainexHardwareConfig.h>

#if TRAINEX_ENABLE_NETWORK
#include <WiFi.h>
#include <WebSocketsClient.h>
#endif
namespace trainex {
class TrainexLink {
public:
  using PairedCallback = void (*)();
  void begin(PairedCallback onPaired);
  void poll(uint32_t now);
  void sendButton(const char* controlId, const char* value);
  void sendMaster(const char* notch);
  bool isPaired() const {
#if TRAINEX_ENABLE_NETWORK
    return authenticated_ && sessionId_.length() > 0;
#else
    return false;
#endif
  }
private:
#if TRAINEX_ENABLE_NETWORK
  void handleEvent(WStype_t type, uint8_t* payload, size_t length);
  void sendMessage(const String& json);
  bool authenticated_ = false;
  uint32_t sequence_ = 0;
  uint32_t lastHeartbeat_ = 0;
  uint32_t lastWiFiRetry_ = 0;
  String sessionId_;
  PairedCallback onPaired_ = nullptr;
  WebSocketsClient ws_;
  static TrainexLink* self_;
#endif
};
}
