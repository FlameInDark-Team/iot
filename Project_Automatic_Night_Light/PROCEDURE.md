# Step-by-Step Practical Procedure Guide: Automatic Night Light System

**Department of Computer Science & Engineering / IoT Laboratory**  
**Course Code:** PCC-CS791 | **Degree:** B.Tech | **Academic Session:** 2025–2026

---

## Overview

This guide provides a comprehensive, sequential walkthrough to assemble, wire, flash, calibrate, and test the **Automatic Night Light System** using an **Arduino UNO**, **LDR (CdS photoresistor)**, and **LED luminaire**.

---

## Phase 1: Laboratory Component Requisition, Part Numbers & Costs in Rupees

Present the following official **Bill of Materials (BOM) & Cost Matrix** to your professor or laboratory instructor to requisition the certified components for this project:

| # | Full Technical Component Name | Component Part Number / Hardware ID | Technical Parameters & Ratings | Qty | Cost (INR / ₹) |
|:---:|:---|:---|:---|:---:|:---:|
| 1 | **Arduino UNO R3 Board** | `A000066` / `ARD-UNO-R3` | ATmega328P 8-bit MCU, 16 MHz Crystal, 5V Logic, 10-bit SAR ADC, DIP-28 | 1 unit | ₹480.00 |
| 2 | **Cadmium Sulfide (CdS) Photoresistor** | `GL5528` / `LDR-5528` | 5mm Optical Cell, $\lambda_p = 540\,\text{nm}$, $R_{10} = 10-20\,\text{k}\Omega$, $R_{\text{dark}} \ge 1.0\,\text{M}\Omega$ | 1 unit | ₹10.00 |
| 3 | **Carbon Film Fixed Resistor (Pull-Down)** | `CFR-25JR-52-10K` (`CF1/4W-10K`) | $10\,\text{k}\Omega \pm 5\%$, $0.25\,\text{W}$ Rating, Axial (**Brown-Black-Orange-Gold**) | 1 unit | ₹1.50 |
| 4 | **Carbon Film Fixed Resistor (Current Limiter)** | `CFR-25JR-52-220R` (`CF1/4W-220R`) | $220\,\Omega \pm 5\%$, $0.25\,\text{W}$ Rating, Axial (**Red-Red-Brown-Gold**) | 1 unit | ₹1.50 |
| 5 | **5mm Round Diffused LED (Indicator)** | `WP7113ID` (Red) | Forward Drop $V_F \approx 2.0\,\text{V}$, Max Forward Current $I_F = 20\,\text{mA}$ | 1 unit | ₹3.00 |
| 6 | **Solderless Prototyping Breadboard** | `MB-102` / `BB-830` | 830 Tie-Points (630 Terminal + 200 Power Bus), Phosphor Bronze Clips | 1 unit | ₹110.00 |
| 7 | **Male-to-Male Jumper Leads** | `JW-MM-20CM` | 24 AWG Flexible Multi-Strand Wire, 20 cm, 2.54 mm Dupont Connectors | 6 units | ₹20.00 |
| 8 | **USB 2.0 Interface Cable** | `CAB-USB-AB-1M` | USB Type-A Male to Type-B Male Shielded Cable, 28/24 AWG, 1 Meter | 1 unit | ₹50.00 |
| | | | **Total Estimated Hardware Cost:** | | **₹676.00** |

### Component Terminal & Polarity Guide
1. **Arduino UNO R3 (`A000066`)**: Locate header pins **5V**, **GND**, Analog Pin **A0**, and Digital Pin **D9**.
2. **LDR Photoresistor (`GL5528`)**: Symmetrical 2-terminal sensor. It has **no polarity** (either leg can go to +5V or A0).
3. **10 kΩ Resistor (`CFR-25JR-52-10K`)**: Color bands: **Brown – Black – Orange – Gold**.
4. **220 Ω Resistor (`CFR-25JR-52-220R`)**: Color bands: **Red – Red – Brown – Gold**.
5. **5mm LED (`WP7113ID`)**:
   - **Longer Leg (Anode +)**: Positive terminal; connects to Digital Pin D9 through the 220 Ω resistor.
   - **Shorter Leg / Flat Rim (Cathode -)**: Negative terminal; connects to Ground (GND).

---

## Phase 2: Graphical Wire Connection Matrix & Layout

