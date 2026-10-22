#include "WiFiManager.h"
#include "../config/Secrets.h"
#include "../protocol/ProtocolConfig.h"
#include <WiFi.h>
void TrainexWiFiManager::begin(){WiFi.mode(WIFI_STA);WiFi.begin(TRAINEX_WIFI_SSID,TRAINEX_WIFI_PASSWORD);attempted_=millis();}
void TrainexWiFiManager::loop(){if(WiFi.status()!=WL_CONNECTED && millis()-attempted_>=kWiFiReconnectIntervalMs){attempted_=millis();WiFi.disconnect();WiFi.begin(TRAINEX_WIFI_SSID,TRAINEX_WIFI_PASSWORD);}}
bool TrainexWiFiManager::connected() const{return WiFi.status()==WL_CONNECTED;}
