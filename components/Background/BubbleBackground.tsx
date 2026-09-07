"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  maxLife: number;
  life: number;
  hue: number;
}

interface BurstRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  hue: number;
}

interface Bubble {
  x: number;
  y: number;
  startX: number;
  baseRadius: number;
  currentRadius: number;
  maxRadius: number;
  speedY: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobbleTime: number;
  burstY: number;
  hue: number;
  alpha: number;
}

export default function BubbleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const isMobile = width < 768;
    const MAX_BUBBLES = isMobile ? 18 : 32;

    const bubbles: Bubble[] = [];
    const particles: Particle[] = [];
    const burstRings: BurstRing[] = [];

    const hues = [190, 205, 220, 260, 280, 320]; // Cyan, Sky, Blue, Violet, Magenta

    function resize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    function createBubble(initialBottom = true): Bubble {
      const startX = Math.random() * width;
      const baseRadius = 3.5 + Math.random() * 5.5; // starts 3.5px - 9px
      const growthFactor = 1.8 + Math.random() * 1.6; // expands to ~2x - 3.4x
      const maxRadius = baseRadius * growthFactor;

      const startY = initialBottom
        ? height + baseRadius + Math.random() * 60
        : Math.random() * height;

      // Random burst height between 10% and 75% of screen height
      const burstY = height * (0.08 + Math.random() * 0.68);

      return {
        x: startX,
        y: startY,
        startX,
        baseRadius,
        currentRadius: baseRadius,
        maxRadius,
        speedY: 0.65 + Math.random() * 1.15,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        wobbleAmp: 12 + Math.random() * 22,
        wobbleTime: Math.random() * Math.PI * 2,
        burstY,
        hue: hues[Math.floor(Math.random() * hues.length)],
        alpha: 0.38 + Math.random() * 0.32,
      };
    }

    function createBurst(x: number, y: number, radius: number, hue: number) {
      // 1. Expanding shockwave ring
      burstRings.push({
        x,
        y,
        radius: radius * 0.8,
        maxRadius: radius * 2.2,
        alpha: 0.85,
        hue,
      });

      // 2. Micro water droplet splash particles
      const particleCount = 5 + Math.floor(Math.random() * 5); // 5 to 9 particles
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const speed = 1.4 + Math.random() * 3.0;
        const maxLife = 16 + Math.floor(Math.random() * 14);

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.35, // slight upward momentum
          radius: 1.0 + Math.random() * 1.6,
          alpha: 0.9,
          maxLife,
          life: 0,
          hue,
        });
      }
    }

    // Populate initial batch
    for (let i = 0; i < MAX_BUBBLES; i++) {
      bubbles.push(createBubble(false));
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function render() {
      if (!ctx) return;

      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        // Update & Draw Burst Rings
        for (let i = burstRings.length - 1; i >= 0; i--) {
          const ring = burstRings[i];
          ring.radius += (ring.maxRadius - ring.radius) * 0.22 + 0.8;
          ring.alpha *= 0.82;

          if (ring.alpha <= 0.03 || ring.radius >= ring.maxRadius) {
            burstRings.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${ring.hue}, 85%, 70%, ${ring.alpha})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        // Update & Draw Splash Particles (Mini Droplets)
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94; // friction
          p.vy = p.vy * 0.94 + 0.05; // gravity
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);

          if (p.life >= p.maxLife || p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.alpha * 0.85})`;
          ctx.fill();

          // Particle sparkle glint
          ctx.beginPath();
          ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.fill();
        }

        // Update & Draw Bubbles
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];

          // Float upward
          b.y -= b.speedY;
          b.wobbleTime += b.wobbleSpeed;
          b.x = b.startX + Math.sin(b.wobbleTime) * b.wobbleAmp;

          // Progressive growth as bubble rises
          const riseProgress = Math.min(1, Math.max(0, (height - b.y) / (height - b.burstY)));
          b.currentRadius = b.baseRadius + (b.maxRadius - b.baseRadius) * riseProgress;

          // Check for Burst / Pop
          if (b.y <= b.burstY) {
            createBurst(b.x, b.y, b.currentRadius, b.hue);
            bubbles[i] = createBubble(true);
            continue;
          }

          const r = b.currentRadius;

          // Realistic 3D Liquid Water Bubble Rendering
          ctx.save();

          // 1. Soft Translucent Bubble Rim
          ctx.beginPath();
          ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${b.hue}, 85%, 72%, ${b.alpha * 0.65})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // 2. Soft Inner Glow Gradient
          const grad = ctx.createRadialGradient(
            b.x - r * 0.35,
            b.y - r * 0.35,
            r * 0.1,
            b.x,
            b.y,
            r
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${b.alpha * 0.5})`);
          grad.addColorStop(0.3, `hsla(${b.hue}, 90%, 80%, ${b.alpha * 0.2})`);
          grad.addColorStop(0.85, `hsla(${b.hue}, 90%, 65%, ${b.alpha * 0.08})`);
          grad.addColorStop(1, `hsla(${b.hue}, 90%, 60%, ${b.alpha * 0.35})`);

          ctx.fillStyle = grad;
          ctx.fill();

          // 3. Main Specular Highlight (Reflection Glint)
          ctx.beginPath();
          ctx.arc(b.x - r * 0.36, b.y - r * 0.36, r * 0.24, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.85})`;
          ctx.fill();

          // 4. Secondary micro specular shine
          ctx.beginPath();
          ctx.arc(b.x + r * 0.28, b.y + r * 0.28, r * 0.12, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.45})`;
          ctx.fill();

          ctx.restore();
        }

        // Maintain bubble count
        while (bubbles.length < MAX_BUBBLES) {
          bubbles.push(createBubble(true));
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        transform: "translate3d(0, 0, 0)",
        willChange: "transform",
      }}
    />
  );
}
