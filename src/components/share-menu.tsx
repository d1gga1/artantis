"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Mail, Share2, MoreHorizontal, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Icone dei social.
 * Sono disegnate qui dentro perché la libreria di icone del sito non
 * copre WhatsApp e Telegram: meglio un set coerente che due stili misti.
 * ------------------------------------------------------------------ */

type IconProps = { size?: number; className?: string };

const Glyph = ({ size = 20, className, d }: IconProps & { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d={d} />
  </svg>
);

const WhatsAppIcon = (p: IconProps) => (
  <Glyph
    {...p}
    d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.17c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.84-.85 2.04s.87 2.37 1 2.53c.12.17 1.72 2.62 4.16 3.68.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z"
  />
);

const TelegramIcon = (p: IconProps) => (
  <Glyph
    {...p}
    d="M21.94 4.3 18.9 19.1c-.23 1.01-.83 1.26-1.68.78l-4.64-3.42-2.24 2.16c-.25.25-.45.45-.93.45l.33-4.72 8.6-7.77c.37-.33-.08-.52-.58-.19L7.14 13.06 2.56 11.6c-1-.31-1.01-1 .21-1.48L20.66 3.2c.83-.31 1.55.19 1.28 1.1Z"
  />
);

const FacebookIcon = (p: IconProps) => (
  <Glyph
    {...p}
    d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.470h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z"
  />
);

const XIconBrand = (p: IconProps) => (
  <Glyph
    {...p}
    d="M17.53 3h3.24l-7.08 8.09L22 21h-6.52l-5.1-6.67L4.54 21H1.3l7.57-8.65L2 3h6.69l4.61 6.1L17.53 3Zm-1.14 16.06h1.8L7.7 4.85H5.77l10.62 14.21Z"
  />
);

const LinkedInIcon = (p: IconProps) => (
  <Glyph
    {...p}
    d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"
  />
);

const InstagramIcon = (p: IconProps) => (
  <Glyph
    {...p}
    d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07Zm0 6.35a3.49 3.49 0 1 0 0 6.98 3.49 3.49 0 0 0 0-6.98Zm0 5.75a2.26 2.26 0 1 1 0-4.52 2.26 2.26 0 0 1 0 4.52Zm4.45-5.89a.82.82 0 1 1-1.63 0 .82.82 0 0 1 1.63 0Z"
  />
);

/* ------------------------------------------------------------------ */

type Target = {
  id: string;
  label: string;
  color: string;
  icon: (p: IconProps) => React.ReactElement;
  href?: (url: string, text: string) => string;
  /** Instagram non accetta link dall'esterno: si copia e si incolla. */
  copyFirst?: boolean;
};

const TARGETS: Target[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon: WhatsAppIcon,
    href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    icon: FacebookIcon,
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "instagram",
    label: "Instagram",
    color: "#E1306C",
    icon: InstagramIcon,
    href: () => "https://www.instagram.com/",
    copyFirst: true,
  },
  {
    id: "x",
    label: "X",
    color: "#0d1420",
    icon: XIconBrand,
    href: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#229ED9",
    icon: TelegramIcon,
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    icon: LinkedInIcon,
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "email",
    label: "Email",
    color: "#0f6f8c",
    icon: (p: IconProps) => <Mail size={p.size} className={p.className} strokeWidth={2} />,
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
];

export function ShareMenu({
  url,
  title,
  text,
  align = "right",
  trigger = "icon",
  label = "Condividi",
  className,
}: {
  /** Percorso relativo ("/post/123") oppure indirizzo completo. */
  url: string;
  /** Titolo del contenuto: finisce nel messaggio precompilato. */
  title?: string;
  /** Testo alternativo al titolo. */
  text?: string;
  align?: "left" | "right";
  trigger?: "icon" | "button" | "ghost";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
  }, []);

  // Indirizzo completo: si calcola nel browser, così funziona su ogni dominio.
  const fullUrl = useMemo(() => {
    if (/^https?:\/\//i.test(url)) return url;
    if (typeof window === "undefined") return url;
    return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
  }, [url]);

  const message = text || title || "Guarda questo contenuto su ARTANTIS";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Il pannello vive in fondo alla pagina (portale): va posizionato a mano
  // sotto al pulsante, altrimenti le schede con i bordi arrotondati lo tagliano.
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const W = 304;
      const margin = 12;
      let left = align === "right" ? r.right - W : r.left;
      left = Math.min(Math.max(left, margin), window.innerWidth - W - margin);
      const belowFits = window.innerHeight - r.bottom > 330;
      const top = belowFits ? r.bottom + 8 : Math.max(margin, r.top - 330);
      setPos({ top, left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, align]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      return true;
    } catch {
      // Contesti senza permessi sugli appunti: si torna al metodo vecchio.
      try {
        const ta = document.createElement("textarea");
        ta.value = fullUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch {
        window.prompt("Copia il link:", fullUrl);
        return false;
      }
    }
  };

  const handleCopy = async () => {
    if (await copy()) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleTarget = async (t: Target) => {
    if (t.copyFirst) {
      await copy();
      setHint("Link copiato: incollalo nella tua storia o nel profilo Instagram.");
      setTimeout(() => setHint(null), 4000);
    }
    const href = t.href?.(fullUrl, message);
    if (!href) return;
    if (t.id === "email") {
      window.location.href = href;
    } else {
      window.open(href, "_blank", "noopener,noreferrer,width=640,height=680");
    }
    if (!t.copyFirst) setOpen(false);
  };

  const handleNative = async () => {
    try {
      await navigator.share({ title: title || "ARTANTIS", text: message, url: fullUrl });
      setOpen(false);
    } catch {
      /* l'utente ha annullato: nessun problema */
    }
  };

  const panel = (
    <>
      <div className="flex items-center justify-between px-1 pb-3">
        <p className="text-[14px] font-semibold">Condividi</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full p-1 text-ink-faint transition-colors hover:bg-paper-sunk hover:text-ink"
          aria-label="Chiudi"
        >
          <XIcon size={15} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {TARGETS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTarget(t)}
              className="group/s flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 transition-colors hover:bg-paper-sunk"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform duration-200 group-hover/s:scale-110"
                style={{ background: t.color }}
              >
                <Icon size={18} />
              </span>
              <span className="text-[11px] text-ink-faint">{t.label}</span>
            </button>
          );
        })}

        {canNativeShare && (
          <button
            type="button"
            onClick={handleNative}
            className="group/s flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 transition-colors hover:bg-paper-sunk"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-sunk text-ink-soft transition-transform duration-200 group-hover/s:scale-110">
              <MoreHorizontal size={18} />
            </span>
            <span className="text-[11px] text-ink-faint">Altro</span>
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-paper-warm p-1.5 pl-3">
        <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-faint">
          {fullUrl.replace(/^https?:\/\//, "")}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            copied ? "bg-signal-ok/10 text-signal-ok" : "bg-accent text-white hover:bg-accent-deep"
          )}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copiato" : "Copia"}
        </button>
      </div>

      <AnimatePresence>
        {hint && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-1 pt-2 text-[11.5px] leading-snug text-ink-faint"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className={cn("relative", className)} ref={wrapRef}>
      <TriggerButton variant={trigger} label={label} open={open} onClick={() => setOpen((v) => !v)} />

      {/* Da tablet in su: pannellino agganciato al pulsante, disegnato fuori
          dalla scheda così non viene mai ritagliato. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                style={{ top: pos.top, left: pos.left }}
                className="fixed z-[80] hidden w-[304px] rounded-2xl border border-line bg-white p-3 shadow-lift sm:block"
                role="dialog"
                aria-label="Condividi"
              >
                {panel}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Su telefono: foglio che sale dal basso, più comodo da toccare. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-end bg-ink/25 backdrop-blur-[2px] sm:hidden"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-t-3xl border-t border-line bg-white p-4 pb-7 shadow-lift"
                  role="dialog"
                  aria-label="Condividi"
                >
                  <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line-strong" aria-hidden />
                  {panel}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function TriggerButton({
  variant,
  label,
  open,
  onClick,
}: {
  variant: "icon" | "button" | "ghost";
  label: string;
  open: boolean;
  onClick: () => void;
}) {
  if (variant === "button") {
    return (
      <button type="button" onClick={onClick} className="btn-ghost" aria-label={label} aria-expanded={open}>
        <Share2 size={15} strokeWidth={2} />
        {label}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        aria-label={label}
        aria-expanded={open}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-all hover:border-line-strong hover:text-accent hover:shadow-card",
          open && "border-accent/40 text-accent"
        )}
      >
        <Share2 size={16} strokeWidth={2} />
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      aria-label={label}
      aria-expanded={open}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-2 text-ink-faint transition-colors duration-200 hover:bg-paper-sunk hover:text-ink",
        open && "bg-paper-sunk text-accent"
      )}
    >
      <Share2 size={17} strokeWidth={2} />
    </motion.button>
  );
}