The hardware assembly uses four color-coded interconnect jumper leads connecting the **Arduino UNO R3** to the **MB-102 Breadboard**. Follow this quick-reference table for visual verification:

| Wire Color | Arduino UNO R3 Header Pin | Breadboard MB-102 Tie Point | Function / Signal Description |
|:---|:---|:---|:---|
| **Orange Wire** | **Pin D9** (Digital PWM Header) | **Row 25** (Top lead of 220 Ω Resistor) | Switched Output Gate Drive (+5V Active) |
| **Green Wire** | **Pin A0** (Analog In Header) | **Row 14** (Divider Tap Junction) | Analog Light Sensor Voltage Signal |
| **Black Wire** | **Pin GND** (Power Header) | **Blue Common Ground Rail (-)** | 0V System Common Ground Return |
| **Red Wire** | **Pin 5V** (Power Header) | **Red Power Bus Rail (+)** | +5V Regulated DC Supply Rail |

### Graphical Connection Map

```
+=======================================================================================+
|                   ARDUINO UNO R3 TO MB-102 BREADBOARD CONNECTION MAP                  |
+=======================================================================================+
|                                                                                       |
|   [ARDUINO UNO R3]                                        [MB-102 SOLDERLESS BREADBOARD]
|                                                                                       |
|   Header Pin D9 (PWM) ======= (ORANGE WIRE) =========>> Row 25 (Top of 220 Ohm Resistor)
|                                                               ||                      |
|                                                          [220 Ohm Resistor]           |
|                                                               ||                      |
|                                                          Row 20 [LED Anode (+)]       |
|                                                               ||                      |
|                                                             [5mm LED]                 |
|                                                               ||                      |
|                                                          Row 21 [LED Cathode (-)]     |
|                                                               ||                      |
|                                                          (Internal Jumper to GND)     |
|                                                               ||                      |
|   Header Pin GND =========== (BLACK WIRE) ==========>> Blue Ground Bus Rail (0V) ----+
|                                                               ^                       |
|                                                               || (via 10k Resistor)   |
|   Header Pin A0 (Analog) <<== (GREEN WIRE) =========<< Row 14 [Divider Midpoint Node] |
|                                                               ||                      |
|                                                           [LDR GL5528]                |
|                                                               ||                      |
|                                                          Row 10 [Sensor VCC Input]    |
|                                                               ||                      |
|   Header Pin 5V ============ (RED WIRE) ============>> Red Power Bus Rail (+5V) ------+
|                                                                                       |
+=======================================================================================+
```

---

## Phase 3: Breadboard Circuit Wiring (Step-by-Step)

> [!IMPORTANT]
> **Safety Rule**: Keep the Arduino UNO **unplugged from USB power** while making connections on the breadboard.

### Step 2.1: Establish Power and Ground Rails
1. Connect a **Red jumper wire** from Arduino pin **5V** to the **Red (+) power strip** on the breadboard.
2. Connect a **Black jumper wire** from Arduino pin **GND** to the **Blue (-) ground strip** on the breadboard.

