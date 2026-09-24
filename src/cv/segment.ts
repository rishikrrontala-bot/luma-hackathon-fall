/**
 * Binary segmentation primitives: Otsu thresholding, morphology, connected
 * components, hole filling and outer-contour tracing. All operate on flat typed
 * arrays so a 1280×960 photo segments in tens of milliseconds.
 */
import type { Point } from './geometry';
import { createMask, type FloatImage, type Mask } from './image';

/**
 * Otsu's method: the threshold that maximises between-class variance of a
 * 256-bin histogram of `values` (optionally restricted by `include`).
 */
export function otsuThreshold(values: Float32Array, include?: Uint8Array, bins = 256): number {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < values.length; i++) {
    if (include && !include[i]) continue;
    const v = values[i];
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (!(hi > lo)) return lo;
  const hist = new Float64Array(bins);
  const k = (bins - 1) / (hi - lo);
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    if (include && !include[i]) continue;
    hist[Math.round((values[i] - lo) * k)]++;
    total++;
  }
  let sumAll = 0;
  for (let t = 0; t < bins; t++) sumAll += t * hist[t];
  let wB = 0;
  let sumB = 0;
  let best = -1;
  let bestT = 0;
  for (let t = 0; t < bins; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) {
      best = between;
      bestT = t;
    }
  }
  return lo + (bestT + 0.5) / k;
}

export function thresholdAbove(img: FloatImage, t: number): Mask {
  const m = createMask(img.width, img.height);
  for (let i = 0; i < img.data.length; i++) m.data[i] = img.data[i] > t ? 1 : 0;
  return m;
}

/** Count of set pixels in the (2r+1)² window around every pixel (separable running sums). */
function windowCounts(mask: Mask, r: number): Uint16Array | Uint32Array {
  const { width: w, height: h } = mask;
  const tmp = new Uint16Array(w * h);
  const out = (2 * r + 1) ** 2 > 65535 ? new Uint32Array(w * h) : new Uint16Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let x = 0; x <= Math.min(r, w - 1); x++) acc += mask.data[row + x];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc;
      if (x + r + 1 < w) acc += mask.data[row + x + r + 1];
      if (x - r >= 0) acc -= mask.data[row + x - r];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = 0; y <= Math.min(r, h - 1); y++) acc += tmp[y * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc;
      if (y + r + 1 < h) acc += tmp[(y + r + 1) * w + x];
      if (y - r >= 0) acc -= tmp[(y - r) * w + x];
    }
  }
  return out;
}

export function dilate(mask: Mask, r: number): Mask {
  if (r <= 0) return { ...mask, data: mask.data.slice() };
  const c = windowCounts(mask, r);
  const out = createMask(mask.width, mask.height);
  for (let i = 0; i < c.length; i++) out.data[i] = c[i] > 0 ? 1 : 0;
  return out;
}

export function erode(mask: Mask, r: number): Mask {
  if (r <= 0) return { ...mask, data: mask.data.slice() };
  const { width: w, height: h } = mask;
  const c = windowCounts(mask, r);
  const out = createMask(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      // Pixels near the border see a clipped window; treat outside as unset.
      const full = (Math.min(w - 1, x + r) - Math.max(0, x - r) + 1) * (Math.min(h - 1, y + r) - Math.max(0, y - r) + 1);
      const i = y * w + x;
      out.data[i] = c[i] === full && full === (2 * r + 1) ** 2 ? 1 : 0;
    }
  return out;
}

export const closeMask = (mask: Mask, r: number): Mask => erode(dilate(mask, r), r);
export const openMask = (mask: Mask, r: number): Mask => dilate(erode(mask, r), r);

export interface Component {
  label: number;
  area: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  /** Number of pixels on the image border. */
  borderPixels: number;
  /** A pixel known to be in the component (its first in raster order), for contour tracing. */
  seed: Point;
}

