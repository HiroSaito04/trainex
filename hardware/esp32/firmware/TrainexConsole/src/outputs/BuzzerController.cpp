#include "BuzzerController.h"
#include "../config/HardwarePins.h"
#include <esp_arduino_version.h>
// A 2.2 kHz tone on a low-current passive piezo. Does NOT block switch polling.
// Arduino-ESP32 3.x uses pin-based LEDC; Arduino-ESP32 2.x uses channels.
static constexpr uint32_t kToneHz=2200;
static constexpr uint8_t kLedcChannel=0;
void BuzzerController::begin(){
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcAttach(kPinBuzzer,kToneHz,8);
  ledcWriteTone(kPinBuzzer,0);
#else
  ledcSetup(kLedcChannel,kToneHz,8);
  ledcAttachPin(kPinBuzzer,kLedcChannel);
  ledcWriteTone(kLedcChannel,0);
#endif
}
void BuzzerController::setVigilanceBuzzer(bool active){
  if(active==active_) return;
  active_=active;
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  ledcWriteTone(kPinBuzzer,active?kToneHz:0);
#else
  ledcWriteTone(kLedcChannel,active?kToneHz:0);
#endif
}
