"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Sfondo vivo disegnato su canvas.
 *
 * Due strati:
 *  1. campi di colore che si spostano con continuità, come luce che cambia;
 *  2. una rete di nodi alla deriva che si collega quando due punti si avvicinano,
 *     percorsa ogni tanto da un chiarore che scorre lungo un collegamento.
 *
 * Regola di fondo: nessun elemento appare o scompare di colpo. Tutto entra e
 * esce con una dissolvenza, e ogni posizione è una funzione continua del tempo.
 * È la ragione per cui i campi di colore sono disegnati come immagini già
 * pronte e spostate ogni fotogramma, invece di essere ridipinti a intervalli:
 * ridipingerli ogni tanto li faceva scattare, e lo scatto si legge come
 * sfarfallio.
 *
 * Il puntatore del mouse scosta i nodi vicini. L'animazione si ferma da sola
 * quando la scheda del browser passa in secondo piano o quando l'utente ha
 * chiesto meno animazioni nelle impostazioni di sistema.
 */

const COLORS = [
  [15, 111, 140],   // ricerca
  [109, 74, 168],   // arte
  [180, 86, 43],    // pittura
  [21, 112, 74],    // medicina
  [168, 73, 123],   // benessere
  [43, 95, 168],    // farmacia
];

type Node = { x: number; y: number; vx: number; vy: number; r: number; c: number[] };
type Pulse = { a: number; b: number; t: number; speed: number; c: number[] };

/** Un campo di colore: immagine morbida disegnata una volta sola e poi spostata. */
const FIELDS = [
  { ci: 0, bx: 0.14, by: 0.10, r: 0.60, ax: 0.085, ay: 0.065, w1: 0.000045, w2: 0.000032 },
  { ci: 1, bx: 0.74, by: 0.06, r: 0.64, ax: 0.100, ay: 0.075, w1: 0.000033, w2: 0.000047 },
  { ci: 2, bx: 0.86, by: 0.64, r: 0.50, ax: 0.090, ay: 0.080, w1: 0.000052, w2: 0.000029 },
  { ci: 3, bx: 0.30, by: 0.74, r: 0.56, ax: 0.095, ay: 0.070, w1: 0.000039, w2: 0.000055 },
];


