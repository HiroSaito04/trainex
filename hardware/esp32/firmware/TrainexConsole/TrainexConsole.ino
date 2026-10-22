#include <Arduino.h>
#include <ArduinoJson.h>
#include "src/config/HardwarePins.h"
#include "src/config/DeviceConfig.h"
#include "src/config/Secrets.h"
#include "src/inputs/InputManager.h"
#include "src/communication/WiFiManager.h"
#include "src/communication/WebSocketClient.h"
#include "src/communication/SerialTransport.h"
#include "src/protocol/MessageEncoder.h"
#include "src/protocol/MessageDecoder.h"
#include "src/outputs/IndicatorController.h"
#include "src/outputs/DisplayController.h"

TrainexWiFiManager wifi;
TrainexWebSocketClient relay;
TrainexSerialTransport serialLink;
HardwareInputManager inputs(kPinEmergency,kPinEmergencyReset,kPinDoorOpen,kPinDoorClose);
IndicatorController indicators;
DisplayController displayController;
unsigned long sequence=0;

void applyFeedback(const String& payload){
 JsonDocument doc;if(!parseMessage(payload,doc))return;
 if(String(doc["type"]|"")!="state_feedback")return;
 indicators.set(doc["allDoorsClosed"]|false,doc["emergencyBrake"]|false);
 displayController.showSpeed(doc["speed"]|0.0f);
}
void emitControl(const char* control,const char* value){
 sequence++;
 if(kEnableWiFi&&relay.paired())relay.sendInput(encodeInput(relay.sessionId(),sequence,control,value));
 if(kEnableUsbSerial)serialLink.sendInput(encodeInput("",sequence,control,value));
}
void setup(){
 Serial.begin(kSerialBaud);
 inputs.begin();indicators.begin();displayController.begin();
 if(kEnableUsbSerial)serialLink.begin(applyFeedback);
 if(kEnableWiFi){wifi.begin();relay.begin(applyFeedback);}
}
void loop(){
 if(kEnableWiFi){wifi.loop();relay.loop();}
 if(kEnableUsbSerial)serialLink.loop();
 inputs.poll(emitControl);
 delay(2);
}
