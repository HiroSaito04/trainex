#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <Secrets.h>
#include <TrainexRootCA.h>

// ESP32-WROOM-32: each rotary contact or button connects GPIO to GND.
// GPIO internal pullups are used; NEVER connect 5V to a GPIO.
// Match rotary physical positions to these pins before wiring.
static const uint8_t MASTER_PINS[8] = {13,14,16,17,18,19,21,22};
static const char *MASTER_VALUES[8] = {"EB","B3","B2","B1","N","P1","P2","P3"};
static const uint8_t BUTTON_PINS[5] = {23,25,26,27,32};
static const char *BUTTON_IDS[5] = {
  "EMERGENCY_BRAKE_RESET", "DOORS_OPEN", "DOORS_CLOSE", "HORN", "VIGILANCE_ACK"
};
static constexpr uint32_t DEBOUNCE_MS = 45;
static constexpr uint32_t HEARTBEAT_MS = 20000;
static constexpr uint32_t WIFI_RETRY_MS = 5000;

WebSocketsClient socketClient;
String sessionId;
bool authenticated=false;
uint32_t sequence=0;
uint32_t lastHeartbeat=0;
uint32_t lastWiFiRetry=0;
int stableDetent=-1;
int pendingDetent=-1;
uint32_t pendingDetentSince=0;
struct Button {
  bool stableHigh=true;
  bool pendingHigh=true;
  uint32_t changedAt=0;
};
Button buttonStates[5];

void sendObject(JsonDocument &doc) {
  if (!authenticated || !socketClient.isConnected()) return;
  String payload;
  serializeJson(doc,payload);
  socketClient.sendTXT(payload);
}

void sendHeartbeat() {
  JsonDocument msg;
  msg["type"]="heartbeat";
  sendObject(msg);
}

void sendInput(const char *controlId, bool value) {
  if(sessionId.isEmpty()) return;
  JsonDocument msg;
  msg["type"]="input";
  msg["deviceId"]=RELAY_DEVICE_ID;
  msg["sessionId"]=sessionId;
  msg["sequence"]=sequence++;
  msg["controlId"]=controlId;
  msg["value"]=value;
  sendObject(msg);
  Serial.printf("Input: %s=%s\n",controlId,value?"true":"false");
}

void sendMaster(int index) {
  if(sessionId.isEmpty() || index<0 || index>=8) return;
  JsonDocument msg;
  msg["type"]="input";
  msg["deviceId"]=RELAY_DEVICE_ID;
  msg["sessionId"]=sessionId;
  msg["sequence"]=sequence++;
  msg["controlId"]="MASTER_HANDLE";
  msg["value"]=MASTER_VALUES[index];
  sendObject(msg);
  Serial.printf("Master handle: %s\n",MASTER_VALUES[index]);
}

int readDetent() {
  int index=-1;
  for(int i=0;i<8;i++) {
    if(digitalRead(MASTER_PINS[i])==LOW) {
      if(index!=-1) return -1; // Multiple positions active: ignore.
      index=i;
    }
  }
  return index;
}

void pollInputs() {
  const uint32_t now=millis();
  const int raw=readDetent();
  if(raw!=pendingDetent) {pendingDetent=raw;pendingDetentSince=now;}
  if(now-pendingDetentSince>=DEBOUNCE_MS && pendingDetent!=stableDetent) {
    stableDetent=pendingDetent;
    if(stableDetent>=0) sendMaster(stableDetent);
  }
  for(int i=0;i<5;i++) {
    const bool high=digitalRead(BUTTON_PINS[i])==HIGH;
    auto &b=buttonStates[i];
    if(high!=b.pendingHigh) {b.pendingHigh=high;b.changedAt=now;}
    if(now-b.changedAt>=DEBOUNCE_MS && high==b.pendingHigh && high!=b.stableHigh) {
      b.stableHigh=high;
      // Horn has a release event; other controls are momentary press events.
      if(i==3) sendInput(BUTTON_IDS[i],!high);
      else if(!high) sendInput(BUTTON_IDS[i],true);
    }
  }
}

void onSocketEvent(WStype_t event,uint8_t *payload,size_t length) {
  switch(event) {
    case WStype_CONNECTED: {
      authenticated=false;
      sessionId="";
      Serial.println("TLS WebSocket connected, authenticating device...");
      JsonDocument auth;
      auth["type"]="auth";
      auth["role"]="device";
      auth["deviceId"]=RELAY_DEVICE_ID;
      auth["token"]=RELAY_DEVICE_TOKEN;
      String data;
      serializeJson(auth,data);
      socketClient.sendTXT(data);
      break;
    }
    case WStype_TEXT: {
      JsonDocument msg;
      if(deserializeJson(msg,payload,length)) { Serial.println("Invalid relay JSON");return; }
      const String type=msg["type"] | "";
      if(type=="authenticated") {
        authenticated=true;
        Serial.println("Device authenticated; waiting for simulator pairing");
      } else if(type=="paired") {
        sessionId=String(msg["sessionId"] | "");
        sequence=0;
        Serial.println("Paired to session: "+sessionId);
        if(stableDetent>=0) sendMaster(stableDetent);
      } else if(type=="unpaired") {
        Serial.println("Session unpaired");
        sessionId="";
      } else if(type=="error") {
        Serial.println(String("Relay error: ")+(msg["reason"] | "unknown"));
      } else if(type=="state_feedback") {
        // Feedback is informational. Simulation engine owns braking/vigilance timing.
        Serial.println("Simulator state feedback received");
      }
      break;
    }
    case WStype_DISCONNECTED:
      authenticated=false;sessionId="";
      Serial.println("Relay disconnected; reconnecting...");
      break;
    default: break;
  }
}

void connectWiFi() {
  if(WiFi.status()==WL_CONNECTED) return;
  if(millis()-lastWiFiRetry < WIFI_RETRY_MS) return;
  lastWiFiRetry=millis();
  Serial.println("Connecting to 2.4 GHz Wi-Fi...");
  WiFi.begin(WIFI_SSID,WIFI_PASSWORD);
}

void setup() {
  Serial.begin(115200);
  delay(300);
  for(int i=0;i<8;i++) pinMode(MASTER_PINS[i],INPUT_PULLUP);
  for(int i=0;i<5;i++) {
    pinMode(BUTTON_PINS[i],INPUT_PULLUP);
    buttonStates[i].stableHigh=digitalRead(BUTTON_PINS[i])==HIGH;
    buttonStates[i].pendingHigh=buttonStates[i].stableHigh;
  }
  stableDetent=readDetent();pendingDetent=stableDetent;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID,WIFI_PASSWORD);
  // TLS hostname + CA verification (no setInsecure()).
  configTime(0,0,"pool.ntp.org","time.google.com");
  socketClient.beginSslWithCA(RELAY_HOST,443,"/ws",TRAINEX_RELAY_CA_PEM);
  socketClient.setExtraHeaders(""); // Remove library default "Origin: file://".
  socketClient.setReconnectInterval(5000);
  socketClient.onEvent(onSocketEvent);
  socketClient.enableHeartbeat(25000,5000,2);
  Serial.println("TRAINEX ESP32 starting. Waiting for Wi-Fi + trusted TLS.");
}

void loop() {
  connectWiFi();
  if(WiFi.status()==WL_CONNECTED && time(nullptr)>1700000000) {
    socketClient.loop();
  }
  pollInputs();
  if(authenticated && millis()-lastHeartbeat>=HEARTBEAT_MS) {
    lastHeartbeat=millis();sendHeartbeat();
  }
  delay(2);
}
