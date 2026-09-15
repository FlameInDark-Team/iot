# 💡 IoT Laboratory & Smart Automatic Night Light System

> **Department of Computer Science & Engineering / Information Technology**  
> **Internet of Things (IoT) & Embedded Systems Laboratory**  
> *Compliant with ATmega328P Hardware Specifications • Production C++ Firmware • Interactive Web Simulator*

[![GitHub repo](https://img.shields.io/badge/GitHub-FlameInDark--Team%2Fiot-blue?logo=github)](https://github.com/FlameInDark-Team/iot)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Simulation-success?logo=vercel)](https://iot-lab-one.vercel.app)
[![Hardware](https://img.shields.io/badge/Hardware-Arduino%20UNO%20R3-00979D?logo=arduino)](https://www.arduino.cc/)
[![License](https://img.shields.io/badge/License-Academic%20Lab-orange)](#)

---

## 🌟 Live Interactive Simulation Portal

Experience the fully responsive, physics-driven web simulation portal with real-time 50Hz oscilloscope sampling, COM3 serial telemetry, and hardware workbench inspection:

👉 **[Launch Interactive Simulation Portal (Live on Vercel)](https://iot-lab-one.vercel.app)**

---

## 📌 Project Overview: Automatic Night Light System

The **Automatic Night Light System** is an ambient light-adaptive luminaire automation project engineered around the **Arduino UNO R3 (ATmega328P)**. The system autonomously senses environmental light levels and transitions an LED actuator or AC mains relay between **ACTIVE (ON)** and **INACTIVE (OFF)** states without human intervention or relay contact chatter.

```
                  +5V Rail
                     |
                   [LDR] (GL5528 Photoresistor)
                     |
                     +-----> Pin A0 (Analog Voltage Tap)
                     |
                  [10 kΩ] (Fixed Pull-Down Resistor)
                     |
                    GND
                     
               ATmega328P Microcontroller
                     |
                  Pin D9 (Digital Output)
                     |
                  [220 Ω] (Current Limiting Resistor)
                     |
                  [ LED ] (Luminaire / Actuator)
                     |
                    GND
```

---

## 🔬 Core Engineering Innovations

1. **Photoconductive Physics**: Cadmium Sulfide ($E_g = 2.42\,\text{eV}$) bandgap absorption produces a 3-order-of-magnitude resistance swing from $1\,\text{M}\Omega$ in dark to $400\,\Omega$ in bright sun.
2. **Optimal Potential Divider**: Fixed $10\,\text{k}\Omega$ pull-down resistor strategically matched to twilight resistance ($R_{\text{LDR}} \approx 10-15\,\text{k}\Omega$) maximizing node sensitivity $S = |dV/dR|$.
3. **10-Sample Rolling Average Filter**: High-frequency optical noise, mains $50\,\text{Hz}$ hum, and thermal flutter are eliminated using a circular FIFO buffer.
4. **Schmitt Trigger Hysteresis Comparator**:
   - **$T_{\text{DARK}} = 400$ Counts ($1.95\,\text{V}$ / $\approx 35\,\text{Lux}$)**: Luminaire illuminates when descending into nightfall.
   - **$T_{\text{LIGHT}} = 500$ Counts ($2.44\,\text{V}$ / $\approx 85\,\text{Lux}$)**: Luminaire extinguishes when ascending into daybreak.
   - **Deadband $\Delta = 100$ Counts ($0.49\,\text{V}$)**: Guarantees 100% chatter-free operation during slow dawn/dusk transitions.

---

## 📸 Real Hardware Prototype & Custom PCB Shield

The project includes laboratory workbench macro photography and custom Gerber PCB shield layouts:
- **MB-102 Breadboard Prototype**: Arduino UNO R3, GL5528 photocell, 10kΩ pull-down, 220Ω current limiter, luminaire LED, and bench multimeter.
- **Custom Arduino UNO R3 PCB Shield**: Double-sided 1.6mm FR-4 printed circuit board with 0805 SMD resistors, screw terminal blocks, and ground plane copper pour.

---

## 📦 Bill of Materials (BOM) & Sourcing (INR ₹)

| # | Component Name | Part / Model ID | Technical Specification | Qty | Unit (₹) | Total (₹) | Amazon India Sourcing |
|---|----------------|-----------------|-------------------------|:---:|:--------:|:---------:|:---------------------:|
| 1 | Arduino UNO R3 Development Board | `A000066 / DIP-28` | ATmega328P, 16MHz, 5V, 14 Digital / 6 Analog | 1 | ₹480.00 | ₹480.00 | [Amazon India](https://www.amazon.in/s?k=Arduino+Uno+R3+board) |
| 2 | Cadmium Sulfide (CdS) LDR Sensor | `GL5528 / VT90N2` | 5mm Dia, 10–20kΩ @ 10 lux, 1MΩ dark | 1 | ₹15.00 | ₹15.00 | [Amazon India](https://www.amazon.in/s?k=GL5528+LDR+photoresistor+5mm) |
| 3 | Fixed Carbon Film Pull-Down Resistor | `CFR-25JR-10K` | 10 kΩ, 0.25W (1/4W), ±5% tolerance | 1 | ₹2.00 | ₹2.00 | [Amazon India](https://www.amazon.in/s?k=10k+ohm+resistor+quarter+watt) |
| 4 | Current-Limiting Actuator Resistor | `CFR-25JR-220R` | 220 Ω, 0.25W (1/4W), ±5% tolerance | 1 | ₹2.00 | ₹2.00 | [Amazon India](https://www.amazon.in/s?k=220+ohm+resistor+quarter+watt) |
| 5 | Diffused Red Luminaire Indicator LED | `WP7113ID` | 5mm Round, Vf = 2.0V, If = 20mA max | 1 | ₹5.00 | ₹5.00 | [Amazon India](https://www.amazon.in/s?k=5mm+red+diffused+led) |
| 6 | Solderless Breadboard | `MB-102` | 400 / 830 Tie-Points, 2 Power Rails | 1 | ₹95.00 | ₹95.00 | [Amazon India](https://www.amazon.in/s?k=MB102+breadboard+830+points) |
| 7 | Premium Male-to-Male Jumper Wires | `M2M-JMP-20CM` | 24 AWG tinned copper core, multi-color pack | 6 | ₹4.50 | ₹27.00 | [Amazon India](https://www.amazon.in/s?k=male+to+male+jumper+wires+arduino) |
| 8 | USB 2.0 Type-A to Type-B Cable | `USB-AB-1M-BL` | 1.0m High-Speed Data & 5V Power Cable | 1 | ₹50.00 | ₹50.00 | [Amazon India](https://www.amazon.in/s?k=arduino+uno+usb+cable+type+a+to+b) |
| **Total** | | | | | | **₹676.00** | |

---

## 💻 Arduino C++ Production Firmware

```cpp
/* Project Work: Automatic Night Light System (Ambient Light-Adaptive Luminaire)
 * Connections: LDR -> A0 (10k Pull-Down) | 5mm LED -> Pin D9 (220 Ohm Resistor) | Baud: 9600 bps */
const int LDR_PIN = A0;              // Analog input pin for LDR potential divider tap
const int LED_PIN = 9;               // Digital output pin for LED actuator
const int THRESHOLD_DARK  = 400;     // Lower hysteresis boundary (Nightfall -> Turn ON)
const int THRESHOLD_LIGHT = 500;     // Upper hysteresis boundary (Daybreak -> Turn OFF)
const int SAMPLES = 10;              // Rolling average window size
int buffer[SAMPLES]; int bufIdx = 0; long runningSum = 0;
bool ledState = false; unsigned long lastLog = 0;

void setup() {
  pinMode(LED_PIN, OUTPUT); digitalWrite(LED_PIN, LOW); // Initialize luminaire extinguished
  Serial.begin(9600);
  for (int i = 0; i < SAMPLES; i++) {
    buffer[i] = analogRead(LDR_PIN); runningSum += buffer[i]; delay(5);
  }
}

void loop() {
  runningSum -= buffer[bufIdx];
  buffer[bufIdx] = analogRead(LDR_PIN);
  runningSum += buffer[bufIdx];
  bufIdx = (bufIdx + 1) % SAMPLES;

  int filteredADC = runningSum / SAMPLES;
  float nodeV = (filteredADC * 5.0) / 1023.0;

  // Dual-Threshold Schmitt Trigger Hysteresis Comparator
  if (filteredADC <= THRESHOLD_DARK) {
    ledState = true;  digitalWrite(LED_PIN, HIGH);     // Darkness detected: Luminaire ON
  } else if (filteredADC >= THRESHOLD_LIGHT) {
    ledState = false; digitalWrite(LED_PIN, LOW);      // Daylight restored: Luminaire OFF
  }

  // Periodic Telemetry Reporting over UART Serial (Every 500 ms)
  if (millis() - lastLog >= 500) {
    lastLog = millis();
    Serial.print("ADC: "); Serial.print(filteredADC);
    Serial.print(" | V: "); Serial.print(nodeV, 2);
    Serial.print("V | Luminaire: ");
    Serial.println(ledState ? "ACTIVE (ON)" : "INACTIVE (OFF)");
  }
  delay(20);
}
```

---

## 📂 Laboratory Coursework Index

This repository also contains printable laboratory manuals, experiment reports, and LaTeX source files for all semester experiments:

- **Experiment 1**: LED Blinking and Digital Pin Control (`IOT_Experiment_01_Printable_Code_Output.pdf`)
- **Experiment 2**: Pushbutton Digital Input Interfacing (`IOT_Experiment_02_Printable_Code_Output.pdf`)
- **Experiment 3**: Analog Potentiometer & PWM Brightness Regulation (`IOT_Experiment_03_Printable_Code_Output.pdf`)
- **Experiment 4**: HC-SR04 Ultrasonic Distance Telemetry (`IOT_Experiment_04_Printable_Code_Output.pdf`)
- **Experiment 5**: LDR Sensor Interfacing & Ambient Lux Sensing (`IOT_Experiment_05_Printable_Code_Output.pdf`)
- **Experiment 6**: DHT11 Temperature & Relative Humidity Telemetry (`IOT_Experiment_06_Printable_Code_Output.pdf`)
- **Capstone Project**: Automatic Night Light System (`Project_Automatic_Night_Light/`)
- **Master Compendium**: Single-page LaTeX reports, circuit diagrams, and viva guides.

---

## 🚀 Deployment Instructions

### Deploy to Vercel
1. Push this repository to GitHub.
2. Import the repository on [Vercel](https://vercel.com/new).
3. Vercel automatically reads `vercel.json` and serves the web simulation portal directly at the root URL.

---

## 👥 Contributors & Academic Credits
- **Engineering Team**: FlameInDark Team
- **Course**: Microcontroller & IoT Embedded Systems Laboratory
- **Board**: Arduino UNO R3 (ATmega328P Microcontroller)
