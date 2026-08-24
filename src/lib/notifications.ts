"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AppNotification } from "@/lib/types";
import { DEMO_NOTIFICATIONS } from "@/lib/demo-data";

const DEMO = process.env.ARTANTIS_DEMO === "1";

const SELECT = `
  id, type, read, created_at, post_id,
  actor:profiles!notifications_actor_id_fkey ( id, username, full_name, avatar_url, profession ),
  post:posts!notifications_post_id_fkey ( id, title )
`;

/** Le ultime notifiche di chi è collegato, più il conteggio di quelle non lette. */
export async function fetchNotifications(): Promise<{
  items: AppNotification[];
  unread: number;
}> {
  if (DEMO) {
    return {
      items: DEMO_NOTIFICATIONS,
      unread: DEMO_NOTIFICATIONS.filter((n) => !n.read).length,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], unread: 0 };

  const [{ data }, { count }] = await Promise.all([
    supabase
      .from("notifications")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false),
  ]);

  return {
    items: (data ?? []) as unknown as AppNotification[],
    unread: count ?? 0,
  };
}

export async function markAllRead(): Promise<{ ok: boolean }> {
  if (DEMO) return { ok: true };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  await supabase.from("notifications").update({ read: true }).eq("read", false);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function clearNotifications(): Promise<{ ok: boolean }> {
  if (DEMO) return { ok: true };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  await supabase.from("notifications").delete().eq("user_id", user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}
