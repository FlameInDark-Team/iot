# Automatic Night Light System (Smart Ambient Light-Adaptive Luminaire)

**Department of Computer Science & Engineering / Information Technology**  
**Internet of Things (IoT) Laboratory --- Practical Project Work**  
**Course Code:** PCC-CS791 / IT-LAB | **Academic Session:** 2025–2026 | **Project Status:** Approved & Verified (09/09/2026)

---

## 1. Project Overview

The **Automatic Night Light System** is an intelligent, energy-efficient luminaire control system driven by an **Arduino UNO R3 (ATmega328P MCU)**. It continuously monitors ambient luminous intensity via a **Cadmium Sulfide (CdS) Light Dependent Resistor (LDR)** configured in an analog potential divider circuit. 

When ambient illumination falls below a designated nightfall threshold ($T_{\text{DARK}} \le 400$, corresponding to $V_{\text{out}} \le 1.95\,\text{V}$), the microcontroller actuates a solid-state indicator LED (or high-power luminaire via relay/TRIAC). To prevent rapid erratic switching (**chattering**) at dusk or dawn, a software **Schmitt-Trigger Hysteresis Comparator** with a 100-count deadband ($\Delta V \approx 0.49\,\text{V}$) is implemented along with a 10-sample circular moving average filter to reject $50\,\text{Hz}/60\,\text{Hz}$ artificial lighting noise.

---

## 2. Hardware Bill of Materials (BOM) & Market Cost in Rupees

| S.No. | Component Name | Commercial Part Number / Hardware ID | Technical Specifications & Parametric Values | Qty | Cost (INR / ₹) |
|:---:|:---|:---|:---|:---:|:---:|
| 1 | **Arduino UNO R3** | `A000066` / `ARD-UNO-R3` | ATmega328P 8-bit AVR RISC MCU, 16 MHz Crystal, 5V Logic, 10-bit SAR ADC | 1 unit | ₹480.00 |
| 2 | **LDR (Photoresistor)** | `GL5528` / `LDR-5528` | GL5528 CdS Cell, $\lambda_{\text{peak}} = 540\,\text{nm}$, $R_{\text{light}}\,(10\,\text{lux}) \approx 10-20\,\text{k}\Omega$, $R_{\text{dark}} \ge 1.0\,\text{M}\Omega$ | 1 unit | ₹10.00 |
| 3 | **Divider Resistor** | `CFR-25JR-52-10K` (`CF1/4W-10K`) | $10\,\text{k}\Omega \pm 5\%$ Carbon Film Resistor, $0.25\,\text{W}$ (Reference Pull-Down) | 1 unit | ₹1.50 |
| 4 | **Indicator LED** | `WP7113ID` (Red) | 5mm High-Brightness Diffused LED, Forward Drop $V_F \approx 2.0\,\text{V}$, $I_{F,\max} = 20\,\text{mA}$ | 1 unit | ₹3.00 |
| 5 | **Current-Limiting Resistor** | `CFR-25JR-52-220R` (`CF1/4W-220R`) | $220\,\Omega \pm 5\%$ Carbon Film Resistor, $0.25\,\text{W}$ ($I_F \approx 13.64\,\text{mA}$) | 1 unit | ₹1.50 |
| 6 | **Solderless Breadboard** | `MB-102` / `BB-830` | Standard 830 Tie-Point Breadboard with Dual Power Distribution Rails | 1 unit | ₹110.00 |
| 7 | **Jumper Interconnects** | `JW-MM-20CM` | 24 AWG Solid-Core Flexible Male-to-Male Jumper Leads | 6 units | ₹20.00 |
| 8 | **USB Cable** | `CAB-USB-AB-1M` | USB Type-A to Type-B Shielded Cable for Regulated 5V Power & UART Data | 1 unit | ₹50.00 |
| | | | **Total Estimated Hardware Cost:** | | **₹676.00** |

---

## 3. Hardware Pin Mapping & Graphical Wire Connection Matrix

The circuit uses four primary color-coded jumper leads connecting the Arduino UNO R3 to the MB-102 Breadboard:

