"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Compass,
  LayoutGrid,
  Users,
  LogOut,
  Menu,
  PenLine,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Wordmark } from "@/components/wordmark";
import { NotificationBell } from "@/components/notification-bell";
import { ShareMenu } from "@/components/share-menu";
import { signOut } from "@/lib/actions";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const NAV = [
  { href: "/", label: "Feed", icon: LayoutGrid },
  { href: "/esplora", label: "Esplora", icon: Compass },
  { href: "/membri", label: "Membri", icon: Users },
];

export function SiteHeader({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-line bg-white/92 sm:bg-white/80 sm:backdrop-blur-xl sm:supports-[backdrop-filter]:bg-white/70"
            : "border-b border-transparent bg-white/80 sm:bg-white/45 sm:backdrop-blur-sm"
        )}
      >
        <div className="container-page flex h-[68px] items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <Wordmark />
            <nav className="hidden items-center gap-8 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link"
                  data-active={isActive(item.href)}
                >
                  {item.label}
                </Link>
              ))}
              {profile?.is_admin && (
                <Link href="/moderazione" className="nav-link" data-active={isActive("/moderazione")}>
                  Moderazione
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/pubblica" className="btn-accent hidden sm:inline-flex">
              <PenLine size={15} strokeWidth={2.2} />
              Pubblica
            </Link>

            <ShareMenu
              url={pathname}
              title="ARTANTIS"
              text={
                pathname === "/"
                  ? "ARTANTIS — spazio editoriale per ricercatori, medici, artisti e farmacisti"
                  : "Guarda questa pagina su ARTANTIS"
              }
              trigger="ghost"
              align="right"
              label="Condividi questa pagina"
            />

            {profile && <NotificationBell />}

            {profile ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-line bg-white p-1 pr-3 transition-all hover:border-line-strong hover:shadow-card"
                  aria-label="Menu profilo"
                >
                  <Avatar url={profile.avatar_url} name={profile.full_name} size="xs" />
                  <span className="hidden max-w-[110px] truncate text-[13.5px] font-medium lg:inline">
                    {profile.full_name || profile.username}
                  </span>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-[calc(100%+10px)] w-60 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lift"
                    >
                      <div className="border-b border-line px-3 py-2.5">
                        <p className="truncate text-[14px] font-medium">{profile.full_name}</p>
                        <p className="truncate text-[12.5px] text-ink-faint">@{profile.username}</p>
                      </div>
                      <MenuLink href={`/profilo/${profile.username}`} icon={UserRound}>
                        Il mio profilo
                      </MenuLink>
                      <MenuLink href="/area-personale" icon={LayoutGrid}>
                        Area personale
                      </MenuLink>
                      {profile.is_admin && (
                        <MenuLink href="/moderazione" icon={ShieldCheck}>
                          Moderazione
                        </MenuLink>
                      )}
                      <form action={signOut}>
                        <button
                          type="submit"
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] text-ink-soft transition-colors hover:bg-paper-sunk hover:text-signal-bad"
                        >
                          <LogOut size={15} />
                          Esci
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/accedi" className="btn-quiet">
                  Accedi
                </Link>
                <Link href="/registrati" className="btn-primary">
                  Crea profilo
                </Link>
              </div>
            )}

            <button
              className="btn-ghost !px-2.5 md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-[68px] z-40 overflow-hidden border-b border-line bg-white md:hidden"
          >
            <div className="container-page flex flex-col gap-1 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-ink-soft hover:bg-paper-sunk hover:text-ink"
                >
                  <item.icon size={17} />
                  {item.label}
                </Link>
              ))}
              <Link
                href="/pubblica"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-accent"
              >
                <PenLine size={17} />
                Pubblica un contenuto
              </Link>
              {!profile && (
                <div className="mt-2 flex gap-2">
                  <Link href="/accedi" className="btn-ghost flex-1">
                    Accedi
                  </Link>
                  <Link href="/registrati" className="btn-primary flex-1">
                    Crea profilo
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink"
    >
      <Icon size={15} />
      {children}
    </Link>
  );
}
