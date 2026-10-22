#include "IndicatorController.h"
#include "../config/HardwarePins.h"
void IndicatorController::begin(){pinMode(kPinAllDoorsClosedLed,OUTPUT);pinMode(kPinEmergencyLed,OUTPUT);set(false,false);}
void IndicatorController::set(bool doorsClosed,bool emergency){digitalWrite(kPinAllDoorsClosedLed,doorsClosed?HIGH:LOW);digitalWrite(kPinEmergencyLed,emergency?HIGH:LOW);}
