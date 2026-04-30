const RAMP = "@%#*+=-:. ";

export type AsciiOptions = {
  width?: number;
  invert?: boolean;
};

export async function convertImageToAscii(
  imageUrl: string,
  options: AsciiOptions = {}
): Promise<string> {
  const width = options.width ?? 80;
  const invert = options.invert ?? false;

  const img = await loadImage(imageUrl);
  const aspect = img.height / img.width;
  // Characters are taller than wide; multiply by 0.5 to compensate
  const height = Math.max(8, Math.round(width * aspect * 0.5));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS UNAVAILABLE");
  ctx.drawImage(img, 0, 0, width, height);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, width, height).data;
  } catch {
    throw new Error("CROSS_ORIGIN_BLOCKED");
  }

  let out = "";
  for (let y = 0; y < height; y++) {
    let row = "";
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const norm = invert ? lum / 255 : 1 - lum / 255;
      const idx = Math.min(RAMP.length - 1, Math.max(0, Math.floor(norm * RAMP.length)));
      row += RAMP[idx];
    }
    out += row + "\n";
  }
  return out;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    img.src = src;
  });
}