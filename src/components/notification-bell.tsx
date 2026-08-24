"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { fetchNotifications, markAllRead } from "@/lib/notifications";
import type { AppNotification } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

const POLL_MS = 25_000;

/** Testo, icona e destinazione di ogni tipo di notifica. */
function describe(n: AppNotification) {
  const chi = n.actor?.full_name || n.actor?.username || "Qualcuno";
  const titolo = n.post?.title?.trim();
  const rif = titolo ? `«${titolo}»` : "il tuo contenuto";

  switch (n.type) {
    case "post_approved":
      return {
        icon: CheckCircle2,
        color: "#15704A",
        text: `Il tuo contenuto ${rif} è stato approvato ed è online.`,
        href: n.post_id ? `/post/${n.post_id}` : "/area-personale?sezione=contenuti",
      };
    case "post_rejected":
      return {
        icon: XCircle,
        color: "#B3352F",
        text: `La tua proposta ${rif} non è stata approvata. Apri per leggere il motivo.`,
        href: "/area-personale?sezione=contenuti",
      };
    case "like":
      return {
        icon: Heart,
        color: "#B3352F",
        text: `${chi} ha apprezzato ${rif}.`,
        href: n.post_id ? `/post/${n.post_id}` : "/",
      };
    case "comment":
      return {
        icon: MessageCircle,
        color: "#0F6F8C",
        text: `${chi} ha commentato ${rif}.`,
        href: n.post_id ? `/post/${n.post_id}#commenti` : "/",
      };
    case "repost":
      return {
        icon: Repeat2,
        color: "#15704A",
        text: `${chi} ha ricondiviso ${rif}.`,
        href: n.post_id ? `/post/${n.post_id}` : "/",
      };
    case "follow":
    default:
      return {
        icon: UserPlus,
        color: "#6D4AA8",
        text: `${chi} ha iniziato a seguirti.`,
        href: n.actor?.username ? `/profilo/${n.actor.username}` : "/membri",
      };
  }
}

export function NotificationBell() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const seen = useRef<Set<string> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const { items: list, unread: n } = await fetchNotifications();
      setItems(list);
      setUnread(n);

      // Al primo caricamento non si annuncia nulla: si prende nota e basta.
      if (seen.current === null) {
        seen.current = new Set(list.map((x) => x.id));
        return;
      }
      const fresh = list.filter((x) => !seen.current!.has(x.id) && !x.read);
      fresh.forEach((x) => seen.current!.add(x.id));
      if (fresh.length) setToasts((t) => [...fresh.slice(0, 3), ...t].slice(0, 3));
    } catch {
      // rete assente o sessione scaduta: si riprova al giro successivo
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // i riquadri a destra si ritirano da soli
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => setToasts((prev) => prev.slice(0, -1)), 6500);
    return () => clearTimeout(t);
  }, [toasts]);

  const openPanel = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      setItems((list) => list.map((n) => ({ ...n, read: true })));
      await markAllRead();
    }
  };

  return (
    <>
      <div className="relative" ref={panelRef}>
        <button
          onClick={openPanel}
          aria-label={unread > 0 ? `Notifiche: ${unread} da leggere` : "Notifiche"}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-soft transition-all hover:border-line-strong hover:text-ink hover:shadow-card"
        >
          <motion.span
            animate={unread > 0 ? { rotate: [0, -12, 10, -6, 0] } : { rotate: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Bell size={17} strokeWidth={2} />
          </motion.span>

          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-signal-bad px-1 text-[10.5px] font-bold text-white ring-2 ring-white"
              >
                {unread > 9 ? "9+" : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em]">Notifiche</p>
                {items.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint">
                    <CheckCheck size={13} />
                    tutte lette
                  </span>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {items.length === 0 ? (
                  <p className="px-5 py-10 text-center text-[14px] text-ink-faint">
                    Nessuna notifica per ora.
                  </p>
                ) : (
                  items.map((n) => {
                    const d = describe(n);
                    return (
                      <Link
                        key={n.id}
                        href={d.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex gap-3 border-b border-line/60 px-4 py-3 transition-colors last:border-0 hover:bg-paper-warm",
                          !n.read && "bg-accent-soft/40"
                        )}
                      >
                        <span className="relative shrink-0">
                          <Avatar
                            url={n.actor?.avatar_url}
                            name={n.actor?.full_name}
                            size="xs"
                            profession={n.actor?.profession}
                          />
                          <span
                            className="absolute -bottom-1 -right-1 flex h-[15px] w-[15px] items-center justify-center rounded-full text-white ring-2 ring-white"
                            style={{ background: d.color }}
                          >
                            <d.icon size={8.5} strokeWidth={3} />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] leading-snug text-ink-soft">
                            {d.text}
                          </span>
                          <span className="mt-0.5 block text-[12px] text-ink-faint">
                            {timeAgo(n.created_at)}
                          </span>
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </>
  );
}

/** I riquadri che compaiono in alto a destra all'arrivo di una notifica. */
function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: AppNotification[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-[84px] z-[90] flex w-[min(92vw,360px)] flex-col gap-2.5">
      <AnimatePresence initial={false}>
        {toasts.map((n) => {
          const d = describe(n);
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl border border-line bg-white/95 shadow-lift backdrop-blur"
            >
              <span
                className="absolute left-0 top-0 h-full w-[3px]"
                style={{ background: d.color }}
                aria-hidden
              />
              <Link href={d.href} className="flex items-start gap-3 p-4 pr-9">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: d.color }}
                >
                  <d.icon size={14} strokeWidth={2.6} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] leading-snug text-ink">{d.text}</span>
                  <span className="mt-0.5 block text-[12px] text-ink-faint">adesso</span>
                </span>
              </Link>
              <button
                onClick={() => onDismiss(n.id)}
                aria-label="Chiudi"
                className="absolute right-2.5 top-2.5 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-paper-sunk hover:text-ink"
              >
                <X size={13} />
              </button>
              <motion.span
                className="absolute bottom-0 left-0 h-[2px]"
                style={{ background: d.color, opacity: 0.5 }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 6.5, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