export function LivingBackground({
  intensity = 1,
  density = 1,
  className,
}: {
  intensity?: number;
  density?: number;
  className?: string;
}) {
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const netRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const netEl = netRef.current;
    const fieldEl = fieldRef.current;
    if (!netEl || !fieldEl) return;
    const cv: HTMLCanvasElement = netEl;
    const fieldCv: HTMLCanvasElement = fieldEl;
    const context = cv.getContext("2d", { alpha: true });
    const fieldContext = fieldCv.getContext("2d", { alpha: true });
    if (!context || !fieldContext) return;
    const ctx = context;
    const fctx = fieldContext;

    /**
     * I campi di colore vivono su una tela grande un quarto, che il browser
     * ingrandisce da solo: costa un quarto del lavoro e viene sfumata
     * gratis. Vengono ridisegnati a ogni fotogramma, quindi il movimento
     * resta continuo — è la correzione dello sfarfallio.
     */
    const FIELD_SCALE = 0.25;

    const host = cv.parentElement;
    if (!host) return;
    const parent: HTMLElement = host;

    let w = 0, h = 0, dpr = 1;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let running = true;
    let clock = 0;
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

      fieldCv.width = Math.max(2, Math.floor(w * FIELD_SCALE));
      fieldCv.height = Math.max(2, Math.floor(h * FIELD_SCALE));

      const target = Math.round(((w * h) / 22000) * density);
      const count = Math.max(14, Math.min(target, 70));

      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1.6 + Math.random() * 1.8,
        c: COLORS[i % COLORS.length],
      }));
      pulses = [];
    }

    /* --- strato 1: campi di colore, movimento continuo ------------------- */
    function drawFields() {
      const fw = fieldCv.width, fh = fieldCv.height;
      fctx.clearRect(0, 0, fw, fh);
      for (const f of FIELDS) {
        const c = COLORS[f.ci];
        const cx = (f.bx + Math.sin(clock * f.w1) * f.ax) * fw;
        const cy = (f.by + Math.cos(clock * f.w2) * f.ay) * fh;
        const rad = Math.max(fw, fh) * f.r;
        const g = fctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${c.join(",")}, ${0.22 * intensity})`);
        g.addColorStop(0.5, `rgba(${c.join(",")}, ${0.08 * intensity})`);
        g.addColorStop(1, `rgba(${c.join(",")}, 0)`);
        fctx.fillStyle = g;
        fctx.fillRect(0, 0, fw, fh);
      }
    }

    /* --- strato 2: rete e chiarori --------------------------------------- */
    function drawNetwork() {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const d = Math.sqrt(d2);
          const alpha = (1 - d / LINK) * 0.30 * intensity;
          ctx.strokeStyle = `rgba(${Math.round((a.c[0] + b.c[0]) / 2)},${Math.round(
            (a.c[1] + b.c[1]) / 2
          )},${Math.round((a.c[2] + b.c[2]) / 2)}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // chiarore che scorre lungo un collegamento: un tratto morbido, non un lampo
      for (const p of pulses) {
        const a = nodes[p.a], b = nodes[p.b];
        if (!a || !b) continue;
        const fade = Math.sin(p.t * Math.PI);
        const head = p.t;
        const tail = Math.max(p.t - 0.24, 0);
        const x1 = a.x + (b.x - a.x) * tail;
        const y1 = a.y + (b.y - a.y) * tail;
        const x2 = a.x + (b.x - a.x) * head;
        const y2 = a.y + (b.y - a.y) * head;
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, `rgba(${p.c.join(",")}, 0)`);
        g.addColorStop(1, `rgba(${p.c.join(",")}, ${0.42 * fade * intensity})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      for (const n of nodes) {
        ctx.fillStyle = `rgba(${n.c.join(",")}, ${0.6 * intensity})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step(dt: number) {
      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;

        if (pointer.active) {
          const dx = n.x - pointer.x, dy = n.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 170 * 170 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const push = ((170 - d) / 170) * 0.4;
            n.x += (dx / d) * push * dt;
            n.y += (dy / d) * push * dt;
          }
        }

        if (n.x < -40) n.x = w + 40;
        if (n.x > w + 40) n.x = -40;
        if (n.y < -40) n.y = h + 40;
        if (n.y > h + 40) n.y = -40;
      }

      for (const p of pulses) p.t += p.speed * dt;
      pulses = pulses.filter((p) => p.t < 1);

      if (pulses.length < 3 && Math.random() < 0.012 * dt) {
        const a = Math.floor(Math.random() * nodes.length);
        const near: number[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (j === a) continue;
          const dx = nodes[a].x - nodes[j].x, dy = nodes[a].y - nodes[j].y;
          if (dx * dx + dy * dy < LINK * LINK) near.push(j);
        }
        if (near.length) {
          const b = near[Math.floor(Math.random() * near.length)];
          pulses.push({ a, b, t: 0, speed: 0.005 + Math.random() * 0.004, c: nodes[a].c });
        }
      }
    }

    function render() {
      ctx.clearRect(0, 0, w, h);
      drawFields();
      drawNetwork();
    }

    let last = 0;
    function frame(now: number) {
      if (!running) return;
      const dt = last ? Math.min((now - last) / 16.67, 3) : 1;
      last = now;
      clock = now;
      render();
      step(dt);
      raf = requestAnimationFrame(frame);
    }

    build();
    if (reduce) render();
    else raf = requestAnimationFrame(frame);

    const onResize = () => {
      build();
      if (reduce) render();
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
        last = 0;
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

  const base = className ?? "pointer-events-none absolute inset-0 h-full w-full";

  return (
    <>
      <canvas ref={fieldRef} className={base} aria-hidden />
      <canvas ref={netRef} className={base} aria-hidden />
    </>
  );
}