/** 4-connected component labelling with an explicit stack. */
export function connectedComponents(mask: Mask): { labels: Int32Array; components: Component[] } {
  const { width: w, height: h, data } = mask;
  const labels = new Int32Array(w * h);
  const components: Component[] = [];
  const stack = new Int32Array(w * h);
  let next = 0;
  for (let start = 0; start < data.length; start++) {
    if (!data[start] || labels[start]) continue;
    next++;
    let sp = 0;
    stack[sp++] = start;
    labels[start] = next;
    const c: Component = {
      label: next,
      area: 0,
      minX: w,
      minY: h,
      maxX: -1,
      maxY: -1,
      borderPixels: 0,
      seed: { x: start % w, y: Math.floor(start / w) },
    };
    while (sp) {
      const i = stack[--sp];
      const x = i % w;
      const y = (i - x) / w;
      c.area++;
      if (x < c.minX) c.minX = x;
      if (x > c.maxX) c.maxX = x;
      if (y < c.minY) c.minY = y;
      if (y > c.maxY) c.maxY = y;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) c.borderPixels++;
      if (x > 0 && data[i - 1] && !labels[i - 1]) {
        labels[i - 1] = next;
        stack[sp++] = i - 1;
      }
      if (x < w - 1 && data[i + 1] && !labels[i + 1]) {
        labels[i + 1] = next;
        stack[sp++] = i + 1;
      }
      if (y > 0 && data[i - w] && !labels[i - w]) {
        labels[i - w] = next;
        stack[sp++] = i - w;
      }
      if (y < h - 1 && data[i + w] && !labels[i + w]) {
        labels[i + w] = next;
        stack[sp++] = i + w;
      }
    }
    components.push(c);
  }
  return { labels, components };
}

export function maskOfLabel(labels: Int32Array, width: number, height: number, label: number): Mask {
  const m = createMask(width, height);
  for (let i = 0; i < labels.length; i++) m.data[i] = labels[i] === label ? 1 : 0;
  return m;
}

/** Fill every unset region not connected to the image border (holes, like a hood opening). */
export function fillHoles(mask: Mask): Mask {
  const { width: w, height: h, data } = mask;
  const outside = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let sp = 0;
  const push = (i: number) => {
    if (!data[i] && !outside[i]) {
      outside[i] = 1;
      stack[sp++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (sp) {
    const i = stack[--sp];
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < w * (h - 1)) push(i + w);
  }
  const out = createMask(w, h);
  for (let i = 0; i < out.data.length; i++) out.data[i] = outside[i] ? 0 : 1;
  return out;
}

// Moore neighbourhood, clockwise in image coordinates (y down), starting west.
const DX = [-1, -1, 0, 1, 1, 1, 0, -1];
const DY = [0, -1, -1, -1, 0, 1, 1, 1];

/**
 * Trace the outer boundary of the blob containing `seed` (which must be its
 * top-most, then left-most pixel, as `connectedComponents` provides) with Moore
 * neighbour tracing. It stops when the tracer is back at the start pixel and about
 * to repeat its very first move, which handles one-pixel-wide necks correctly.
 * Returns pixel-centre points in order.
 */
export function traceOuterContour(mask: Mask, seed: Point): Point[] {
  const { width: w, height: h, data } = mask;
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && data[y * w + x] === 1;
  const start = { x: seed.x, y: seed.y };
  const contour: Point[] = [{ ...start }];
  let cur = { ...start };
  let backDir = 0; // the start pixel's west neighbour is background by construction
  let firstNext: Point | null = null;
  const maxSteps = 4 * w * h + 8;
  for (let step = 0; step < maxSteps; step++) {
    let found = -1;
    for (let k = 1; k <= 8; k++) {
      const d = (backDir + k) % 8;
      if (at(cur.x + DX[d], cur.y + DY[d])) {
        found = d;
        break;
      }
    }
    if (found < 0) break; // a single isolated pixel
    const nextP = { x: cur.x + DX[found], y: cur.y + DY[found] };
    if (cur.x === start.x && cur.y === start.y) {
      if (firstNext === null) firstNext = nextP;
      else if (nextP.x === firstNext.x && nextP.y === firstNext.y) break;
    }
    // The new backtrack is the (background) neighbour examined just before `found`,
    // re-expressed as a direction from the pixel we move to.
    const prevD = (found + 7) % 8;
    const bx = cur.x + DX[prevD];
    const by = cur.y + DY[prevD];
    let nb = 0;
    for (let d = 0; d < 8; d++)
      if (nextP.x + DX[d] === bx && nextP.y + DY[d] === by) {
        nb = d;
        break;
      }
    cur = nextP;
    backDir = nb;
    contour.push({ ...cur });
  }
  const last = contour[contour.length - 1];
  if (contour.length > 1 && last.x === start.x && last.y === start.y) contour.pop();
  return contour;
}
