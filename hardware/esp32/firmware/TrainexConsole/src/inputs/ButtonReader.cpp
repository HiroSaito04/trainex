#include "ButtonReader.h"
#include "../config/DeviceConfig.h"
void ButtonReader::begin(){pinMode(pin_,INPUT_PULLUP);raw_=digitalRead(pin_)==LOW;stable_=raw_;changed_=millis();}
bool ButtonReader::pressed(uint32_t now){
 const bool raw=digitalRead(pin_)==LOW;
 if(raw!=raw_){raw_=raw;changed_=now;}
 if(raw_!=stable_&&now-changed_>=kDebounceMs){stable_=raw_;return stable_;}
 return false;
}
