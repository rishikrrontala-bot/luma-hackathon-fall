/**
 * Parametric flat-lay garment outlines, in millimetres, with the true landmarks
 * and measurements baked in. Two uses:
 *  1. The benchmark renders these into synthetic photos, so every measurement has
 *     an exact ground truth.
 *  2. The fit check draws a listing's "ghost" outline from its measurements when
 *     the seller didn't share a real one.
 * Frame: x to the right, y down, origin at the top centre of the garment.
 */
import { horizontalCrossings, intervalContaining, type Point, type Polygon } from '../cv/geometry';
import type { MeasurementId } from '../cv/measure';

export interface TopParams {
  kind: 'tee' | 'longsleeve' | 'hoodie';
  /** Flat chest width, 1 inch below the armpits (mm). */
  pitToPit: number;
  /** High point shoulder to hem (mm). */
  length: number;
  /** Shoulder seam to shoulder seam (mm). */
  shoulder: number;
  /** Shoulder seam to cuff, along the top of the sleeve (mm). */
  sleeve: number;
  /** Neck opening width at the high point shoulders (mm). */
  neck?: number;
  /** Shoulder slope (degrees below horizontal). */
  shoulderSlope?: number;
  /** Angle of the sleeves below horizontal, as laid (degrees). */
  sleeveAngle?: number;
  /** Width of the sleeve opening (mm). */
  cuff?: number;
  /** Shoulder seam down to armpit (mm). */
  armhole?: number;
  hoodWidth?: number;
  hoodHeight?: number;
}

export interface BottomParams {
  kind: 'jeans' | 'shorts';
  waist: number;
  rise: number;
  inseam: number;
  legOpening: number;
  /** Flat hip width (mm), at ~65% of the rise. */
  hip?: number;
  /** Horizontal distance of each leg's inner hem corner from the centre (mm). */
  legSpread?: number;
}

export type GarmentParams = TopParams | BottomParams;

export interface Silhouette {
  outline: Polygon;
  landmarks: Record<string, Point>;
  /** Ground-truth segments using exactly the pipeline's definitions. */
  truth: Partial<Record<MeasurementId, { a: Point; b: Point }>>;
  /** Extra paths for realistic rendering (collar, cuffs, pocket, seams); not part of the outline. */
  details: Array<{ kind: 'band' | 'seam' | 'pocket' | 'cord'; points: Point[]; closed?: boolean }>;
}

const rad = (d: number) => (d * Math.PI) / 180;
const mirror = (p: Point): Point => ({ x: -p.x, y: p.y });

/** Quadratic Bézier sampled into points (excluding the start point). */
function quad(p0: Point, c: Point, p1: Point, n = 8): Point[] {
  const out: Point[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push({ x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y });
  }
  return out;
}

