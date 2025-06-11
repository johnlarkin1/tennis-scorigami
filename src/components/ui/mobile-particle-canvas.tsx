"use client";

import React, { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age?: number;
  lifetime?: number;
  tx?: number;
  ty?: number;
  origAngle?: number;
  origR?: number;
  type: "text" | "staticBall" | "debris";
};

export const MobileParticleCanvas: React.FC<{ className?: string }> = ({
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let W = 0,
      H = 0;
    let textPts: { x: number; y: number }[] = [];
    let particles: Particle[] = [];

    // Mobile-optimized settings
    const repulseRadius = 50;
    const offscreen = -repulseRadius * 2;
    const mouse = { x: offscreen, y: offscreen };

    let rotation = 0;
    let staticBallCenter = { x: 0, y: 0 };
    let staticBallRadius = 0;
    let netOffset = 0;

    /* Mobile-optimized physics constants */
    const springStrength = 0.025;
    const friction = 0.9;
    const repulseStrength = 12000;
    const ballRotationSpeed = 0.003;
    const staticBallFactor = 0.15; // Smaller ball for mobile

    /* Mobile-optimized grid size - maximum density for clean text */
    const textGrid = 3; // Much smaller grid for higher resolution text
    const tennisGrid = 4;

    /* off-screen canvas for text mask */
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d", { willReadFrequently: true })!;

    function prepareTextMask() {
      off.width = W;
      off.height = H;
      offCtx.clearRect(0, 0, W, H);
      offCtx.fillStyle = "#fff";

      // Mobile-optimized responsive font size - smaller for better fit
      const fontSize = Math.min(W * 0.1, 50); // Further reduced to 50px max
      offCtx.font = `bold ${fontSize}px sans-serif`;
      offCtx.textAlign = "left"; // Left align like desktop version
      offCtx.textBaseline = "middle";

      // Position text on the left side like desktop
      const leftX = W * 0.1;
      const centerY = H * 0.5;

      // Stack text vertically with tighter spacing for better mobile fit
      const lineSpacing = fontSize * 0.9;
      const y1 = centerY - lineSpacing * 0.5;
      const y2 = centerY + lineSpacing * 0.5;

      offCtx.fillText("TENNIS", leftX, y1);
      offCtx.fillText("SCORIGAMI", leftX, y2);

      const img = offCtx.getImageData(0, 0, W, H).data;

      textPts = [];
      // Scan the left portion where text is positioned
      for (let y = 0; y < H; y += textGrid) {
        for (let x = 0; x < W * 0.7; x += textGrid) {
          // Scan wider area for better text coverage
          if (img[(y * W + x) * 4 + 3] > 128) {
            textPts.push({ x, y });
          }
        }
      }
    }

    function initParticles() {
      particles = [];

      // Text dots
      for (const p of textPts) {
        particles.push({
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          tx: p.x,
          ty: p.y,
          type: "text",
        });
      }

      // Static ball - positioned on the right side
      const c = staticBallCenter;
      const r = staticBallRadius;
      for (let yy = c.y - r; yy < c.y + r; yy += tennisGrid) {
        for (let xx = c.x - r; xx < c.x + r; xx += tennisGrid) {
          const dx = xx - c.x,
            dy = yy - c.y;
          if (dx * dx + dy * dy <= r * r) {
            const ang = Math.atan2(dy, dx);
            const dist = Math.hypot(dx, dy);
            particles.push({
              x: xx,
              y: yy,
              vx: 0,
              vy: 0,
              origAngle: ang,
              origR: dist,
              type: "staticBall",
            });
          }
        }
      }
    }

    function drawNetTexture() {
      const cellSize = 30; // Smaller cells for mobile
      const lineWidth = 1;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"; // More subtle
      ctx.lineWidth = lineWidth;

      // Vertical lines
      for (let x = netOffset % cellSize; x < W; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < H; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Subtle gradient overlay
      const gradient = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        Math.max(W, H) / 2
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(0.8, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    }

    function resize() {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;

      // Position ball further right for mobile
      staticBallCenter = { x: W * 0.8, y: H * 0.5 }; // Moved further right to give text more space
      staticBallRadius = Math.min(W, H) * staticBallFactor;

      requestAnimationFrame(() => {
        prepareTextMask();
        initParticles();
      });

      mouse.x = offscreen;
      mouse.y = offscreen;
    }

    let physicsId: number;
    function updatePhysics() {
      rotation += ballRotationSpeed;
      netOffset += 0.08; // Slower net movement
      const c = staticBallCenter;

      particles.forEach((p) => {
        // Mouse repulsion
        const dx = p.x - mouse.x,
          dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < repulseRadius * repulseRadius) {
          const F = repulseStrength / (dist2 + 1000);
          const ang = Math.atan2(dy, dx);
          p.vx += Math.cos(ang) * F;
          p.vy += Math.sin(ang) * F;
        }

        // Spring back to origin
        let tx: number, ty: number;
        if (p.type === "text") {
          tx = p.tx!;
          ty = p.ty!;
        } else {
          const a = p.origAngle! + rotation;
          tx = c.x + Math.cos(a) * p.origR!;
          ty = c.y + Math.sin(a) * p.origR!;
        }
        p.vx += (tx - p.x) * springStrength;
        p.vy += (ty - p.y) * springStrength;

        // Integration
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;
      });

      physicsId = requestAnimationFrame(updatePhysics);
    }

    let drawId: number;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Draw the net texture as background
      drawNetTexture();

      // Text dots - smaller for higher density
      ctx.fillStyle = "#0f0";
      particles.forEach((p) => {
        if (p.type === "text") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); // Reduced to 2 for higher density
          ctx.fill();
        }
      });

      // Static ball dots
      ctx.fillStyle = "#c5c75a";
      particles.forEach((p) => {
        if (p.type === "staticBall") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); // Reduced for higher density
          ctx.fill();
        }
      });

      // Static ball outline + seam
      const c = staticBallCenter,
        bigR = staticBallRadius;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3; // Thinner for mobile
      ctx.beginPath();
      ctx.arc(c.x, c.y, bigR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.arc(0, 0, bigR, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2; // Thinner
      ctx.moveTo(-bigR, 0);
      ctx.bezierCurveTo(
        -bigR * 0.5,
        -bigR * 0.85,
        bigR * 0.5,
        bigR * 0.85,
        bigR,
        0
      );
      ctx.stroke();
      ctx.restore();

      drawId = requestAnimationFrame(draw);
    }

    // Touch-optimized event handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = touch.clientX - r.left;
      mouse.y = touch.clientY - r.top;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const newX = touch.clientX - r.left;
      const newY = touch.clientY - r.top;

      mouse.x = newX;
      mouse.y = newY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      mouse.x = offscreen;
      mouse.y = offscreen;
    };

    // Add touch event listeners
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.style.touchAction = "none";

    window.addEventListener("resize", resize);

    // Initialize
    resize();
    updatePhysics();
    draw();

    return () => {
      cancelAnimationFrame(physicsId);
      cancelAnimationFrame(drawId);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};
