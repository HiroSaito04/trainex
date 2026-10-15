
/*
 * TRAINEX
 * An Interactive Train Driver's Cab Mockup
 * for Railway Engineering Education
 *
 * Platform: Arduino Uno / ATmega328P
 * Display: 20x4 I2C LCD (0x27)
 *
 * Software-based railway cab demonstration.
 */

#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <string.h>

// ==========================================
// HARDWARE CONFIGURATION
// ==========================================

constexpr uint8_t PIN_HANDLE = A0;
constexpr uint8_t PIN_EB = 2;
constexpr uint8_t PIN_EB_RESET = 3;
constexpr uint8_t PIN_DOOR_OPEN = 4;
constexpr uint8_t PIN_DOOR_CLOSE = 5;
constexpr uint8_t PIN_DOOR_LAMP = 6;
constexpr uint8_t PIN_BUZZER = 7;

LiquidCrystal_I2C lcd(0x27, 20, 4);

// ==========================================
// TRAIN CONFIGURATION
// ==========================================

constexpr float MAX_SPEED_KPH = 80.0f;
constexpr float EMERGENCY_DECEL = -5.5f;

constexpr unsigned long DOOR_TIME_MS = 2000;
constexpr unsigned long SIM_INTERVAL_MS = 100;
constexpr unsigned long LCD_INTERVAL_MS = 200;
constexpr unsigned long DEBOUNCE_MS = 25;

const char* const NOTCH_NAMES[8] = {
  "B3", "B2", "B1", "N",
  "P1", "P2", "P3", "P4"
};

const float NOTCH_ACCEL[8] = {
  -4.0f,
  -3.0f,
  -2.0f,
  -0.1f,
   1.0f,
   2.0f,
   3.0f,
   4.0f
};

// ==========================================
// TRAIN STATES
// ==========================================

enum DoorState {
  DOORS_CLOSED,
  DOORS_OPENING,
  DOORS_OPEN,
  DOORS_CLOSING
};

float trainSpeed = 0.0f;
uint8_t currentNotch = 3;

bool emergencyBrake = false;

DoorState doorState = DOORS_CLOSED;
unsigned long doorStartedAt = 0;

unsigned long lastSimulation = 0;
unsigned long lastDisplay = 0;

const char* systemMessage = "SYSTEM READY";

// ==========================================
// BUTTON DEBOUNCING
// ==========================================

struct Button {
  uint8_t pin;
  bool stableState;
  bool previousReading;
  unsigned long changedAt;
};

Button ebButton = {
  PIN_EB, HIGH, HIGH, 0
};

Button resetButton = {
  PIN_EB_RESET, HIGH, HIGH, 0
};

Button openButton = {
  PIN_DOOR_OPEN, HIGH, HIGH, 0
};

Button closeButton = {
  PIN_DOOR_CLOSE, HIGH, HIGH, 0
};

bool wasPressed(Button &button, unsigned long now) {
  bool reading = digitalRead(button.pin);

  if (reading != button.previousReading) {
    button.changedAt = now;
    button.previousReading = reading;
  }

  if (
    now - button.changedAt >= DEBOUNCE_MS &&
    reading != button.stableState
  ) {
    button.stableState = reading;

    if (reading == LOW) {
      return true;
    }
  }

  return false;
}

// ==========================================
// NON-BLOCKING CHIME CONTROLLER
// ==========================================

const int DOOR_CHIME[] = {880, 660};
const int RESET_CHIME[] = {660, 880, 1100};

const int* currentChime = nullptr;

uint8_t chimeLength = 0;
uint8_t chimeIndex = 0;

unsigned long nextChimeNote = 0;

void startChime(const int* notes, uint8_t count) {
  currentChime = notes;
  chimeLength = count;
  chimeIndex = 0;
  nextChimeNote = 0;
}

void updateChime(unsigned long now) {
  if (currentChime != nullptr) {
    if (now >= nextChimeNote) {
      if (chimeIndex >= chimeLength) {
        currentChime = nullptr;
        noTone(PIN_BUZZER);
        return;
      }

      tone(
        PIN_BUZZER,
        currentChime[chimeIndex]
      );

      chimeIndex++;
      nextChimeNote = now + 250;
    }

    return;
  }

  // Emergency alarm while the train is moving.
  if (emergencyBrake && trainSpeed > 0.0f) {
    if ((now / 300) % 2 == 0) {
      tone(PIN_BUZZER, 1000);
    } else {
      noTone(PIN_BUZZER);
    }
  } else {
    noTone(PIN_BUZZER);
  }
}

// ==========================================
// MASTER CONTROL HANDLE
// ==========================================

void updateMasterHandle() {
  int analogValue = analogRead(PIN_HANDLE);

  currentNotch = constrain(
    analogValue / 128,
    0,
    7
  );
}

const char* currentMode() {
  if (emergencyBrake) {
    return "EMERG";
  }

  if (
    currentNotch >= 4 &&
    doorState != DOORS_CLOSED
  ) {
    return "INTERLOCK";
  }

  if (currentNotch >= 4) {
    return "POWER";
  }

  if (currentNotch == 3) {
    return "COAST";
  }

  return "BRAKE";
}

// ==========================================
// EMERGENCY BRAKE
// ==========================================

void applyEmergencyBrake() {
  emergencyBrake = true;
  systemMessage = "EMERGENCY BRAKE";
}

void resetEmergencyBrake() {
  if (!emergencyBrake) {
    return;
  }

  if (
    trainSpeed <= 0.0f &&
    currentNotch <= 3
  ) {
    emergencyBrake = false;

    systemMessage = "EB RESET";
    startChime(RESET_CHIME, 3);
  } else {
    systemMessage = "STOP + HANDLE N/B";
  }
}