| Wire Color | Arduino UNO R3 Header Pin | Breadboard MB-102 Tie Point | Function / Signal Path |
|:---|:---|:---|:---|
| **Orange Wire** | **Pin D9** (Digital PWM Header) | **Row 25** (Top lead of 220 Ω Resistor) | Switched Output Gate Drive (+5V Active) |
| **Green Wire** | **Pin A0** (Analog In Header) | **Row 14** (Divider Tap Junction) | Analog Light Sensor Voltage Signal |
| **Black Wire** | **Pin GND** (Power Header) | **Blue Common Ground Rail (-)** | 0V System Ground Return |
| **Red Wire** | **Pin 5V** (Power Header) | **Red Power Bus Rail (+)** | +5V Regulated DC Supply Rail |

```
+---------------------------------------------------------------------------------------+
|                             BREADBOARD WIRING SCHEME                                  |
|                                                                                       |
|   [Arduino 5V]  ======= (RED WIRE) ======>> [Red Power Rail (+)]                      |
|                                                    ||                                 |
|                                              (Row 10 Jumper)                          |
|                                                    ||                                 |
|                                             [ LDR (GL5528) ]                          |
|                                                    ||                                 |
|   [Arduino A0]  <==== (GREEN WIRE) =====<<  [ Row 14 Node ]                           |
|                                                    ||                                 |
|                                            [ 10k Resistor ]                           |
|                                                    ||                                 |
|   [Arduino GND] ======= (BLACK WIRE) ====>> [Blue Ground Rail (-)]                    |
|                                                    ^                                  |
|                                                    || (Row 21 Cathode Return)         |
|   [Arduino D9]  ====== (ORANGE WIRE) ===>> [Row 25]                                   |
|                                               ||                                      |
|                                        [ 220R Resistor ]                              |
|                                               ||                                      |
|                                        [Row 20 (Anode +)]                             |
|                                               ||                                      |
|                                          [ 5mm LED ]                                  |
|                                               ||                                      |
|                                        [Row 21 (Cathode -)]                           |
+---------------------------------------------------------------------------------------+
```

---

## 4. Mathematical Formulations

### A. Analog Voltage Divider Output
$$V_{\text{out}} = V_{CC} \left( \frac{R_1}{R_{\text{LDR}} + R_1} \right) = 5.0\,\text{V} \times \left( \frac{10000\,\Omega}{R_{\text{LDR}} + 10000\,\Omega} \right)$$

### B. 10-Bit ADC Quantization Resolution
$$q = \frac{V_{\text{ref}}}{2^{10} - 1} = \frac{5.00\,\text{V}}{1023} \approx 4.887\,\text{mV/LSB}, \qquad D_{\text{ADC}} = \text{round}\left( \frac{V_{\text{out}}}{5.00\,\text{V}} \times 1023 \right)$$

### C. LED Current Limiting Resistor
$$R_2 = \frac{V_{OH} - V_F}{I_F} = \frac{5.0\,\text{V} - 2.0\,\text{V}}{13.64\,\text{mA}} \approx 220\,\Omega$$

### D. Schmitt-Trigger Software Hysteresis Core
$$\text{Actuator State}_{t+1} = \begin{cases} \text{HIGH (LED ON)}, & \text{if } \text{ADC}_{\text{filt}} \le 400 \quad (V_{\text{out}} \le 1.95\,\text{V}) \\ \text{LOW (LED OFF)}, & \text{if } \text{ADC}_{\text{filt}} \ge 500 \quad (V_{\text{out}} \ge 2.44\,\text{V}) \\ \text{Actuator State}_t, & \text{if } 400 < \text{ADC}_{\text{filt}} < 500 \quad (\text{Deadband } \Delta V = 0.49\,\text{V}) \end{cases}$$

---

## 5. Experimental Calibration Matrix

