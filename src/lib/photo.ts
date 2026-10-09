// Decode and resize images so common photos can be attached and stored offline.
export async function checkAndCompress(
  file: File,
): Promise<{ ok: true; dataUrl: string } | { ok: false; reason: string }> {
  if (file.type && !file.type.startsWith("image/")) {
    return { ok: false, reason: "Choose an image file such as JPG, PNG, or WebP." };
  }

  let imageUrl: string | undefined;
  try {
    const objectUrl = URL.createObjectURL(file);
    imageUrl = objectUrl;
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("This image could not be opened. Try another image file."));
      image.src = objectUrl;
    });
    if (!img.naturalWidth || !img.naturalHeight) {
      return { ok: false, reason: "This image has no readable picture data. Try another image file." };
    }

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return { ok: false, reason: "Your browser could not process this image." };

    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { ok: true, dataUrl: canvas.toDataURL("image/jpeg", 0.82) };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Could not process this image. Try another image file.",
    };
  } finally {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }
}