"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Link2, MessageCircle, Repeat2 } from "lucide-react";
import { AuthDialog } from "@/components/auth-dialog";
import { toggleLike, toggleRepost } from "@/lib/actions";
import { cn, formatCount } from "@/lib/utils";

export function InteractionBar({
  postId,
  likes,
  comments,
  reposts,
  liked,
  reposted,
  isAuthenticated,
  onCommentClick,
}: {
  postId: string;
  likes: number;
  comments: number;
  reposts: number;
  liked: boolean;
  reposted: boolean;
  isAuthenticated: boolean;
  onCommentClick?: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [dialog, setDialog] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Stato ottimistico: l'interfaccia risponde subito, il server segue.
  const [likeState, setLikeState] = useState({ on: liked, n: likes });
  const [repostState, setRepostState] = useState({ on: reposted, n: reposts });

  const guard = (action: string) => {
    if (!isAuthenticated) {
      setDialog(action);
      return false;
    }
    return true;
  };

  const handleLike = () => {
    if (!guard("mettere un apprezzamento")) return;
    setLikeState((s) => ({ on: !s.on, n: s.n + (s.on ? -1 : 1) }));
    startTransition(async () => {
      await toggleLike(postId);
      router.refresh();
    });
  };

  const handleRepost = () => {
    if (!guard("ricondividere")) return;
    setRepostState((s) => ({ on: !s.on, n: s.n + (s.on ? -1 : 1) }));
    startTransition(async () => {
      await toggleRepost(postId);
      router.refresh();
    });
  };

  const handleComment = () => {
    if (!guard("commentare")) return;
    onCommentClick?.();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copia il link:", url);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 pt-1">
        <ActionButton
          onClick={handleLike}
          active={likeState.on}
          activeClass="text-signal-bad"
          label="Apprezza"
        >
          <motion.span
            animate={likeState.on ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex"
          >
            <Heart size={17} strokeWidth={2} fill={likeState.on ? "currentColor" : "none"} />
          </motion.span>
          {likeState.n > 0 && <Count value={likeState.n} />}
        </ActionButton>

        <ActionButton onClick={handleComment} active={false} activeClass="" label="Commenta">
          <MessageCircle size={17} strokeWidth={2} />
          {comments > 0 && <Count value={comments} />}
        </ActionButton>

        <ActionButton
          onClick={handleRepost}
          active={repostState.on}
          activeClass="text-signal-ok"
          label="Ricondividi"
        >
          <motion.span
            animate={repostState.on ? { rotate: [0, 180, 360] } : { rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex"
          >
            <Repeat2 size={18} strokeWidth={2} />
          </motion.span>
          {repostState.n > 0 && <Count value={repostState.n} />}
        </ActionButton>

        <div className="flex-1" />

        <ActionButton onClick={handleShare} active={copied} activeClass="text-accent" label="Copia link">
          <Link2 size={16} strokeWidth={2} />
          <span className="text-[12.5px]">{copied ? "Link copiato" : ""}</span>
        </ActionButton>
      </div>

      <AuthDialog open={Boolean(dialog)} onClose={() => setDialog(null)} action={dialog ?? "interagire"} />
    </>
  );
}

function Count({ value }: { value: number }) {
  return <span className="text-[13px] font-medium tabular-nums">{formatCount(value)}</span>;
}

function ActionButton({
  children,
  onClick,
  active,
  activeClass,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  activeClass: string;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-2 text-ink-faint transition-colors duration-200 hover:bg-paper-sunk hover:text-ink",
        active && activeClass
      )}
    >
      {children}
    </motion.button>
  );
}
