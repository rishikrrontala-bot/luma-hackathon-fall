/**
 * Garment geometry → measurements. Works on the garment outline in real-world
 * millimetres (after the homography), rotated so the garment's own mirror-symmetry
 * axis is vertical. From there the landmarks are geometric facts of a flat-laid
 * garment: armpits and crotch are the deepest concavities of the outline, the hem is
 * its lowest edge, the high point of the shoulder is the top of the outline beside
 * the collar, and the shoulder seam is the sharpest bend between collar and cuff.
 */
import {
  bbox,
  centroid,
  convexityDefects,
  dist,
  horizontalCrossings,
  intervalContaining,
  nearestIndex,
  resamplePolygon,
  rotateAbout,
  simplifyPolyline,
  turnAngle,
  verticalCrossings,
  walk,
  type Defect,
  type Point,
  type Polygon,
} from './geometry';

export type GarmentType = 'top' | 'bottom';

export type MeasurementId =
  | 'pitToPit'
  | 'length'
  | 'shoulder'
  | 'sleeve'
  | 'waist'
  | 'rise'
  | 'inseam'
  | 'outseam'
  | 'thigh'
  | 'legOpening';

export type Confidence = 'high' | 'medium' | 'low';

/** A measurement as a straight segment between two points (in whatever frame the caller uses). */
export interface Segment {
  id: MeasurementId;
  a: Point;
  b: Point;
  confidence: Confidence;
}

export interface Alignment {
  /** Rotation centre (plane mm). */
  center: Point;
  /** Radians to rotate plane → aligned (garment upright, collar/waist at the top, y down). */
  angle: number;
  /** Mirror-symmetry score 0–1 of the outline about the found axis. */
  symmetry: number;
}

export const toAligned = (p: Point, al: Alignment): Point => rotateAbout(p, al.center, al.angle);
export const fromAligned = (p: Point, al: Alignment): Point => rotateAbout(p, al.center, -al.angle);

/** Rasterise a polygon to a coarse inside/outside grid (used by the symmetry search). */
function rasterise(poly: Polygon, cells: number) {
  const bb = bbox(poly);
  const size = Math.max(bb.maxX - bb.minX, bb.maxY - bb.minY) / cells;
  const gw = Math.ceil((bb.maxX - bb.minX) / size) + 1;
  const gh = Math.ceil((bb.maxY - bb.minY) / size) + 1;
  const grid = new Uint8Array(gw * gh);
  const inside: Point[] = [];
  for (let gy = 0; gy < gh; gy++) {
    const y = bb.minY + (gy + 0.5) * size;
    const xs = horizontalCrossings(poly, y);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const g0 = Math.max(0, Math.ceil((xs[k] - bb.minX) / size - 0.5));
      const g1 = Math.min(gw - 1, Math.floor((xs[k + 1] - bb.minX) / size - 0.5));
      for (let gx = g0; gx <= g1; gx++) {
        grid[gy * gw + gx] = 1;
        inside.push({ x: bb.minX + (gx + 0.5) * size, y });
      }
    }
  }
  const has = (p: Point) => {
    const gx = Math.floor((p.x - bb.minX) / size);
    const gy = Math.floor((p.y - bb.minY) / size);
    return gx >= 0 && gy >= 0 && gx < gw && gy < gh && grid[gy * gw + gx] === 1;
  };
  return { inside, has };
}

/**
 * Find the garment's mirror-symmetry axis: the line through the centroid that
 * maps the most of the shape onto itself. `priorUp` (the photo's "up" direction,
 * in plane coordinates) limits the search to ±60° and picks which way is up.
 */
