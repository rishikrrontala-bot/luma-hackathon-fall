/**
 * The whole measuring pipeline, photo in → measurements out:
 *
 *   downscale → Lab → find paper → homography → segment garment → outline in mm →
 *   symmetry axis → landmarks → segments → values ± uncertainty
 *
 * Pure function of its inputs; runs in a Web Worker in the app and in Node for the
 * benchmark and tests.
 */
import { simplifyPolygon, sub, type Point, type Polygon } from './geometry';
import { downscale, toLab, type RGBAImage } from './image';
import { analyseAligned, findAlignment, fromAligned, rotate180, toAligned, type Confidence, type GarmentType, type MeasurementId } from './measure';
import { detectPaper, quadMask, whitenessMap } from './paper';
import { lengthMm, measurementUncertainty, planeFromCorners, toImage, toPlane, type Quad } from './plane';
import { segmentGarment } from './garment';
import { centroid } from './geometry';
import type { PaperSizeId } from '../domain/paper';

export type WarningCode =
  | 'paper-not-found'
  | 'paper-aspect-mismatch'
  | 'paper-small'
  | 'garment-not-found'
  | 'garment-cut-off'
  | 'low-contrast'
  | 'type-unknown';

export interface AnalyzeOptions {
  /** Which paper is in the photo; 'auto' trusts the perspective-recovered aspect ratio when it's unambiguous. */
  paper: PaperSizeId | 'auto';
  /** Used when paper is 'auto' and the aspect ratio can't tell Letter from A4. */
  defaultPaper: PaperSizeId;
  garment: GarmentType | 'auto';
  /** Manually placed paper corners (processing-image pixels, TL TR BR BL); skips detection. */
  corners?: Quad;
  /** Longest side the photo is reduced to before processing. */
  maxSide?: number;
  /** Also return low-resolution stage images for the pipeline X-ray view. */
  debug?: boolean;
}

export interface MeasurementResult {
  id: MeasurementId;
  /** Endpoints in processing-image pixels. */
  a: Point;
  b: Point;
  valueMm: number;
  /** 95% half-width from pixel-level error, mm. */
  plusMinusMm: number;
  confidence: Confidence;
}

export interface StageImage {
  width: number;
  height: number;
  /** 8-bit grey. */
  data: Uint8ClampedArray;
}

