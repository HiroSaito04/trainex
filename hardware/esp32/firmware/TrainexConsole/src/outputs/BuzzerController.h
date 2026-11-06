#pragma once
#include <Arduino.h>
class BuzzerController {
 public:
  void begin();
  void setVigilanceBuzzer(bool active);
 private:
  bool active_=false;
};
