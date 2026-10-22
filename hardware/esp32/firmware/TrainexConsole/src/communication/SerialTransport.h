#pragma once
#include <Arduino.h>
class TrainexSerialTransport {
 String pending_="";
 void (*feedback_)(const String&)=nullptr;
public:
 void begin(void(*onFeedback)(const String&));
 void loop();
 void sendInput(const String& payload);
};
