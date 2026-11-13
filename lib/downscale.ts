/**
 * Verkleinert ein Bild im Browser, bevor es hochgeladen wird (Handyfotos haben oft 5 bis 10 MB,
 * Vercel nimmt pro Anfrage nur rund 4,5 MB an). Ergebnis ist ein JPEG mit höchstens maxSize Pixeln
 * an der längsten Kante. Klappt das nicht (alter Browser), bleibt die Originaldatei.
 */
export async function downscaleImage(file: File, maxSize = 2400, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
