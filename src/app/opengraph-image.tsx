import { ImageResponse } from "next/og";
import { AUTHOR_NAME } from "@/lib/brand";

/**
 * Immagine di anteprima del sito: è il riquadro che compare quando qualcuno
 * incolla artantiss.com su WhatsApp, LinkedIn, Facebook o in una chat.
 * Senza questa, il collegamento appare nudo e viene aperto molto meno.
 */
export const alt = "ARTANTIS — Spazio editoriale di ricerca, medicina e arte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0d1420 0%, #132030 55%, #0f3a4a 100%)",
          padding: "72px 80px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 700,
              color: "#0d1420",
            }}
          >
            A
          </div>
          <div
            style={{
              fontSize: 30,
              letterSpacing: 8,
              fontWeight: 600,
              color: "#cfe4ec",
            }}
          >
            ARTANTIS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.12,
              fontWeight: 700,
              maxWidth: 940,
            }}
          >
            Il sapere che merita di essere guardato da vicino
          </div>
          <div style={{ fontSize: 30, color: "#a9c6d3", maxWidth: 900 }}>
            Ricerca, medicina, arte, pittura e benessere. Contenuti selezionati
            uno a uno.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: "#7fa8ba",
          }}
        >
          <div style={{ width: 44, height: 3, background: "#0f6f8c" }} />
          <div>{`Spazio editoriale curato by ${AUTHOR_NAME}`}</div>
        </div>
      </div>
    ),
    size
  );
}
