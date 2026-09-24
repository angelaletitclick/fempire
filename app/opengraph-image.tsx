import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hero } from "@/content/landing";
import { site } from "@/content/site";

export const alt = `${site.name} — ${hero.headline.join(" ")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori kennt keine CSS-Variablen, deshalb hier die CI-Werte als Konstanten.
const ONYX = "#0d0d0d";
const PINK = "#ff1493";
const WHITE = "#ffffff";
const SLATE = "#b4b4b8";
const LINE = "#2a2a2a";

export default async function OpengraphImage() {
  const [syne, inter] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Syne-ExtraBold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: ONYX,
          padding: "64px 72px",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", color: SLATE, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {hero.eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Syne", color: WHITE, fontSize: 100, lineHeight: 0.92, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
          {hero.headline.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 2, background: LINE }}>
            <div style={{ width: 300, height: 2, background: PINK }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, color: SLATE, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <span style={{ fontFamily: "Syne", color: WHITE }}>{site.name}</span>
            <span>{site.claimSuffix}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Syne", data: syne, weight: 800, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
      ],
    },
  );
}
