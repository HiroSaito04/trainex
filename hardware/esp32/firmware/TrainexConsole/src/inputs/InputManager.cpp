#include "InputManager.h"
#include "../config/HardwarePins.h"
HardwareInputManager::HardwareInputManager(uint8_t emergencyPin,uint8_t resetPin,uint8_t openPin,uint8_t closePin)
 :emergency_(emergencyPin),reset_(resetPin),doorOpen_(openPin),doorClose_(closePin){}
void HardwareInputManager::begin(){handle_.begin();emergency_.begin();reset_.begin();doorOpen_.begin();doorClose_.begin();}
void HardwareInputManager::poll(void(*emit)(const char*,const char*)){
 uint32_t now=millis(); const int handle=handle_.poll(now);
 if(handle>=0)emit("MASTER_HANDLE",kHandleValues[handle]);
 if(emergency_.pressed(now))emit("EMERGENCY_BRAKE","");
 if(reset_.pressed(now))emit("EMERGENCY_BRAKE_RESET","");
 if(doorOpen_.pressed(now))emit("DOORS_OPEN","");
 if(doorClose_.pressed(now))emit("DOORS_CLOSE","");
}