export interface AnalysisResult {
  width: number;
  height: number;
  /** processing pixels per original pixel */
  scale: number;
  paper: {
    corners: Quad;
    detected: boolean;
    confidence: number;
    size: PaperSizeId;
    sizeGuess: PaperSizeId | null;
    measuredAspect: number;
    expectedAspect: number;
    focal: number | null;
  } | null;
  garment: {
    type: GarmentType;
    confidence: number;
    /** Outline in processing-image pixels (simplified). */
    contour: Polygon;
    /** Upright outline in mm, anchored at the top-centre landmark. */
    outline: Polygon;
    symmetry: number;
    notes: string[];
  } | null;
  /** Outline found even when no measurements could be made (for display). */
  rawContour: Polygon | null;
  measurements: MeasurementResult[];
  warnings: WarningCode[];
  timings: Record<string, number>;
  stages?: { whiteness: StageImage; distance: StageImage; mask: StageImage };
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function toStage(values: ArrayLike<number>, w: number, h: number, lo: number, hi: number, maxSide = 360): StageImage {
  const f = Math.min(1, maxSide / Math.max(w, h));
  const sw = Math.max(1, Math.round(w * f));
  const sh = Math.max(1, Math.round(h * f));
  const data = new Uint8ClampedArray(sw * sh);
  for (let y = 0; y < sh; y++)
    for (let x = 0; x < sw; x++) {
      const v = values[Math.min(h - 1, Math.floor(y / f)) * w + Math.min(w - 1, Math.floor(x / f))];
      data[y * sw + x] = ((v - lo) / (hi - lo)) * 255;
    }
  return { width: sw, height: sh, data };
}

export function analyzePhoto(photo: RGBAImage, options: AnalyzeOptions): AnalysisResult {
  const timings: Record<string, number> = {};
  let t = now();
  const mark = (k: string) => {
    const n = now();
    timings[k] = Math.round((n - t) * 10) / 10;
    t = n;
  };
  const { image, factor } = downscale(photo, options.maxSide ?? 1280);
  const { width: w, height: h } = image;
  const lab = toLab(image);
  mark('prepare');
  const warnings: WarningCode[] = [];
  const result: AnalysisResult = {
    width: w,
    height: h,
    scale: factor,
    paper: null,
    garment: null,
    rawContour: null,
    measurements: [],
    warnings,
    timings,
  };

  // 1. Paper.
  const detected = options.corners ? null : detectPaper(lab);
  mark('paper');
  const corners: Quad | null = options.corners ?? detected?.corners ?? null;
  const exclude = corners ? quadMask(w, h, corners, Math.hypot(w, h) * 0.012) : null;

  // 2. Garment (segmented even without paper, so the user sees the outline).
  const seg = segmentGarment(lab, exclude);
  mark('segment');
  if (options.debug) {
    const white = whitenessMap(lab);
    result.stages = {
      whiteness: toStage(white, w, h, 20, 100),
      distance: toStage(seg ? seg.distance : new Float32Array(w * h), w, h, 0, 6),
      mask: toStage(seg ? seg.mask.data : new Uint8Array(w * h), w, h, 0, 1),
    };
  }
  if (seg) result.rawContour = simplifyPolygon(seg.contour, 1);
  if (!corners) {
    warnings.push('paper-not-found');
    if (!seg) warnings.push('garment-not-found');
    return result;
  }

  const size: PaperSizeId =
    options.paper === 'auto' ? (detected?.sizeGuess ?? options.defaultPaper) : options.paper;
  const plane = planeFromCorners(corners, size, w, h);
  result.paper = {
    corners,
    detected: !!detected,
    confidence: detected ? detected.confidence : 1,
    size,
    sizeGuess: detected?.sizeGuess ?? null,
    measuredAspect: plane.measuredAspect,
    expectedAspect: plane.expectedAspect,
    focal: detected?.focal ?? null,
  };
  if (Math.abs(plane.measuredAspect / plane.expectedAspect - 1) > 0.06) warnings.push('paper-aspect-mismatch');
  if (detected && detected.area < w * h * 0.012) warnings.push('paper-small');

  if (!seg) {
    warnings.push('garment-not-found');
    return result;
  }
  if (seg.borderFraction > 0.04) warnings.push('garment-cut-off');
  if (seg.contrast < 0.25) warnings.push('low-contrast');

  // 3. Outline in millimetres, upright.
  const contourPx = simplifyPolygon(seg.contour, 1);
  const planePoly = contourPx.map((p) => toPlane(plane, p));
  const c0 = { x: w / 2, y: h / 2 };
  const up = sub(toPlane(plane, { x: c0.x, y: c0.y - 50 }), toPlane(plane, c0));
  const upLen = Math.hypot(up.x, up.y) || 1;
  const alignment = findAlignment(planePoly, { x: up.x / upLen, y: up.y / upLen });
  const aligned = planePoly.map((p) => toAligned(p, alignment));
  mark('outline');

  // 4. Landmarks and segments.
  const found = analyseAligned(aligned, options.garment);
  mark('landmarks');
  if (!found) {
    warnings.push('type-unknown');
    result.rawContour = contourPx;
    return result;
  }
  const { analysis, flipped } = found;
  const flipCenter = centroid(aligned);
  const backToImage = (p: Point): Point => {
    const q = flipped ? rotate180([p], flipCenter)[0] : p;
    return toImage(plane, fromAligned(q, alignment));
  };
  const segs = analysis.segments.map((s) => ({ ...s, a: backToImage(s.a), b: backToImage(s.b) }));
  const pm = measurementUncertainty(corners, size, w, h, segs);
  result.measurements = segs.map((s, i) => ({
    id: s.id,
    a: s.a,
    b: s.b,
    valueMm: lengthMm(plane, s.a, s.b),
    plusMinusMm: pm[i],
    confidence: s.confidence,
  }));
  mark('measure');

  const confidence = Math.max(
    0,
    Math.min(1, analysis.confidence * (0.5 + 0.5 * alignment.symmetry) * (seg.contrast < 0.25 ? 0.7 : 1)),
  );
  result.garment = {
    type: analysis.type,
    confidence,
    contour: contourPx,
    outline: analysis.outline,
    symmetry: alignment.symmetry,
    notes: analysis.notes,
  };
  return result;
}
