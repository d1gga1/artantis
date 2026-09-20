import { ImageResponse } from "next/og";

/** Icona usata quando il sito viene salvato sulla schermata di un iPhone. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d1420",
          color: "#ffffff",
          fontSize: 116,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        A
      </div>
    ),
    size
  );
}
