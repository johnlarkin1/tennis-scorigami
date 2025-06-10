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

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export const UnfurlParticleCanvas: React.FC<{ className?: string }> = ({
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // Fixed dimensions for unfurl
    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    let textPts: { x: number; y: number }[] = [];
    let particles: Particle[] = [];
    let balls: Ball[] = [];
    // mouse starts off-screen
    const repulseRadius = 80;
    const offscreen = -repulseRadius * 2;
    const mouse = { x: offscreen, y: offscreen };

    let rotation = 0;
    const staticBallCenter = { x: W * 0.8, y: H / 2 }; // Move ball more to the right
    const staticBallRadius = Math.min(W, H) * 0.18; // Slightly smaller ball
    let netOffset = 0;

    /* physics constants */
    const springStrength = 0.02;
    const friction = 0.9;
    const repulseStrength = 20000;
    const ballRotationSpeed = 0.004;
    const gravity = 0.5;

    /* grid size */
    const textGrid = 5; // Finer grid for better text quality
    const tennisGrid = 6;

    /* off-screen canvas for text mask */
    const off = document.createElement("canvas");
    // Set willReadFrequently to true to optimize getImageData calls
    const offCtx = off.getContext("2d", { willReadFrequently: true })!;

    function prepareTextMask() {
      off.width = W;
      off.height = H;
      offCtx.clearRect(0, 0, W, H);
      offCtx.fillStyle = "#fff";

      // Optimized font size for unfurl dimensions
      offCtx.font = "bold 110px sans-serif";
      offCtx.textAlign = "left";
      offCtx.textBaseline = "middle";

      // Position text more carefully for 1200x630
      const leftX = W * 0.08; // Start closer to left edge
      const centerY = H / 2;
      const lineSpacing = 110; // Space between lines

      const y1 = centerY - lineSpacing / 2;
      const y2 = centerY + lineSpacing / 2;

      offCtx.fillText("TENNIS", leftX, y1);
      offCtx.fillText("SCORIGAMI", leftX, y2);

      const img = offCtx.getImageData(0, 0, W, H).data;

      textPts = [];
      for (let y = 0; y < H; y += textGrid) {
        for (let x = 0; x < W * 0.65; x += textGrid) {
          // Extend text area slightly
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

    function spawnBall(x0: number, y0: number) {
      const bigR = Math.min(W, H) * 0.15;
      const r = bigR * 0.5;
      balls.push({ x: x0, y: y0, vx: 0, vy: 0, radius: r });
    }

    function scatter(x0: number, y0: number) {
      const count = 60,
        speed = 3,
        life = 90;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const mag = speed * (0.5 + Math.random() * 0.5);
        particles.push({
          x: x0,
          y: y0,
          vx: Math.cos(ang) * mag,
          vy: Math.sin(ang) * mag,
          age: 0,
          lifetime: life,
          type: "debris",
        });
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

    let physicsId: number;
    function updatePhysics() {
      rotation += ballRotationSpeed;
      netOffset += 0.1; // Subtle net movement
      const c = staticBallCenter;

      particles.forEach((p) => {
        if (p.type === "debris") return;

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

      // falling balls
      balls = balls.filter((b) => {
        b.vy += gravity;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= friction;
        b.vy *= friction;
        if (b.y + b.radius >= H) {
          scatter(b.x, H - 1);
          return false;
        }
        return true;
      });

      // debris
      particles = particles.filter((p) => {
        if (p.type !== "debris") return true;
        p.age!++;
        if (p.age! >= p.lifetime!) return false;
        p.vy += gravity * 0.2;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= friction;
        p.vy *= friction;
        return true;
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

      // falling balls
      balls.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // debris
      particles.forEach((p) => {
        if (p.type === "debris") {
          ctx.globalAlpha = 1 - p.age! / p.lifetime!;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
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

    // pointer events: move → set mouse; leave → push it offscreen
    const handlePM = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const handlePL = () => {
      mouse.x = offscreen;
      mouse.y = offscreen;
    };

    canvas.addEventListener("pointermove", handlePM);
    canvas.addEventListener("pointerleave", handlePL);

    // Initialize everything
    prepareTextMask();
    initParticles();
    updatePhysics();
    draw();

    return () => {
      cancelAnimationFrame(physicsId);
      cancelAnimationFrame(drawId);
      canvas.removeEventListener("pointermove", handlePM);
      canvas.removeEventListener("pointerleave", handlePL);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "1200px", height: "630px" }}
    />
  );
};
