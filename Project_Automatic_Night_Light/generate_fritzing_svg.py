"""
Advanced Fritzing Circuit Diagram Generator
Generates fritzing_circuit_diagram.svg with Arduino UNO R3, MB-102 Breadboard,
LDR, 10k Resistor, 220 Resistor, 5mm LED, and realistic curved jumper wires.
"""

def generate_svg():
    width = 1100
    height = 680
    
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" style="background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif;">')
    
    # Defs for gradients, filters, markers
    svg.append('''
    <defs>
        <!-- Drop Shadows -->
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" flood-color="#000000" flood-opacity="0.5"/>
        </filter>
        <filter id="wire-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
        <filter id="led-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>

        <!-- Arduino PCB Gradients -->
        <linearGradient id="arduino-pcb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00979D" />
            <stop offset="100%" stop-color="#00666B" />
        </linearGradient>
        <linearGradient id="metal-silver" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#cbd5e1" />
            <stop offset="50%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#94a3b8" />
        </linearGradient>
        <linearGradient id="ic-chip" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2d3748" />
            <stop offset="100%" stop-color="#1a202c" />
        </linearGradient>
        <linearGradient id="bb-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#f1f5f9" />
        </linearGradient>
        <linearGradient id="resistor-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#fde047" />
            <stop offset="100%" stop-color="#eab308" />
        </linearGradient>
        <radialGradient id="ldr-face" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fb923c" />
            <stop offset="70%" stop-color="#ea580c" />
            <stop offset="100%" stop-color="#9a3412" />
        </radialGradient>
        <radialGradient id="led-red-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ff8080" />
            <stop offset="40%" stop-color="#ef4444" />
            <stop offset="85%" stop-color="#b91c1c" />
            <stop offset="100%" stop-color="#7f1d1d" />
        </radialGradient>
    </defs>
    ''')

    # Background subtle grid pattern
    svg.append('<rect x="0" y="0" width="1100" height="680" fill="#0b1120"/>')
    svg.append('''
    <!-- Title Banner -->
    <g transform="translate(40, 35)">
        <text x="0" y="0" font-size="20" font-weight="bold" fill="#f8fafc" letter-spacing="0.5">AUTOMATIC NIGHT LIGHT — INTERACTIVE BREADBOARD CIRCUIT</text>
        <text x="0" y="22" font-size="12" fill="#94a3b8">Engineering Architecture: Arduino UNO R3 (ATmega328P) + CdS Photocell + MB-102 Breadboard</text>
    </g>
    ''')

    # ==========================================
    # 1. ARDUINO UNO R3 (Left side: x: 50, y: 90)
    # ==========================================
    ax = 50
    ay = 90
    aw = 390
    ah = 520
    svg.append(f'<!-- ARDUINO UNO BOARD -->\n<g id="arduino-uno" filter="url(#shadow)">')
    
    # PCB Outline (Teal with Arduino custom profile)
    # Rounded corners with cutouts
    pcb_path = f'''M {ax+15} {ay} 
                  H {ax+aw-40} L {ax+aw} {ay+40} 
                  V {ay+ah-20} Q {ax+aw} {ay+ah} {ax+aw-20} {ay+ah}
                  H {ax+20} Q {ax} {ay+ah} {ax} {ay+ah-20}
                  V {ay+20} Q {ax} {ay} {ax+20} {ay} Z'''
    svg.append(f'<path d="{pcb_path}" fill="url(#arduino-pcb)" stroke="#004d52" stroke-width="2"/>')
    
    # Gold Mounting Holes (4 holes)
    holes = [(ax+35, ay+30), (ax+aw-20, ay+85), (ax+aw-20, ay+ah-55), (ax+35, ay+ah-35)]
    for hx, hy in holes:
        svg.append(f'<circle cx="{hx}" cy="{hy}" r="10" fill="none" stroke="#eab308" stroke-width="2.5"/>')
        svg.append(f'<circle cx="{hx}" cy="{hy}" r="6.5" fill="#0b1120"/>')

    # USB Type-B Port (Metal)
    svg.append(f'''
    <g transform="translate({ax-25}, {ay+60})">
        <rect x="0" y="0" width="70" height="60" rx="3" fill="url(#metal-silver)" stroke="#64748b" stroke-width="1.5" filter="url(#shadow)"/>
        <rect x="15" y="10" width="40" height="40" rx="2" fill="#1e293b"/>
        <path d="M 22 20 H 48 V 40 H 22 Z" fill="#f8fafc" opacity="0.9"/>
    </g>
    ''')

    # DC Power Barrel Jack (Black)
    svg.append(f'''
    <g transform="translate({ax-20}, {ay+ah-110})">
        <rect x="0" y="0" width="60" height="55" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="2" filter="url(#shadow)"/>
        <rect x="0" y="10" width="20" height="35" fill="#0f172a"/>
        <circle cx="35" cy="27" r="9" fill="#334155"/>
        <circle cx="35" cy="27" r="4" fill="#cbd5e1"/>
    </g>
    ''')

    # Reset Button
    svg.append(f'''
    <g transform="translate({ax+35}, {ay+35})">
        <rect x="0" y="0" width="22" height="22" rx="2" fill="url(#metal-silver)" stroke="#64748b"/>
        <circle cx="11" cy="11" r="7" fill="#dc2626"/>
        <text x="11" y="32" font-size="8" font-weight="bold" fill="#f8fafc" text-anchor="middle">RESET</text>
    </g>
    ''')

    # ATmega16U2 (USB controller chip) + Crystal
    svg.append(f'''
    <rect x="{ax+90}" y="{ay+75}" width="28" height="28" rx="2" fill="url(#ic-chip)" stroke="#111827"/>
    <circle cx="{ax+96}" cy="{ay+81}" r="2" fill="#64748b"/>
    <rect x="{ax+130}" y="{ay+80}" width="16" height="30" rx="4" fill="url(#metal-silver)" stroke="#64748b"/>
    <text x="{ax+138}" y="{ay+98}" font-size="6" fill="#475569" text-anchor="middle">16.000</text>
    ''')

    # ICSP Headers (2x3 gold pins)
    def render_icsp(ix, iy, label):
        svg.append(f'<g transform="translate({ix}, {iy})">')
        svg.append(f'<text x="9" y="-4" font-size="7" fill="#94a3b8" text-anchor="middle">{label}</text>')
        for r in range(3):
            for c in range(2):
                svg.append(f'<rect x="{c*9}" y="{r*9}" width="7" height="7" fill="#0f172a" stroke="#475569" stroke-width="0.8"/>')
                svg.append(f'<rect x="{c*9+2}" y="{r*9+2}" width="3" height="3" fill="#eab308"/>')
        svg.append('</g>')

    render_icsp(ax+70, ay+130, "ICSP2")
    render_icsp(ax+aw-35, ay+ah/2-20, "ICSP")

    # ATmega328P DIP-28 Microcontroller IC (Center bottom)
    svg.append(f'''
    <g transform="translate({ax+110}, {ay+270})">
        <!-- Socket -->
        <rect x="-4" y="-4" width="190" height="42" rx="3" fill="#0f172a" stroke="#334155"/>
        <!-- DIP Chip Body -->
        <rect x="0" y="0" width="182" height="34" rx="2" fill="url(#ic-chip)" stroke="#000000" stroke-width="1.5"/>
        <!-- Notch on Pin 1 side -->
        <path d="M 0 12 A 5 5 0 0 1 0 22 Z" fill="#0f172a"/>
        <!-- Silver Pins (14 on top, 14 on bottom) -->
    ''')
    for i in range(14):
        px = 12 + i * 12
        svg.append(f'<rect x="{px}" y="-4" width="4" height="4" fill="url(#metal-silver)"/>')
        svg.append(f'<rect x="{px}" y="34" width="4" height="4" fill="url(#metal-silver)"/>')
    svg.append(f'''
        <text x="91" y="21" font-size="11" font-family="Courier New, monospace" font-weight="bold" fill="#e2e8f0" letter-spacing="2" text-anchor="middle">ATMEGA328P-PU</text>
    </g>
    ''')

    # Capacitors (2 silver electrolytic cylinders)
    svg.append(f'''
    <g transform="translate({ax+65}, {ay+ah-130})">
        <circle cx="16" cy="16" r="16" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <path d="M 0 16 A 16 16 0 0 0 32 16 Z" fill="url(#metal-silver)"/>
        <text x="16" y="27" font-size="8" fill="#0f172a" font-weight="bold" text-anchor="middle">47μF</text>
    </g>
    <g transform="translate({ax+105}, {ay+ah-130})">
        <circle cx="16" cy="16" r="16" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <path d="M 0 16 A 16 16 0 0 0 32 16 Z" fill="url(#metal-silver)"/>
        <text x="16" y="27" font-size="8" fill="#0f172a" font-weight="bold" text-anchor="middle">47μF</text>
    </g>
    ''')

    # Silkscreen Branding
    svg.append(f'''
    <!-- Arduino Infinity Logo -->
    <g transform="translate({ax+160}, {ay+150})">
        <circle cx="20" cy="15" r="14" fill="none" stroke="#f8fafc" stroke-width="3"/>
        <circle cx="48" cy="15" r="14" fill="none" stroke="#f8fafc" stroke-width="3"/>
        <text x="20" y="19" font-size="15" font-weight="bold" fill="#f8fafc" text-anchor="middle">−</text>
        <text x="48" y="20" font-size="15" font-weight="bold" fill="#f8fafc" text-anchor="middle">+</text>
        <text x="75" y="22" font-size="26" font-family="Arial Black, Impact" font-weight="900" fill="#f8fafc" letter-spacing="1">UNO</text>
        <text x="34" y="42" font-size="13" font-family="Arial" font-weight="bold" fill="#f8fafc" letter-spacing="1">Arduino™</text>
    </g>
    ''')

    # Status LEDs (ON, L, TX, RX)
    status_leds = [
        (ax+aw-50, ay+150, "#22c55e", "ON"),
        (ax+130, ay+150, "#eab308", "L"),
        (ax+130, ay+175, "#eab308", "TX"),
        (ax+130, ay+195, "#eab308", "RX"),
    ]
    for lx, ly, col, lbl in status_leds:
        svg.append(f'''
        <rect x="{lx}" y="{ly}" width="10" height="6" rx="1" fill="#fef08a" stroke="#ca8a04"/>
        <circle cx="{lx+5}" cy="{ly+3}" r="2.5" fill="{col}"/>
        <text x="{lx+14}" y="{ly+6}" font-size="8" font-weight="bold" fill="#f8fafc">{lbl}</text>
        ''')

    # Pin Headers Coordinates Tracking
    header_coords = {}

    # TOP DIGITAL HEADER (Pins: AREF, GND, 13, 12, ~11, ~10, ~9, 8 | 7, ~6, ~5, 4, ~3, 2, TX>1, RX<0)
    top_pins_left = ["AREF", "GND", "13", "12", "~11", "~10", "~9", "8"]
    top_pins_right = ["7", "~6", "~5", "4", "~3", "2", "TX 1", "RX 0"]

    # Header bar 1 (Digital 8-13 + GND + AREF)
    svg.append(f'<g transform="translate({ax+105}, {ay+15})">')
    svg.append(f'<rect x="-4" y="0" width="128" height="24" rx="2" fill="#111827" stroke="#374151" stroke-width="1.5"/>')
    for i, p in enumerate(top_pins_left):
        hx = i * 15 + 6
        hy = 12
        header_coords[p] = (ax + 105 + hx, ay + 15 + hy)
        svg.append(f'<rect x="{hx-5}" y="{hy-5}" width="10" height="10" fill="#030712" stroke="#4b5563" stroke-width="0.8"/>')
        svg.append(f'<rect x="{hx-2}" y="{hy-2}" width="4" height="4" fill="#374151"/>')
        svg.append(f'<text x="{hx}" y="-4" font-size="7" font-weight="bold" fill="#cbd5e1" text-anchor="middle">{p}</text>')
    svg.append('</g>')

    # Header bar 2 (Digital 0-7)
    svg.append(f'<g transform="translate({ax+245}, {ay+15})">')
    svg.append(f'<rect x="-4" y="0" width="128" height="24" rx="2" fill="#111827" stroke="#374151" stroke-width="1.5"/>')
    for i, p in enumerate(top_pins_right):
        hx = i * 15 + 6
        hy = 12
        header_coords[p] = (ax + 245 + hx, ay + 15 + hy)
        svg.append(f'<rect x="{hx-5}" y="{hy-5}" width="10" height="10" fill="#030712" stroke="#4b5563" stroke-width="0.8"/>')
        svg.append(f'<rect x="{hx-2}" y="{hy-2}" width="4" height="4" fill="#374151"/>')
        svg.append(f'<text x="{hx}" y="-4" font-size="7" font-weight="bold" fill="#cbd5e1" text-anchor="middle">{p}</text>')
    svg.append('</g>')
    svg.append(f'<text x="{ax+240}" y="{ay+52}" font-size="9" font-weight="bold" fill="#f8fafc" letter-spacing="1">DIGITAL (PWM ~)</text>')

    # BOTTOM POWER & ANALOG HEADERS
    power_pins = ["IOREF", "RESET", "3.3V", "5V", "GND1", "GND2", "VIN"]
    analog_pins = ["A0", "A1", "A2", "A3", "A4", "A5"]

    # Power Header
    svg.append(f'<g transform="translate({ax+150}, {ay+ah-40})">')
    svg.append(f'<rect x="-4" y="0" width="115" height="24" rx="2" fill="#111827" stroke="#374151" stroke-width="1.5"/>')
    for i, p in enumerate(power_pins):
        hx = i * 15 + 6
        hy = 12
        lbl = "GND" if "GND" in p else p
        header_coords[p] = (ax + 150 + hx, ay + ah - 40 + hy)
        svg.append(f'<rect x="{hx-5}" y="{hy-5}" width="10" height="10" fill="#030712" stroke="#4b5563" stroke-width="0.8"/>')
        svg.append(f'<rect x="{hx-2}" y="{hy-2}" width="4" height="4" fill="#374151"/>')
        svg.append(f'<text x="{hx}" y="32" font-size="7" font-weight="bold" fill="#cbd5e1" text-anchor="middle">{lbl}</text>')
    svg.append('</g>')
    svg.append(f'<text x="{ax+200}" y="{ay+ah-48}" font-size="9" font-weight="bold" fill="#f8fafc" letter-spacing="1">POWER</text>')

    # Analog Header
    svg.append(f'<g transform="translate({ax+280}, {ay+ah-40})">')
    svg.append(f'<rect x="-4" y="0" width="100" height="24" rx="2" fill="#111827" stroke="#374151" stroke-width="1.5"/>')
    for i, p in enumerate(analog_pins):
        hx = i * 15 + 6
        hy = 12
        header_coords[p] = (ax + 280 + hx, ay + ah - 40 + hy)
        svg.append(f'<rect x="{hx-5}" y="{hy-5}" width="10" height="10" fill="#030712" stroke="#4b5563" stroke-width="0.8"/>')
        svg.append(f'<rect x="{hx-2}" y="{hy-2}" width="4" height="4" fill="#374151"/>')
        svg.append(f'<text x="{hx}" y="32" font-size="7" font-weight="bold" fill="#cbd5e1" text-anchor="middle">{p}</text>')
    svg.append('</g>')
    svg.append(f'<text x="{ax+325}" y="{ay+ah-48}" font-size="9" font-weight="bold" fill="#f8fafc" letter-spacing="1">ANALOG IN</text>')

    svg.append('</g><!-- END ARDUINO UNO -->\n')

    # ==========================================
    # 2. MB-102 BREADBOARD (Right side: x: 540, y: 90)
    # ==========================================
    bx = 540
    by = 90
    bw = 510
    bh = 520

    svg.append(f'<!-- MB-102 BREADBOARD -->\n<g id="breadboard" filter="url(#shadow)">')
    # Breadboard Base Plastic Body
    svg.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="10" fill="url(#bb-body)" stroke="#cbd5e1" stroke-width="2"/>')

    # Central Divider Trench (separates row E and F)
    trench_y = by + bh / 2
    svg.append(f'<rect x="{bx+20}" y="{trench_y-5}" width="{bw-40}" height="10" fill="#cbd5e1" rx="2"/>')

    # Power Rails (Top and Bottom)
    # Top Power Rail: 2 lines (+ Red, - Blue)
    svg.append(f'''
    <!-- Top Power Rails -->
    <line x1="{bx+35}" y1="{by+30}" x2="{bx+bw-35}" y2="{by+30}" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
    <text x="{bx+22}" y="{by+34}" font-size="16" font-weight="bold" fill="#3b82f6">−</text>
    <text x="{bx+bw-25}" y="{by+34}" font-size="16" font-weight="bold" fill="#3b82f6">−</text>

    <line x1="{bx+35}" y1="{by+60}" x2="{bx+bw-35}" y2="{by+60}" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
    <text x="{bx+22}" y="{by+65}" font-size="16" font-weight="bold" fill="#ef4444">+</text>
    <text x="{bx+bw-25}" y="{by+65}" font-size="16" font-weight="bold" fill="#ef4444">+</text>

    <!-- Bottom Power Rails -->
    <line x1="{bx+35}" y1="{by+bh-60}" x2="{bx+bw-35}" y2="{by+bh-60}" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
    <text x="{bx+22}" y="{by+bh-56}" font-size="16" font-weight="bold" fill="#3b82f6">−</text>
    <text x="{bx+bw-25}" y="{by+bh-56}" font-size="16" font-weight="bold" fill="#3b82f6">−</text>

    <line x1="{bx+35}" y1="{by+bh-30}" x2="{bx+bw-35}" y2="{by+bh-30}" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
    <text x="{bx+22}" y="{by+bh-25}" font-size="16" font-weight="bold" fill="#ef4444">+</text>
    <text x="{bx+bw-25}" y="{by+bh-25}" font-size="16" font-weight="bold" fill="#ef4444">+</text>
    ''')

    # Tie Point Matrix Configuration
    # 30 columns (1 to 30), rows A-E (top), F-J (bottom)
    cols = 30
    col_spacing = (bw - 90) / (cols - 1)
    
    # Store coordinates for breadboard holes
    bb_holes = {}  # key: (row, col) e.g. ('A', 15), ('+', 'top', 15), etc.

    # Render Power Rail Holes
    for c in range(1, cols + 1):
        cx = bx + 45 + (c - 1) * col_spacing
        # Top Blue (-) rail: y = by + 30
        bb_holes[('-', 'top', c)] = (cx, by + 30)
        svg.append(f'<circle cx="{cx}" cy="{by+30}" r="3.2" fill="#0f172a" stroke="#94a3b8" stroke-width="0.8"/>')
        # Top Red (+) rail: y = by + 60
        bb_holes[('+', 'top', c)] = (cx, by + 60)
        svg.append(f'<circle cx="{cx}" cy="{by+60}" r="3.2" fill="#0f172a" stroke="#94a3b8" stroke-width="0.8"/>')
        # Bottom Blue (-) rail: y = by + bh - 60
        bb_holes[('-', 'bot', c)] = (cx, by + bh - 60)
        svg.append(f'<circle cx="{cx}" cy="{by+bh-60}" r="3.2" fill="#0f172a" stroke="#94a3b8" stroke-width="0.8"/>')
        # Bottom Red (+) rail: y = by + bh - 30
        bb_holes[('+', 'bot', c)] = (cx, by + bh - 30)
        svg.append(f'<circle cx="{cx}" cy="{by+bh-30}" r="3.2" fill="#0f172a" stroke="#94a3b8" stroke-width="0.8"/>')

        # Column Numbers Label (at 1, 5, 10, 15, 20, 25, 30)
        if c in [1, 5, 10, 15, 20, 25, 30]:
            svg.append(f'<text x="{cx}" y="{by+82}" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">{c}</text>')
            svg.append(f'<text x="{cx}" y="{by+bh-72}" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">{c}</text>')

    # Terminal Rows: A, B, C, D, E (top half) & F, G, H, I, J (bottom half)
    top_rows = ['A', 'B', 'C', 'D', 'E']
    bot_rows = ['F', 'G', 'H', 'I', 'J']

    # Row spacing
    row_y_map = {}
    for idx, r in enumerate(top_rows):
        ry = by + 105 + idx * 24
        row_y_map[r] = ry
        svg.append(f'<text x="{bx+30}" y="{ry+4}" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle">{r}</text>')
        svg.append(f'<text x="{bx+bw-30}" y="{ry+4}" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle">{r}</text>')

    for idx, r in enumerate(bot_rows):
        ry = by + bh/2 + 25 + idx * 24
        row_y_map[r] = ry
        svg.append(f'<text x="{bx+30}" y="{ry+4}" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle">{r}</text>')
        svg.append(f'<text x="{bx+bw-30}" y="{ry+4}" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle">{r}</text>')

    # Render Terminal Holes
    for r in top_rows + bot_rows:
        ry = row_y_map[r]
        for c in range(1, cols + 1):
            cx = bx + 45 + (c - 1) * col_spacing
            bb_holes[(r, c)] = (cx, ry)
            svg.append(f'<rect x="{cx-3.2}" y="{ry-3.2}" width="6.4" height="6.4" rx="1" fill="#0f172a" stroke="#94a3b8" stroke-width="0.8"/>')
            svg.append(f'<rect x="{cx-1.5}" y="{ry-1.5}" width="3" height="3" fill="#334155"/>')

    svg.append('</g><!-- END BREADBOARD -->\n')

    # ==========================================
    # 3. COMPONENTS ON BREADBOARD
    # ==========================================
    svg.append('<!-- ON-BOARD COMPONENTS -->\n<g id="components">')

    # --- COMPONENT 1: 5mm LDR (Photoresistor) ---
    # Location: column 8, rows B and E
    ldr_c = 8
    ldr_p1 = bb_holes[('B', ldr_c)]
    ldr_p2 = bb_holes[('E', ldr_c)]
    ldr_center_x = ldr_p1[0] - 22
    ldr_center_y = (ldr_p1[1] + ldr_p2[1]) / 2

    svg.append(f'''
    <!-- LDR (Photocell) -->
    <g id="ldr-sensor" filter="url(#shadow)">
        <!-- Wire Leads -->
        <path d="M {ldr_p1[0]} {ldr_p1[1]} C {ldr_p1[0]-10} {ldr_p1[1]}, {ldr_center_x} {ldr_center_y-8}, {ldr_center_x} {ldr_center_y-4}" stroke="url(#metal-silver)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M {ldr_p2[0]} {ldr_p2[1]} C {ldr_p2[0]-10} {ldr_p2[1]}, {ldr_center_x} {ldr_center_y+8}, {ldr_center_x} {ldr_center_y+4}" stroke="url(#metal-silver)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Ceramic Disc Body -->
        <circle cx="{ldr_center_x}" cy="{ldr_center_y}" r="16" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
        <circle cx="{ldr_center_x}" cy="{ldr_center_y}" r="13" fill="url(#ldr-face)"/>
        <!-- Serpentine CdS Photo-track (Characteristic zig-zag squiggles) -->
        <path d="M {ldr_center_x-8} {ldr_center_y-8} H {ldr_center_x+8} V {ldr_center_y-4} H {ldr_center_x-8} V {ldr_center_y} H {ldr_center_x+8} V {ldr_center_y+4} H {ldr_center_x-8} V {ldr_center_y+8} H {ldr_center_x+8}" 
              fill="none" stroke="#7c2d12" stroke-width="1.8" stroke-linecap="round"/>
    </g>
    ''')

    # --- COMPONENT 2: 10kΩ Resistor (Pull-Down) ---
    # Location: column 8 (row E) to GND top rail (column 8)
    # Actually row E col 8 connects to 10k resistor, which spans to col 13 row E, or to GND rail!
    # In breadboard practice: 10k resistor spans from Column 8 (Row D) to GND rail or Column 8 to Column 14.
    # Let's make 10k resistor connect Column 8 Row D to Column 8 Top Rail (-) or Bottom rail!
    # Even clearer: 10k resistor connects from Column 8 (Row A) to Top Blue (-) Rail at col 8!
    r10k_p1 = bb_holes[('A', ldr_c)]
    r10k_p2 = bb_holes[('-', 'top', ldr_c)]
    # Resistor body centered between them
    r10k_mid_x = r10k_p1[0]
    r10k_mid_y = (r10k_p1[1] + r10k_p2[1]) / 2

    svg.append(f'''
    <!-- 10k Ohm Resistor (Brown-Black-Orange-Gold) -->
    <g id="resistor-10k" filter="url(#shadow)">
        <!-- Leads -->
        <line x1="{r10k_p1[0]}" y1="{r10k_p1[1]}" x2="{r10k_mid_x}" y2="{r10k_mid_y+16}" stroke="url(#metal-silver)" stroke-width="2" stroke-linecap="round"/>
        <line x1="{r10k_p2[0]}" y1="{r10k_p2[1]}" x2="{r10k_mid_x}" y2="{r10k_mid_y-16}" stroke="url(#metal-silver)" stroke-width="2" stroke-linecap="round"/>
        <!-- Resistor Body (Vertical) -->
        <rect x="{r10k_mid_x-6}" y="{r10k_mid_y-16}" width="12" height="32" rx="4" fill="url(#resistor-body)" stroke="#a16207" stroke-width="1"/>
        <!-- Color Bands: Brown, Black, Orange, Gold -->
        <rect x="{r10k_mid_x-6}" y="{r10k_mid_y-11}" width="12" height="3" fill="#78350f"/> <!-- Brown (1) -->
        <rect x="{r10k_mid_x-6}" y="{r10k_mid_y-5}" width="12" height="3" fill="#0f172a"/>  <!-- Black (0) -->
        <rect x="{r10k_mid_x-6}" y="{r10k_mid_y+1}" width="12" height="3" fill="#ea580c"/>  <!-- Orange (x10^3) -->
        <rect x="{r10k_mid_x-6}" y="{r10k_mid_y+8}" width="12" height="3" fill="#eab308"/>  <!-- Gold (5%) -->
    </g>
    ''')

    # --- COMPONENT 3: 220Ω Resistor (Current Limiter) ---
    # Connects Column 20 Row F to Column 20 Row I
    r220_c = 20
    r220_p1 = bb_holes[('F', r220_c)]
    r220_p2 = bb_holes[('I', r220_c)]
    r220_mid_x = r220_p1[0]
    r220_mid_y = (r220_p1[1] + r220_p2[1]) / 2

    svg.append(f'''
    <!-- 220 Ohm Resistor (Red-Red-Brown-Gold) -->
    <g id="resistor-220" filter="url(#shadow)">
        <!-- Leads -->
        <line x1="{r220_p1[0]}" y1="{r220_p1[1]}" x2="{r220_mid_x}" y2="{r220_mid_y-16}" stroke="url(#metal-silver)" stroke-width="2" stroke-linecap="round"/>
        <line x1="{r220_p2[0]}" y1="{r220_p2[1]}" x2="{r220_mid_x}" y2="{r220_mid_y+16}" stroke="url(#metal-silver)" stroke-width="2" stroke-linecap="round"/>
        <!-- Resistor Body -->
        <rect x="{r220_mid_x-6}" y="{r220_mid_y-16}" width="12" height="32" rx="4" fill="url(#resistor-body)" stroke="#a16207" stroke-width="1"/>
        <!-- Color Bands: Red, Red, Brown, Gold -->
        <rect x="{r220_mid_x-6}" y="{r220_mid_y-11}" width="12" height="3" fill="#dc2626"/> <!-- Red (2) -->
        <rect x="{r220_mid_x-6}" y="{r220_mid_y-5}" width="12" height="3" fill="#dc2626"/>  <!-- Red (2) -->
        <rect x="{r220_mid_x-6}" y="{r220_mid_y+1}" width="12" height="3" fill="#78350f"/>  <!-- Brown (x10^1) -->
        <rect x="{r220_mid_x-6}" y="{r220_mid_y+8}" width="12" height="3" fill="#eab308"/>  <!-- Gold (5%) -->
    </g>
    ''')

    # --- COMPONENT 4: 5mm RED LUMINAIRE LED ---
    # Anode (long leg) in Column 20 Row J (connected to 220Ω resistor)
    # Cathode (short leg, flat side) in Column 21 Row J
    led_anode_pt = bb_holes[('J', 20)]
    led_cathode_pt = bb_holes[('J', 21)]
    led_center_x = (led_anode_pt[0] + led_cathode_pt[0]) / 2
    led_center_y = led_anode_pt[1] + 32

    svg.append(f'''
    <!-- 5mm LED Actuator -->
    <g id="led-actuator" filter="url(#shadow)">
        <!-- Bent Metal Leads -->
        <path d="M {led_anode_pt[0]} {led_anode_pt[1]} L {led_anode_pt[0]} {led_anode_pt[1]+14} L {led_center_x-4} {led_center_y-8}" stroke="url(#metal-silver)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M {led_cathode_pt[0]} {led_cathode_pt[1]} L {led_cathode_pt[0]} {led_cathode_pt[1]+14} L {led_center_x+4} {led_center_y-8}" stroke="url(#metal-silver)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Glow Aura when Active -->
        <circle id="led-glow-aura" cx="{led_center_x}" cy="{led_center_y}" r="22" fill="#ef4444" opacity="0.35" filter="url(#led-glow)"/>
        <!-- LED Flange (Rim) -->
        <rect x="{led_center_x-13}" y="{led_center_y+5}" width="26" height="5" rx="1.5" fill="#991b1b"/>
        <!-- Flat edge on cathode side (right side) -->
        <path d="M {led_center_x+13} {led_center_y+5} V {led_center_y+10} H {led_center_x+10} Z" fill="#7f1d1d"/>
        <!-- 5mm Dome -->
        <path d="M {led_center_x-11} {led_center_y+5} V {led_center_y-6} A 11 11 0 0 1 {led_center_x+11} {led_center_y-6} V {led_center_y+5} Z" fill="url(#led-red-grad)"/>
        <!-- Inner Anvil & Post Reflector Frame -->
        <path d="M {led_center_x-5} {led_center_y} L {led_center_x} {led_center_y-4} L {led_center_x+4} {led_center_y}" fill="none" stroke="#fca5a5" stroke-width="1.2"/>
        <circle cx="{led_center_x}" cy="{led_center_y-4}" r="1.5" fill="#ffffff"/>
        <!-- Specular Highlight -->
        <ellipse cx="{led_center_x-4}" cy="{led_center_y-6}" rx="3" ry="5" fill="#ffffff" opacity="0.45" transform="rotate(-20 {led_center_x-4} {led_center_y-6})"/>
    </g>
    ''')

    svg.append('</g><!-- END COMPONENTS -->\n')

    # ==========================================
    # 4. JUMPER WIRES (CURVED & COLOR-CODED)
    # ==========================================
    svg.append('<!-- JUMPER WIRES -->\n<g id="wires" filter="url(#wire-shadow)">')

    def render_wire(start_pt, end_pt, color, stroke_w=4.5, c1_offset=(0, 0), c2_offset=(0, 0), label=""):
        sx, sy = start_pt
        ex, ey = end_pt
        # Compute nice curved control points
        dx = ex - sx
        dy = ey - sy
        cx1 = sx + dx * 0.35 + c1_offset[0]
        cy1 = sy + dy * 0.15 + c1_offset[1]
        cx2 = sx + dx * 0.65 + c2_offset[0]
        cy2 = sy + dy * 0.85 + c2_offset[1]
        
        # Wire Terminal Boot at Start
        svg.append(f'<circle cx="{sx}" cy="{sy}" r="4.5" fill="#1e293b" stroke="#475569" stroke-width="1"/>')
        svg.append(f'<circle cx="{sx}" cy="{sy}" r="2" fill="{color}"/>')

        # Outer Wire Line
        wire_id = label.lower().replace(" ", "-") if label else "wire"
        svg.append(f'<path id="{wire_id}" d="M {sx} {sy} C {cx1} {cy1}, {cx2} {cy2}, {ex} {ey}" fill="none" stroke="{color}" stroke-width="{stroke_w}" stroke-linecap="round"/>')
        # Highlight Core on Wire for 3D depth
        svg.append(f'<path d="M {sx} {sy} C {cx1} {cy1}, {cx2} {cy2}, {ex} {ey}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.3" stroke-linecap="round"/>')

        # Wire Terminal Boot at End
        svg.append(f'<circle cx="{ex}" cy="{ey}" r="4.5" fill="#1e293b" stroke="#475569" stroke-width="1"/>')
        svg.append(f'<circle cx="{ex}" cy="{ey}" r="2" fill="{color}"/>')

    # WIRE 1: 5V Power (Red)
    # From Arduino '5V' header -> Breadboard Top Red (+) Rail (col 4)
    w_5v_start = header_coords["5V"]
    w_5v_end = bb_holes[('+', 'top', 4)]
    render_wire(w_5v_start, w_5v_end, "#dc2626", stroke_w=4.5, c1_offset=(20, 100), c2_offset=(-30, -50), label="5V Power Wire")

    # WIRE 2: Ground GND (Black)
    # From Arduino 'GND1' header -> Breadboard Top Blue (-) Rail (col 2)
    w_gnd_start = header_coords["GND1"]
    w_gnd_end = bb_holes[('-', 'top', 2)]
    render_wire(w_gnd_start, w_gnd_end, "#1e293b", stroke_w=4.5, c1_offset=(20, 120), c2_offset=(-40, -40), label="GND Rail Wire")

    # WIRE 3: Analog Signal A0 (Green / Bright Yellow-Green)
    # From Arduino Pin A0 -> Breadboard Column 8, Row C (Midpoint between LDR and 10k resistor)
    w_a0_start = header_coords["A0"]
    w_a0_end = bb_holes[('C', 8)]
    render_wire(w_a0_start, w_a0_end, "#22c55e", stroke_w=4.5, c1_offset=(60, 40), c2_offset=(-50, -20), label="A0 Sensor Tap Wire")

    # WIRE 4: Digital Actuator Pin D9 (Blue)
    # From Arduino Pin ~9 -> Breadboard Column 20, Row F (feeds 220Ω resistor)
    w_d9_start = header_coords["~9"]
    w_d9_end = bb_holes[('F', 20)]
    render_wire(w_d9_start, w_d9_end, "#2563eb", stroke_w=4.5, c1_offset=(80, -70), c2_offset=(-40, -40), label="D9 Control Wire")

    # WIRE 5: Breadboard Internal Jumper (Red)
    # Connects Top Red (+) Rail (col 8) to Column 8 Row B (LDR high side)
    bb_jumper1_start = bb_holes[('+', 'top', 8)]
    bb_jumper1_end = bb_holes[('B', 8)]
    render_wire(bb_jumper1_start, bb_jumper1_end, "#dc2626", stroke_w=3.5, c1_offset=(-15, 5), c2_offset=(-15, -5), label="LDR 5V Jumper")

    # WIRE 6: Breadboard Internal Jumper (Black)
    # Connects LED Cathode (Column 21, Row J) to Bottom Blue (-) Rail (col 21)
    bb_jumper2_start = bb_holes[('J', 21)]
    bb_jumper2_end = bb_holes[('-', 'bot', 21)]
    render_wire(bb_jumper2_start, bb_jumper2_end, "#1e293b", stroke_w=3.5, c1_offset=(12, 10), c2_offset=(12, -10), label="LED Ground Jumper")

    # WIRE 7: Breadboard Ground Link (Black)
    # Connects Top Blue (-) Rail (col 28) to Bottom Blue (-) Rail (col 28)
    bb_gnd_link_start = bb_holes[('-', 'top', 28)]
    bb_gnd_link_end = bb_holes[('-', 'bot', 28)]
    render_wire(bb_gnd_link_start, bb_gnd_link_end, "#334155", stroke_w=3.5, c1_offset=(20, 0), c2_offset=(20, 0), label="Rails Ground Bridge")

    svg.append('</g><!-- END JUMPER WIRES -->\n')

    # ==========================================
    # 5. TECHNICAL ANNOTATIONS & PIN CALLOUTS
    # ==========================================
    svg.append('''
    <!-- TECHNICAL CALLOUTS & LABELS -->
    <g id="annotations">
        <!-- Callout 1: LDR Potential Divider -->
        <g transform="translate(685, 235)">
            <rect x="0" y="0" width="180" height="48" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5" opacity="0.95" filter="url(#shadow)"/>
            <text x="12" y="18" font-size="11" font-weight="bold" fill="#fcd34d">CdS Photocell (LDR)</text>
            <text x="12" y="32" font-size="9.5" fill="#cbd5e1">Dark: 100kΩ+ | Light: 1kΩ</text>
            <text x="12" y="43" font-size="8.5" fill="#94a3b8">Node tap connected to Pin A0</text>
            <line x1="0" y1="24" x2="-35" y2="24" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
            <circle cx="-35" cy="24" r="3" fill="#f59e0b"/>
        </g>

        <!-- Callout 2: 10k Pull-Down Resistor -->
        <g transform="translate(685, 140)">
            <rect x="0" y="0" width="180" height="42" rx="6" fill="#1e293b" stroke="#a16207" stroke-width="1.5" opacity="0.95" filter="url(#shadow)"/>
            <text x="12" y="17" font-size="11" font-weight="bold" fill="#fef08a">10kΩ 1/4W Resistor</text>
            <text x="12" y="31" font-size="9.5" fill="#cbd5e1">Pull-Down to Ground Rail</text>
            <line x1="0" y1="21" x2="-45" y2="21" stroke="#a16207" stroke-width="1.5" stroke-dasharray="3,3"/>
            <circle cx="-45" cy="21" r="3" fill="#a16207"/>
        </g>

        <!-- Callout 3: 220 Ohm Current Limiter -->
        <g transform="translate(890, 390)">
            <rect x="0" y="0" width="180" height="42" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5" opacity="0.95" filter="url(#shadow)"/>
            <text x="12" y="17" font-size="11" font-weight="bold" fill="#93c5fd">220Ω Limiting Resistor</text>
            <text x="12" y="31" font-size="9.5" fill="#cbd5e1">Limits LED current to ~14mA</text>
            <line x1="0" y1="21" x2="-55" y2="21" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3,3"/>
            <circle cx="-55" cy="21" r="3" fill="#3b82f6"/>
        </g>

        <!-- Callout 4: 5mm LED Actuator -->
        <g transform="translate(890, 480)">
            <rect x="0" y="0" width="180" height="48" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1.5" opacity="0.95" filter="url(#shadow)"/>
            <text x="12" y="18" font-size="11" font-weight="bold" fill="#fca5a5">5mm Red Luminaire LED</text>
            <text x="12" y="32" font-size="9.5" fill="#cbd5e1">Cathode to GND | Anode to D9</text>
            <text x="12" y="43" font-size="8.5" fill="#94a3b8">Active when ADC &lt;= 400 (Night)</text>
            <line x1="0" y1="24" x2="-40" y2="24" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
            <circle cx="-40" cy="24" r="3" fill="#ef4444"/>
        </g>

        <!-- Legend / Status Pill -->
        <g transform="translate(50, 625)">
            <rect x="0" y="0" width="480" height="32" rx="6" fill="#1e293b" stroke="#334155"/>
            <!-- Red wire pill -->
            <circle cx="20" cy="16" r="6" fill="#dc2626"/>
            <text x="32" y="20" font-size="10" font-weight="bold" fill="#e2e8f0">+5V VCC</text>
            <!-- Black wire pill -->
            <circle cx="105" cy="16" r="6" fill="#1e293b" stroke="#94a3b8"/>
            <text x="117" y="20" font-size="10" font-weight="bold" fill="#e2e8f0">GND (0V)</text>
            <!-- Green wire pill -->
            <circle cx="195" cy="16" r="6" fill="#22c55e"/>
            <text x="207" y="20" font-size="10" font-weight="bold" fill="#e2e8f0">A0 (Analog In)</text>
            <!-- Blue wire pill -->
            <circle cx="310" cy="16" r="6" fill="#2563eb"/>
            <text x="322" y="20" font-size="10" font-weight="bold" fill="#e2e8f0">D9 (PWM Output)</text>
        </g>
    </g>
    ''')

    svg.append('</svg>')
    return '\n'.join(svg)

if __name__ == '__main__':
    svg_content = generate_svg()
    with open('fritzing_circuit_diagram.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print("Successfully generated fritzing_circuit_diagram.svg")
