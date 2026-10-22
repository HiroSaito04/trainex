#pragma once
#include <Arduino.h>
#include <WebSocketsClient.h>
class TrainexWebSocketClient {
 WebSocketsClient socket_;
 bool connected_=false,paired_=false;
 String sessionId_="";
 void (*feedback_)(const String&)=nullptr;
public:
 void begin(void(*onFeedback)(const String&));
 void loop();
 void sendInput(const String& payload);
 bool paired() const {return paired_;}
 String sessionId() const{return sessionId_;}
};
