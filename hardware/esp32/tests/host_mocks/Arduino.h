#pragma once
#include <cstdint>
#include <cstddef>
#include <cstdarg>
#include <cstdio>
#include <string>
#include <vector>
#include <map>
constexpr int INPUT_PULLUP = 2;
constexpr int HIGH = 1;
constexpr int LOW = 0;
extern uint32_t fakeMillis;
extern std::map<int,int> pinStates;
extern std::vector<std::string> serialLines;
inline unsigned long millis() {return fakeMillis;}
inline void delay(unsigned long n) {fakeMillis+=n;}
inline void pinMode(int pin, int /*mode*/) {pinStates[pin]=HIGH;}
inline int digitalRead(int pin) {return pinStates[pin];}
struct FakeSerial {
  void begin(unsigned long) {}
  void println(const char* s) {serialLines.emplace_back(s);}
  void println(const std::string& s) {serialLines.push_back(s);}
  template<typename... Args> void printf(const char* fmt, Args... args) {
    char buf[512]; std::snprintf(buf,sizeof(buf),fmt,args...); serialLines.emplace_back(buf);
  }
};
extern FakeSerial Serial;
