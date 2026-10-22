#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
inline bool parseMessage(const String& raw,JsonDocument& out){
 if(raw.length()>4096)return false;
 return deserializeJson(out,raw)==DeserializationError::Ok;
}