export function topSilhouette(p: TopParams): Silhouette {
  const P = p.pitToPit;
  const N = p.neck ?? Math.max(150, 0.34 * P);
  const slope = rad(p.shoulderSlope ?? 18);
  const beta = rad(p.sleeveAngle ?? (p.kind === 'tee' ? 28 : 58));
  const C = p.cuff ?? (p.kind === 'tee' ? 0.34 * P : 0.19 * P);
  const A = p.armhole ?? 0.42 * P;
  const halfS = p.shoulder / 2;
  // With a hood, "HPS" is where the hood seam meets the shoulder; the neck is the hood base.
  const hood = p.kind === 'hoodie';
  const hoodBase = hood ? (p.hoodWidth ?? Math.max(N + 90, 0.55 * P)) : N;
  const hps: Point = { x: hoodBase / 2, y: 0 };
  const sp: Point = { x: halfS, y: (halfS - hoodBase / 2) * Math.tan(slope) };
  const u = { x: Math.cos(beta), y: Math.sin(beta) };
  const n = { x: -Math.sin(beta), y: Math.cos(beta) };
  const cuffTop: Point = { x: sp.x + p.sleeve * u.x, y: sp.y + p.sleeve * u.y };
  const cuffBot: Point = { x: cuffTop.x + C * n.x, y: cuffTop.y + C * n.y };
  const pit: Point = { x: P / 2, y: sp.y + A };
  const hemY = p.length;
  const hemCorner: Point = { x: P / 2 + 0.015 * P, y: hemY };

  const right: Point[] = [hps, sp, cuffTop, cuffBot, pit, hemCorner];
  const outline: Point[] = [];
  // Neck (or hood) across the top, from left HPS to right HPS.
  if (hood) {
    const H = p.hoodHeight ?? 0.62 * P;
    const hw = hoodBase / 2;
    const top: Point[] = [
      { x: -hw, y: 0 },
      ...quad({ x: -hw, y: 0 }, { x: -hw - 25, y: -H * 0.55 }, { x: -hw * 0.55, y: -H }, 10),
      ...quad({ x: -hw * 0.55, y: -H }, { x: 0, y: -H * 1.08 }, { x: hw * 0.55, y: -H }, 8),
      ...quad({ x: hw * 0.55, y: -H }, { x: hw + 25, y: -H * 0.55 }, { x: hw, y: 0 }, 10),
    ];
    outline.push(...top.slice(0, -1));
  } else {
    const dip = 0.09 * N;
    outline.push({ x: -N / 2, y: 0 }, ...quad({ x: -N / 2, y: 0 }, { x: 0, y: dip * 2 }, { x: N / 2, y: 0 }, 10).slice(0, -1));
  }
  outline.push(...right, ...right.slice().reverse().map(mirror));
  // outline now: neck… right side down to hem, then left side back up to left HPS (duplicate removed below)
  outline.pop();

  const yc = pit.y + 25.4;
  // Body side between pit and hem corner is a straight line; chest edge at yc:
  const t = (yc - pit.y) / (hemCorner.y - pit.y);
  const chestX = pit.x + t * (hemCorner.x - pit.x);
  const truth: Silhouette['truth'] = {
    pitToPit: { a: { x: -chestX, y: yc }, b: { x: chestX, y: yc } },
    length: { a: mirror(hps), b: { x: -hps.x, y: hemY } },
    shoulder: { a: mirror(sp), b: sp },
    sleeve: { a: mirror(sp), b: mirror(cuffTop) },
  };
  const details: Silhouette['details'] = [
    { kind: 'band', points: [{ x: -hemCorner.x, y: hemY - 22 }, { x: hemCorner.x, y: hemY - 22 }] },
    { kind: 'band', points: [lerpP(cuffTop, sp, 22 / p.sleeve), lerpP(cuffBot, pit, 22 / Math.max(1, dist2(cuffBot, pit)))] },
    {
      kind: 'band',
      points: [mirror(lerpP(cuffTop, sp, 22 / p.sleeve)), mirror(lerpP(cuffBot, pit, 22 / Math.max(1, dist2(cuffBot, pit))))],
    },
    { kind: 'seam', points: [sp, pit] },
    { kind: 'seam', points: [mirror(sp), mirror(pit)] },
  ];
  if (hood) {
    details.push({
      kind: 'pocket',
      closed: true,
      points: [
        { x: -0.32 * P, y: hemY - 60 },
        { x: -0.22 * P, y: hemY - 0.36 * p.length },
        { x: 0.22 * P, y: hemY - 0.36 * p.length },
        { x: 0.32 * P, y: hemY - 60 },
      ],
    });
    details.push({ kind: 'cord', points: [{ x: -38, y: 10 }, { x: -44, y: 170 }] });
    details.push({ kind: 'cord', points: [{ x: 38, y: 10 }, { x: 46, y: 175 }] });
  } else {
    details.push({ kind: 'band', points: quad({ x: -N / 2, y: 0 }, { x: 0, y: 0.09 * N * 2 + 40 }, { x: N / 2, y: 0 }, 12) });
  }
  return {
    outline,
    landmarks: { hpsL: mirror(hps), hpsR: hps, shoulderL: mirror(sp), shoulderR: sp, pitL: mirror(pit), pitR: pit, cuffTop: mirror(cuffTop) },
    truth,
    details,
  };
}

