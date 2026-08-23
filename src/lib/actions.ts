"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeHandle } from "@/lib/utils";
import type { MediaType } from "@/lib/types";

type Result = { ok: boolean; error?: string; message?: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/* -------------------------------------------------------------------------- */
/* Accesso                                                                     */
/* -------------------------------------------------------------------------- */

export async function signIn(_prev: Result | null, formData: FormData): Promise<Result> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/");

  if (!email || !password) return { ok: false, error: "Inserisci email e password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message.toLowerCase().includes("invalid")
      ? "Email o password non corretti."
      : error.message.toLowerCase().includes("confirm")
        ? "Devi prima confermare l'indirizzo email: controlla la posta."
        : "Accesso non riuscito. Riprova.";
    return { ok: false, error: msg };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function signUp(_prev: Result | null, formData: FormData): Promise<Result> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const profession = String(formData.get("profession") ?? "altro");
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "");

  if (!fullName) return { ok: false, error: "Inserisci nome e cognome." };
  if (username.length < 3) return { ok: false, error: "Il nome utente deve avere almeno 3 caratteri." };
  if (password.length < 8) return { ok: false, error: "La password deve avere almeno 8 caratteri." };

  const supabase = await createClient();
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (taken) return { ok: false, error: "Questo nome utente è già in uso." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, username, profession } },
  });

  if (error) {
    return {
      ok: false,
      error: error.message.toLowerCase().includes("registered")
        ? "Esiste già un account con questa email."
        : "Registrazione non riuscita. Controlla i dati e riprova.",
    };
  }

  if (!data.session) {
    return {
      ok: true,
      message:
        "Ti abbiamo inviato un'email di conferma. Apri il messaggio e clicca sul link per attivare il tuo profilo ARTANTIS.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/area-personale");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/* -------------------------------------------------------------------------- */
/* Interazioni                                                                 */
/* -------------------------------------------------------------------------- */

export async function toggleLike(postId: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "auth" };

  const { data: existing } = await supabase
    .from("likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function toggleRepost(postId: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "auth" };

  const { data: existing } = await supabase
    .from("reposts")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("reposts").delete().eq("post_id", postId).eq("user_id", user.id);
  } else {
    await supabase.from("reposts").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function addComment(postId: string, content: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "auth" };

  const text = content.trim();
  if (!text) return { ok: false, error: "Scrivi qualcosa prima di inviare." };
  if (text.length > 2000) return { ok: false, error: "Il commento è troppo lungo." };

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, content: text });

  if (error) return { ok: false, error: "Commento non inviato. Riprova." };

  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function deleteComment(commentId: string, postId: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "auth" };

  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function toggleFollow(targetId: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "auth" };
  if (user.id === targetId) return { ok: false, error: "Non puoi seguire te stesso." };

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
  } else {
    await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Pubblicazione                                                               */
/* -------------------------------------------------------------------------- */

export async function createPost(payload: {
  title: string;
  content: string;
  category: string;
  media: { url: string; media_type: MediaType }[];
}): Promise<Result & { id?: string }> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "auth" };

  const content = payload.content.trim();
  if (!content && payload.media.length === 0) {
    return { ok: false, error: "Aggiungi un testo oppure almeno un file." };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: payload.title.trim().slice(0, 160),
      content,
      category: payload.category || "generale",
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "Invio non riuscito. Riprova." };

  if (payload.media.length > 0) {
    await supabase.from("post_media").insert(
      payload.media.slice(0, 10).map((m, i) => ({
        post_id: data.id,
        url: m.url,
        media_type: m.media_type,
        position: i,
      }))
    );
  }

  revalidatePath("/area-personale");
  revalidatePath("/moderazione");
  return { ok: true, id: data.id as string };
}

export async function deleteOwnPost(postId: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "auth" };

  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath("/area-personale");
  revalidatePath("/");
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Area personale                                                              */
/* -------------------------------------------------------------------------- */

export async function updateProfile(_prev: Result | null, formData: FormData): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Sessione scaduta: rifai l'accesso." };

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "");

  if (username.length < 3) return { ok: false, error: "Il nome utente deve avere almeno 3 caratteri." };

  const { data: clash } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();
  if (clash) return { ok: false, error: "Questo nome utente è già in uso." };

  const text = (key: string) => {
    const v = String(formData.get(key) ?? "").trim();
    return v === "" ? null : v;
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      full_name: String(formData.get("full_name") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim().slice(0, 600),
      profession: String(formData.get("profession") ?? "altro"),
      birth_date: text("birth_date"),
      phone: text("phone"),
      public_email: text("public_email"),
      city: text("city"),
      website: text("website"),
      instagram: normalizeHandle(text("instagram")),
      facebook: normalizeHandle(text("facebook")),
      avatar_url: text("avatar_url"),
      cover_url: text("cover_url"),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: "Salvataggio non riuscito. Riprova." };

  revalidatePath("/", "layout");
  revalidatePath("/area-personale");
  revalidatePath(`/profilo/${username}`);
  return { ok: true, message: "Profilo aggiornato." };
}

/* -------------------------------------------------------------------------- */
/* Moderazione (solo amministratore)                                           */
/* -------------------------------------------------------------------------- */

export async function moderatePost(
  postId: string,
  decision: "approved" | "rejected",
  reason?: string
): Promise<Result> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "auth" };

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!me?.is_admin) return { ok: false, error: "Non hai i permessi per questa azione." };

  const { error } = await supabase
    .from("posts")
    .update({
      status: decision,
      rejection_reason: decision === "rejected" ? (reason?.trim() || null) : null,
    })
    .eq("id", postId);

  if (error) return { ok: false, error: "Operazione non riuscita. Riprova." };

  revalidatePath("/moderazione");
  revalidatePath("/");
  return { ok: true };
}
