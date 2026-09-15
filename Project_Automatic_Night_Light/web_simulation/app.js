/**
 * ==============================================================================
 * AUTOMATIC NIGHT LIGHT SYSTEM — CLIENT APPLICATION SCRIPT
 * Full Real-Time Physics Engine, Hysteresis State Machine, Scope & Telemetry
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE CONFIGURATION ---
  const state = {
    lux: 450,
    currentLux: 450,
    targetLux: 450,
    tDark: 400,
    tLight: 500,
    rFixed: 10000,
    vcc: 5.0,
    buffer: new Array(10).fill(678),
    bufIdx: 0,
    runningSum: 678 * 10,
    ledState: false,
    terminalPaused: false,
    terminalAutoScroll: true,
    startTime: Date.now(),
    lastLogTime: 0,
    scopeHistory: [],
    maxScopePoints: 120,
    currentStep: 1,
    isFlowPlaying: false,
    flowInterval: null,
    activePage: 'simulator',
    isAutoAnimating: false,
    autoAnimSpeed: 1.0,
    autoAnimAngle: 0.5
  };

  // --- TAB-BASED PAGE NAVIGATION SYSTEM ---
  const navLinks = document.querySelectorAll('nav.main-nav a[data-page]');
  const pageSections = document.querySelectorAll('.page-section');
  const mainNav = document.getElementById('main-nav');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');

  function switchPage(pageId) {
    state.activePage = pageId;

    // Hide all page sections, show the selected one
    pageSections.forEach(section => {
      section.classList.remove('active-page');
    });
    const targetSection = document.getElementById(pageId);
    if (targetSection) {
      targetSection.classList.add('active-page');
    }

    // Update nav active states
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.page === pageId) {
        link.classList.add('active');
      }
    });

    // Close mobile menu if open
    if (mainNav) mainNav.classList.remove('open');

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Resize oscilloscope canvas when simulator is shown
    if (pageId === 'simulator') {
      resizeCanvas();
    }
  }

  // Attach click handlers to nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchPage(link.dataset.page);
    });
  });

  // Mobile hamburger menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      mobileMenuBtn.textContent = mainNav.classList.contains('open') ? '✕' : '☰';
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mainNav && mobileMenuBtn && !mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      mainNav.classList.remove('open');
      mobileMenuBtn.textContent = '☰';
    }
  });

  // Responsive canvas resize handler
  function resizeCanvas() {
    const canvas = document.getElementById('oscilloscope-canvas');
    if (canvas) {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth - 32; // Account for padding
      canvas.height = Math.min(200, container.clientWidth * 0.3);
    }
  }
  window.addEventListener('resize', resizeCanvas);

  // --- DOM ELEMENTS ---
  const luxSlider = document.getElementById('lux-slider');
  const luxBadge = document.getElementById('lux-badge');
  const presetButtons = document.querySelectorAll('.btn-preset');
  
  const valRldr = document.getElementById('val-rldr');
  const barRldr = document.getElementById('bar-rldr');
  const valNodeV = document.getElementById('val-nodev');
  const barNodeV = document.getElementById('bar-nodev');
  const valRawAdc = document.getElementById('val-rawadc');
  const barRawAdc = document.getElementById('bar-rawadc');
  const valFilteredAdc = document.getElementById('val-filteredadc');
  const barFilteredAdc = document.getElementById('bar-filteredadc');
  
  const luminaireCard = document.getElementById('luminaire-card');
  const luminaireStatusText = document.getElementById('luminaire-status-text');
  const luminaireSubtext = document.getElementById('luminaire-subtext');
  const deadbandAlert = document.getElementById('deadband-alert');
  
  const canvas = document.getElementById('oscilloscope-canvas');
  const ctx = canvas.getContext('2d');
  
  const terminalViewport = document.getElementById('terminal-viewport');
  const btnClearTerm = document.getElementById('btn-clear-term');
  const btnPauseTerm = document.getElementById('btn-pause-term');
  const btnAutoscrollTerm = document.getElementById('btn-autoscroll-term');
  
  const sliderTDark = document.getElementById('slider-tdark');
  const sliderTLight = document.getElementById('slider-tlight');
  const labelTDark = document.getElementById('label-tdark');
  const labelTLight = document.getElementById('label-tlight');
  const deadbandWidthText = document.getElementById('deadband-width-text');
  const codeTDark = document.getElementById('code-tdark');
  const codeTLight = document.getElementById('code-tlight');
  const btnResetTuner = document.getElementById('btn-reset-tuner');
  const btnCopyFirmware = document.getElementById('btn-copy-firmware');
  
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  // --- PHYSICS ENGINE: LUX TO RESISTANCE & VOLTAGE ---
  function computePhysics(lux) {
    // Model: R_LDR ≈ 500,000 * lux^(-0.75), clamped between 400 Ω and 1,000,000 Ω
    const rLdr = Math.max(400, Math.min(1000000, Math.round(500000 * Math.pow(lux, -0.75))));
    
    // Voltage Divider: V_out = Vcc * [ R_fixed / (R_LDR + R_fixed) ]
    const vNode = (state.vcc * state.rFixed) / (rLdr + state.rFixed);
    
    // 10-Bit ADC: D = round( (V_out / Vcc) * 1023 )
    const rawAdc = Math.max(0, Math.min(1023, Math.round((vNode / state.vcc) * 1023)));
    
    return { rLdr, vNode, rawAdc };
  }

  // --- PHOTOREALISTIC VIRTUAL ROOM & SKY WINDOW ---
  function updateVirtualRoom(lux, isLedOn) {
    const sky = document.getElementById('sky-backdrop');
    const sun = document.getElementById('celestial-sun');
    const moon = document.getElementById('celestial-moon');
    const stars = document.getElementById('stars-layer');
    const roomWin = document.getElementById('virtual-room-window');
    const atmoText = document.getElementById('room-atmosphere-text');
    const luxText = document.getElementById('room-lux-text');

    if (!sky || !sun || !moon || !roomWin) return;

    if (isLedOn) {
      roomWin.classList.add('light-active');
    } else {
      roomWin.classList.remove('light-active');
    }

    if (luxText) luxText.textContent = `${lux} Lux`;

    if (lux >= 350) {
      sky.className = 'sky-backdrop day';
      sun.style.opacity = '1';
      sun.style.transform = 'translateY(0) scale(1)';
      moon.style.opacity = '0';
      moon.style.transform = 'translateY(60px)';
      stars.style.opacity = '0';
      if (atmoText) atmoText.innerHTML = '☀️ Daylight Atmosphere';
    } else if (lux >= 60) {
      sky.className = 'sky-backdrop twilight';
      sun.style.opacity = '0.7';
      sun.style.transform = 'translateY(35px) scale(0.9)';
      moon.style.opacity = '0.35';
      moon.style.transform = 'translateY(25px)';
      stars.style.opacity = '0.2';
      if (atmoText) atmoText.innerHTML = '🌅 Twilight Sunset';
    } else {
      sky.className = 'sky-backdrop night';
      sun.style.opacity = '0';
      sun.style.transform = 'translateY(80px)';
      moon.style.opacity = '1';
      moon.style.transform = 'translateY(0) scale(1)';
      stars.style.opacity = Math.max(0.35, 1 - (lux / 60)).toFixed(2);
      if (atmoText) atmoText.innerHTML = isLedOn ? '💡 Luminaire Active (Night)' : '🌙 Deep Nightfall';
    }
  }

  // --- FILTER & HYSTERESIS STATE MACHINE ---
  function updateSimulation() {
    // Dynamic Auto-Animation Sweep (Silky-Smooth Sinusoidal Modulation)
    if (state.isAutoAnimating) {
      // Gentle, realistic diurnal cycle speed (approx. 38s at 1.0x, 76s at 0.5x, 19s at 2.0x)
      state.autoAnimAngle += 0.0032 * state.autoAnimSpeed;
      
      // Smoothstep cosine easing: smooth deceleration at midday peak and midnight low
      const cosVal = Math.cos(state.autoAnimAngle);
      const norm = (cosVal + 1) / 2; // 0 to 1
      const smoothStep = norm * norm * (3 - 2 * norm); // S-curve easing
      const targetLux = Math.round(2 + 1098 * smoothStep);
      state.targetLux = targetLux;

      // Update Phase Status text
      const curLux = state.lux;
      let phaseMsg = '';
      if (curLux >= 650) {
        phaseMsg = `☀️ High Daylight (${curLux} Lux) • Luminaire Extinguished`;
      } else if (curLux >= 350) {
        phaseMsg = `🌤️ Overhead Ambient (${curLux} Lux) • High Node Voltage (~3.3V)`;
      } else if (curLux >= 120) {
        phaseMsg = `🌅 Dusk Twilight Descent (${curLux} Lux) • Photocell Resistance Rising`;
      } else if (curLux >= 45) {
        phaseMsg = `⚠️ Schmitt Hysteresis Deadband (${curLux} Lux) • Chatter-Free Memory`;
      } else if (curLux >= 10) {
        phaseMsg = `💡 Nightfall Active (${curLux} Lux) • Pin D9 Output HIGH (Active)`;
      } else {
        phaseMsg = `🌙 Deep Night Darkness (${curLux} Lux) • Peak Sensor Resistance (>100kΩ)`;
      }
      const phaseEl = document.getElementById('auto-demo-phase-text');
      if (phaseEl) phaseEl.textContent = phaseMsg;
    }

    // Ultra-smooth lux gliding towards targetLux (zero stutter, velvet glide)
    const diff = state.targetLux - state.currentLux;
    if (Math.abs(diff) > 0.08) {
      state.currentLux += diff * 0.075;
      state.lux = Math.round(state.currentLux);
      luxSlider.value = state.lux;
    } else {
      state.currentLux = state.targetLux;
      state.lux = state.targetLux;
      luxSlider.value = state.lux;
    }

    const { rLdr, vNode, rawAdc } = computePhysics(state.lux);
    
    // Circular buffer rolling average update
    state.runningSum -= state.buffer[state.bufIdx];
    state.buffer[state.bufIdx] = rawAdc;
    state.runningSum += rawAdc;
    state.bufIdx = (state.bufIdx + 1) % state.buffer.length;
    
    const filteredAdc = Math.round(state.runningSum / state.buffer.length);
    const filteredVolt = (filteredAdc * state.vcc) / 1023.0;

    // Schmitt Trigger Dual-Threshold Logic
    let inDeadband = false;
    if (filteredAdc <= state.tDark) {
      state.ledState = true;
    } else if (filteredAdc >= state.tLight) {
      state.ledState = false;
    } else {
      // Retain previous state
      inDeadband = true;
    }

    // Update Virtual Room Graphic
    updateVirtualRoom(state.lux, state.ledState);

    // Update Gauges & Text
    luxBadge.textContent = `${state.lux} Lux`;
    
    // R_LDR formatting
    if (rLdr >= 1000000) {
      valRldr.textContent = `${(rLdr / 1000000).toFixed(2)} MΩ`;
    } else {
      valRldr.textContent = `${(rLdr / 1000).toFixed(1)} kΩ`;
    }
    barRldr.style.width = `${Math.min(100, Math.max(5, (1 - (rLdr / 100000)) * 100))}%`;

    valNodeV.textContent = `${vNode.toFixed(2)} V`;
    barNodeV.style.width = `${(vNode / 5.0) * 100}%`;

    valRawAdc.textContent = `${rawAdc}`;
    barRawAdc.style.width = `${(rawAdc / 1023) * 100}%`;

    valFilteredAdc.textContent = `${filteredAdc}`;
    barFilteredAdc.style.width = `${(filteredAdc / 1023) * 100}%`;

    // Luminaire Status Display
    if (state.ledState) {
      luminaireCard.classList.add('is-on');
      luminaireStatusText.textContent = 'LUMINAIRE ACTIVE (ON)';
      luminaireSubtext.textContent = `Nightfall detected (ADC ${filteredAdc} ≤ ${state.tDark}). Output HIGH.`;
    } else {
      luminaireCard.classList.remove('is-on');
      luminaireStatusText.textContent = 'EXTINGUISHED (OFF)';
      luminaireSubtext.textContent = `Sufficient daylight (ADC ${filteredAdc} ≥ ${state.tLight}). Output LOW.`;
    }

    // Deadband Badge
    if (inDeadband) {
      deadbandAlert.style.display = 'inline-flex';
    } else {
      deadbandAlert.style.display = 'none';
    }

    // Update Embedded SVG Circuit (if available in DOM)
    updateCircuitSvg(state.ledState, filteredAdc);

    // Record Scope Data
    state.scopeHistory.push({
      adc: filteredAdc,
      led: state.ledState ? 1 : 0
    });
    if (state.scopeHistory.length > state.maxScopePoints) {
      state.scopeHistory.shift();
    }
  }

  // --- SVG INTERACTIVE STYLING ---
  function updateCircuitSvg(isLedOn, adcVal) {
    const svgObject = document.getElementById('circuit-svg-object');
    if (!svgObject || !svgObject.contentDocument) return;

    try {
      const svgDoc = svgObject.contentDocument;
      const ledGlow = svgDoc.getElementById('led-glow-aura');
      const d9Wire = svgDoc.getElementById('d9-control-wire');
      const a0Wire = svgDoc.getElementById('a0-sensor-tap-wire');

      if (ledGlow) {
        if (isLedOn) {
          ledGlow.setAttribute('opacity', '0.75');
          ledGlow.setAttribute('r', '28');
        } else {
          ledGlow.setAttribute('opacity', '0.05');
          ledGlow.setAttribute('r', '14');
        }
      }

      if (d9Wire) {
        if (isLedOn) {
          d9Wire.setAttribute('stroke', '#60a5fa');
          d9Wire.setAttribute('stroke-width', '5.5');
        } else {
          d9Wire.setAttribute('stroke', '#2563eb');
          d9Wire.setAttribute('stroke-width', '4.5');
        }
      }
    } catch (e) {
      // Cross-origin restriction fallback
    }
  }

  // --- REAL-TIME OSCILLOSCOPE CANVAS ---
  function drawOscilloscope() {
    const w = canvas.width;
    const h = canvas.height;

    // Clear background with soft phosphor decay persistence
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    ctx.fillStyle = isLight ? 'rgba(241, 245, 249, 0.35)' : 'rgba(2, 6, 23, 0.32)';
    ctx.fillRect(0, 0, w, h);

    // Draw phosphor grid lines
    ctx.strokeStyle = isLight ? 'rgba(203, 213, 225, 0.75)' : 'rgba(30, 41, 59, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    const gridCols = 10;
    const gridRows = 6;
    for (let c = 1; c < gridCols; c++) {
      ctx.beginPath();
      ctx.moveTo((w / gridCols) * c, 0);
      ctx.lineTo((w / gridCols) * c, h);
      ctx.stroke();
    }
    for (let r = 1; r < gridRows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, (h / gridRows) * r);
      ctx.lineTo(w, (h / gridRows) * r);
      ctx.stroke();
    }

    // Shaded Hysteresis Deadband Zone
    const yTDark = h - (state.tDark / 1023) * h;
    const yTLight = h - (state.tLight / 1023) * h;
    
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fillRect(0, yTLight, w, yTDark - yTLight);

    // Dashed threshold guide lines
    ctx.setLineDash([5, 5]);
    // T_DARK line
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, yTDark);
    ctx.lineTo(w, yTDark);
    ctx.stroke();
    
    // T_LIGHT line
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, yTLight);
    ctx.lineTo(w, yTLight);
    ctx.stroke();

    ctx.setLineDash([]);

    // Channel labels on canvas
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#f87171';
    ctx.fillText(`T_DARK = ${state.tDark}`, 10, yTDark - 4);
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`T_LIGHT = ${state.tLight}`, 10, yTLight - 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`DEADBAND (Δ = ${state.tLight - state.tDark})`, w - 160, (yTDark + yTLight) / 2 + 3);

    if (state.scopeHistory.length < 2) return;

    const stepX = w / (state.maxScopePoints - 1);

    // --- PLOT CH2: Digital Pin 9 State (HIGH / LOW) in Neon Rose ---
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < state.scopeHistory.length; i++) {
      const x = i * stepX;
      // Map 0 to h - 15, 1 to h - 55
      const y = state.scopeHistory[i].led === 1 ? h - 55 : h - 15;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const prevY = state.scopeHistory[i - 1].led === 1 ? h - 55 : h - 15;
        if (prevY !== y) {
          ctx.lineTo(x, prevY); // Square wave sharp edge
        }
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // --- PLOT CH1: Filtered ADC Waveform in Luminous Cyan ---
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < state.scopeHistory.length; i++) {
      const x = i * stepX;
      const y = h - (state.scopeHistory[i].adc / 1023) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // --- VIRTUAL SERIAL MONITOR TELEMETRY ---
  function streamSerialTelemetry() {
    if (state.terminalPaused) return;

    const now = Date.now();
    if (now - state.lastLogTime >= 500) {
      state.lastLogTime = now;
      const elapsedSec = ((now - state.startTime) / 1000).toFixed(3);
      
      const { vNode } = computePhysics(state.lux);
      const filteredAdc = Math.round(state.runningSum / state.buffer.length);
      const statusText = state.ledState ? 'ACTIVE (ON)' : 'INACTIVE (OFF)';
      const msgClass = state.ledState ? 'log-msg-on' : 'log-msg-off';

      const entry = document.createElement('div');
      entry.className = 'log-entry';
      entry.innerHTML = `
        <span class="log-time">[+${elapsedSec}s]</span>
        <span class="${msgClass}">ADC: ${filteredAdc} | V: ${vNode.toFixed(2)}V | Luminaire: ${statusText}</span>
      `;

      terminalViewport.appendChild(entry);

      // Trim terminal history to 80 lines max
      while (terminalViewport.children.length > 80) {
        terminalViewport.removeChild(terminalViewport.firstChild);
      }

      if (state.terminalAutoScroll) {
        terminalViewport.scrollTop = terminalViewport.scrollHeight;
      }
    }
  }

  // --- PROCESS FLOW STAGES DATA & LOGIC ---
  const flowStages = [
    {
      step: 1,
      badge: 'STAGE 1 OF 5 • SENSOR TRANSDUCTION',
      heading: 'Photoconductive Excitation in Cadmium Sulfide (CdS)',
      description: 'Incident photons with energy hν ≥ Eg ≈ 2.42 eV strike the ceramic CdS surface, kicking valence electrons across the forbidden gap into the conduction band. The resulting abundance of free electron-hole pairs drastically cuts bulk sensor resistance from >100 kΩ in pitch darkness to <1 kΩ in daylight.',
      formula: 'R_LDR = 500,000 × Lux^(-0.75) | λ_cutoff = hc / E_g = 512 nm',
      caption: 'Photon Flux Striking CdS Active Serpentine Track',
      renderSvg: (svg) => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const cardBg = isLight ? '#ffffff' : '#1e293b';
        const cardStroke = '#f59e0b';
        const waveColor = isLight ? '#d97706' : '#fef08a';
        svg.innerHTML = `
          <rect x="20" y="20" width="220" height="100" rx="8" fill="${cardBg}" stroke="${cardStroke}" stroke-width="1.5"/>
          <circle cx="70" cy="70" r="28" fill="#ea580c"/>
          <path d="M 55 55 H 85 V 65 H 55 V 75 H 85 V 85 H 55" fill="none" stroke="#7c2d12" stroke-width="2.5"/>
          <!-- Incoming Light Waves with Smooth Flow Animation -->
          <path class="anim-photon-wave" d="M 120 45 Q 135 40 150 45 T 180 45" fill="none" stroke="${waveColor}" stroke-width="2.2"/>
          <path class="anim-photon-wave" style="animation-delay: -0.5s;" d="M 120 70 Q 135 65 150 70 T 180 70" fill="none" stroke="${waveColor}" stroke-width="2.2"/>
          <path class="anim-photon-wave" style="animation-delay: -1s;" d="M 120 95 Q 135 90 150 95 T 180 95" fill="none" stroke="${waveColor}" stroke-width="2.2"/>
          <text x="195" y="74" font-size="11" fill="${waveColor}" font-weight="bold">hν</text>
        `;
      }
    },
    {
      step: 2,
      badge: 'STAGE 2 OF 5 • VOLTAGE TRANSLATION',
      heading: 'Potential Divider Ratio Scaling (0 to 5V Analog)',
      description: 'Because microcontrollers cannot read bare resistance directly, the LDR is paired with a precision 10 kΩ carbon pull-down resistor to GND. By Ohm\'s voltage division, the intermediate node tap voltage shifts dynamically with illuminance.',
      formula: 'V_node = V_cc × [ 10,000 / (R_LDR + 10,000) ]',
      caption: 'Ohmic Potential Divider Network',
      renderSvg: (svg) => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const cardBg = isLight ? '#ffffff' : '#1e293b';
        const wireColor = isLight ? '#475569' : '#cbd5e1';
        svg.innerHTML = `
          <rect x="20" y="20" width="220" height="100" rx="8" fill="${cardBg}" stroke="#3b82f6" stroke-width="1.5"/>
          <text x="130" y="38" font-size="10" fill="#ef4444" font-weight="bold" text-anchor="middle">+5V VCC</text>
          <line x1="130" y1="42" x2="130" y2="52" stroke="#ef4444" stroke-width="2"/>
          <rect x="118" y="52" width="24" height="18" fill="#fde047" stroke="#ca8a04" rx="2"/>
          <text x="130" y="65" font-size="8" fill="#000" font-weight="bold" text-anchor="middle">LDR</text>
          <line x1="130" y1="70" x2="130" y2="78" stroke="${wireColor}" stroke-width="2"/>
          <!-- Tap to A0 with Pulsing Signal Animation -->
          <line x1="130" y1="74" x2="190" y2="74" stroke="#22c55e" stroke-width="2.5"/>
          <circle class="anim-signal-pulse" cx="190" cy="74" r="3.5" fill="#22c55e"/>
          <text x="210" y="78" font-size="10" fill="#22c55e" font-weight="bold">Pin A0</text>
          <rect x="118" y="78" width="24" height="18" fill="#94a3b8" stroke="#475569" rx="2"/>
          <text x="130" y="91" font-size="8" fill="#000" font-weight="bold" text-anchor="middle">10k</text>
          <line x1="130" y1="96" x2="130" y2="108" stroke="#3b82f6" stroke-width="2"/>
          <text x="130" y="117" font-size="9" fill="#3b82f6" font-weight="bold" text-anchor="middle">GND</text>
        `;
      }
    },
    {
      step: 3,
      badge: 'STAGE 3 OF 5 • ANALOG-TO-DIGITAL CONVERSION',
      heading: '10-Bit Successive Approximation Register (SAR) ADC',
      description: 'The ATmega328P ADC compares the continuous tap voltage against a 5.0 V reference in 13 clock cycles (104 μs). The binary search successive approximation algorithm quantizes the voltage into 2¹⁰ = 1024 discrete integer steps.',
      formula: 'ADC = round( (V_node / 5.0 V) × 1023 ) | 1 LSB = 4.887 mV',
      caption: 'SAR Internal Binary Search DAC Comparator',
      renderSvg: (svg) => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const cardBg = isLight ? '#ffffff' : '#1e293b';
        const dacBg = isLight ? '#f1f5f9' : '#030712';
        const textColor = isLight ? '#334155' : '#cbd5e1';
        svg.innerHTML = `
          <rect x="20" y="20" width="220" height="100" rx="8" fill="${cardBg}" stroke="#10b981" stroke-width="1.5"/>
          <text x="40" y="45" font-size="9" fill="${textColor}">Continuous: 1.75 V</text>
          <path d="M 40 55 L 70 55 L 70 85 L 100 85" stroke="#22c55e" stroke-width="2" fill="none"/>
          <path d="M 115 70 L 140 70" stroke="#94a3b8" stroke-width="2"/>
          <rect x="145" y="45" width="80" height="50" rx="4" fill="${dacBg}" stroke="#10b981"/>
          <g class="anim-sar-counter">
            <text x="185" y="68" font-size="12" fill="#10b981" font-weight="bold" text-anchor="middle">358</text>
          </g>
          <text x="185" y="84" font-size="8" fill="${isLight ? '#64748b' : '#94a3b8'}" text-anchor="middle">10-Bit Integer</text>
        `;
      }
    },
    {
      step: 4,
      badge: 'STAGE 4 OF 5 • DIGITAL SIGNAL PROCESSING',
      heading: 'Circular FIFO Moving-Average Noise Filter',
      description: 'A 10-sample rolling buffer in SRAM continually purges high-frequency sensor noise, mains 50 Hz fluorescent hum, and rapid shadow flickers. In each loop iteration, the oldest sample is subtracted from a running sum and replaced with the new reading.',
      formula: 'filteredADC = runningSum / 10 | Computational Complexity: O(1)',
      caption: 'FIFO Circular Buffer Smoothing Architecture',
      renderSvg: (svg) => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const cardBg = isLight ? '#ffffff' : '#1e293b';
        const slotBg = isLight ? '#f1f5f9' : '#0f172a';
        const slotBorder = isLight ? '#cbd5e1' : '#475569';
        svg.innerHTML = `
          <rect x="20" y="20" width="220" height="100" rx="8" fill="${cardBg}" stroke="#8b5cf6" stroke-width="1.5"/>
          <g transform="translate(35, 45)">
            ${[0,1,2,3,4,5,6,7,8,9].map(i => `
              <rect x="${i*19}" y="0" width="16" height="24" rx="2" fill="${i === 3 ? '#8b5cf6' : slotBg}" stroke="${slotBorder}" ${i === 3 ? 'class="anim-sar-counter"' : ''}/>
              <text x="${i*19+8}" y="16" font-size="8" fill="${i === 3 ? '#fff' : (isLight ? '#475569' : '#94a3b8')}" text-anchor="middle">${i===3 ? 'N' : '·'}</text>
            `).join('')}
          </g>
          <text x="130" y="95" font-size="10" fill="${isLight ? '#7c3aed' : '#a78bfa'}" font-weight="bold" text-anchor="middle">runningSum ÷ 10 = Zero Phase Lag</text>
        `;
      }
    },
    {
      step: 5,
      badge: 'STAGE 5 OF 5 • HYSTERESIS DECISION & ACTUATION',
      heading: 'Schmitt-Trigger Software Hysteresis & LED Control',
      description: 'The filtered ADC is compared against dual thresholds. To enter the ON state, darkness must drop below 400 (1.95 V). To extinguish, daylight must climb above 500 (2.44 V). The 100-count deadband prevents rapid chatter, contact sparking, and visual flickering.',
      formula: 'ON if ADC ≤ 400 | OFF if ADC ≥ 500 | Deadband Δ = 100 Counts',
      caption: 'Bistable Schmitt-Trigger Transfer Characteristic',
      renderSvg: (svg) => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const cardBg = isLight ? '#ffffff' : '#1e293b';
        const axisColor = isLight ? '#94a3b8' : '#64748b';
        svg.innerHTML = `
          <rect x="20" y="20" width="220" height="100" rx="8" fill="${cardBg}" stroke="#f43f5e" stroke-width="1.5"/>
          <line x1="40" y1="100" x2="210" y2="100" stroke="${axisColor}" stroke-width="1.5"/>
          <line x1="40" y1="100" x2="40" y2="35" stroke="${axisColor}" stroke-width="1.5"/>
          <!-- Hysteresis Loop with Animated Cursor -->
          <rect x="85" y="45" width="70" height="55" fill="rgba(245, 158, 11, ${isLight ? '0.2' : '0.15'})"/>
          <path d="M 40 45 H 155 V 100 H 205" stroke="#f43f5e" stroke-width="2.5" fill="none"/>
          <path d="M 205 100 H 85 V 45 H 40" stroke="#f43f5e" stroke-width="2.5" fill="none"/>
          <circle class="anim-hysteresis-cursor" cx="115" cy="72.5" r="4.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5"/>
          <text x="85" y="112" font-size="8" fill="${isLight ? '#dc2626' : '#f87171'}" font-weight="bold">400</text>
          <text x="155" y="112" font-size="8" fill="${isLight ? '#0284c7' : '#38bdf8'}" font-weight="bold">500</text>
          <text x="120" y="75" font-size="8" fill="${isLight ? '#d97706' : '#fbbf24'}" font-weight="bold" text-anchor="middle">DEADBAND</text>
        `;
      }
    }
  ];

  function setProcessStep(stepNum) {
    state.currentStep = stepNum;
    const stage = flowStages[stepNum - 1];

    document.getElementById('step-badge').textContent = stage.badge;
    document.getElementById('step-heading').textContent = stage.heading;
    document.getElementById('step-description').textContent = stage.description;
    document.getElementById('step-formula-box').textContent = stage.formula;
    document.getElementById('step-graphic-caption').textContent = stage.caption;
    
    stage.renderSvg(document.getElementById('step-visual-svg'));

    document.querySelectorAll('.flow-step-node').forEach(node => {
      const s = parseInt(node.dataset.step);
      node.classList.remove('active', 'completed');
      if (s === stepNum) node.classList.add('active');
      else if (s < stepNum) node.classList.add('completed');
    });

    document.getElementById('flow-status-text').textContent = `Stage ${stepNum} / 5 Selected`;
  }

  // --- AUTOMATED FLOW ANIMATION CYCLE ---
  function toggleFlowAnimation() {
    if (state.isFlowPlaying) {
      clearInterval(state.flowInterval);
      state.isFlowPlaying = false;
      document.getElementById('btn-play-flow').innerHTML = '<span>▶</span> Play Guided Cycle Animation';
      return;
    }

    state.isFlowPlaying = true;
    document.getElementById('btn-play-flow').innerHTML = '<span>⏹</span> Stop Cycle Animation';

    // Sequence of lux transitions demonstrating day -> dusk -> night -> dawn
    const demoSequence = [
      { step: 1, lux: 950, delay: 1800 },
      { step: 2, lux: 520, delay: 1800 },
      { step: 3, lux: 150, delay: 1800 },
      { step: 4, lux: 65,  delay: 2000 },
      { step: 5, lux: 15,  delay: 2500 },
      { step: 5, lux: 80,  delay: 2000 }, // In deadband, stays ON!
      { step: 5, lux: 400, delay: 2000 }, // Over 500, turns OFF!
      { step: 1, lux: 900, delay: 1800 }
    ];

    let seqIdx = 0;
    function runNextDemoStep() {
      if (!state.isFlowPlaying) return;

      const item = demoSequence[seqIdx];
      state.targetLux = item.lux;
      setProcessStep(item.step);

      seqIdx = (seqIdx + 1) % demoSequence.length;
      state.flowInterval = setTimeout(runNextDemoStep, item.delay);
    }

    runNextDemoStep();
  }

  // --- INTERACTIVE THRESHOLD TUNER ---
  function updateTuner() {
    state.tDark = parseInt(sliderTDark.value);
    state.tLight = parseInt(sliderTLight.value);

    // Prevent cross-over
    if (state.tDark >= state.tLight) {
      state.tDark = state.tLight - 20;
      sliderTDark.value = state.tDark;
    }

    const darkVolt = ((state.tDark * state.vcc) / 1023).toFixed(2);
    const lightVolt = ((state.tLight * state.vcc) / 1023).toFixed(2);

    labelTDark.textContent = `${state.tDark} (${darkVolt} V)`;
    labelTLight.textContent = `${state.tLight} (${lightVolt} V)`;

    codeTDark.textContent = state.tDark;
    codeTLight.textContent = state.tLight;

    const deadband = state.tLight - state.tDark;
    const deadbandVolt = ((deadband * state.vcc) / 1023).toFixed(2);
    deadbandWidthText.textContent = `${deadband} ADC Counts (${deadbandVolt} V)`;

    updateSimulation();
  }

  // --- VOLTAGE DIVIDER CALCULATOR ---
  const calcVcc = document.getElementById('calc-vcc');
  const calcRfixed = document.getElementById('calc-rfixed');
  const calcRldr = document.getElementById('calc-rldr');
  const calcResultV = document.getElementById('calc-result-v');
  const calcResultAdc = document.getElementById('calc-result-adc');

  function updateCalculator() {
    const vcc = parseFloat(calcVcc.value) || 5.0;
    const rFixed = parseFloat(calcRfixed.value) || 10000;
    const rLdr = parseFloat(calcRldr.value) || 15000;

    const vNode = (vcc * rFixed) / (rLdr + rFixed);
    const adc = Math.max(0, Math.min(1023, Math.round((vNode / vcc) * 1023)));

    calcResultV.textContent = `${vNode.toFixed(2)} V`;
    calcResultAdc.textContent = `ADC: ${adc} Counts`;
  }

  [calcVcc, calcRfixed, calcRldr].forEach(el => {
    el.addEventListener('input', updateCalculator);
  });

  // --- VIVA-VOCE QUIZ FLASHCARDS DATA (ALL 20 EXHAUSTIVE QUESTIONS) ---
  const vivaQuestions = [
    {
      id: 1,
      category: 'physics',
      tag: 'Physics',
      q: 'Explain the internal physical mechanism of photoconductivity in a Cadmium Sulfide (CdS) LDR.',
      a: 'CdS is an intrinsic II-VI semiconductor with a bandgap energy Eg ≈ 2.42 eV. When incident photons have energy hν ≥ Eg (wavelength ≤ 512 nm), valence electrons absorb photon energy and jump across the forbidden gap into the conduction band, generating electron-hole pairs. Because electron mobility is high (μ_e ≈ 250 cm²/V·s), carrier concentration surges and bulk resistance drops exponentially from >1 MΩ in darkness to <1 kΩ in daylight.'
    },
    {
      id: 2,
      category: 'physics',
      tag: 'Physics',
      q: 'Why does a photoresistor exhibit a noticeable time lag when light changes suddenly?',
      a: 'CdS photoresistors have trap states and recombination centers in their crystal lattice. When illumination ceases, trapped charge carriers require thermal energy to be liberated before recombining. Consequently, the rise time is fast (~10–30 ms), but the decay time in dark transition is sluggish (200–500 ms). Our firmware incorporates a 10-sample moving-average window to prevent transient switching triggers during this decay curve.'
    },
    {
      id: 3,
      category: 'physics',
      tag: 'Physics',
      q: 'What is the cutoff wavelength (λ_cutoff) of a standard CdS LDR?',
      a: 'The cutoff wavelength is calculated from λ_cutoff = hc / Eg. For Cadmium Sulfide with Eg = 2.42 eV, λ_cutoff = (6.626 × 10^-34 × 3 × 10^8) / (2.42 × 1.602 × 10^-19) ≈ 512 nm, which aligns closely with the peak sensitivity of the human eye (green-yellow visible light spectrum).'
    },
    {
      id: 4,
      category: 'physics',
      tag: 'Physics',
      q: 'How does ambient temperature affect LDR resistance readings?',
      a: 'CdS material exhibits a negative temperature coefficient of resistance (NTC) where elevated temperatures thermally excite intrinsic carriers, causing resistance to drop independently of light. Our dual-threshold hysteresis provides a generous 100-count deadband (0.49V margin) that easily absorbs thermal drift without causing premature activation.'
    },
    {
      id: 5,
      category: 'circuit',
      tag: 'Hardware',
      q: 'Why is a 10 kΩ resistor chosen for the potential divider pull-down rather than 100 Ω or 1 MΩ?',
      a: 'To maximize dynamic voltage sensitivity dV_out/dR_LDR, the fixed resistor must approximate the LDR resistance at the desired switching threshold (R_fixed ≈ R_threshold). In indoor twilight and street lighting entry (20–50 lux), the LDR measures 8 kΩ to 15 kΩ. A 10 kΩ resistor centers the divider midpoint at ~2.5V, maximizing the ADC count difference per lux.'
    },
    {
      id: 6,
      category: 'circuit',
      tag: 'Hardware',
      q: 'Calculate the value of the current-limiting resistor for the 5mm luminaire LED.',
      a: 'Using Ohm\'s Law: R = (V_supply - V_f) / I_f. For an Arduino 5V digital pin, standard red LED forward voltage V_f ≈ 2.0V, and target forward current I_f = 14 mA: R = (5.0V - 2.0V) / 0.014A = 214.3 Ω. Standard E12 commercial value 220 Ω provides safe, reliable current limiting well below the 40 mA pin damage limit.'
    },
    {
      id: 7,
      category: 'circuit',
      tag: 'Hardware',
      q: 'What are the absolute maximum current limits for the ATmega328P I/O pins and VCC/GND pins?',
      a: 'The absolute maximum DC current per individual I/O pin is 40.0 mA (recommended continuous design limit is 20 mA). The absolute maximum total current through the MCU VCC and GND power supply pins is 200 mA.'
    },
    {
      id: 8,
      category: 'circuit',
      tag: 'Hardware',
      q: 'What would happen if the LDR and 10k resistor positions were swapped in the potential divider?',
      a: 'With LDR tied to GND and 10k tied to 5V (pull-up configuration), the transfer curve would invert: V_node would rise as darkness increases (high ADC = dark). The firmware comparator logic would then simply check for ADC ≥ THRESHOLD_DARK instead of ADC ≤ THRESHOLD_DARK.'
    },
    {
      id: 9,
      category: 'circuit',
      tag: 'Hardware',
      q: 'What is the role of decoupling / bypass capacitors across the power rails?',
      a: 'Electrolytic (47 μF) and ceramic (100 nF) bypass capacitors placed across breadboard VCC and GND act as local charge reservoirs and shunt high-frequency switching transients to ground, preventing inductive voltage dips when actuators switch ON.'
    },
    {
      id: 10,
      category: 'circuit',
      tag: 'Hardware',
      q: 'How does solderless breadboard contact resistance affect measurement accuracy?',
      a: 'MB-102 breadboard nickel-plated phosphor bronze spring contacts introduce 0.1–0.3 Ω series resistance and 2–5 pF stray capacitance between adjacent rows. In high-impedance voltage divider nodes (10 kΩ), contact resistance has negligible (<0.003%) impact on ADC conversion accuracy.'
    },
    {
      id: 11,
      category: 'firmware',
      tag: 'Firmware',
      q: 'Why is a single threshold comparator (if analogRead(A0) < 450) unacceptable in production?',
      a: 'When ambient lighting hovers near 450 lux during gradual sunset, high-frequency optical noise, mains ripple, or tree shadows cause the ADC to oscillate across 450. In a single-threshold system, the relay or LED will chatter violently at 10–50 Hz, causing rapid component burnout, audible clicking, and power line noise.'
    },
    {
      id: 12,
      category: 'firmware',
      tag: 'Firmware',
      q: 'Explain how software Schmitt-trigger hysteresis eliminates contact chattering.',
      a: 'By defining two distinct trip points (T_DARK = 400 and T_LIGHT = 500), an intentional deadband of 100 ADC counts (0.49V) is created. Once darkness trips the system ON at ADC ≤ 400, the light remains firmly latched ON even if ADC fluctuates up to 499. It will only turn OFF when ambient light climbs all the way above 500.'
    },
    {
      id: 13,
      category: 'firmware',
      tag: 'Firmware',
      q: 'What is the quantization step (LSB voltage) of the ATmega328P 10-bit ADC?',
      a: 'Resolution = V_ref / 2^N = 5.0V / 1024 = 4.8828 mV per count. An ADC value of 400 corresponds to 400 × 4.8828 mV = 1.953V. An ADC value of 500 corresponds to 500 × 4.8828 mV = 2.441V.'
    },
    {
      id: 14,
      category: 'firmware',
      tag: 'Firmware',
      q: 'Why use non-blocking millis() timing instead of delay(500) for serial telemetry logging?',
      a: 'Using delay(500) halts CPU execution completely for half a second, preventing the microcontroller from processing incoming analog samples or responding to real-time events. By using millis() timestamp polling, the moving-average filter samples smoothly at 50 Hz while telemetry logs independently every 500 ms.'
    },
    {
      id: 15,
      category: 'firmware',
      tag: 'Firmware',
      q: 'What is the computational complexity of the circular buffer moving-average filter?',
      a: 'It operates in O(1) constant time per loop. Rather than iterating across all 10 elements on every sample, it subtracts the outgoing element buffer[idx] from runningSum, stores the new reading, adds it to runningSum, and advances idx = (idx + 1) % 10.'
    },
    {
      id: 16,
      category: 'power',
      tag: 'AC Mains',
      q: 'How would you interface a 230V AC / 100W incandescent lamp to the Arduino output pin?',
      a: 'The 5V digital pin cannot handle 230V AC. It must trigger a 5V SPDT electromechanical relay module or solid-state relay (SSR). An NPN transistor (2N2222) provides coil current (~70 mA), while an optocoupler (PC817 or MOC3021) provides 5000V RMS galvanic isolation between high-voltage mains and low-voltage logic.'
    },
    {
      id: 17,
      category: 'power',
      tag: 'AC Mains',
      q: 'Why is a flyback diode (1N4007) connected across the relay coil?',
      a: 'Relay coils are inductors. When the driving transistor switches off, collapsing magnetic flux induces a massive reverse back-EMF spike: V = -L · (di/dt), often exceeding 200V. A reverse-biased 1N4007 diode clamps this spike safely across the coil, protecting the transistor and microcontroller from dielectric breakdown.'
    },
    {
      id: 18,
      category: 'power',
      tag: 'AC Mains',
      q: 'What is the difference between an electromechanical relay and a TRIAC for AC switching?',
      a: 'An electromechanical relay provides physical galvanic air-gap contacts and zero off-state leakage, but has slow switching (10 ms), mechanical wear (100k cycles), and acoustic clicking. A TRIAC (with opto-TRIAC MOC3041) is purely solid-state with zero acoustic noise, infinite switching life, and zero-crossing turn-on to eliminate electrical EMI transients.'
    },
    {
      id: 19,
      category: 'power',
      tag: 'IoT Systems',
      q: 'How can this stand-alone system be upgraded into a connected Smart City IoT street light?',
      a: 'By migrating to an ESP32 or adding an ESP8266 Wi-Fi / LoRaWAN transceiver. The node publishes sensor telemetry (lux, lamp state, burn hours) via lightweight MQTT over TLS to an IoT cloud broker (AWS IoT Core, ThingsBoard). Municipal operators can remotely configure thresholds, detect burnt-out lamps, and schedule dynamic dimming.'
    },
    {
      id: 20,
      category: 'power',
      tag: 'IoT Systems',
      q: 'How would you minimize power consumption in a remote battery-powered night light?',
      a: '1) Put the microcontroller into deep sleep mode (Power-Down SLEEP_MODE_PWR_DOWN) drawing < 10 μA; 2) Power the LDR voltage divider only for 500 μs during sampling using an auxiliary digital pin rather than constant 5V; 3) Use an internal watchdog timer interrupt to wake the MCU once every 5 seconds to take a measurement.'
    }
  ];

  // Render Viva Voce Flashcards (Answers shown by default for study)
  const vivaGrid = document.getElementById('viva-grid');
  function renderVivaCards(filter = 'all') {
    vivaGrid.innerHTML = '';
    const filtered = filter === 'all' ? vivaQuestions : vivaQuestions.filter(q => q.category === filter);
    
    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'viva-card';
      card.innerHTML = `
        <div>
          <div class="viva-header">
            <span class="viva-q-num">Q${item.id}</span>
            <span class="viva-tag">${item.tag}</span>
          </div>
          <div class="viva-question" style="margin-top: 0.6rem;">${item.q}</div>
        </div>
        <div class="viva-answer">${item.a}</div>
      `;

      vivaGrid.appendChild(card);
    });
  }

  // Viva Filter Buttons
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderVivaCards(btn.dataset.filter);
    });
  });

  // --- AUTO-ANIMATION DYNAMIC TELEMETRY CONTROLS ---
  const autoDemoToggle = document.getElementById('auto-demo-toggle');
  const autoDemoExpanded = document.getElementById('auto-demo-expanded-controls');
  const autoDemoLabel = document.getElementById('auto-demo-label');
  const speedButtons = document.querySelectorAll('.btn-speed');

  function startAutoAnimation() {
    state.isAutoAnimating = true;
    if (autoDemoToggle) autoDemoToggle.checked = true;
    if (autoDemoExpanded) autoDemoExpanded.style.display = 'flex';
    if (autoDemoLabel) {
      autoDemoLabel.textContent = 'ACTIVE';
      autoDemoLabel.classList.add('active');
    }
    presetButtons.forEach(b => b.classList.remove('active'));
  }

  function stopAutoAnimation() {
    state.isAutoAnimating = false;
    if (autoDemoToggle) autoDemoToggle.checked = false;
    if (autoDemoExpanded) autoDemoExpanded.style.display = 'none';
    if (autoDemoLabel) {
      autoDemoLabel.textContent = 'OFF';
      autoDemoLabel.classList.remove('active');
    }
  }

  if (autoDemoToggle) {
    autoDemoToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        startAutoAnimation();
        showToast('Dynamic Auto-Cycle Started ⚡');
      } else {
        stopAutoAnimation();
        showToast('Auto-Cycle Paused');
      }
    });
  }

  speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      speedButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.autoAnimSpeed = parseFloat(btn.dataset.speed) || 1.0;
    });
  });

  // --- EVENT LISTENERS ---
  // Lux Slider (Smooth Target Lux)
  luxSlider.addEventListener('input', (e) => {
    state.targetLux = parseInt(e.target.value);
    presetButtons.forEach(b => b.classList.remove('active'));
    stopAutoAnimation();
  });

  // Preset Buttons (Smooth Interpolation)
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.targetLux = parseInt(btn.dataset.lux);
      stopAutoAnimation();
    });
  });

  // --- THEME SYNCHRONIZATION FOR CIRCUIT SVG & SYSTEM ---
  function syncCircuitTheme(theme) {
    const svgObject = document.getElementById('circuit-svg-object');
    if (!svgObject) return;

    const applyTheme = () => {
      try {
        const svgDoc = svgObject.contentDocument;
        if (!svgDoc) return;
        const root = svgDoc.documentElement;
        if (!root) return;

        root.setAttribute('data-theme', theme);
        if (theme === 'light') {
          root.classList.add('light-theme');
          root.classList.remove('dark-theme');
          const bg = svgDoc.getElementById('circuit-bg-rect');
          if (bg) bg.setAttribute('fill', '#f8fafc');
          const title = svgDoc.getElementById('circuit-main-title');
          if (title) title.setAttribute('fill', '#0f172a');
          const sub = svgDoc.getElementById('circuit-main-sub');
          if (sub) sub.setAttribute('fill', '#475569');
          svgDoc.querySelectorAll('.circuit-card-bg').forEach(el => {
            el.setAttribute('fill', '#ffffff');
            el.setAttribute('stroke', '#cbd5e1');
          });
          svgDoc.querySelectorAll('.circuit-card-text').forEach(el => el.setAttribute('fill', '#334155'));
          svgDoc.querySelectorAll('.circuit-card-sub').forEach(el => el.setAttribute('fill', '#64748b'));
          const leg = svgDoc.getElementById('circuit-legend-rect');
          if (leg) {
            leg.setAttribute('fill', '#ffffff');
            leg.setAttribute('stroke', '#cbd5e1');
          }
          svgDoc.querySelectorAll('.circuit-legend-text').forEach(el => el.setAttribute('fill', '#0f172a'));
          svgDoc.querySelectorAll('.circuit-hole').forEach(el => el.setAttribute('fill', '#e2e8f0'));
        } else {
          root.classList.add('dark-theme');
          root.classList.remove('light-theme');
          const bg = svgDoc.getElementById('circuit-bg-rect');
          if (bg) bg.setAttribute('fill', '#0b1120');
          const title = svgDoc.getElementById('circuit-main-title');
          if (title) title.setAttribute('fill', '#f8fafc');
          const sub = svgDoc.getElementById('circuit-main-sub');
          if (sub) sub.setAttribute('fill', '#94a3b8');
          svgDoc.querySelectorAll('.circuit-card-bg').forEach(el => {
            el.setAttribute('fill', '#1e293b');
            el.setAttribute('stroke', '#334155');
          });
          svgDoc.querySelectorAll('.circuit-card-text').forEach(el => el.setAttribute('fill', '#cbd5e1'));
          svgDoc.querySelectorAll('.circuit-card-sub').forEach(el => el.setAttribute('fill', '#94a3b8'));
          const leg = svgDoc.getElementById('circuit-legend-rect');
          if (leg) {
            leg.setAttribute('fill', '#1e293b');
            leg.setAttribute('stroke', '#334155');
          }
          svgDoc.querySelectorAll('.circuit-legend-text').forEach(el => el.setAttribute('fill', '#e2e8f0'));
          svgDoc.querySelectorAll('.circuit-hole').forEach(el => el.setAttribute('fill', '#0b1120'));
        }
      } catch (e) {
        // Fallback for cross-origin or delayed load
      }
    };

    applyTheme();
    svgObject.onload = applyTheme;
  }

  // --- THEME SWITCHER (DARK & WHITE/LIGHT THEME) ---
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  function initTheme() {
    const savedTheme = localStorage.getItem('nightlight_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
    syncCircuitTheme(savedTheme);
    setProcessStep(state.currentStep);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('nightlight_theme', nextTheme);
      syncCircuitTheme(nextTheme);
      setProcessStep(state.currentStep);
      showToast(`Switched to ${nextTheme === 'light' ? 'Light Theme ☀️' : 'Dark Theme 🌙'}`);
    });
  }
  initTheme();

  // Terminal Controls
  btnClearTerm.addEventListener('click', () => {
    terminalViewport.innerHTML = '';
  });

  btnPauseTerm.addEventListener('click', () => {
    state.terminalPaused = !state.terminalPaused;
    btnPauseTerm.textContent = state.terminalPaused ? 'Resume' : 'Pause';
    btnPauseTerm.style.color = state.terminalPaused ? '#f87171' : '#cbd5e1';
  });

  btnAutoscrollTerm.addEventListener('click', () => {
    state.terminalAutoScroll = !state.terminalAutoScroll;
    btnAutoscrollTerm.textContent = `Auto-Scroll: ${state.terminalAutoScroll ? 'ON' : 'OFF'}`;
    btnAutoscrollTerm.style.color = state.terminalAutoScroll ? 'var(--accent-cyan)' : '#94a3b8';
  });

  // Flow Controls
  document.getElementById('btn-play-flow').addEventListener('click', toggleFlowAnimation);
  document.getElementById('btn-prev-step').addEventListener('click', () => {
    const prev = state.currentStep > 1 ? state.currentStep - 1 : 5;
    setProcessStep(prev);
  });
  document.getElementById('btn-next-step').addEventListener('click', () => {
    const next = state.currentStep < 5 ? state.currentStep + 1 : 1;
    setProcessStep(next);
  });
  document.querySelectorAll('.flow-step-node').forEach(node => {
    node.addEventListener('click', () => {
      setProcessStep(parseInt(node.dataset.step));
    });
  });

  // Tuner Sliders
  sliderTDark.addEventListener('input', updateTuner);
  sliderTLight.addEventListener('input', updateTuner);
  btnResetTuner.addEventListener('click', () => {
    sliderTDark.value = 400;
    sliderTLight.value = 500;
    updateTuner();
  });

  // Copy Firmware Button
  btnCopyFirmware.addEventListener('click', () => {
    const rawCode = document.getElementById('code-display').innerText;
    navigator.clipboard.writeText(rawCode).then(() => {
      showToast('Arduino C++ Firmware copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy to clipboard.');
    });
  });

  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // --- IMAGE LIGHTBOX MODAL ---
  const lightboxModal = document.getElementById('image-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  window.openLightboxFromCard = function(card) {
    if (lightboxModal && lightboxImg && card) {
      const src = card.dataset.img;
      lightboxImg.src = src;
      if (lightboxTitle) lightboxTitle.textContent = card.dataset.title || 'Laboratory Hardware Setup';
      if (lightboxDesc) lightboxDesc.textContent = card.dataset.desc || '';
      lightboxModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeLightboxModal = function() {
    if (lightboxModal) {
      lightboxModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  document.querySelectorAll('.hardware-photo-card').forEach(card => {
    card.addEventListener('click', () => window.openLightboxFromCard(card));
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', window.closeLightboxModal);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', window.closeLightboxModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeLightboxModal();
  });

  // --- INITIALIZATION ---
  renderVivaCards('all');
  setProcessStep(1);
  updateTuner();
  updateCalculator();
  updateSimulation();
  resizeCanvas();

  // Show initial page (check URL hash or default to simulator)
  const initialPage = window.location.hash ? window.location.hash.substring(1) : 'simulator';
  switchPage(initialPage);

  // Scope & Telemetry Animation Loop (50 Hz)
  setInterval(() => {
    updateSimulation();
    // Only draw scope & terminal when simulator page is visible
    if (state.activePage === 'simulator') {
      drawOscilloscope();
      streamSerialTelemetry();
    }
  }, 20);

});