function lerpP(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
const dist2 = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function bottomSilhouette(p: BottomParams): Silhouette {
  const W = p.waist;
  const R = p.rise;
  const hip = p.hip ?? W * 1.2;
  const spread = p.legSpread ?? (p.kind === 'jeans' ? 45 : 30);
  const dy = Math.sqrt(Math.max(1, p.inseam * p.inseam - spread * spread));
  const hemY = R + dy;
  const crotch: Point = { x: 0, y: R };
  const inner: Point = { x: spread, y: hemY };
  const outer: Point = { x: spread + p.legOpening, y: hemY };
  const waistR: Point = { x: W / 2, y: 0 };
  const hipR: Point = { x: hip / 2, y: 0.65 * R };
  // Right half, clockwise from the waist centre: waist → hip → outer hem → inner hem → crotch.
  const right: Point[] = [waistR, ...quad(waistR, { x: hip / 2, y: 0.25 * R }, hipR, 6), outer, inner];
  const outline: Point[] = [
    ...right,
    crotch,
    ...right.slice().reverse().map(mirror),
  ];
  // Truth uses the exact same definitions as the pipeline, read off the outline itself.
  const yw = 5;
  const waistIv = intervalContaining(horizontalCrossings(outline, yw), 0) ?? [-W / 2, W / 2];
  const yt = R + 25.4;
  const thighIv = intervalContaining(horizontalCrossings(outline, yt), -(spread + p.legOpening / 2)) ?? [0, 0];
  const truth: Silhouette['truth'] = {
    waist: { a: { x: waistIv[0], y: yw }, b: { x: waistIv[1], y: yw } },
    rise: { a: { x: 0, y: 0 }, b: crotch },
    inseam: { a: crotch, b: mirror(inner) },
    outseam: { a: { x: waistIv[0], y: yw }, b: mirror(outer) },
    legOpening: { a: mirror(outer), b: mirror(inner) },
    thigh: { a: { x: thighIv[0], y: yt }, b: { x: thighIv[1], y: yt } },
  };
  const details: Silhouette['details'] = [
    { kind: 'band', points: [{ x: -W / 2, y: 38 }, { x: W / 2, y: 38 }] },
    { kind: 'seam', points: [{ x: 0, y: 38 }, { x: 0, y: R - 25 }] },
    { kind: 'pocket', points: quad({ x: -W / 2 + 20, y: 45 }, { x: -W / 2 + 40, y: 120 }, { x: -W / 2 + 120, y: 50 }, 8) },
    { kind: 'pocket', points: quad({ x: W / 2 - 20, y: 45 }, { x: W / 2 - 40, y: 120 }, { x: W / 2 - 120, y: 50 }, 8) },
    { kind: 'band', points: [{ x: -outer.x + 4, y: hemY - 20 }, { x: -inner.x - 4, y: hemY - 20 }] },
    { kind: 'band', points: [{ x: inner.x + 4, y: hemY - 20 }, { x: outer.x - 4, y: hemY - 20 }] },
  ];
  return {
    outline,
    landmarks: { crotch, hemInner: mirror(inner), hemOuter: mirror(outer) },
    truth,
    details,
  };
}

export function silhouette(p: GarmentParams): Silhouette {
  return p.kind === 'jeans' || p.kind === 'shorts' ? bottomSilhouette(p as BottomParams) : topSilhouette(p as TopParams);
}

/** A plausible outline drawn from listing numbers alone (for the fit check's ghost). */
export function silhouetteFromMeasurements(
  type: 'top' | 'bottom',
  m: Partial<Record<MeasurementId, number>>,
): Silhouette | null {
  if (type === 'top') {
    if (!m.pitToPit || !m.length) return null;
    const shoulder = m.shoulder ?? m.pitToPit * 0.9;
    const sleeve = m.sleeve ?? m.pitToPit * 0.42;
    return topSilhouette({ kind: sleeve > m.pitToPit * 0.8 ? 'longsleeve' : 'tee', pitToPit: m.pitToPit, length: m.length, shoulder, sleeve });
  }
  if (!m.waist || !m.inseam) return null;
  return bottomSilhouette({
    kind: m.inseam > 450 ? 'jeans' : 'shorts',
    waist: m.waist,
    rise: m.rise ?? 280,
    inseam: m.inseam,
    legOpening: m.legOpening ?? m.waist * 0.45,
  });
}
