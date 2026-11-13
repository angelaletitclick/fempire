import type { NextConfig } from "next";

// Titel- und Textbilder des Magazins liegen im öffentlichen Supabase-Speicher
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/magazin/**" }]
      : [],
  },
  experimental: {
    // Bilder werden im Browser verkleinert, das hier ist nur die Obergrenze (Vercel erlaubt max. 4,5 MB)
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
