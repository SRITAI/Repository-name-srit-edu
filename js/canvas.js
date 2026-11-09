/**
 * THE HUMAN LEDGER - Canvas Visual Engine
 * 
 * Contains:
 * 1. EcgHeartbeatVisualizer: Electrocardiogram wave with cursor reactivity & phosphor glow.
 * 2. ScaleDotMatrixVisualizer: 8,200-dot canvas where 1 dot = 1 million living human beings.
 */

// Respect user preference for reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   1. ECG HEARTBEAT VISUALIZER
   ========================================================================== */
class EcgVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Heartbeat state
    this.bpm = 70; // baseline beats per minute
    this.targetBpm = 70;
    this.sweepX = 0;
    this.sweepSpeed = 2.2; // px per frame
    this.waveHistory = [];
    this.lastTime = performance.now();
    this.phase = 0; // 0 to 1 representing one heartbeat cycle

    // Cursor interaction
    this.cursor = { x: -1000, y: -1000, active: false, intensity: 0 };
    this.isHovered = false;

    // Visual styles
    this.primaryColor = '#00ff88'; // Acid phosphor green
    this.glowColor = 'rgba(0, 255, 136, 0.4)';
    this.gridColor = 'rgba(0, 255, 136, 0.05)';

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Cursor tracking on canvas container
    const container = this.canvas.parentElement;
    container.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.cursor.x = (e.clientX - rect.left);
      this.cursor.y = (e.clientY - rect.top);
      this.cursor.active = true;
      this.cursor.intensity = 1.0;
      this.targetBpm = 95; // Sympathetic response: cursor increases heart rate
    });

    container.addEventListener('mouseleave', () => {
      this.cursor.active = false;
      this.targetBpm = 70; // Relax back to resting heart rate
    });

    // Tap on mobile
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.cursor.x = (e.touches[0].clientX - rect.left);
        this.cursor.y = (e.touches[0].clientY - rect.top);
        this.cursor.active = true;
        this.targetBpm = 105;
      }
    }, { passive: true });

    container.addEventListener('touchend', () => {
      this.cursor.active = false;
      this.targetBpm = 70;
    });

    // Start loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.width = parent.clientWidth;
    this.height = Math.max(parent.clientHeight, 180);

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    // Re-initialize buffer
    this.waveHistory = new Float32Array(Math.ceil(this.width));
    for (let i = 0; i < this.waveHistory.length; i++) {
      this.waveHistory[i] = this.height * 0.5;
    }
  }

  // Pure mathematical clinical ECG formula: P wave, Q dip, R spike, S dip, T wave
  getEcgVoltage(phase, cursorNoise) {
    let v = 0;
    // Normalized phase 0..1
    const p = phase % 1.0;

    // Baseline resting voltage (isoelectric line)
    // P wave (at phase 0.15 - 0.23): gentle atrial depolarization
    if (p >= 0.14 && p <= 0.22) {
      const pPhase = (p - 0.14) / 0.08;
      v += Math.sin(pPhase * Math.PI) * 0.18;
    }
    // PR segment: flat line between P and Q

    // Q wave (at phase 0.33 - 0.35): small septal dip
    else if (p >= 0.33 && p <= 0.35) {
      const qPhase = (p - 0.33) / 0.02;
      v -= Math.sin(qPhase * Math.PI) * 0.15;
    }
    // R peak (at phase 0.35 - 0.39): sharp ventricular spike!
    else if (p > 0.35 && p <= 0.39) {
      const rPhase = (p - 0.35) / 0.04;
      v += Math.sin(rPhase * Math.PI) * 1.35; // Tall peak
    }
    // S wave (at phase 0.39 - 0.43): deep downward spike below baseline
    else if (p > 0.39 && p <= 0.43) {
      const sPhase = (p - 0.39) / 0.04;
      v -= Math.sin(sPhase * Math.PI) * 0.45;
    }
    // ST segment: brief baseline isoelectric interval

    // T wave (at phase 0.54 - 0.68): rounded ventricular repolarization
    else if (p >= 0.54 && p <= 0.68) {
      const tPhase = (p - 0.54) / 0.14;
      v += Math.sin(tPhase * Math.PI) * 0.35;
    }

    // Add mild biological baseline wander & cursor tremor
    v += cursorNoise;

    return v;
  }

  animate(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Smooth BPM adjustment toward target
    this.bpm += (this.targetBpm - this.bpm) * 0.05;

    // If reduced motion is active, do minimal update
    if (prefersReducedMotion) {
      this.drawReducedMotion();
      requestAnimationFrame(this.animate);
      return;
    }

    // Calculate advance in phase based on current BPM
    const beatsPerSecond = this.bpm / 60;
    const phaseAdvance = beatsPerSecond * dt;
    this.phase = (this.phase + phaseAdvance) % 1.0;

    // Calculate cursor influence
    let cursorNoise = 0;
    if (this.cursor.active) {
      // Distance from sweep head to cursor
      const dx = this.cursor.x - this.sweepX;
      const dist = Math.abs(dx);
      if (dist < 120) {
        const proximity = (1 - dist / 120);
        // Tremor & subtle amplitude excitement
        cursorNoise = (Math.sin(now * 0.04) * 0.08 + (Math.random() - 0.5) * 0.04) * proximity;
      }
    }

    // Step the sweep head forward
    const speed = this.sweepSpeed * (this.bpm / 70);
    const steps = Math.ceil(speed);
    const midY = this.height * 0.52;
    const amplitude = this.height * 0.35;

    for (let s = 0; s < steps; s++) {
      const currentVoltage = this.getEcgVoltage(this.phase, cursorNoise);
      const y = midY - (currentVoltage * amplitude);

      const targetX = Math.floor(this.sweepX);
      if (targetX < this.waveHistory.length) {
        this.waveHistory[targetX] = y;
      }

      this.sweepX = (this.sweepX + 1) % this.width;
      // Clear a small blank notch ahead of the sweep beam (clinical CRT effect)
      const clearLead = 28;
      for (let c = 0; c < clearLead; c++) {
        const clearIdx = (targetX + c) % this.waveHistory.length;
        this.waveHistory[clearIdx] = midY;
      }
    }

    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Draw clinical medical grid (subtle background graticule)
    this.drawGrid();

    // Check theme (X-ray mode support)
    const isXray = document.body.classList.contains('xray-mode');
    const strokeColor = isXray ? '#ff0055' : '#00ff88';
    const headColor = isXray ? '#ffffff' : '#ffffff';

    // Draw continuous waveform
    ctx.save();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = strokeColor;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = isXray ? 4 : 8;

    ctx.beginPath();
    let started = false;
    const len = this.waveHistory.length;
    const currentX = Math.floor(this.sweepX);

    for (let x = 0; x < len; x++) {
      // Don't draw in the eraser gap
      const distFromSweep = (x - currentX + len) % len;
      if (distFromSweep > 0 && distFromSweep < 25) {
        started = false;
        continue;
      }

      const y = this.waveHistory[x];
      if (!started) {
        ctx.moveTo(x, y);
        started = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw glowing CRT phosphor head
    const headY = this.waveHistory[currentX] || (this.height * 0.5);
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(currentX, headY, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Subtle sweep cursor vertical line
    ctx.lineWidth = 1;
    ctx.strokeStyle = isXray ? 'rgba(255, 0, 85, 0.25)' : 'rgba(0, 255, 136, 0.25)';
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, this.height);
    ctx.stroke();

    // Cursor interactive targeting reticle on ECG wave
    if (this.cursor.active && this.cursor.x >= 0 && this.cursor.x <= this.width) {
      const cy = Math.max(20, Math.min(this.height - 20, this.cursor.y));
      ctx.save();
      ctx.strokeStyle = isXray ? 'rgba(192, 0, 74, 0.6)' : 'rgba(0, 255, 136, 0.6)';
      ctx.fillStyle = isXray ? 'rgba(192, 0, 74, 0.12)' : 'rgba(0, 255, 136, 0.12)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(this.cursor.x, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.cursor.x - 20, cy);
      ctx.lineTo(this.cursor.x + 20, cy);
      ctx.moveTo(this.cursor.x, cy - 20);
      ctx.lineTo(this.cursor.x, cy + 20);
      ctx.stroke();

      ctx.font = '10px monospace';
      ctx.fillStyle = isXray ? '#c0004a' : '#00ff88';
      ctx.fillText(`CADENCE: ${Math.round(this.bpm)} BPM`, this.cursor.x + 18, cy - 6);
      ctx.restore();
    }

    ctx.restore();
  }

  drawGrid() {
    const ctx = this.ctx;
    const isXray = document.body.classList.contains('xray-mode');
    const majorGrid = isXray ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 255, 136, 0.06)';
    const minorGrid = isXray ? 'rgba(0, 0, 0, 0.03)' : 'rgba(0, 255, 136, 0.02)';

    ctx.save();
    const cellSize = 24;

    // Minor grid
    ctx.strokeStyle = minorGrid;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < this.width; x += cellSize / 2) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = 0; y < this.height; y += cellSize / 2) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();

    // Major grid
    ctx.strokeStyle = majorGrid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < this.width; x += cellSize * 2) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
    }
    for (let y = 0; y < this.height; y += cellSize * 2) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
    }
    ctx.stroke();

    ctx.restore();
  }

  drawReducedMotion() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();

    const isXray = document.body.classList.contains('xray-mode');
    const strokeColor = isXray ? '#ff0055' : '#00ff88';

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();

    const midY = this.height * 0.52;
    const amp = this.height * 0.35;
    const cycleWidth = 140;

    for (let x = 0; x < this.width; x++) {
      const phase = (x % cycleWidth) / cycleWidth;
      const y = midY - (this.getEcgVoltage(phase, 0) * amp);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

/* ==========================================================================
   2. SCALE DOT MATRIX VISUALIZER (1 DOT = 1 MILLION PEOPLE)
   ========================================================================== */
class ScaleDotMatrixVisualizer {
  constructor(canvasId, tooltipId) {
    this.canvas = document.getElementById(canvasId);
    this.tooltip = document.getElementById(tooltipId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.totalDots = 8200; // 8.2 billion world population
    this.cols = 100;
    this.rows = 82; // 100 x 82 = 8,200 dots

    this.activeMilestoneId = 'world';
    this.highlightCount = 8200; // dots to illuminate
    this.displayCount = 8200;
    this.highlightColor = '#00ff88';

    // Interactive mouse state
    this.hoverDotIndex = -1;
    this.mouse = { x: -1, y: -1, inside: false };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Mouse tracking for dot inspection
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.inside = true;
      this.updateHover(e);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.inside = false;
      this.hoverDotIndex = -1;
      if (this.tooltip) {
        this.tooltip.classList.remove('visible');
      }
      this.render();
    });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
        this.mouse.inside = true;
        this.updateHover(e.touches[0]);
      }
    }, { passive: true });

    this.render();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const availableWidth = parent.clientWidth;

    // Dynamically adjust column count on smaller mobile screens for clear dot definition
    if (availableWidth < 480) {
      this.cols = 50;
      this.rows = Math.ceil(this.totalDots / this.cols); // 164 rows
    } else if (availableWidth < 768) {
      this.cols = 80;
      this.rows = Math.ceil(this.totalDots / this.cols); // 103 rows
    } else {
      this.cols = 100;
      this.rows = 82;
    }

    // Dot sizing & spacing
    this.padding = 16;
    const gridInnerWidth = availableWidth - (this.padding * 2);
    this.dotSpacing = gridInnerWidth / this.cols;
    this.dotRadius = Math.max(1, (this.dotSpacing * 0.35));

    this.height = (this.rows * this.dotSpacing) + (this.padding * 2);
    this.width = availableWidth;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
    this.render();
  }

  setMilestone(milestoneId) {
    this.activeMilestoneId = milestoneId;
    const milestone = HUMAN_LEDGER_DATA.scaleData.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    const targetCount = milestone.dots;
    const targetColor = milestone.activeColor || '#00ff88';
    this.highlightColor = targetColor;

    if (prefersReducedMotion) {
      this.highlightCount = targetCount;
      this.render();
      return;
    }

    // Smooth animation tween
    const startCount = this.highlightCount;
    const startTime = performance.now();
    const duration = 650; // ms

    const animateTransition = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      this.highlightCount = Math.round(startCount + (targetCount - startCount) * ease);
      this.render();

      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);
  }

  setCountDirect(count, color) {
    this.highlightCount = Math.max(0, Math.min(this.totalDots, count));
    if (color) this.highlightColor = color;
    this.render();
  }

  updateHover(pointerEvent) {
    // Calculate which dot row and col is hovered
    const x = this.mouse.x - this.padding;
    const y = this.mouse.y - this.padding;

    if (x < 0 || y < 0) {
      this.hoverDotIndex = -1;
      if (this.tooltip) this.tooltip.classList.remove('visible');
      this.render();
      return;
    }

    const col = Math.floor(x / this.dotSpacing);
    const row = Math.floor(y / this.dotSpacing);

    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      const index = (row * this.cols) + col;
      if (index < this.totalDots) {
        this.hoverDotIndex = index;
        this.showTooltip(pointerEvent, index);
        this.render();
        return;
      }
    }

    this.hoverDotIndex = -1;
    if (this.tooltip) this.tooltip.classList.remove('visible');
    this.render();
  }

  showTooltip(e, dotIndex) {
    if (!this.tooltip) return;

    const countMillion = dotIndex + 1;
    const isHighlighted = dotIndex < this.highlightCount;
    const pct = ((countMillion / this.totalDots) * 100).toFixed(1);

    this.tooltip.innerHTML = `
      <div class="scale-tooltip-header">
        <span class="scale-dot-badge">DOT #${(dotIndex + 1).toLocaleString()}</span>
        <span class="scale-status">${isHighlighted ? 'ACTIVE SUBSET' : 'GLOBAL POOL'}</span>
      </div>
      <div class="scale-tooltip-value">= 1,000,000 People</div>
      <div class="scale-tooltip-meta">Cumulative: ${countMillion.toLocaleString()}M / 8,200M (${pct}% of Earth)</div>
    `;

    // Position tooltip smoothly
    const rect = this.canvas.getBoundingClientRect();
    const tooltipX = e.clientX;
    const tooltipY = e.clientY - 12;

    this.tooltip.style.left = `${tooltipX}px`;
    this.tooltip.style.top = `${tooltipY}px`;
    this.tooltip.classList.add('visible');
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const isXray = document.body.classList.contains('xray-mode');
    const inactiveColor = isXray ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.10)';

    const total = this.totalDots;
    const cols = this.cols;
    const spacing = this.dotSpacing;
    const radius = this.dotRadius;
    const pad = this.padding;
    const highlightTarget = this.highlightCount;

    // Draw dots batching paths for 60fps performance
    // Group 1: Inactive dots
    ctx.fillStyle = inactiveColor;
    ctx.beginPath();
    for (let i = highlightTarget; i < total; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = pad + (col * spacing) + (spacing * 0.5);
      const cy = pad + (row * spacing) + (spacing * 0.5);
      ctx.moveTo(cx + radius, cy);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    }
    ctx.fill();

    // Group 2: Highlighted dots
    if (highlightTarget > 0) {
      ctx.fillStyle = this.highlightColor;
      ctx.shadowColor = this.highlightColor;
      ctx.shadowBlur = isXray ? 0 : 3;
      ctx.beginPath();
      const count = Math.min(highlightTarget, total);
      for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = pad + (col * spacing) + (spacing * 0.5);
        const cy = pad + (row * spacing) + (spacing * 0.5);
        ctx.moveTo(cx + radius, cy);
        ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Group 3: Hovered dot magnification
    if (this.hoverDotIndex >= 0 && this.hoverDotIndex < total) {
      const col = this.hoverDotIndex % cols;
      const row = Math.floor(this.hoverDotIndex / cols);
      const cx = pad + (col * spacing) + (spacing * 0.5);
      const cy = pad + (row * spacing) + (spacing * 0.5);

      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = this.highlightColor;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}

// Global initialization helper
window.LedgerVisualizers = {
  EcgVisualizer,
  ScaleDotMatrixVisualizer
};
