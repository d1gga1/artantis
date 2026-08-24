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
 *
 * NOTE SUL MOBILE (correzione dello sfarfallio)
 * ---------------------------------------------
 * 1. Scorrendo su telefono la barra degli indirizzi si ritrae e riappare: la
 *    finestra cambia altezza di continuo. Prima ogni cambio faceva ripartire la
 *    scena da zero, con i nodi rigenerati a caso — ed è quello che si vedeva
 *    come sfarfallio. Ora le misure piccole vengono ignorate e, quando serve
 *    davvero ridimensionare, i nodi vengono riproporzionati invece che ricreati.
 * 2. Il dito genera eventi "pointer" che restavano attivi per sempre (su touch
 *    non arriva mai un "pointerleave"), quindi i nodi venivano spinti senza
 *    sosta. Ora si ascolta solo il mouse vero.
 * 3. Su schermi piccoli si disegna a densità di pixel 1, con meno nodi e a 30
 *    fotogrammi: il telefono sta al passo e il movimento resta fluido.
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

    const host = cv.parentElement;
    if (!host) return;
    const parent: HTMLElement = host;

    /** Telefoni e tablet: schermo stretto oppure nessun mouse. */
    const mobile =
      window.matchMedia("(hover: none)").matches || window.innerWidth < 768;

    /**
     * I campi di colore vivono su una tela ridotta, che il browser ingrandisce
     * da solo: costa una frazione del lavoro e viene sfumata gratis. Vengono
     * ridisegnati a ogni fotogramma, quindi il movimento resta continuo.
     */
    const FIELD_SCALE = mobile ? 0.18 : 0.25;
    /** Su mobile bastano 30 fotogrammi: metà lavoro, stessa impressione. */
    const MIN_FRAME = mobile ? 32 : 0;
    /** Distanza entro cui due nodi si collegano. */
    const LINK = mobile ? 140 : 165;
    /** Quanti nodi al massimo: il disegno dei collegamenti cresce col quadrato. */
    const MAX_NODES = mobile ? 32 : 70;

    let w = 0, h = 0, dpr = 1;
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let resizeRaf = 0;
    let running = true;
    let clock = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    function measure() {
      const rect = parent.getBoundingClientRect();
      return { mw: Math.max(rect.width, 1), mh: Math.max(rect.height, 1) };
    }

    /**
     * Adatta le tele a una nuova misura SENZA ricreare la scena: i nodi
     * esistenti vengono riproporzionati, così il cambio non si vede.
     */
    function applySize(nw: number, nh: number) {
      const ow = w, oh = h;
      w = nw;
      h = nh;
      dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

      cv.width = Math.floor(w * dpr);
      cv.height = Math.floor(h * dpr);
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fieldCv.width = Math.max(2, Math.floor(w * FIELD_SCALE));
      fieldCv.height = Math.max(2, Math.floor(h * FIELD_SCALE));

      if (nodes.length && ow > 1 && oh > 1) {
        const sx = w / ow, sy = h / oh;
        for (const n of nodes) {
          n.x *= sx;
          n.y *= sy;
        }
      }
    }

    /** Prima semina dei nodi: avviene una volta sola. */
    function seed() {
      const target = Math.round(((w * h) / 22000) * density);
      const count = Math.max(12, Math.min(target, MAX_NODES));

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
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      const elapsed = now - last;
      if (elapsed < MIN_FRAME) return;
      last = now;
      const dt = Math.min(elapsed / 16.67, 3);
      clock = now;
      render();
      step(dt);
    }

    const first = measure();
    applySize(first.mw, first.mh);
    seed();
    if (reduce) render();
    else raf = requestAnimationFrame(frame);

    /**
     * Il ridimensionamento vero è raro; quello finto — la barra del browser che
     * si ritrae mentre si scorre — è continuo. Cambiamenti di sola altezza
     * sotto la soglia vengono ignorati: è la causa principale dello sfarfallio.
     */
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        const { mw, mh } = measure();
        const dw = Math.abs(mw - w);
        const dh = Math.abs(mh - h);
        if (dw < 2 && dh < (mobile ? 180 : 2)) return;
        applySize(mw, mh);
        if (reduce) render();
      });
    };

    // Solo il mouse sposta i nodi: il dito no, altrimenti resta "incollato".
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
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
    if (!mobile) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intensity, density, reduce]);

  const base =
    className ?? "pointer-events-none absolute inset-0 h-full w-full transform-gpu";

  return (
    <>
      <canvas ref={fieldRef} className={base} aria-hidden />
      <canvas ref={netRef} className={base} aria-hidden />
    </>
  );
}
