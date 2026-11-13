"use client";

import { useState } from "react";
import { downscaleImage } from "@/lib/downscale";

/**
 * Datei-Feld für Fotos: verkleinert das gewählte Bild sofort im Browser und ersetzt die Datei
 * im Feld durch die kleine Version. Das Formular schickt dann nur wenige hundert KB.
 */
export function ImageInput({ id, name, maxSize = 2400, describedBy }: { id: string; name: string; maxSize?: number; describedBy?: string }) {
  const [status, setStatus] = useState<string>("");

  return (
    <>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-describedby={describedBy}
        onChange={async (event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          if (!file) return setStatus("");
          setStatus("Bild wird vorbereitet …");
          const small = await downscaleImage(file, maxSize);
          if (small !== file && typeof DataTransfer !== "undefined") {
            const transfer = new DataTransfer();
            transfer.items.add(small);
            input.files = transfer.files;
          }
          setStatus(`${small.name} · ${Math.round(small.size / 1024)} KB, bereit`);
        }}
        className="text-sm text-slate-light file:mr-4 file:h-10 file:cursor-pointer file:border file:border-white/40 file:bg-transparent file:px-4 file:text-[0.7rem] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-white hover:file:border-pink hover:file:bg-pink"
      />
      {status ? (
        <p role="status" className="text-xs text-slate-light">
          {status}
        </p>
      ) : null}
    </>
  );
}
