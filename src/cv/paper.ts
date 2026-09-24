/**
 * Find the reference sheet of paper: the whitest, most rectangle-like blob in the
 * photo. Its four corners, refined to sub-pixel accuracy by fitting straight lines
 * to its edges, are the scale reference for everything else.
 */
import {
  centroid,
  convexHull,
  dist,
  fitLine,
  intersectLines,
  polygonArea,
  simplifyPolygon,
  distToSegment,
  type Point,
} from './geometry';
import { estimateRectangleAspect } from './homography';
import type { LabImage, Mask } from './image';
import { createMask } from './image';
import { connectedComponents, fillHoles, openMask, traceOuterContour } from './segment';
import { PAPER_SIZES, type PaperSizeId } from '../domain/paper';

export interface PaperDetection {
  /** Corners in processing-image pixels, ordered TL, TR, BR, BL as seen in the photo. */
  corners: [Point, Point, Point, Point];
  /** 0–1: how rectangular, solid and white the detected blob is. */
  confidence: number;
  /** True width/height of the TL→TR edge vs the TL→BL edge, recovered from perspective (Zhang & He). */
  aspect: number;
  /** Focal length estimate in pixels (null when the shot is too frontal to tell). */
  focal: number | null;
  /** Best guess of the paper size from the recovered aspect ratio, or null when ambiguous. */
  sizeGuess: PaperSizeId | null;
  /** Pixel mask of the paper (filled quad), for excluding it from garment segmentation. */
  area: number;
}

/** Whiteness: bright and colourless. Paper scores high, most floors and fabrics low. */
export function whitenessMap(lab: LabImage): Float32Array {
  const n = lab.L.length;
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = lab.L[i] - 1.6 * Math.hypot(lab.a[i], lab.b[i]);
  return w;
}

/** Order four points TL, TR, BR, BL by angle around their centroid, starting top-left. */
export function orderCorners(pts: Point[]): [Point, Point, Point, Point] {
  const c = centroid(pts);
  const sorted = pts.slice().sort((p, q) => Math.atan2(p.y - c.y, p.x - c.x) - Math.atan2(q.y - c.y, q.x - c.x));
  // atan2 order in image coords (y down) runs clockwise on screen: TL(-,-) … start from min x+y.
  let start = 0;
  for (let i = 1; i < 4; i++) if (sorted[i].x + sorted[i].y < sorted[start].x + sorted[start].y) start = i;
  const o = [0, 1, 2, 3].map((k) => sorted[(start + k) % 4]);
  return [o[0], o[1], o[2], o[3]];
}

/** Interior angles (degrees) of a quad. */
function quadAngles(q: Point[]): number[] {
  return q.map((p, i) => {
    const a = q[(i + 3) % 4];
    const b = q[(i + 1) % 4];
    const v1 = { x: a.x - p.x, y: a.y - p.y };
    const v2 = { x: b.x - p.x, y: b.y - p.y };
    const cos = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y));
    return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
  });
}

/** Reduce a convex hull to 4 vertices by increasing the RDP tolerance. */
function hullToQuad(hull: Point[]): Point[] | null {
  const per = hull.reduce((s, p, i) => s + dist(p, hull[(i + 1) % hull.length]), 0);
  for (const f of [0.01, 0.02, 0.03, 0.045, 0.06, 0.08]) {
    const s = simplifyPolygon(hull, per * f);
    if (s.length === 4) return s;
    if (s.length < 4) return null;
  }
  return null;
}

/**
 * Refine each quad edge by a total-least-squares line fit over the contour pixels
 * that lie along it (ignoring the 12% nearest each corner, where the sheet may curl),
 * then intersect neighbouring lines. Sub-pixel corners cut scale error roughly in half.
 */
export function refineQuad(quad: Point[], contour: Point[]): Point[] {
  const lines: Array<{ p: Point; d: Point } | null> = [];
  for (let e = 0; e < 4; e++) {
    const a = quad[e];
    const b = quad[(e + 1) % 4];
    const len = dist(a, b);
    const tol = Math.max(2, len * 0.02);
    const pts = contour.filter((p) => {
      if (distToSegment(p, a, b) > tol) return false;
      const t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (len * len);
      return t > 0.12 && t < 0.88;
    });
    lines.push(pts.length >= 6 ? fitLine(pts) : null);
  }
  return quad.map((q, i) => {
    const l1 = lines[(i + 3) % 4];
    const l2 = lines[i];
    if (!l1 || !l2) return q;
    const x = intersectLines(l1.p, l1.d, l2.p, l2.d);
    // Guard against a bad fit dragging a corner far away.
    return x && dist(x, q) < Math.max(6, 0.05 * dist(quad[i], quad[(i + 1) % 4])) ? x : q;
  });
}

