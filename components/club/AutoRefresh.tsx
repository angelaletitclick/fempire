"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Lädt die Seite in einem festen Abstand neu, solange der Tab sichtbar ist.
 * Reicht für den Website-Chat, ohne dauerhafte Verbindung zu einem Echtzeit-Dienst.
 */
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => window.clearInterval(timer);
  }, [router, seconds]);
  return null;
}
