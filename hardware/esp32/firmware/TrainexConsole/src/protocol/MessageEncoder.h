#pragma once
#include <Arduino.h>
#include <ArduinoJson.h>
#include "../config/DeviceConfig.h"
inline String encodeInput(const String& sessionId,unsigned long seq,const char* control,const char* value){
 JsonDocument doc;
 doc["type"]="input";doc["deviceId"]=kDeviceId;doc["sequence"]=seq;
 if(sessionId.length())doc["sessionId"]=sessionId;
 doc["controlId"]=control;
 if(value&&strlen(value))doc["value"]=value;
 String text;serializeJson(doc,text);return text;
}
inline String encodeAuth(){
 JsonDocument doc;doc["type"]="auth";doc["role"]="device";doc["deviceId"]=kDeviceId;
 doc["token"]=TRAINEX_DEVICE_TOKEN;
 String text;serializeJson(doc,text);return text;
}
