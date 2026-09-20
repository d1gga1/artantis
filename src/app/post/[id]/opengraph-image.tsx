import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";
import { professionLabel } from "@/lib/types";
import { SITE_NAME } from "@/lib/seo";

/**
 * Anteprima social di un singolo contenuto: titolo, autore e categoria su
 * fondo scuro. È quello che si vede quando un contenuto viene condiviso.
 */
export const alt = "Contenuto pubblicato su ARTANTIS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Row = {
  title: string | null;
  content: string;
  status: string;
  published_at: string | null;
  created_at: string;
  author: { full_name: string | null; profession: string | null } | null;
};

async function loadPost(id: string): Promise<Row | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("posts")
      .select(
        `title, content, status, published_at, created_at,
         author:profiles!posts_author_id_fkey ( full_name, profession )`
      )
      .eq("id", id)
      .maybeSingle();
    return (data as unknown as Row) ?? null;
  } catch {
    return null;
  }
}

function clamp(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean;
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await loadPost(id);

  const heading = post
    ? clamp(post.title || post.content, post.title ? 90 : 140)
    : "Il sapere che merita di essere guardato da vicino";
  const author = post?.author?.full_name ?? `Spazio editoriale ${SITE_NAME}`;
  const category = post?.author?.profession
    ? professionLabel(post.author.profession)
    : "Editoriale";
  const date = post
    ? new Date(post.published_at ?? post.created_at).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0d1420 0%, #132030 60%, #0f3a4a 100%)",
          padding: "68px 78px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: "#0f6f8c",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {category}
          </div>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#8fb4c4" }}>
            ARTANTIS
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: heading.length > 70 ? 50 : 62,
            lineHeight: 1.16,
            fontWeight: 700,
            maxWidth: 1010,
          }}
        >
          {heading}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 26,
            color: "#a9c6d3",
          }}
        >
          <div style={{ fontWeight: 600, color: "#ffffff" }}>{author}</div>
          {date ? <div style={{ color: "#5f8798" }}>·</div> : null}
          {date ? <div>{date}</div> : null}
        </div>
      </div>
    ),
    size
  );
}