/** Rasterise a convex quad into a mask (used to exclude the paper from the garment). */
export function quadMask(width: number, height: number, quad: Point[], grow = 0): Mask {
  const m = createMask(width, height);
  const c = centroid(quad);
  const q = quad.map((p) => {
    const d = dist(p, c) || 1;
    return { x: p.x + ((p.x - c.x) / d) * grow, y: p.y + ((p.y - c.y) / d) * grow };
  });
  const minY = Math.max(0, Math.floor(Math.min(...q.map((p) => p.y))));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(...q.map((p) => p.y))));
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < 4; i++) {
      const a = q[i];
      const b = q[(i + 1) % 4];
      if (a.y > y !== b.y > y) xs.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y));
    }
    xs.sort((u, v) => u - v);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.max(0, Math.ceil(xs[k]));
      const x1 = Math.min(width - 1, Math.floor(xs[k + 1]));
      for (let x = x0; x <= x1; x++) m.data[y * width + x] = 1;
    }
  }
  return m;
}

/** Guess Letter vs A4 from the recovered aspect ratio; null when it could be either. */
export function guessPaperSize(aspect: number): PaperSizeId | null {
  const r = aspect >= 1 ? aspect : 1 / aspect;
  const dl = Math.abs(r - PAPER_SIZES.letter.long / PAPER_SIZES.letter.short);
  const da = Math.abs(r - PAPER_SIZES.a4.long / PAPER_SIZES.a4.short);
  if (Math.min(dl, da) > 0.05) return null;
  if (dl < da * 0.5) return 'letter';
  if (da < dl * 0.5) return 'a4';
  return null;
}

export function detectPaper(lab: LabImage): PaperDetection | null {
  const { width: w, height: h } = lab;
  const white = whitenessMap(lab);
  const total = w * h;
  const sortedVals = Float32Array.from(white).sort();
  const q = (f: number) => sortedVals[Math.min(total - 1, Math.floor(total * f))];
  // Several thresholds: the paper may be the brightest 1% of the frame or share
  // the top 30% with a white T-shirt. Each threshold yields candidate blobs.
  const thresholds = [q(0.99), q(0.97), q(0.94), q(0.9), q(0.85), q(0.78), q(0.7)];
  let best: { score: number; det: PaperDetection } | null = null;
  const seen = new Set<number>();
  for (const t of thresholds) {
    const key = Math.round(t * 10);
    if (seen.has(key)) continue;
    seen.add(key);
    const m = createMask(w, h);
    for (let i = 0; i < total; i++) m.data[i] = white[i] > t ? 1 : 0;
    const cleaned = openMask(m, 1);
    const { labels, components } = connectedComponents(cleaned);
    for (const c of components) {
      if (c.area < total * 0.004 || c.area > total * 0.6) continue;
      const bw = c.maxX - c.minX + 1;
      const bh = c.maxY - c.minY + 1;
      if (Math.min(bw, bh) < 12) continue;
      // Isolate and fill this blob, then trace it.
      const blob = createMask(w, h);
      for (let y = c.minY; y <= c.maxY; y++)
        for (let x = c.minX; x <= c.maxX; x++) if (labels[y * w + x] === c.label) blob.data[y * w + x] = 1;
      const filled = fillHoles(blob);
      const contour = traceOuterContour(filled, c.seed);
      if (contour.length < 20) continue;
      const hull = convexHull(contour);
      const quad0 = hullToQuad(hull);
      if (!quad0) continue;
      const ordered0 = orderCorners(quad0);
      const refined = orderCorners(refineQuad(ordered0, contour));
      const qa = polygonArea(refined);
      if (qa <= 0) continue;
      const fill = c.area / qa;
      if (fill < 0.85 || fill > 1.12) continue;
      const angles = quadAngles(refined);
      if (angles.some((a) => a < 35 || a > 145)) continue;
      const sides = refined.map((p, i) => dist(p, refined[(i + 1) % 4]));
      if (Math.min(...sides) < 10) continue;
      const [tl, tr, br, bl] = refined;
      const est = estimateRectangleAspect(tl, tr, bl, br, w, h);
      const r = est.ratio >= 1 ? est.ratio : 1 / est.ratio;
      // A sheet of paper is between square-ish (1.2) and A-series (1.414): reject other rectangles.
      const aspectPenalty = r < 1.15 || r > 1.6 ? 0.4 : 1;
      // Mean whiteness of the blob relative to the frame, so a white wall beats nothing but loses to paper.
      let ws = 0;
      for (let y = c.minY; y <= c.maxY; y++)
        for (let x = c.minX; x <= c.maxX; x++) if (labels[y * w + x] === c.label) ws += white[y * w + x];
      const meanWhite = ws / c.area;
      const whiteScore = Math.max(0, Math.min(1, (meanWhite - q(0.5)) / 40));
      const rect = 1 - Math.min(1, Math.abs(1 - fill) * 4);
      const angleScore = 1 - Math.min(1, angles.reduce((s, a) => s + Math.abs(a - 90), 0) / 180);
      const sizeScore = Math.min(1, Math.sqrt(c.area / (total * 0.02)));
      const score = (0.45 * rect + 0.2 * angleScore + 0.35 * whiteScore) * aspectPenalty * (0.6 + 0.4 * sizeScore);
      if (!best || score > best.score) {
        best = {
          score,
          det: {
            corners: refined as [Point, Point, Point, Point],
            confidence: Math.max(0, Math.min(1, score)),
            aspect: est.ratio,
            focal: est.focal,
            sizeGuess: guessPaperSize(est.ratio),
            area: qa,
          },
        };
      }
    }
  }
  return best && best.score > 0.45 ? best.det : null;
}
