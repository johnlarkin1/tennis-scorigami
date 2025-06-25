"use client";

import React, { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx?: number;
  ty?: number;
  origAngle?: number;
  origR?: number;
  type: "text" | "staticBall";
};

// Ball type removed since we're not using ball animations anymore

export const ParticleCanvas: React.FC<{ className?: string }> = ({
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
    // Removed balls array since we're not using ball animations
    // mouse starts off-screen - larger radius on mobile for easier interaction
    const repulseRadius = isMobile ? 120 : 80;
    const offscreen = -repulseRadius * 2;
    const mouse = { x: offscreen, y: offscreen };

    let rotation = 0;
    let staticBallCenter = { x: 0, y: 0 };
    let staticBallRadius = 0;
    let netOffset = 0;

    /* physics constants - adjusted for mobile */
    const springStrength = 0.02;
    const friction = 0.9;
    const repulseStrength = isMobile ? 15000 : 20000;
    const ballRotationSpeed = 0.004;
    const staticBallFactor = isMobile ? 0.2 : 0.25; // Smaller ball on mobile

    /* grid size - larger on mobile for better performance */
    const textGrid = isMobile ? 8 : 6;
    const tennisGrid = isMobile ? 8 : 6;

    /* off-screen canvas for text mask */
    const off = document.createElement("canvas");
    // Set willReadFrequently to true to optimize getImageData calls
    const offCtx = off.getContext("2d", { willReadFrequently: true })!;

    function prepareTextMask() {
      off.width = W;
      off.height = H;
      offCtx.clearRect(0, 0, W, H);
      offCtx.fillStyle = "#fff";

      // Responsive font size - smaller on mobile
      const fontSize = isMobile
        ? Math.min(W * 0.2, 80)
        : Math.min(W * 0.15, 132);
      offCtx.font = `bold ${fontSize}px sans-serif`;
      offCtx.textAlign = "left";
      const leftX = W * 0.1;
      offCtx.textBaseline = "middle";

      // how far apart your two baselines *used* to be:
      const textGap = 60;
      const origY1 = H * 0.4;
      const origY2 = H * 0.6 + textGap;
      const halfGap = (origY2 - origY1) / 2;

      const centerY = staticBallCenter.y; // = H/2

      // now place each line's *center* halfGap above / below the ball
      const y1 = centerY - halfGap;
      const y2 = centerY + halfGap;

      offCtx.fillText("TENNIS", leftX, y1);
      offCtx.fillText("SCORIGAMI", leftX, y2);
      const img = offCtx.getImageData(0, 0, W, H).data;

      textPts = [];
      for (let y = 0; y < H; y += textGrid) {
        for (let x = 0; x < W * 0.6; x += textGrid) {
          if (img[(y * W + x) * 4 + 3] > 128) {
            textPts.push({ x, y });
          }
        }
      }
    }

    function initParticles() {
      particles = [];
      // text dots
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
      // static big ball dots

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
      const cellSize = 40; // Size of each net "cell"
      const lineWidth = 1.5;

      // Main net grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"; // Very subtle white lines
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

      // Crossing diagonal threads (characteristic of tennis nets)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;

      // Draw X patterns within each cell
      for (let x = netOffset % cellSize; x < W; x += cellSize) {
        for (let y = 0; y < H; y += cellSize) {
          // Top-left to bottom-right
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.stroke();

          // Top-right to bottom-left
          ctx.beginPath();
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x, y + cellSize);
          ctx.stroke();
        }
      }

      // Add a subtle gradient overlay to fade the net at edges
      const gradient = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        Math.max(W, H) / 2
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(0.7, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    }

    function resize() {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
      staticBallCenter = { x: W * 0.75, y: H / 2 };
      staticBallRadius = Math.min(W, H) * staticBallFactor;

      // Clear existing particles before reinitializing to prevent accumulation
      particles = [];
      textPts = [];

      // Use requestAnimationFrame to avoid setTimeout performance issues
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
      netOffset += 0.1; // Subtle net movement
      const c = staticBallCenter;

      particles.forEach((p) => {
        // single, unconditional repulsion:
        const dx = p.x - mouse.x,
          dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < repulseRadius * repulseRadius) {
          const F = repulseStrength / (dist2 + 1000);
          const ang = Math.atan2(dy, dx);
          p.vx += Math.cos(ang) * F;
          p.vy += Math.sin(ang) * F;
        }

        // spring back to origin/text
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

        // integrate
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

      // text dots
      ctx.fillStyle = "#0f0";
      particles.forEach((p) => {
        if (p.type === "text") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // static ball dots
      ctx.fillStyle = "#c5c75a";
      particles.forEach((p) => {
        if (p.type === "staticBall") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // static ball outline + seam
      const c = staticBallCenter,
        bigR = staticBallRadius;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
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
      ctx.lineWidth = 3;
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

    // Enhanced pointer and touch events for better mobile experience
    const handlePM = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    const handlePL = () => {
      mouse.x = offscreen;
      mouse.y = offscreen;
    };

    // Touch-specific handlers for better mobile responsiveness
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      const r = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = touch.clientX - r.left;
      mouse.y = touch.clientY - r.top;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      const r = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouse.x = touch.clientX - r.left;
      mouse.y = touch.clientY - r.top;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      mouse.x = offscreen;
      mouse.y = offscreen;
    };

    // Add all event listeners
    canvas.addEventListener("pointermove", handlePM);
    canvas.addEventListener("pointerleave", handlePL);

    // Enhanced mobile touch support
    if (isMobile) {
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
      canvas.style.touchAction = "none"; // Prevent browser touch behaviors
    }
    window.addEventListener("resize", resize);

    // start
    resize();
    updatePhysics();
    draw();

    return () => {
      cancelAnimationFrame(physicsId);
      cancelAnimationFrame(drawId);
      canvas.removeEventListener("pointermove", handlePM);
      canvas.removeEventListener("pointerleave", handlePL);

      if (isMobile) {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
      }

      window.removeEventListener("resize", resize);

      // Clear all references to prevent memory leaks
      particles = [];
      textPts = [];
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
};
