#include "SerialTransport.h"
void TrainexSerialTransport::begin(void(*onFeedback)(const String&)){feedback_=onFeedback;}
void TrainexSerialTransport::loop(){while(Serial.available()){
 char c=Serial.read();if(c=='\n'){if(feedback_&&pending_.length())feedback_(pending_);pending_="";}
 else if(c!='\r'&&pending_.length()<4096)pending_+=c;
}}
void TrainexSerialTransport::sendInput(const String& payload){Serial.println(payload);}
