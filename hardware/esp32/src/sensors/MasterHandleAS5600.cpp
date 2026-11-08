#include "MasterHandleAS5600.h"
#include <TrainexHardwareConfig.h>
#include <MasterDetents.h>
#include <Wire.h>
namespace trainex {
void MasterHandleAS5600::begin() {
#if TRAINEX_ENABLE_AS5600
  Wire.begin(TRAINEX_AS5600_SDA, TRAINEX_AS5600_SCL);
  Wire.setClock(100000);
  Serial.println("AS5600 enabled; master handle sensor will be polled");
  if (TRAINEX_AS5600_NEUTRAL_RAW < 0)
    Serial.println("Master handle uncalibrated. Set TRAINEX_AS5600_NEUTRAL_RAW after reading physical N.");
#else
  Serial.println("AS5600 disabled: 7 physical buttons work without sensor");
#endif
}
int MasterHandleAS5600::readRaw() {
#if TRAINEX_ENABLE_AS5600
  Wire.beginTransmission(TRAINEX_AS5600_ADDRESS);
  Wire.write((uint8_t)0x0C);
  if (Wire.endTransmission(false) != 0) return -1;
  if (Wire.requestFrom((uint8_t)TRAINEX_AS5600_ADDRESS, (uint8_t)2) != 2) return -1;
  return ((Wire.read() << 8) | Wire.read()) & 0x0fff;
#else
  return -1;
#endif
}
bool MasterHandleAS5600::magnetPresent() {
#if TRAINEX_ENABLE_AS5600
  Wire.beginTransmission(TRAINEX_AS5600_ADDRESS);
  Wire.write((uint8_t)0x0B); // STATUS; bit 5 (MD) signals magnet detected.
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom((uint8_t)TRAINEX_AS5600_ADDRESS, (uint8_t)1) != 1) return false;
  return (Wire.read() & 0x20) != 0;
#else
  return false;
#endif
}
void MasterHandleAS5600::poll(uint32_t now, PositionCallback callback) {
#if TRAINEX_ENABLE_AS5600
  if (now - lastPoll_ < TRAINEX_SENSOR_POLL_MS) return;
  lastPoll_ = now;
  const int raw = readRaw();
  available_ = raw >= 0 && magnetPresent();
  const int index = available_ ? nearestDetent(raw, TRAINEX_AS5600_NEUTRAL_RAW,
                    TRAINEX_AS5600_REVERSE != 0, TRAINEX_AS5600_TOLERANCE_DEG) : -1;
  if (now - lastDiagnostic_ > TRAINEX_DIAGNOSTIC_PERIOD_MS) {
    lastDiagnostic_ = now;
    Serial.printf("AS5600 RAW=%d MAGNET=%s NEUTRAL=%d NOTCH=%s\n",
      raw, available_ ? "YES" : "NO", TRAINEX_AS5600_NEUTRAL_RAW,
      index < 0 ? "UNRECOGNIZED" : kDetentNames[index]);
  }
  if (index != pending_) { pending_ = index; changedAt_ = now; }
  if (pending_ != stable_ && now - changedAt_ >= TRAINEX_SENSOR_SETTLE_MS) {
    stable_ = pending_;
    if (stable_ >= 0 && callback) callback(kDetentNames[stable_]);
  }
#else
  (void)now; (void)callback;
#endif
}
const char* MasterHandleAS5600::stableNotch() const {
#if TRAINEX_ENABLE_AS5600
  return stable_ >= 0 ? kDetentNames[stable_] : nullptr;
#else
  return nullptr;
#endif
}
bool MasterHandleAS5600::available() const { return available_; }
}
