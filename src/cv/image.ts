/**
 * Minimal raster types and per-pixel operations. Kept free of DOM types (only
 * structural `{width, height, data}`), so a browser `ImageData` and a Node canvas
 * buffer both fit.
 */

export interface RGBAImage {
  width: number;
  height: number;
  /** RGBA, 8 bits per channel, row-major. */
  data: Uint8ClampedArray | Uint8Array;
}

export interface FloatImage {
  width: number;
  height: number;
  data: Float32Array;
}

export interface Mask {
  width: number;
  height: number;
  /** 1 = set, 0 = unset. */
  data: Uint8Array;
}

export const createMask = (width: number, height: number): Mask => ({ width, height, data: new Uint8Array(width * height) });
export const createFloat = (width: number, height: number): FloatImage => ({
  width,
  height,
  data: new Float32Array(width * height),
});

/** Area-averaging downscale so the longer side is at most `maxSide`. Returns the input unchanged if already small. */
export function downscale(img: RGBAImage, maxSide: number): { image: RGBAImage; factor: number } {
  const longSide = Math.max(img.width, img.height);
  if (longSide <= maxSide) return { image: img, factor: 1 };
  const factor = maxSide / longSide;
  const w = Math.max(1, Math.round(img.width * factor));
  const h = Math.max(1, Math.round(img.height * factor));
  const out = new Uint8ClampedArray(w * h * 4);
  const sx = img.width / w;
  const sy = img.height / h;
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor(y * sy);
    const y1 = Math.min(img.height, Math.max(y0 + 1, Math.floor((y + 1) * sy)));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.min(img.width, Math.max(x0 + 1, Math.floor((x + 1) * sx)));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let c = 0;
      for (let yy = y0; yy < y1; yy++) {
        let i = (yy * img.width + x0) * 4;
        for (let xx = x0; xx < x1; xx++, i += 4) {
          r += img.data[i];
          g += img.data[i + 1];
          b += img.data[i + 2];
          a += img.data[i + 3];
          c++;
        }
      }
      const o = (y * w + x) * 4;
      out[o] = r / c;
      out[o + 1] = g / c;
      out[o + 2] = b / c;
      out[o + 3] = a / c;
    }
  }
  // Effective factor per axis differs by < 0.5 px; report the mean.
  return { image: { width: w, height: h, data: out }, factor: (w / img.width + h / img.height) / 2 };
}

// sRGB → CIE L*a*b* (D65). A 256-entry table makes the gamma step free.
const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  SRGB_TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
const labF = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const R = SRGB_TO_LINEAR[r];
  const G = SRGB_TO_LINEAR[g];
  const B = SRGB_TO_LINEAR[b];
  const X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  const Y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const Z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883;
  const fx = labF(X);
  const fy = labF(Y);
  const fz = labF(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export interface LabImage {
  width: number;
  height: number;
  L: Float32Array;
  a: Float32Array;
  b: Float32Array;
}

export function toLab(img: RGBAImage): LabImage {
  const n = img.width * img.height;
  const L = new Float32Array(n);
  const A = new Float32Array(n);
  const B = new Float32Array(n);
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    const [l, a, b] = rgbToLab(img.data[j], img.data[j + 1], img.data[j + 2]);
    L[i] = l;
    A[i] = a;
    B[i] = b;
  }
  return { width: img.width, height: img.height, L, a: A, b: B };
}

/** Separable box blur with radius `r` using running sums (O(1) per pixel). */
export function boxBlur(src: FloatImage, r: number): FloatImage {
  if (r <= 0) return { ...src, data: src.data.slice() };
  const { width: w, height: h } = src;
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src.data[row + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc / (2 * r + 1);
      const add = src.data[row + Math.min(w - 1, x + r + 1)];
      const rem = src.data[row + Math.max(0, x - r)];
      acc += add - rem;
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / (2 * r + 1);
      const add = tmp[Math.min(h - 1, y + r + 1) * w + x];
      const rem = tmp[Math.max(0, y - r) * w + x];
      acc += add - rem;
    }
  }
  return { width: w, height: h, data: out };
}

/** Bilinear sample of a float image at a sub-pixel location (clamped at the borders). */
export function sampleBilinear(img: FloatImage, x: number, y: number): number {
  const { width: w, height: h, data } = img;
  const cx = Math.min(w - 1.001, Math.max(0, x));
  const cy = Math.min(h - 1.001, Math.max(0, y));
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const fx = cx - x0;
  const fy = cy - y0;
  const i = y0 * w + x0;
  return (
    data[i] * (1 - fx) * (1 - fy) + data[i + 1] * fx * (1 - fy) + data[i + w] * (1 - fx) * fy + data[i + w + 1] * fx * fy
  );
}
