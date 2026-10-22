#pragma once
#include <Arduino.h>
class MasterHandleReader {
 int stable_=-1,pending_=-1;uint32_t changed_=0;
public:
 void begin();
 int poll(uint32_t now); // returns selected index once changed, otherwise -1
};