export function findAlignment(poly: Polygon, priorUp: Point): Alignment {
  const c = centroid(poly);
  const { inside, has } = rasterise(poly, 120);
  const step = Math.max(1, Math.floor(inside.length / 6000));
  const score = (phi: number) => {
    const ux = Math.cos(phi);
    const uy = Math.sin(phi);
    let hit = 0;
    let tot = 0;
    for (let i = 0; i < inside.length; i += step) {
      const vx = inside[i].x - c.x;
      const vy = inside[i].y - c.y;
      const d = vx * ux + vy * uy;
      tot++;
      if (has({ x: c.x + 2 * d * ux - vx, y: c.y + 2 * d * uy - vy })) hit++;
    }
    return hit / Math.max(1, tot);
  };
  const prior = Math.atan2(priorUp.y, priorUp.x);
  let bestPhi = prior;
  let best = -1;
  for (let deg = -60; deg <= 60; deg += 2) {
    const phi = prior + (deg * Math.PI) / 180;
    const s = score(phi);
    if (s > best) {
      best = s;
      bestPhi = phi;
    }
  }
  const coarse = bestPhi;
  for (let deg = -2; deg <= 2; deg += 0.25) {
    const phi = coarse + (deg * Math.PI) / 180;
    const s = score(phi);
    if (s > best) {
      best = s;
      bestPhi = phi;
    }
  }
  // Rotate so the "up" direction u maps to (0, -1).
  const angle = -Math.PI / 2 - bestPhi;
  return { center: c, angle, symmetry: best };
}

export interface GarmentAnalysis {
  type: GarmentType;
  segments: Segment[];
  /** Landmarks in the aligned frame, for drawing and debugging. */
  landmarks: Record<string, Point>;
  /** 0–1: how confidently the garment type and landmarks were found. */
  confidence: number;
  /** The outline in the aligned frame, anchored so the top-centre landmark is (0, 0). */
  outline: Polygon;
  notes: string[];
  /** > 0 when the outline looks right way up (sleeves above the armpits; legs below the crotch). */
  orientationScore: number;
}

/** Horizontal extent of the outline at height y (0 when the line misses it). */
const extentAt = (poly: Polygon, y: number): number => {
  const xs = horizontalCrossings(poly, y);
  return xs.length >= 2 ? xs[xs.length - 1] - xs[0] : 0;
};

const bottomAt = (poly: Polygon, x: number): number | null => {
  const ys = verticalCrossings(poly, x);
  return ys.length ? ys[ys.length - 1] : null;
};
const topAt = (poly: Polygon, x: number): number | null => {
  const ys = verticalCrossings(poly, x);
  return ys.length ? ys[0] : null;
};

function pickSide(defects: Defect[], cx: number, side: -1 | 1, filter: (d: Defect) => boolean): Defect | null {
  const c = defects.filter((d) => Math.sign(d.point.x - cx) === side && filter(d));
  return c.length ? c.reduce((a, b) => (b.depth > a.depth ? b : a)) : null;
}

/** Walk from `from` to `to` along whichever direction avoids index `avoid`. */
function chainAvoiding(poly: Polygon, from: number, to: number, avoid: number[]): Point[] {
  const n = poly.length;
  const fwd = walk(poly, from, to);
  const fwdIdx = new Set<number>();
  for (let i = from, k = 0; k < fwd.length; i = (i + 1) % n, k++) fwdIdx.add(i);
  if (!avoid.some((a) => fwdIdx.has(a))) return fwd;
  return walk(poly, to, from).reverse();
}

/** Arc length along a polyline. */
const arc = (pts: Point[]) => pts.reduce((s, p, i) => (i ? s + dist(pts[i - 1], p) : 0), 0);

interface SideShoulder {
  shoulder: Point | null;
  cuff: Point | null;
  sleeveArc: number | null;
  shoulderTurn: number;
}

