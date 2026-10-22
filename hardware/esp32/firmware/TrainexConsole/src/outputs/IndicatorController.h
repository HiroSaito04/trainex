#pragma once
#include <Arduino.h>
class IndicatorController {
public:
 void begin();
 void set(bool doorsClosed,bool emergency);
};
