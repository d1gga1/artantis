import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";
import { professionLabel } from "@/lib/types";
import { SITE_NAME } from "@/lib/seo";

/** Anteprima social del profilo di un membro. */
export const alt = "Profilo su ARTANTIS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Row = {
  username: string;
  full_name: string | null;
  bio: string | null;
  profession: string | null;
  city: string | null;
};

async function loadProfile(username: string): Promise<Row | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("username, full_name, bio, profession, city")
      .eq("username", username.toLowerCase())
      .maybeSingle();
    return (data as Row) ?? null;
  } catch {
    return null;
  }
}

function clamp(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean;
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await loadProfile(username);

  const name = profile?.full_name || profile?.username || SITE_NAME;
  const role = professionLabel(profile?.profession);
  const bio = profile?.bio ? clamp(profile.bio, 150) : "";
  const initial = (name.trim()[0] ?? "A").toUpperCase();

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
        <div style={{ fontSize: 22, letterSpacing: 6, color: "#8fb4c4", display: "flex" }}>
          ARTANTIS
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              background: "#0f6f8c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 76,
              fontWeight: 700,
            }}
          >
            {initial}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 58, fontWeight: 700, maxWidth: 800 }}>{name}</div>
            <div style={{ fontSize: 28, color: "#7fd0e8", display: "flex", gap: 14 }}>
              <div>{role}</div>
              {profile?.city ? <div style={{ color: "#5f8798" }}>·</div> : null}
              {profile?.city ? <div style={{ color: "#a9c6d3" }}>{profile.city}</div> : null}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#a9c6d3", maxWidth: 1000 }}>
          {bio || "Membro dello spazio editoriale ARTANTIS."}
        </div>
      </div>
    ),
    size
  );
}
