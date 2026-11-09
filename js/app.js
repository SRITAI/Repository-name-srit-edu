/**
 * MINDLY° — Application Interaction Engine
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

})();
