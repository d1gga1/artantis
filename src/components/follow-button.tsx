"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, UserPlus } from "lucide-react";
import { AuthDialog } from "@/components/auth-dialog";
import { toggleFollow } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function FollowButton({
  targetId,
  initialFollowing,
  isAuthenticated,
  size = "md",
  className,
}: {
  targetId: string;
  initialFollowing: boolean;
  isAuthenticated: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [hover, setHover] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [pending, startTransition] = useTransition();

  const handle = () => {
    if (!isAuthenticated) {
      setDialog(true);
      return;
    }
    setFollowing((v) => !v);
    startTransition(async () => {
      await toggleFollow(targetId);
      router.refresh();
    });
  };

  return (
    <>
      <motion.button
        onClick={handle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={pending}
        whileTap={{ scale: 0.96 }}
        className={cn(
          following ? "btn-ghost" : "btn-primary",
          size === "sm" && "!px-4 !py-2 !text-[13.5px]",
          following && hover && "!border-signal-bad/30 !text-signal-bad",
          className
        )}
      >
        {following ? (
          <>
            {hover ? null : <Check size={14} />}
            {hover ? "Smetti di seguire" : "Già seguito"}
          </>
        ) : (
          <>
            <UserPlus size={14} />
            Segui
          </>
        )}
      </motion.button>

      <AuthDialog open={dialog} onClose={() => setDialog(false)} action="seguire questo profilo" />
    </>
  );
}