/** Shoulder seam point and top-of-cuff corner on one side, from the HPS→armpit chain. */
function shoulderAndCuff(chain: Point[]): SideShoulder {
  const simp = simplifyPolyline(chain, 6);
  const turns = simp.map((p, i) => (i === 0 || i === simp.length - 1 ? 0 : turnAngle(simp[i - 1], p, simp[i + 1])));
  const along: number[] = [];
  let acc = 0;
  for (let i = 0; i < simp.length; i++) {
    if (i) acc += dist(simp[i - 1], simp[i]);
    along.push(acc);
  }
  // Cuff corner: the first sharp (> 50°) corner at least 60 mm out from the collar.
  let cuffIdx = -1;
  for (let i = 1; i < simp.length - 1; i++) {
    if (along[i] > 60 && turns[i] > (50 * Math.PI) / 180) {
      cuffIdx = i;
      break;
    }
  }
  if (cuffIdx < 0) return { shoulder: null, cuff: null, sleeveArc: null, shoulderTurn: 0 };
  // Shoulder seam: the sharpest bend between the collar and the cuff corner.
  let sIdx = -1;
  let sTurn = 0;
  for (let i = 1; i < cuffIdx; i++) {
    if (along[i] < 25 || along[cuffIdx] - along[i] < 25) continue;
    if (turns[i] > sTurn) {
      sTurn = turns[i];
      sIdx = i;
    }
  }
  if (sIdx < 0) return { shoulder: null, cuff: simp[cuffIdx], sleeveArc: null, shoulderTurn: 0 };
  return {
    shoulder: simp[sIdx],
    cuff: simp[cuffIdx],
    sleeveArc: arc(simp.slice(sIdx, cuffIdx + 1)),
    shoulderTurn: sTurn,
  };
}

function analyseTop(poly: Polygon, defects: Defect[], notes: string[]): GarmentAnalysis | null {
  const bb = bbox(poly);
  const H = bb.maxY - bb.minY;
  const W = bb.maxX - bb.minX;
  const cx = centroid(poly).x;
  const pitFilter = (d: Defect) =>
    d.depth > Math.max(18, 0.035 * H) && d.point.y > bb.minY + 0.08 * H && d.point.y < bb.minY + 0.75 * H;
  const pitL = pickSide(defects, cx, -1, pitFilter);
  const pitR = pickSide(defects, cx, 1, pitFilter);
  if (!pitL || !pitR) return null;
  if (Math.abs(pitL.point.y - pitR.point.y) > 0.12 * H) return null;
  if (Math.abs(cx - pitL.point.x - (pitR.point.x - cx)) > 0.15 * W) return null;

  const segments: Segment[] = [];
  const landmarks: Record<string, Point> = { pitL: pitL.point, pitR: pitR.point };
  let conf = 0.9;

  // Pit to pit: straight across, one inch (25.4 mm) below the armpits.
  const yc = (pitL.point.y + pitR.point.y) / 2 + 25.4;
  const iv = intervalContaining(horizontalCrossings(poly, yc), cx);
  if (iv) {
    const xa = Math.max(iv[0], pitL.point.x - 20);
    const xb = Math.min(iv[1], pitR.point.x + 20);
    segments.push({ id: 'pitToPit', a: { x: xa, y: yc }, b: { x: xb, y: yc }, confidence: 'high' });
  }
  const halfChest = iv ? (iv[1] - iv[0]) / 2 : (pitR.point.x - pitL.point.x) / 2;

  // Hood: a pair of concavities where the hood meets the shoulders, above the armpits.
  const hoodFilter = (d: Defect) =>
    d.depth > 15 &&
    d.point.y < Math.min(pitL.point.y, pitR.point.y) - 20 &&
    Math.abs(d.point.x - cx) < 0.75 * halfChest &&
    Math.abs(d.point.x - cx) > 0.12 * halfChest;
  const hoodL = pickSide(defects, cx, -1, hoodFilter);
  const hoodR = pickSide(defects, cx, 1, hoodFilter);
  let hpsL: Point | null = null;
  let hpsR: Point | null = null;
  if (hoodL && hoodR && Math.abs(hoodL.point.y - hoodR.point.y) < 40) {
    hpsL = hoodL.point;
    hpsR = hoodR.point;
    notes.push('hood');
  } else {
    // High point shoulder: the top of the outline beside the collar, each side.
    const best = (sign: -1 | 1): Point | null => {
      let bp: Point | null = null;
      for (let f = 0.06; f <= 0.5; f += 0.01) {
        const x = cx + sign * f * halfChest;
        const t = topAt(poly, x);
        if (t !== null && (!bp || t < bp.y - 0.05)) bp = { x, y: t };
      }
      return bp;
    };
    hpsL = best(-1);
    hpsR = best(1);
  }
  if (hpsL && hpsR) {
    landmarks.hpsL = hpsL;
    landmarks.hpsR = hpsR;
    // Body length: from the high point shoulder straight down to the hem.
    const hem = bottomAt(poly, hpsL.x);
    if (hem !== null) segments.push({ id: 'length', a: hpsL, b: { x: hpsL.x, y: hem }, confidence: 'high' });

    const iH = nearestIndex(poly, hpsL);
    const iHR = nearestIndex(poly, hpsR);
    const iP = nearestIndex(poly, pitL.point);
    const iPR = nearestIndex(poly, pitR.point);
    const left = shoulderAndCuff(chainAvoiding(poly, iH, iP, [iHR, iPR]));
    const right = shoulderAndCuff(chainAvoiding(poly, iHR, iPR, [iH, iP]));
    if (left.shoulder && right.shoulder) {
      landmarks.shoulderL = left.shoulder;
      landmarks.shoulderR = right.shoulder;
      const sharp = Math.min(left.shoulderTurn, right.shoulderTurn) > (10 * Math.PI) / 180;
      segments.push({ id: 'shoulder', a: left.shoulder, b: right.shoulder, confidence: sharp ? 'medium' : 'low' });
      if (!sharp) notes.push('soft-shoulder');
    }
    const side = left.sleeveArc !== null ? left : right.sleeveArc !== null ? right : null;
    if (side && side.shoulder && side.cuff) {
      landmarks.cuff = side.cuff;
      segments.push({ id: 'sleeve', a: side.shoulder, b: side.cuff, confidence: 'medium' });
    }
  } else conf -= 0.3;

  const anchor = hpsL && hpsR ? { x: (hpsL.x + hpsR.x) / 2, y: Math.min(hpsL.y, hpsR.y) } : { x: cx, y: bb.minY };
  // Sleeves sit beside and above the armpits: the outline is wider just above them than just below.
  const py = (pitL.point.y + pitR.point.y) / 2;
  const orientationScore = (extentAt(poly, py - 40) - extentAt(poly, py + 40)) / W;
  return {
    type: 'top',
    segments,
    landmarks,
    confidence: conf,
    outline: anchorOutline(poly, anchor),
    notes,
    orientationScore,
  };
}

