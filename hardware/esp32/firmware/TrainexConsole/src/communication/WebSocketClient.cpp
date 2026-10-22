#include "WebSocketClient.h"
#include "../config/DeviceConfig.h"
#include "../config/Secrets.h"
#include "../protocol/MessageEncoder.h"
#include "../protocol/MessageDecoder.h"
#include "../diagnostics/Diagnostics.h"
#include <ArduinoJson.h>
void TrainexWebSocketClient::begin(void(*onFeedback)(const String&)){
 feedback_=onFeedback;
 const String ca=TRAINEX_ROOT_CA;
 if(ca.indexOf("PASTE_REAL_CERTIFICATE_HERE")>=0||ca.length()<100){TRAINEX_LOG("Cannot start WSS: configure TRAINEX_ROOT_CA in Secrets.h");return;}
 socket_.beginSSL(kRelayHost,kRelayPort,kRelayPath);
 socket_.setCACert(TRAINEX_ROOT_CA);
 socket_.setReconnectInterval(7000);
 socket_.onEvent([this](WStype_t type,uint8_t* payload,size_t length){
  if(type==WStype_CONNECTED){connected_=true;paired_=false;sessionId_="";socket_.sendTXT(encodeAuth());return;}
  if(type==WStype_DISCONNECTED){connected_=false;paired_=false;sessionId_="";return;}
  if(type!=WStype_TEXT||length>4096)return;
  String raw;raw.reserve(length);for(size_t i=0;i<length;i++)raw+=(char)payload[i];
  JsonDocument doc;if(!parseMessage(raw,doc))return;
  const String kind=doc["type"]|"";
  if(kind=="paired"){paired_=true;sessionId_=doc["sessionId"].as<String>();TRAINEX_LOG("Paired");}
  else if(kind=="unpaired"){paired_=false;sessionId_="";}
  else if(kind=="state_feedback"&&paired_&&doc["sessionId"].as<String>()==sessionId_){if(feedback_)feedback_(raw);}
 });
}
void TrainexWebSocketClient::loop(){socket_.loop();}
void TrainexWebSocketClient::sendInput(const String& payload){if(connected_&&paired_)socket_.sendTXT(payload);}