| Trial | Ambient Lighting Environment | Lux Level | $R_{\text{LDR}}$ ($\Omega$) | Node Voltage | ADC Value | Luminaire State |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Direct Sunlight / High Torch Beam | $> 1000\,\text{lux}$ | $420\,\Omega$ | $4.80\,\text{V}$ | $982$ | **OFF** (Full Daylight Inactive) |
| 2 | Laboratory Overhead Illumination | $450\,\text{lux}$ | $2.2\,\text{k}\Omega$ | $4.10\,\text{V}$ | $839$ | **OFF** (Adequate Ambient Lighting) |
| 3 | Ambient Twilight / Dusk Transition | $95\,\text{lux}$ | $9.1\,\text{k}\Omega$ | $2.62\,\text{V}$ | $536$ | **OFF** (Above Turn-ON Threshold) |
| 4 | Threshold Border (Nightfall Entry) | $35\,\text{lux}$ | $18.5\,\text{k}\Omega$ | $1.75\,\text{V}$ | $358$ | **ON** (Night Light Tripped) |
| 5 | Covered Sensor / Pitch Darkness | $2\,\text{lux}$ | $88.0\,\text{k}\Omega$ | $0.51\,\text{V}$ | $104$ | **ON** (Full Luminaire Activation) |

---

## 6. Project Deliverables in this Folder

1. **Embedded Firmware**:
   - [`Automatic_Night_Light.ino`](file:///e:/Hackathon/IOT_LAB/Project_Automatic_Night_Light/Automatic_Night_Light.ino): Complete Arduino C++ firmware with circular moving-average filtering, dual-threshold hysteresis, and serial telemetry at 9600 Baud.
2. **Comprehensive 4-Page Master Lab Report**:
   - [`Project_Automatic_Night_Light_Report.pdf`](file:///e:/Hackathon/IOT_LAB/Project_Automatic_Night_Light/Project_Automatic_Night_Light_Report.pdf): Exact 4-page academic lab report modeled after Experiment 04, containing Title, Aim, Apparatus, Photoconductivity Physics, Mathematical Derivations, Pin Matrix, CircuiTikZ Schematic, Breadboard & PCB visual assets, Source Code, Calibration Table, Serial Output, Engineering Discussion, and 8 Viva-Voce Questions with Detailed Answers.
   - [`Project_Automatic_Night_Light_Report.tex`](file:///e:/Hackathon/IOT_LAB/Project_Automatic_Night_Light/Project_Automatic_Night_Light_Report.tex): LaTeX master source document.
3. **Standalone 1-Page Printable Handout**:
   - [`Project_Printable_Code_and_Output.pdf`](file:///e:/Hackathon/IOT_LAB/Project_Automatic_Night_Light/Project_Printable_Code_and_Output.pdf): High-contrast, single-page printable sheet matching Experiments 01–06 (Source Code + Single-Line Calibration Table + Serial Terminal Stream + TikZ Hysteresis Transfer Curve).
   - [`Project_Printable_Code_and_Output.tex`](file:///e:/Hackathon/IOT_LAB/Project_Automatic_Night_Light/Project_Printable_Code_and_Output.tex): LaTeX printable source document.
4. **Step-by-Step Practical Procedure Guide (5-Page Guide)**:
   - [`Step_by_Step_Procedure_Guide.pdf`](file:///e:/Hackathon/IOT_LAB/Project_Automatic_Night_Light/Step_by_Step_Procedure_Guide.pdf): Large-format 5-page on-screen procedure guide with commercial part numbers, itemized costs in Rupees (INR), full graphical wiring diagram, step-by-step breadboard assembly sequence, firmware flashing instructions, calibration procedures, troubleshooting matrix, and faculty sign-off block.
   - [`Step_by_Step_Procedure_Guide.tex`](file:///e:/Hackathon/IOT_LAB/Project_Automatic_Night_Light/Step_by_Step_Procedure_Guide.tex): LaTeX source for the procedure guide.
   - [`PROCEDURE.md`](file:///e:/Hackathon/IOT_LAB/Project_Automatic_Night_Light/PROCEDURE.md): Markdown version of the procedure guide.
5. **Hardware & PCB Visual Assets**:
   - `hardware_breadboard_setup.jpg`: High-resolution photograph of the physical breadboard prototyping circuit wired to Arduino UNO.
   - `pcb_shield_layout.jpg`: 2D engineering CAD routing layout of the custom Arduino night-light shield PCB with SMD footprints and silk-screen markings.