### Step 2.2: Build the LDR Potential Divider (Sensor Circuit)
1. Insert the **LDR** across two separate breadboard rows (e.g., Row 10 and Row 14).
2. Connect a jumper wire from **Row 10** (one leg of the LDR) to the **+5V Rail**.
3. Insert one leg of the **10 kΩ resistor** into **Row 14** (same row as the LDR's second leg).
4. Insert the other leg of the **10 kΩ resistor** into the **GND Rail**.
5. Connect a **Green jumper wire** from **Row 14** (the junction between LDR and 10k resistor) to Arduino Analog Pin **A0**.

### Step 2.3: Build the LED Output Indicator (Actuator Circuit)
1. Insert the **LED** into two unused breadboard rows:
   - **Long leg (Anode +)** into **Row 20**.
   - **Short leg (Cathode -)** into **Row 21**.
2. Insert the **220 Ω resistor** into **Row 20** (with the LED Anode) and the other leg into **Row 25**.
3. Connect an **Orange jumper wire** from **Row 25** (the 220 Ω resistor) to Arduino Digital Pin **D9**.
4. Connect a **Black jumper wire** from **Row 21** (LED Cathode) to the **GND Rail**.

### Step 2.4: Pre-Power Inspection Checklist
- [ ] Is LDR connected between +5V and Node A0?
- [ ] Is 10 kΩ resistor connected between Node A0 and GND?
- [ ] Is LED longer pin connected via 220 Ω to D9?
- [ ] Is LED shorter pin connected to GND?
- [ ] Are 5V and GND separated with no short circuits?

---

## Phase 4: Firmware Uploading in Arduino IDE

1. **Connect to PC**: Plug the USB Type-A to Type-B cable into the Arduino UNO and your computer. The green `ON` LED on the Arduino will light up.
2. **Open Arduino IDE**: Launch the IDE on your computer.
3. **Select Board**: Go to `Tools` → `Board` → `Arduino AVR Boards` → select **`Arduino Uno`**.
4. **Select Port**: Go to `Tools` → `Port` → select the COM port assigned to the board (e.g., `COM3` or `COM4`).
5. **Open Code**: Open [`Automatic_Night_Light.ino`](file:///e:/Hackathon/IOT_LAB/Project_Automatic_Night_Light/Automatic_Night_Light.ino).
6. **Verify (Compile)**: Click the **Verify** button (checkmark icon) to verify zero syntax errors.
7. **Upload**: Click the **Upload** button (arrow icon). Watch the `TX`/`RX` LEDs flash rapidly until the bottom status bar reads **"Done uploading"**.

---

## Phase 5: Calibration & Real-Time Testing

### Step 5.1: Open the Serial Monitor
1. Click the **Serial Monitor** icon (top right corner of Arduino IDE).
2. Set the Baud rate dropdown at the bottom right to **9600 baud**.
3. You will see the initialization banner followed by continuous readings:
   ```
   Time(ms)    Raw ADC    Filtered ADC    Voltage(V)    Luminaire        Ambient Status
   ------------------------------------------------------------------------------------
   500         842        839             4.10 V        [ INACTIVE ]     Well-Lit Room
   ```

### Step 5.2: Ambient Daylight Baseline Test
- Keep the breadboard under normal laboratory/room illumination.
- **Observed ADC**: ~600 to 850 ($V_{\text{out}} \approx 3.0\,\text{V} - 4.2\,\text{V}$).
- **Indicator LED**: Stays **OFF**.

### Step 5.3: Darkness / Nightfall Simulation Test
- Completely cover the LDR sensor head with your finger or an opaque object (such as black paper or a book).
- **Observed ADC**: Plunges sharply below **400** ($V_{\text{out}} < 1.95\,\text{V}$).
- **Indicator LED**: Turns **ON instantly and brightly**!
- **Serial Monitor**: Displays `[ ACTIVE ] Nightfall Detected`.

### Step 5.4: Hysteresis Deadband Verification (Anti-Flicker)
- Slowly pull your finger away from the sensor.
- When the ADC value hovers between **400 and 500** (twilight transition), the LED **remains solidly ON**. It does **NOT flicker or oscillate**!
- Only when ambient light rises above **500** ($V_{\text{out}} \ge 2.44\,\text{V}$) does the LED turn OFF.
- This confirms that the **100-count Schmitt trigger hysteresis deadband** works as designed.

### Step 5.5: High-Intensity Torch Test
- Shine a smartphone flashlight directly onto the LDR head.
- **Observed ADC**: Rises above **950** ($V_{\text{out}} > 4.7\,\text{V}$).
- **Indicator LED**: Remains firmly **OFF**.

---

## Phase 6: Diagnostic Troubleshooting Matrix

| Issue Encountered | Root Cause | Fix / Solution |
|:---|:---|:---|
| **LED never turns ON** when LDR is covered | 1. LED inserted backwards.<br>2. Pin D9 disconnected.<br>3. Burned-out LED. | Reverse LED leads (long lead to D9 via 220 Ω). Verify wire is securely in D9. Test LED with 5V directly. |
| **LED stays ON all the time** in bright light | 1. 10 kΩ resistor disconnected.<br>2. LDR not receiving 5V.<br>3. Pin A0 floating. | Ensure 10 kΩ resistor is securely in GND rail. Check LDR +5V jumper wire. |
| **ADC readings jitter wildly** | 1. Fluorescent AC line noise.<br>2. Loose breadboard ties. | Firmware includes a 10-sample rolling average filter. Push wires firmly into breadboard holes. |
| **Serial Monitor displays gibberish** | Baud rate mismatch. | Change Serial Monitor baud rate setting from 115200 to **9600 baud**. |
