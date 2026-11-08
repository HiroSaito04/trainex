#include <Arduino.h>
#include <TrainexHardwareConfig.h>
#include <cassert>
#include <iostream>
#include <map>
#include <string>
#include <vector>
uint32_t fakeMillis=0;
std::map<int,int> pinStates;
std::vector<std::string> serialLines;
FakeSerial Serial;
extern void setup();
extern void loop();
int countEvents(const std::string& pattern){
  int n=0;
  for(const auto& s:serialLines) if(s.find(pattern)!=std::string::npos) ++n;
  return n;
}
void tick(int milliseconds){for(int i=0;i<milliseconds;i+=2)loop();}
int main(){
  setup();
  assert(countEvents("TRAINEX BENCH MODE")==1);
  const struct {int pin;const char* token;} buttons[]={
    {18,"BUTTON DOOR_ENABLE_LEFT true"}, {26,"BUTTON DOORS_OPEN LEFT"},
    {27,"BUTTON DOORS_CLOSE LEFT"}, {19,"BUTTON DOOR_ENABLE_RIGHT true"},
    {25,"BUTTON DOORS_OPEN RIGHT"}, {33,"BUTTON DOORS_CLOSE RIGHT"},
    {23,"BUTTON VIGILANCE_ACKNOWLEDGE true"}
  };
  for(auto &b:buttons){
    assert(pinStates[b.pin]==HIGH);
    int before=countEvents(b.token);
    pinStates[b.pin]=LOW;
    tick(20); // bounce or sub-35 ms press: ignore
    assert(countEvents(b.token)==before);
    pinStates[b.pin]=HIGH;
    tick(48);
    assert(countEvents(b.token)==before);
    pinStates[b.pin]=LOW;
    tick(50); // stable press
    assert(countEvents(b.token)==before+1);
    tick(100); // held button: no repeats
    assert(countEvents(b.token)==before+1);
    pinStates[b.pin]=HIGH;
    tick(50); // release: no event
    assert(countEvents(b.token)==before+1);
  }
  assert(countEvents("BUTTON ")==7);
  std::cout<<"ESP32 source host build + all 7 button debounce tests PASS\n";
}