function analyseBottom(poly: Polygon, defects: Defect[], notes: string[]): GarmentAnalysis | null {
  const bb = bbox(poly);
  const H = bb.maxY - bb.minY;
  const W = bb.maxX - bb.minX;
  const cx = centroid(poly).x;
  const crotchCandidates = defects.filter(
    (d) => d.depth > 0.12 * H && Math.abs(d.point.x - cx) < 0.12 * W && d.point.y > bb.minY + 0.15 * H,
  );
  if (!crotchCandidates.length) return null;
  const crotchDefect = crotchCandidates[0];
  const crotch = crotchDefect.point;
  // The gap between the legs opens downward when the garment is the right way up.
  const orientationScore = ((crotchDefect.start.y + crotchDefect.end.y) / 2 - crotch.y) / H;
  const segments: Segment[] = [];
  const landmarks: Record<string, Point> = { crotch };

  // Waist: straight across the top edge, 5 mm below it so the line lies on fabric.
  const yw = bb.minY + 5;
  const wIv = intervalContaining(horizontalCrossings(poly, yw), cx);
  if (wIv) segments.push({ id: 'waist', a: { x: wIv[0], y: yw }, b: { x: wIv[1], y: yw }, confidence: 'high' });

  // Rise: from the crotch straight up to the waistband.
  const top = topAt(poly, crotch.x);
  if (top !== null) segments.push({ id: 'rise', a: { x: crotch.x, y: top }, b: crotch, confidence: 'medium' });

  // Left leg hem corners: the lowest points of the left leg, inner (nearest the axis) and outer.
  const leftLeg = poly.filter((p) => p.x < crotch.x && p.y > crotch.y);
  if (leftLeg.length) {
    const hemY = Math.max(...leftLeg.map((p) => p.y));
    const hemBand = leftLeg.filter((p) => p.y > hemY - Math.max(15, 0.03 * H));
    const inner = hemBand.reduce((a, b) => (b.x > a.x ? b : a));
    const outer = hemBand.reduce((a, b) => (b.x < a.x ? b : a));
    landmarks.hemInner = inner;
    landmarks.hemOuter = outer;
    segments.push({ id: 'inseam', a: crotch, b: inner, confidence: 'high' });
    if (wIv) segments.push({ id: 'outseam', a: { x: wIv[0], y: yw }, b: outer, confidence: 'medium' });
    segments.push({ id: 'legOpening', a: outer, b: inner, confidence: 'high' });
    // Thigh: across the left leg one inch below the crotch.
    const yt = crotch.y + 25.4;
    const xs = horizontalCrossings(poly, yt);
    const legIv = intervalContaining(xs, (crotch.x + outer.x) / 2);
    if (legIv) segments.push({ id: 'thigh', a: { x: legIv[0], y: yt }, b: { x: legIv[1], y: yt }, confidence: 'medium' });
  }
  const anchor = wIv ? { x: (wIv[0] + wIv[1]) / 2, y: bb.minY } : { x: cx, y: bb.minY };
  return {
    type: 'bottom',
    segments,
    landmarks,
    confidence: 0.85,
    outline: anchorOutline(poly, anchor),
    notes,
    orientationScore,
  };
}

