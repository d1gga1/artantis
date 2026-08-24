"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Sfondo vivo disegnato su canvas.
 *
 * Tre strati sovrapposti, tutti nei colori delle discipline:
 *  1. campi di colore che si spostano lentamente, come luce che cambia;
 *  2. una rete di nodi alla deriva che si collega quando due punti si avvicinano;
 *  3. impulsi che corrono lungo i collegamenti — la conoscenza che passa da uno all'altro.
 *
 * Il puntatore del mouse scosta i nodi vicini: la pagina reagisce a chi la guarda.
 * Si ferma da solo quando la scheda del browser non è in primo piano o quando
 * l'utente ha chiesto meno animazioni nelle impostazioni di sistema.
 */

const COLORS = [
  [15, 111, 140],   // ricerca
  [109, 74, 168],   // arte
  [180, 86, 43],    // pittura
  [21, 112, 74],    // medicina
  [168, 73, 123],   // benessere
  [43, 95, 168],    // farmacia
];

type Node = {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  c: number[];
  phase: number;
};

type Pulse = { a: number; b: number; t: number; speed: number; c: number[] };

export function LivingBackground({
  intensity = 1,
  density = 1,
  className,
}: {
  intensity?: number;
  density?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cv = canvas;
    const context = cv.getContext("2d", { alpha: true });
    if (!context) return;
    const ctx = context;

    const host = cv.parentElement;
    if (!host) return;
    const parent: HTMLElement = host;
    let w = 0, h = 0, dpr = 1;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let running = true;
    let t = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    const LINK = 165;

    function build() {
      const rect = parent.getBoundingClientRect();
      w = Math.max(rect.width, 1);
      h = Math.max(rect.height, 1);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fieldCanvas.width = Math.max(2, Math.round(w * FIELD_SCALE));
      fieldCanvas.height = Math.max(2, Math.round(h * FIELD_SCALE));
      fieldAge = 99;

      const target = Math.round(((w * h) / 20000) * density);
      const count = Math.max(16, Math.min(target, 78));

      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
        r: 1.4 + Math.random() * 2.2,
        c: COLORS[i % COLORS.length],
        phase: Math.random() * Math.PI * 2,
      }));
      pulses = [];
    }

    /* --- strato 1: campi di colore -------------------------------------
       Sono macchie sfocate: non serve disegnarle a piena risoluzione né a
       ogni fotogramma. Le dipingiamo piccole su una tela di servizio, ogni
       tanto, e le ingrandiamo. Costa pochissimo e l'occhio non vede
       differenza. */
    const fieldCanvas = document.createElement("canvas");
    const fieldCtx = fieldCanvas.getContext("2d");
    const FIELD_SCALE = 0.22;
    let fieldAge = 99;

    function paintFields() {
      if (!fieldCtx) return;
      const fw = fieldCanvas.width, fh = fieldCanvas.height;
      fieldCtx.clearRect(0, 0, fw, fh);

      const fields = [
        { c: COLORS[0], bx: 0.14, by: 0.10, r: 0.62, sx: 0.055, sy: 0.040, sp: 0.00022 },
        { c: COLORS[1], bx: 0.72, by: 0.04, r: 0.66, sx: 0.070, sy: 0.050, sp: 0.00017 },
        { c: COLORS[2], bx: 0.86, by: 0.62, r: 0.52, sx: 0.060, sy: 0.055, sp: 0.00025 },
        { c: COLORS[3], bx: 0.34, by: 0.72, r: 0.58, sx: 0.065, sy: 0.045, sp: 0.00020 },
      ];

      for (const f of fields) {
        const cx = (f.bx + Math.sin(t * f.sp * 1000) * f.sx) * fw;
        const cy = (f.by + Math.cos(t * f.sp * 820) * f.sy) * fh;
        const rad = Math.max(fw, fh) * f.r * (1 + Math.sin(t * f.sp * 640) * 0.08);
        const g = fieldCtx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${f.c.join(",")}, ${0.21 * intensity})`);
        g.addColorStop(0.55, `rgba(${f.c.join(",")}, ${0.07 * intensity})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        fieldCtx.fillStyle = g;
        fieldCtx.fillRect(0, 0, fw, fh);
      }
    }


    /* --- strato 2 e 3: rete e impulsi ----------------------------------- */
    function drawNetwork() {
      // collegamenti
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const d = Math.sqrt(d2);
          const alpha = (1 - d / LINK) * 0.38 * intensity;
          const c = [
            Math.round((a.c[0] + b.c[0]) / 2),
            Math.round((a.c[1] + b.c[1]) / 2),
            Math.round((a.c[2] + b.c[2]) / 2),
          ];
          ctx.strokeStyle = `rgba(${c.join(",")}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // impulsi lungo i collegamenti
      for (const p of pulses) {
        const a = nodes[p.a], b = nodes[p.b];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const fade = Math.sin(p.t * Math.PI);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, `rgba(${p.c.join(",")}, ${0.85 * fade * intensity})`);
        g.addColorStop(1, `rgba(${p.c.join(",")}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodi
      for (const n of nodes) {
        const breathe = 1 + Math.sin(t * 0.0016 + n.phase) * 0.22;
        ctx.fillStyle = `rgba(${n.c.join(",")}, ${0.72 * intensity})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * breathe, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step(dt: number) {
      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;

        // il puntatore scosta delicatamente i nodi vicini
        if (pointer.active) {
          const dx = n.x - pointer.x, dy = n.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 170 * 170 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const push = ((170 - d) / 170) * 0.55;
            n.x += (dx / d) * push * dt;
            n.y += (dy / d) * push * dt;
          }
        }

        // rientro morbido dai bordi
        if (n.x < -40) n.x = w + 40;
        if (n.x > w + 40) n.x = -40;
        if (n.y < -40) n.y = h + 40;
        if (n.y > h + 40) n.y = -40;
      }

      for (const p of pulses) p.t += p.speed * dt;
      pulses = pulses.filter((p) => p.t < 1);

      if (pulses.length < 10 && Math.random() < 0.06 * dt) {
        const a = Math.floor(Math.random() * nodes.length);
        // sceglie un vicino reale, così l'impulso segue un collegamento visibile
        const near: number[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (j === a) continue;
          const dx = nodes[a].x - nodes[j].x, dy = nodes[a].y - nodes[j].y;
          if (dx * dx + dy * dy < LINK * LINK) near.push(j);
        }
        if (near.length) {
          const b = near[Math.floor(Math.random() * near.length)];
          pulses.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.010, c: nodes[a].c });
        }
      }
    }

    let last = 0;
    function frame(now: number) {
      if (!running) return;
      const dt = Math.min((now - last) / 16.67, 3) || 1;
      last = now;
      t = now;

      ctx.clearRect(0, 0, w, h);
      fieldAge += 1;
      if (fieldAge >= 5) { paintFields(); fieldAge = 0; }
      ctx.drawImage(fieldCanvas, 0, 0, w, h);
      drawNetwork();
      step(dt);
      raf = requestAnimationFrame(frame);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      paintFields();
      ctx.drawImage(fieldCanvas, 0, 0, w, h);
      drawNetwork();
    }

    build();

    if (reduce) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      build();
      if (reduce) drawStatic();
    };
    const onPointer = (e: PointerEvent) => {
      const rect = cv.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; };
    const onVisibility = () => {
      if (reduce) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(parent);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intensity, density, reduce]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
      aria-hidden
    />
  );
}
