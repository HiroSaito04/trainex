#pragma once
#include <Arduino.h>
#include "MasterHandleReader.h"
#include "ButtonReader.h"
class HardwareInputManager {
 MasterHandleReader handle_;
 ButtonReader emergency_,reset_,doorOpen_,doorClose_;
public:
 HardwareInputManager(uint8_t emergencyPin,uint8_t resetPin,uint8_t openPin,uint8_t closePin);
 void begin();
 void poll(void(*emit)(const char* control,const char* value));
};