/** Outline resampled to 96 points and translated so `anchor` sits at the origin (mm, 0.5 mm grid). */
function anchorOutline(poly: Polygon, anchor: Point): Polygon {
  return resamplePolygon(poly, 96).map((p) => ({
    x: Math.round((p.x - anchor.x) * 2) / 2,
    y: Math.round((p.y - anchor.y) * 2) / 2,
  }));
}

const flip = (poly: Polygon, c: Point): Polygon => poly.map((p) => ({ x: 2 * c.x - p.x, y: 2 * c.y - p.y }));

/**
 * Classify and measure an aligned outline (mm, upright-ish). The symmetry axis
 * fixes the garment's rotation only up to 180°, so both ways up are analysed and
 * the one whose landmarks sit where a garment's do (sleeves above armpits, legs
 * below the crotch) wins.
 */
export function analyseAligned(
  aligned: Polygon,
  hint: GarmentType | 'auto' = 'auto',
): { analysis: GarmentAnalysis; flipped: boolean } | null {
  const c = centroid(aligned);
  const run = (poly: Polygon, kind: GarmentType): GarmentAnalysis | null => {
    const bb = bbox(poly);
    const defects = convexityDefects(poly, Math.max(6, 0.01 * (bb.maxY - bb.minY)));
    return kind === 'top' ? analyseTop(poly, defects, []) : analyseBottom(poly, defects, []);
  };
  const flipped = flip(aligned, c);
  const kinds: GarmentType[] = hint === 'auto' ? ['top', 'bottom'] : [hint];
  for (const kind of kinds) {
    const up = run(aligned, kind);
    const down = run(flipped, kind);
    if (up && down) {
      return up.orientationScore >= down.orientationScore
        ? { analysis: up, flipped: false }
        : { analysis: down, flipped: true };
    }
    if (up && up.orientationScore > -0.02) return { analysis: up, flipped: false };
    if (down && down.orientationScore > -0.02) return { analysis: down, flipped: true };
    if (up) return { analysis: up, flipped: false };
    if (down) return { analysis: down, flipped: true };
  }
  return null;
}

export { flip as rotate180 };
