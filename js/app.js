/**
 * infimindss° — Application Interaction Engine
 * 
 * Handles:
 * - Dynamic SVG spline wire calculation connecting cards to the central halo
 * - Interactive 3D mouse tilt / parallax on the cards and centerpiece
 * - Interactive navigation pills
 * - Video modal controls
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initSplineConnector();
    initParallax();
    initNavPills();
    initVideoModal();
    initOrbitCarousel();
  });

  /* ==========================================================================
     1. DYNAMIC SVG SPLINE WIRE CONNECTIONS
     ========================================================================== */
  function initSplineConnector() {
    const svg = document.querySelector('.connecting-splines');
    const leftCard = document.querySelector('.left-card');
    const rightCard = document.querySelector('.right-card');
    const centerPiece = document.getElementById('hero-centerpiece');
    const pathLeft = document.getElementById('spline-left');
    const pathRight = document.getElementById('spline-right');

    if (!svg || !leftCard || !rightCard || !centerPiece || !pathLeft || !pathRight) return;

    function updateSplines() {
      // If mobile view, splines are hidden
      if (window.innerWidth <= 860) return;

      const stageRect = document.querySelector('.hero-stage').getBoundingClientRect();
      const leftRect = leftCard.getBoundingClientRect();
      const rightRect = rightCard.getBoundingClientRect();
      const centerRect = centerPiece.getBoundingClientRect();

      // Anchor 1: Bottom center of left card
      const startLeftX = (leftRect.left + leftRect.width / 2) - stageRect.left;
      const startLeftY = (leftRect.bottom - 4) - stageRect.top;

      // Anchor 2: Left anchor of right card
      const startRightX = leftRect ? (rightRect.left + 8) - stageRect.left : 900;
      const startRightY = (rightRect.top + rightRect.height * 0.45) - stageRect.top;

      // Target: Halo around head
      const targetLeftX = (centerRect.left + centerRect.width * 0.28) - stageRect.left;
      const targetLeftY = (centerRect.top + centerRect.height * 0.28) - stageRect.top;

      const targetRightX = (centerRect.left + centerRect.width * 0.72) - stageRect.left;
      const targetRightY = (centerRect.top + centerRect.height * 0.32) - stageRect.top;

      // Construct smooth cubic bezier curves
      const cp1LeftX = startLeftX;
      const cp1LeftY = startLeftY + (targetLeftY - startLeftY) * 0.65;
      const cp2LeftX = targetLeftX - 60;
      const cp2LeftY = targetLeftY;

      const cp1RightX = startRightX - (startRightX - targetRightX) * 0.4;
      const cp1RightY = startRightY + 40;
      const cp2RightX = targetRightX + 40;
      const cp2RightY = targetRightY;

      pathLeft.setAttribute('d', `M ${startLeftX.toFixed(1)} ${startLeftY.toFixed(1)} C ${cp1LeftX.toFixed(1)} ${cp1LeftY.toFixed(1)}, ${cp2LeftX.toFixed(1)} ${cp2LeftY.toFixed(1)}, ${targetLeftX.toFixed(1)} ${targetLeftY.toFixed(1)}`);
      pathRight.setAttribute('d', `M ${startRightX.toFixed(1)} ${startRightY.toFixed(1)} C ${cp1RightX.toFixed(1)} ${cp1RightY.toFixed(1)}, ${cp2RightX.toFixed(1)} ${cp2RightY.toFixed(1)}, ${targetRightX.toFixed(1)} ${targetRightY.toFixed(1)}`);
    }

    updateSplines();
    window.addEventListener('resize', updateSplines, { passive: true });
    // Also update when images finish loading
    window.addEventListener('load', updateSplines);
  }

  /* ==========================================================================
     2. SUBTLE 3D PARALLAX & TILT ON MOUSEMOVE
     ========================================================================== */
  function initParallax() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const stage = document.querySelector('.hero-stage');
    const leftCard = document.querySelector('.left-card');
    const rightCard = document.querySelector('.right-card');
    const centerpiece = document.getElementById('hero-centerpiece');

    if (!stage || !leftCard || !rightCard || !centerpiece) return;

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      leftCard.style.transform = `translate3d(${x * -16}px, ${y * -14}px, 0)`;
      rightCard.style.transform = `translate3d(${x * 18}px, ${y * -12}px, 0)`;
      centerpiece.style.transform = `translate3d(${x * 10}px, ${y * 8}px, 0)`;
    });

    stage.addEventListener('mouseleave', () => {
      leftCard.style.transform = '';
      rightCard.style.transform = '';
      centerpiece.style.transform = '';
    });
  }

  /* ==========================================================================
     3. INTERACTIVE NAVIGATION PILLS
     ========================================================================== */
  function initNavPills() {
    const navItems = document.querySelectorAll('.nav-pill .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  /* ==========================================================================
     4. VIDEO MODAL CONTROLS
     ========================================================================== */
  function initVideoModal() {
    const btn = document.getElementById('btn-watch-video');
    const modal = document.getElementById('video-modal');
    const closeBtn = document.getElementById('modal-close');

    if (!btn || !modal) return;

    btn.addEventListener('click', () => {
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', 'true');
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (typeof modal.close === 'function') {
          modal.close();
        } else {
          modal.removeAttribute('open');
        }
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.close();
      }
    });
  }

  /* ==========================================================================
     5. DYNAMIC 3D ORBIT CAROUSEL
     ========================================================================== */
  function initOrbitCarousel() {
    const container = document.getElementById('orbiting-halo');
    if (!container) return;

    const chips = Array.from(container.querySelectorAll('.halo-chip'));
    if (!chips.length) return;

    const toast = document.getElementById('orbit-toast');
    const toastMsg = document.getElementById('toast-msg');
    let toastTimeout = null;

    function showToast(text) {
      if (!toast || !toastMsg) return;
      toastMsg.textContent = text;
      toast.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 2600);
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const title = chip.getAttribute('data-title');
        if (title) showToast(title);
      });
    });

    let rotation = 0;
    let velocity = 0;
    let isHovered = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartRotation = 0;
    let lastDragX = 0;
    let lastDragTime = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateTransforms() {
      const width = container.offsetWidth || 500;
      const height = container.offsetHeight || 500;
      const isMobile = window.innerWidth <= 640;

      const rx = isMobile ? Math.min(160, width * 0.42) : Math.min(240, width * 0.45);
      const ry = rx * 0.32;
      const cx = width / 2;
      const cy = height * 0.38;
      const tiltAngle = -0.11;

      const total = chips.length;

      for (let i = 0; i < total; i++) {
        const el = chips[i];
        const baseAngle = (i * 2 * Math.PI) / total;
        const angle = baseAngle + rotation;

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        const x = cosA * rx;
        const y = sinA * ry + x * Math.sin(tiltAngle);
        const z = sinA;

        const rotY = -cosA * 32;
        const rotZ = rotY * 0.12;

        if (z >= -0.15) {
          const scale = isMobile ? 0.88 + z * 0.14 : 0.96 + z * 0.16;
          const zIndex = Math.round(20 + z * 15);
          el.style.transform = `translate3d(${cx + x}px, ${cy + y}px, 0px) translate(-50%, -50%) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
          el.style.zIndex = String(zIndex);
          el.style.opacity = '1';
          el.style.filter = 'none';
        } else {
          const scale = isMobile ? 0.72 + (z + 1) * 0.16 : 0.82 + (z + 1) * 0.14;
          const opacity = 0.52 + (z + 1) * 0.38;
          const zIndex = Math.round(4 + (z + 1) * 4);
          el.style.transform = `translate3d(${cx + x}px, ${cy + y}px, 0px) translate(-50%, -50%) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
          el.style.zIndex = String(zIndex);
          el.style.opacity = opacity.toFixed(3);
          el.style.filter = 'blur(0.8px)';
        }
      }
    }

    function animate() {
      if (!isDragging && !prefersReducedMotion) {
        const baseSpeed = isHovered ? 0.0008 : 0.0032;
        rotation += baseSpeed + velocity;
        velocity *= 0.94;
      }
      updateTransforms();
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    container.addEventListener('pointerdown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartRotation = rotation;
      lastDragX = e.clientX;
      lastDragTime = performance.now();
      velocity = 0;
      try { container.setPointerCapture(e.pointerId); } catch {}
    });

    container.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      rotation = dragStartRotation + deltaX * 0.006;
      const now = performance.now();
      const dt = Math.max(1, now - lastDragTime);
      const dx = e.clientX - lastDragX;
      velocity = (dx / dt) * 0.04;
      lastDragX = e.clientX;
      lastDragTime = now;
    });

    function endDrag(e) {
      isDragging = false;
      try { container.releasePointerCapture(e.pointerId); } catch {}
    }

    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);
    container.addEventListener('pointerenter', () => { isHovered = true; });
    container.addEventListener('pointerleave', () => { isHovered = false; isDragging = false; });
  }

})();
