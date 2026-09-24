/**
 * Separate the garment from the floor. The floor's colours are learned from the
 * photo's border (k-means in Lab); every pixel's distance to the nearest floor
 * colour, normalised by that colour's spread, is thresholded with Otsu. The biggest
 * solid blob that isn't the paper is the garment.
 */
import type { Point } from './geometry';
import { boxBlur, createFloat, createMask, type LabImage, type Mask } from './image';
import { closeMask, connectedComponents, fillHoles, openMask, otsuThreshold, traceOuterContour } from './segment';

/** Lightness counts for less than colour, so soft shadows on the floor stay "floor". */
const L_WEIGHT = 0.55;

interface Cluster {
  L: number;
  a: number;
  b: number;
  spread: number;
}

/** Deterministic k-means on Lab samples, seeded at lightness quantiles. */
export function kmeansLab(samples: Float32Array, k: number, iterations = 12): Cluster[] {
  const n = samples.length / 3;
  if (n === 0) return [];
  const order = Array.from({ length: n }, (_, i) => i).sort((i, j) => samples[i * 3] - samples[j * 3]);
  const centers = Array.from({ length: k }, (_, c) => {
    const i = order[Math.min(n - 1, Math.floor(((c + 0.5) / k) * n))];
    return [samples[i * 3], samples[i * 3 + 1], samples[i * 3 + 2]];
  });
  const assign = new Int32Array(n);
  const d2 = (i: number, c: number[]) =>
    (L_WEIGHT * (samples[i * 3] - c[0])) ** 2 + (samples[i * 3 + 1] - c[1]) ** 2 + (samples[i * 3 + 2] - c[2]) ** 2;
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bd = Infinity;
      for (let c = 0; c < k; c++) {
        const d = d2(i, centers[c]);
        if (d < bd) {
          bd = d;
          best = c;
        }
      }
      assign[i] = best;
    }
    const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (let i = 0; i < n; i++) {
      const s = sums[assign[i]];
      s[0] += samples[i * 3];
      s[1] += samples[i * 3 + 1];
      s[2] += samples[i * 3 + 2];
      s[3]++;
    }
    for (let c = 0; c < k; c++) if (sums[c][3] > 0) centers[c] = [sums[c][0] / sums[c][3], sums[c][1] / sums[c][3], sums[c][2] / sums[c][3]];
  }
  // Spread: 90th percentile distance of members, a robust "how textured is this floor colour".
  const members: number[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < n; i++) members[assign[i]].push(Math.sqrt(d2(i, centers[assign[i]])));
  return centers
    .map((c, idx) => {
      const m = members[idx].sort((x, y) => x - y);
      const p90 = m.length ? m[Math.floor(m.length * 0.9)] : 0;
      return { L: c[0], a: c[1], b: c[2], spread: p90, count: m.length };
    })
    .filter((c) => c.count > n * 0.03)
    .map(({ L, a, b, spread }) => ({ L, a, b, spread }));
}

export interface GarmentSegmentation {
  mask: Mask;
  /** Outer contour in processing-image pixels. */
  contour: Point[];
  area: number;
  /** Fraction of the contour lying on the image border (the garment is cut off if high). */
  borderFraction: number;
  /** Otsu separation quality 0–1 (how distinct garment and floor are). */
  contrast: number;
  /** Normalised floor-distance map, kept for the pipeline X-ray view. */
  distance: Float32Array;
}

/**
 * @param exclude pixels to ignore (the paper, grown a little so its shadow goes too)
 */
export function segmentGarment(lab: LabImage, exclude: Mask | null): GarmentSegmentation | null {
  const { width: w, height: h } = lab;
  const total = w * h;
  const ring = Math.max(4, Math.round(Math.min(w, h) * 0.04));
  // Sample the border ring, skipping excluded pixels, every other pixel.
  const buf: number[] = [];
  for (let y = 0; y < h; y += 2)
    for (let x = 0; x < w; x += 2) {
      if (x >= ring && y >= ring && x < w - ring && y < h - ring) continue;
      const i = y * w + x;
      if (exclude?.data[i]) continue;
      buf.push(lab.L[i], lab.a[i], lab.b[i]);
    }
  const clusters = kmeansLab(Float32Array.from(buf), 3);
  if (!clusters.length) return null;

  const dist = createFloat(w, h);
  for (let i = 0; i < total; i++) {
    let best = Infinity;
    for (const c of clusters) {
      const d =
        Math.sqrt((L_WEIGHT * (lab.L[i] - c.L)) ** 2 + (lab.a[i] - c.a) ** 2 + (lab.b[i] - c.b) ** 2) / Math.max(c.spread, 3);
      if (d < best) best = d;
    }
    dist.data[i] = exclude?.data[i] ? 0 : best;
  }
  const smooth = boxBlur(dist, 2);
  const include = new Uint8Array(total);
  for (let i = 0; i < total; i++) include[i] = exclude?.data[i] ? 0 : 1;
  // Never call something "garment" that's within 1.6 floor-spreads of the floor.
  const t = Math.max(1.6, otsuThreshold(smooth.data, include));

  let fg = createMask(w, h);
  let above = 0;
  let sumAbove = 0;
  let sumBelow = 0;
  for (let i = 0; i < total; i++) {
    const on = include[i] && smooth.data[i] > t ? 1 : 0;
    fg.data[i] = on;
    if (on) {
      above++;
      sumAbove += smooth.data[i];
    } else if (include[i]) sumBelow += smooth.data[i];
  }
  const r = Math.max(2, Math.round(Math.min(w, h) / 320));
  fg = openMask(closeMask(fg, r + 1), r);
  if (exclude) for (let i = 0; i < total; i++) if (exclude.data[i]) fg.data[i] = 0;

  const { labels, components } = connectedComponents(fg);
  let best: (typeof components)[number] | null = null;
  let bestScore = -1;
  for (const c of components) {
    if (c.area < total * 0.02) continue;
    const bw = c.maxX - c.minX + 1;
    const bh = c.maxY - c.minY + 1;
    const perimeterBox = 2 * (bw + bh);
    const borderFrac = c.borderPixels / perimeterBox;
    // Blobs hugging the frame edge are usually furniture or a rug, not the garment.
    const score = c.area * (1 - Math.min(0.9, borderFrac * 2));
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  if (!best) return null;
  const blob = createMask(w, h);
  for (let i = 0; i < total; i++) blob.data[i] = labels[i] === best.label ? 1 : 0;
  const filled = fillHoles(blob);
  // Re-find the top-left seed after hole filling (unchanged, but be exact).
  let seed: Point = best.seed;
  outer: for (let y = best.minY; y <= best.maxY; y++)
    for (let x = best.minX; x <= best.maxX; x++)
      if (filled.data[y * w + x]) {
        seed = { x, y };
        break outer;
      }
  const contour = traceOuterContour(filled, seed);
  let onBorder = 0;
  for (const p of contour) if (p.x <= 0 || p.y <= 0 || p.x >= w - 1 || p.y >= h - 1) onBorder++;
  const meanA = sumAbove / Math.max(1, above);
  const meanB = sumBelow / Math.max(1, total - above);
  let area = 0;
  for (let i = 0; i < total; i++) area += filled.data[i];
  return {
    mask: filled,
    contour,
    area,
    borderFraction: onBorder / Math.max(1, contour.length),
    contrast: Math.max(0, Math.min(1, (meanA - meanB) / 8)),
    distance: smooth.data,
  };
}
