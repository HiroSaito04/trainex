#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <time.h>
#include <Wire.h>
#include <Secrets.h>
#include <TrainexRootCA.h>

// ESP32-WROOM-32: each rotary contact or button connects GPIO to GND.
// GPIO internal pullups are used; NEVER connect 5V to a GPIO.
// Match rotary physical positions to these pins before wiring.
static const uint8_t MASTER_PINS[8] = {13,14,16,17,18,19,21,22};
static const char *MASTER_VALUES[8] = {"EB","B3","B2","B1","N","P1","P2","P3"};
static const uint8_t BUTTON_PINS[3] = {25,26,27};
static const char *BUTTON_IDS[3] = {
  "EMERGENCY_BRAKE_RELEASE", "DOORS_OPEN", "DOORS_CLOSE"
};
// Enable after connecting AS5600 SDA=21 / SCL=22, and calibrating raw neutral.
// 0 = existing eight-contact prototype, 1 = AS5600 13-notch master handle.
#ifndef TRAINEX_USE_AS5600
#define TRAINEX_USE_AS5600 0
#endif
static constexpr int AS5600_NEUTRAL_RAW = 0; // CALIBRATE while handle is at N
static constexpr bool AS5600_REVERSE = false; // Change if physical direction is reversed
static const char* ANGLE_VALUES[13] = {"EB","B7","B6","B5","B4","B3","B2","B1","N","P1","P2","P3","P4"};
static const float ANGLES_DEG[13] = {-96,-84,-72,-60,-48,-36,-24,-12,0,12,24,36,48};
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
Button buttonStates[3];

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
  if(sessionId.isEmpty() || index<0 || index>=(TRAINEX_USE_AS5600 ? 13 : 8)) return;
  JsonDocument msg;
  msg["type"]="input";
  msg["deviceId"]=RELAY_DEVICE_ID;
  msg["sessionId"]=sessionId;
  msg["sequence"]=sequence++;
  msg["controlId"]="MASTER_HANDLE";
  msg["value"]=TRAINEX_USE_AS5600 ? ANGLE_VALUES[index] : MASTER_VALUES[index];
  sendObject(msg);
  Serial.printf("Master handle: %s\n",TRAINEX_USE_AS5600 ? ANGLE_VALUES[index] : MASTER_VALUES[index]);
}

int readDetent() {
#if TRAINEX_USE_AS5600
  // AS5600 raw angle: register 0x0C/0x0D, 12-bit position, 0..4095.
  Wire.beginTransmission(0x36);
  Wire.write(0x0C);
  if(Wire.endTransmission(false)!=0 || Wire.requestFrom(0x36,2)!=2)return -1;
  const int raw=((Wire.read()<<8)|Wire.read()) & 0x0FFF;
  int difference=raw-AS5600_NEUTRAL_RAW;
  while(difference>2048)difference-=4096;
  while(difference<-2048)difference+=4096;
  const float degrees=(AS5600_REVERSE?-1.f:1.f)*difference*360.f/4096.f;
  int nearest=-1;float smallest=1000;
  for(int i=0;i<13;i++) {
    const float distance=fabsf(degrees-ANGLES_DEG[i]);
    if(distance<smallest){smallest=distance;nearest=i;}
  }
  return smallest<=5.0f?nearest:-1; // Ignore handle between detents.
#else
  int index=-1;
  for(int i=0;i<8;i++) {
    if(digitalRead(MASTER_PINS[i])==LOW) {
      if(index!=-1)return -1; // Multiple positions active: ignore.
      index=i;
    }
  }
  return index;
#endif
}

void pollInputs() {
  const uint32_t now=millis();
  const int raw=readDetent();
  if(raw!=pendingDetent) {pendingDetent=raw;pendingDetentSince=now;}
  if(now-pendingDetentSince>=DEBOUNCE_MS && pendingDetent!=stableDetent) {
    stableDetent=pendingDetent;
    if(stableDetent>=0) sendMaster(stableDetent);
  }
  for(int i=0;i<3;i++) {
    const bool high=digitalRead(BUTTON_PINS[i])==HIGH;
    auto &b=buttonStates[i];
    if(high!=b.pendingHigh) {b.pendingHigh=high;b.changedAt=now;}
    if(now-b.changedAt>=DEBOUNCE_MS && high==b.pendingHigh && high!=b.stableHigh) {
      b.stableHigh=high;
      if(!high) sendInput(BUTTON_IDS[i],true);
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
        // Feedback is informational. Simulation engine owns braking timing.
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
#if TRAINEX_USE_AS5600
  Wire.begin(21,22); // SDA GPIO21; SCL GPIO22. Do not share with rotary contacts.
#else
  for(int i=0;i<8;i++) pinMode(MASTER_PINS[i],INPUT_PULLUP);
#endif
  for(int i=0;i<3;i++) {
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
