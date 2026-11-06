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
#include "src/outputs/DisplayController.h"
#include "src/outputs/BuzzerController.h"

TrainexWiFiManager wifi;
TrainexWebSocketClient relay;
TrainexSerialTransport serialLink;
HardwareInputManager inputs(kPinVigilance,kPinEmergencyReset,kPinDoorOpen,kPinDoorClose);
DisplayController displayController;
BuzzerController buzzer;
unsigned long sequence=0;

// The website is authoritative for vigilance timing. No physical LEDs.
// Only the warning-stage buzzer output is implemented on the ESP32.
void applyFeedback(const String& payload){
 JsonDocument doc;if(!parseMessage(payload,doc))return;
 if(String(doc["type"]|"")!="state_feedback")return;
 displayController.showSpeed(doc["speed"]|0.0f);
 buzzer.setVigilanceBuzzer(doc["vigilanceBuzzer"]|false);
}
void emitControl(const char* control,const char* value){
 sequence++;
 if(kEnableWiFi&&relay.paired())relay.sendInput(encodeInput(relay.sessionId(),sequence,control,value));
 if(kEnableUsbSerial)serialLink.sendInput(encodeInput("",sequence,control,value));
}
void setup(){
 Serial.begin(kSerialBaud);
 inputs.begin();displayController.begin();buzzer.begin();
 if(kEnableUsbSerial)serialLink.begin(applyFeedback);
 if(kEnableWiFi){wifi.begin();relay.begin(applyFeedback);}
}
void loop(){
 if(kEnableWiFi){wifi.loop();relay.loop();}
 if(kEnableUsbSerial)serialLink.loop();
 inputs.poll(emitControl);
 delay(2);
}
