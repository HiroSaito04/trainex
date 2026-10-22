#pragma once
#include <Arduino.h>
class TrainexWiFiManager {
 uint32_t attempted_=0;
public:
 void begin();
 void loop();
 bool connected() const;
};
