"use client";

import { useEffect } from "react";
import { DRAFT_KEY } from "./ApplicationForm";

/** Entfernt den Zwischenstand, sobald die Bewerbung angekommen ist. */
export function ClearDraft() {
  useEffect(() => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // nichts zu tun
    }
  }, []);
  return null;
}
