/*
 * =====================================================================================
 * Project: Automatic Night Light System (Smart Ambient Light-Adaptive Luminaire)
 * Course: Internet of Things (IoT) Laboratory
 * Hardware Platform: Arduino UNO R3 (ATmega328P MCU)
 * 
 * Pin Connections:
 *   - LDR Terminal 1      -> +5V Rail
 *   - LDR Terminal 2      -> Analog Pin A0 AND 10k Ohm Resistor Terminal 1
 *   - 10k Ohm Terminal 2  -> GND (Voltage Divider Pull-Down Configuration)
 *   - LED Anode (+)       -> Digital Pin D9 (via 220 Ohm Current-Limiting Resistor)
 *   - LED Cathode (-)     -> GND Rail
 * 
 * Baud Rate: 9600 bps
 * =====================================================================================
 */

// Hardware Pin Assignments
const int LDR_PIN = A0;      // Analog input pin connected to LDR voltage divider node
const int LED_PIN = 9;       // Digital output pin connected to 5mm LED via 220 Ohm resistor

// Dual-Threshold Hysteresis Parameters (to prevent rapid switching / chattering at dusk)
const int THRESHOLD_DARK  = 400;  // ADC <= 400 (V_out <= 1.95V) -> Insufficient light, Turn ON LED
const int THRESHOLD_LIGHT = 500;  // ADC >= 500 (V_out >= 2.44V) -> Sufficient ambient light, Turn OFF LED

// Filtering & Timing Constants
const int FILTER_SAMPLES = 10;            // Number of rolling ADC samples for noise smoothing
const unsigned long TELEMETRY_INTERVAL = 500; // Serial reporting interval in milliseconds

// State Variables
int adcBuffer[FILTER_SAMPLES];            // Circular buffer for ADC moving average filter
int bufferIndex = 0;                      // Current buffer insertion pointer
long runningSum = 0;                      // Running sum of ADC samples for fast averaging
bool isBufferFilled = false;              // Flag to indicate buffer prime status
bool ledState = false;                    // Current luminaire actuator state (false = OFF, true = ON)
unsigned long lastTelemetryTime = 0;      // Non-blocking timestamp tracker

void setup() {
  // Initialize GPIO directions
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW); // Start with luminaire extinguished

  // Initialize UART Serial Interface at 9600 bps (Standard Arduino Uno R3 HardwareSerial)
  Serial.begin(9600);

  // Prime the moving average filter with initial readings
  for (int i = 0; i < FILTER_SAMPLES; i++) {
    adcBuffer[i] = analogRead(LDR_PIN);
    runningSum += adcBuffer[i];
    delay(10);
  }
  isBufferFilled = true;

  // Print System Initialization Banner
  Serial.println(F("======================================================================"));
  Serial.println(F("  AUTOMATIC NIGHT LIGHT SYSTEM - FIRMWARE INITIALIZED (v1.0)"));
  Serial.println(F("  Department of Computer Science & Engineering / IoT Laboratory"));
  Serial.println(F("======================================================================"));
  Serial.println(F("Config: LDR on Pin A0 (10k Pull-Down) | LED on Pin D9 (220 Ohm Limiter)"));
  Serial.println(F("Hysteresis Window: ON Threshold <= 400 | OFF Threshold >= 500"));
  Serial.println(F("Time(ms)\tRaw ADC\tFiltered ADC\tVoltage(V)\tLuminaire\tAmbient Status"));
  Serial.println(F("----------------------------------------------------------------------"));
}

void loop() {
  // Step 1: Read instant analog voltage from LDR voltage divider
  int rawADC = analogRead(LDR_PIN);

  // Step 2: Update circular moving average filter to reject 50Hz/60Hz optical noise
  runningSum -= adcBuffer[bufferIndex];
  adcBuffer[bufferIndex] = rawADC;
  runningSum += rawADC;
  bufferIndex = (bufferIndex + 1) % FILTER_SAMPLES;

  int filteredADC = runningSum / FILTER_SAMPLES;

  // Step 3: Compute theoretical voltage at node A0 (Vref = 5.00V, 10-bit ADC = 1024 steps)
  float nodeVoltage = (filteredADC * 5.0) / 1023.0;

  // Step 4: Evaluate Hysteresis Comparator Logic
  if (filteredADC <= THRESHOLD_DARK) {
    ledState = true;
    digitalWrite(LED_PIN, HIGH); // Turn ON luminaire
  } else if (filteredADC >= THRESHOLD_LIGHT) {
    ledState = false;
    digitalWrite(LED_PIN, LOW);  // Turn OFF luminaire
  }
  // If THRESHOLD_DARK < filteredADC < THRESHOLD_LIGHT, maintain previous ledState (Deadband)

  // Step 5: Non-blocking Serial Telemetry Logging
  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = currentMillis;

    Serial.print(currentMillis);
    Serial.print(F("\t\t"));
    Serial.print(rawADC);
    Serial.print(F("\t"));
    Serial.print(filteredADC);
    Serial.print(F("\t\t"));
    Serial.print(nodeVoltage, 2);
    Serial.print(F(" V\t\t"));

    if (ledState) {
      Serial.print(F("[ ACTIVE ]\t"));
    } else {
      Serial.print(F("[ INACTIVE ]\t"));
    }

    // Ambient Lighting Classification
    if (filteredADC > 800) {
      Serial.println(F("Bright Sunlight / Direct Beam"));
    } else if (filteredADC > 600) {
      Serial.println(F("Well-Lit Room / Fluorescent Light"));
    } else if (filteredADC > 500) {
      Serial.println(F("Moderate Ambient Light"));
    } else if (filteredADC > 400) {
      Serial.println(F("Twilight / Hysteresis Deadband"));
    } else if (filteredADC > 200) {
      Serial.println(F("Dim Dusk / Night Fall"));
    } else {
      Serial.println(F("Complete Darkness"));
    }
  }

  delay(20); // Small cycle pacing
}
