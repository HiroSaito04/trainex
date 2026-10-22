#pragma once
#include <Arduino.h>
class ButtonReader {
  uint8_t pin_;bool raw_=false,stable_=false;uint32_t changed_=0;
public:
  explicit ButtonReader(uint8_t pin):pin_(pin){}
  void begin();
  bool pressed(uint32_t now);
};