// ==========================================
// DOOR SYSTEM
// ==========================================

void openDoors(unsigned long now) {
  if (trainSpeed > 0.0f) {
    systemMessage = "TRAIN MOVING";
    return;
  }

  if (doorState != DOORS_CLOSED) {
    return;
  }

  doorState = DOORS_OPENING;
  doorStartedAt = now;

  systemMessage = "DOORS OPENING";
  startChime(DOOR_CHIME, 2);
}

void closeDoors(unsigned long now) {
  if (
    doorState != DOORS_OPEN &&
    doorState != DOORS_OPENING
  ) {
    return;
  }

  doorState = DOORS_CLOSING;
  doorStartedAt = now;

  systemMessage = "DOORS CLOSING";
  startChime(DOOR_CHIME, 2);
}

void updateDoors(unsigned long now) {
  if (
    doorState != DOORS_OPENING &&
    doorState != DOORS_CLOSING
  ) {
    return;
  }

  if (now - doorStartedAt < DOOR_TIME_MS) {
    return;
  }

  if (doorState == DOORS_OPENING) {
    doorState = DOORS_OPEN;
    systemMessage = "DOORS OPEN";
  } else {
    doorState = DOORS_CLOSED;
    systemMessage = "ALL DOORS CLOSED";
  }
}

const char* doorStateText() {
  switch (doorState) {
    case DOORS_CLOSED:  return "CLOSED";
    case DOORS_OPENING: return "OPENING";
    case DOORS_OPEN:    return "OPEN";
    case DOORS_CLOSING: return "CLOSING";
    default:            return "UNKNOWN";
  }
}

// ==========================================
// TRAIN MOVEMENT SIMULATION
// ==========================================

void simulateTrain(float deltaSeconds) {
  float acceleration;

  if (emergencyBrake) {
    acceleration = EMERGENCY_DECEL;
  } else {
    acceleration = NOTCH_ACCEL[currentNotch];

    // Door traction interlock.
    if (
      acceleration > 0 &&
      doorState != DOORS_CLOSED
    ) {
      acceleration = 0;
      systemMessage = "DOOR INTERLOCK";
    }
  }

  trainSpeed += acceleration * deltaSeconds;

  trainSpeed = constrain(
    trainSpeed,
    0.0f,
    MAX_SPEED_KPH
  );
}

// ==========================================
// ALL DOORS CLOSED INDICATOR
// ==========================================

void updateDoorLamp() {
  digitalWrite(
    PIN_DOOR_LAMP,
    doorState == DOORS_CLOSED ? HIGH : LOW
  );
}

// ==========================================
// 20x4 LCD DISPLAY
// ==========================================

void printLcdLine(uint8_t row, const char* text) {
  char buffer[21];

  strncpy(buffer, text, 20);
  buffer[20] = '\0';

  uint8_t length = strlen(buffer);

  for (uint8_t i = length; i < 20; i++) {
    buffer[i] = ' ';
  }

  buffer[20] = '\0';

  lcd.setCursor(0, row);
  lcd.print(buffer);
}

void updateDisplay() {
  char line[32];

  snprintf(
    line,
    sizeof(line),
    "SPD:%3d km/h  %s",
    (int)(trainSpeed + 0.5f),
    NOTCH_NAMES[currentNotch]
  );

  printLcdLine(0, line);

  snprintf(
    line,
    sizeof(line),
    "MODE: %s",
    currentMode()
  );

  printLcdLine(1, line);

  snprintf(
    line,
    sizeof(line),
    "DOORS: %s",
    doorStateText()
  );

  printLcdLine(2, line);

  snprintf(
    line,
    sizeof(line),
    "EB:%s LAMP:%s",
    emergencyBrake ? "ON" : "OFF",
    doorState == DOORS_CLOSED ? "ON" : "OFF"
  );

  printLcdLine(3, line);
}

// ==========================================
// ARDUINO SETUP
// ==========================================

void setup() {
  pinMode(PIN_EB, INPUT_PULLUP);
  pinMode(PIN_EB_RESET, INPUT_PULLUP);
  pinMode(PIN_DOOR_OPEN, INPUT_PULLUP);
  pinMode(PIN_DOOR_CLOSE, INPUT_PULLUP);

  pinMode(PIN_DOOR_LAMP, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  updateDoorLamp();

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("TRAINEX");

  lcd.setCursor(0, 1);
  lcd.print("Railway Cab Trainer");

  lcd.setCursor(0, 2);
  lcd.print("PUP REMA 306");

  delay(1500);
  lcd.clear();

  lastSimulation = millis();
  lastDisplay = millis();
}

// ==========================================
// MAIN LOOP
// ==========================================

void loop() {
  unsigned long now = millis();

  updateMasterHandle();

  // Emergency brake always receives priority.
  if (wasPressed(ebButton, now)) {
    applyEmergencyBrake();
  }

  if (wasPressed(resetButton, now)) {
    resetEmergencyBrake();
  }

  if (wasPressed(openButton, now)) {
    openDoors(now);
  }

  if (wasPressed(closeButton, now)) {
    closeDoors(now);
  }

  updateDoors(now);

  if (
    now - lastSimulation >= SIM_INTERVAL_MS
  ) {
    unsigned long elapsed =
      now - lastSimulation;

    lastSimulation = now;

    // Avoid a large simulation jump.
    float dt = min(elapsed / 1000.0f, 0.25f);

    simulateTrain(dt);
  }

  updateDoorLamp();
  updateChime(now);

  if (
    now - lastDisplay >= LCD_INTERVAL_MS
  ) {
    lastDisplay = now;
    updateDisplay();
  }
}
