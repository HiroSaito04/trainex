#include "MasterHandleReader.h"
#include "../config/HardwarePins.h"
#include "../config/DeviceConfig.h"
void MasterHandleReader::begin(){for(uint8_t pin:kHandlePins)pinMode(pin,INPUT_PULLUP);stable_=-1;pending_=-1;changed_=millis();}
int MasterHandleReader::poll(uint32_t now){
 int found=-1;
 for(int i=0;i<8;i++) if(digitalRead(kHandlePins[i])==LOW){if(found!=-1){found=-1;break;}found=i;}
 // A valid contact on exactly one throw is mandatory; open or multiple contacts are ignored.
 if(found<0)return -1;
 if(found!=pending_){pending_=found;changed_=now;return -1;}
 if(found!=stable_ && now-changed_>=kDebounceMs){stable_=found;return stable_;}
 return -1;
}
