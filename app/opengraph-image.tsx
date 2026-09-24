import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hero } from "@/content/landing";
import { site } from "@/content/site";
import { markSegments, plain } from "@/components/ui/Marked";

export const alt = `${site.name}: ${plain(hero.headline.join(" "))}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori kennt keine CSS-Variablen, deshalb hier die CI-Werte als Konstanten.
const ONYX = "#0d0d0d";
const PINK = "#ff1493";
const WHITE = "#ffffff";
const SLATE = "#b4b4b8";
const LINE = "#2a2a2a";

export default async function OpengraphImage() {
  const [heading, inter] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Montserrat-ExtraBold.ttf")),
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: SLATE, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          <span>
            {`${site.city} // ${site.claimSuffix}`}
          </span>
          <svg width="64" height="45" viewBox="0 0 40 28" fill="none" stroke={WHITE} strokeWidth="1.5">
            <path d="M3 22 L3 7 L11.5 14 L20 2 L28.5 14 L37 7 L37 22 Z" />
            <path d="M3 26 H37" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Montserrat", color: WHITE, fontSize: 76, lineHeight: 1.02, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
          {hero.headline.map((line) => (
            <div key={line} style={{ display: "flex", marginBottom: 8 }}>
              {markSegments(line).map((segment) => (
                <span
                  key={segment.text}
                  style={
                    segment.mark
                      ? {
                          background: segment.mark === "pink" ? PINK : WHITE,
                          color: segment.mark === "pink" ? WHITE : ONYX,
                          padding: "0 12px",
                          marginLeft: -12,
                        }
                      : {}
                  }
                >
                  {segment.text}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", height: 1, background: LINE }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22, color: SLATE, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <span style={{ fontFamily: "Montserrat", color: WHITE }}>{site.name}</span>
            <span>{site.claimSuffix}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: heading, weight: 800, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
      ],
    },
  );
}
