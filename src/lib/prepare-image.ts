// Browser preparation reduces camera photos before the private server upload.
// The server still validates and re-encodes the received bytes independently.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const TARGET_BYTES = 3 * 1024 * 1024;

export async function prepareImageUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPEG, PNG or WebP photo.");
  }
  if (file.size > MAX_IMAGE_BYTES)
    throw new Error("Choose a photo under 10 MB.");
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(
          new Error(
            "This photo could not be opened. Choose a different image.",
          ),
        );
      image.src = url;
    });
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 40_000_000
    ) {
      throw new Error("Choose a photo under 40 megapixels.");
    }
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(
        "Your browser could not prepare this photo. Please try another browser.",
      );
    const scale = Math.min(
      1,
      2048 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    for (let attempt = 0; attempt < 7; attempt++) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(
          resolve,
          "image/webp",
          Math.max(0.68, 0.88 - attempt * 0.04),
        ),
      );
      if (blob && blob.size <= TARGET_BYTES) {
        const suffix =
          blob.type === "image/webp"
            ? "webp"
            : blob.type === "image/jpeg"
              ? "jpg"
              : "png";
        return new File(
          [blob],
          file.name.replace(/\.[^.]*$/, "") + "." + suffix,
          { type: blob.type, lastModified: file.lastModified },
        );
      }
      canvas.width = Math.max(1, Math.round(canvas.width * 0.8));
      canvas.height = Math.max(1, Math.round(canvas.height * 0.8));
    }
    throw new Error(
      "This photo is too large to upload. Choose a smaller image.",
    );
  } finally {
    image.src = "";
    URL.revokeObjectURL(url);
  }
}
