/**
 * From four paper corners to real-world millimetres, and the measurement values
 * and their uncertainty. Cheap enough to rerun on every drag of a handle, so it
 * runs on the main thread while the heavy segmentation stays in the worker.
 */
import { dist, type Point } from './geometry';
import { applyHomography, estimateRectangleAspect, homographyFromPoints, invertMat3, type Mat3 } from './homography';
import { PAPER_SIZES, type PaperSizeId } from '../domain/paper';

export type Quad = [Point, Point, Point, Point];

export interface Plane {
  /** image pixels → floor-plane millimetres */
  H: Mat3;
  /** floor-plane millimetres → image pixels */
  Hinv: Mat3;
  /** True when the TL→TR edge of the quad is the paper's long edge. */
  longEdgeFirst: boolean;
  /** Recovered aspect ratio of the paper as photographed (long/short). */
  measuredAspect: number;
  /** Expected long/short of the chosen paper size. */
  expectedAspect: number;
}

export function planeFromCorners(corners: Quad, paper: PaperSizeId, imageWidth: number, imageHeight: number): Plane {
  const [tl, tr, br, bl] = corners;
  const size = PAPER_SIZES[paper];
  const est = estimateRectangleAspect(tl, tr, bl, br, imageWidth, imageHeight);
  const longEdgeFirst = est.ratio >= 1;
  const w = longEdgeFirst ? size.long : size.short;
  const h = longEdgeFirst ? size.short : size.long;
  const H = homographyFromPoints(corners, [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ]);
  return {
    H,
    Hinv: invertMat3(H),
    longEdgeFirst,
    measuredAspect: est.ratio >= 1 ? est.ratio : 1 / est.ratio,
    expectedAspect: size.long / size.short,
  };
}

export const toPlane = (plane: Plane, p: Point): Point => applyHomography(plane.H, p);
export const toImage = (plane: Plane, p: Point): Point => applyHomography(plane.Hinv, p);

/** Real-world length (mm) of the segment between two image points. */
export const lengthMm = (plane: Plane, a: Point, b: Point): number => dist(toPlane(plane, a), toPlane(plane, b));

/** Small deterministic PRNG (mulberry32) so uncertainty numbers are reproducible. */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal via Box–Muller. */
export function gaussian(rand: () => number): number {
  const u = Math.max(1e-12, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface UncertaintyModel {
  /** 1-σ error of a paper corner, in processing-image pixels. */
  cornerSigmaPx: number;
  /** 1-σ error of a garment edge point, in processing-image pixels. */
  edgeSigmaPx: number;
  samples: number;
  seed: number;
}

export const DEFAULT_UNCERTAINTY: UncertaintyModel = { cornerSigmaPx: 0.8, edgeSigmaPx: 1.2, samples: 160, seed: 1234 };

/**
 * Monte-Carlo propagation of pixel-level error: jitter the paper corners and the
 * segment endpoints, rebuild the homography, remeasure. Returns the 95% half-width
 * (1.96 σ) in millimetres for each segment. This captures what the photo can
 * resolve; it deliberately does not pretend to capture how flat the garment lies.
 */
export function measurementUncertainty(
  corners: Quad,
  paper: PaperSizeId,
  imageWidth: number,
  imageHeight: number,
  segments: Array<{ a: Point; b: Point }>,
  model: UncertaintyModel = DEFAULT_UNCERTAINTY,
): number[] {
  const rand = mulberry32(model.seed);
  const jitter = (p: Point, s: number): Point => ({ x: p.x + gaussian(rand) * s, y: p.y + gaussian(rand) * s });
  const sums = segments.map(() => 0);
  const sq = segments.map(() => 0);
  let ok = 0;
  for (let k = 0; k < model.samples; k++) {
    const c = corners.map((p) => jitter(p, model.cornerSigmaPx)) as Quad;
    let plane: Plane;
    try {
      plane = planeFromCorners(c, paper, imageWidth, imageHeight);
    } catch {
      continue;
    }
    ok++;
    segments.forEach((s, i) => {
      const v = lengthMm(plane, jitter(s.a, model.edgeSigmaPx), jitter(s.b, model.edgeSigmaPx));
      sums[i] += v;
      sq[i] += v * v;
    });
  }
  return segments.map((_, i) => {
    if (ok < 2) return NaN;
    const mean = sums[i] / ok;
    const variance = Math.max(0, sq[i] / ok - mean * mean);
    return 1.96 * Math.sqrt(variance);
  });
}
