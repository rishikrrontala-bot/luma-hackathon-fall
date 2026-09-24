/**
 * 2-D geometry on plain `{x, y}` points. Everything here is pure and allocation-light,
 * so it runs the same in the browser worker, in Node for the benchmark and in Vitest.
 */

export interface Point {
  x: number;
  y: number;
}

export type Polygon = Point[];

export const pt = (x: number, y: number): Point => ({ x, y });

export const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
export const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
export const scale = (a: Point, k: number): Point => ({ x: a.x * k, y: a.y * k });
export const dot = (a: Point, b: Point): number => a.x * b.x + a.y * b.y;
export const cross = (a: Point, b: Point): number => a.x * b.y - a.y * b.x;
export const dist = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
export const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** Signed area (positive when the vertices run counter-clockwise in a y-up frame). */
export function signedArea(poly: Polygon): number {
  let s = 0;
  for (let i = 0, n = poly.length; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

export const polygonArea = (poly: Polygon): number => Math.abs(signedArea(poly));

export function perimeter(poly: Polygon, closed = true): number {
  let s = 0;
  const n = poly.length;
  for (let i = 0; i < n - (closed ? 0 : 1); i++) s += dist(poly[i], poly[(i + 1) % n]);
  return s;
}

/** Area centroid of a simple polygon. */
export function centroid(poly: Polygon): Point {
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0, n = poly.length; i < n; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % n];
    const c = p.x * q.y - q.x * p.y;
    a += c;
    cx += (p.x + q.x) * c;
    cy += (p.y + q.y) * c;
  }
  if (Math.abs(a) < 1e-12) {
    const m = poly.reduce((acc, p) => add(acc, p), pt(0, 0));
    return scale(m, 1 / Math.max(1, poly.length));
  }
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

/** Perpendicular distance from `p` to the infinite line through `a` and `b`. */
export function distToLine(p: Point, a: Point, b: Point): number {
  const d = dist(a, b);
  if (d === 0) return dist(p, a);
  return Math.abs(cross(sub(b, a), sub(p, a))) / d;
}

/** Distance from `p` to the segment `ab`. */
export function distToSegment(p: Point, a: Point, b: Point): number {
  const ab = sub(b, a);
  const len2 = dot(ab, ab);
  if (len2 === 0) return dist(p, a);
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / len2));
  return dist(p, lerp(a, b, t));
}

/**
 * Ramer–Douglas–Peucker simplification of an open polyline (iterative, so long
 * contours can't blow the stack). Keeps the first and last points.
 */
export function simplifyPolyline(points: Point[], epsilon: number): Point[] {
  const n = points.length;
  if (n < 3) return points.slice();
  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;
  const stack: Array<[number, number]> = [[0, n - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    let maxD = -1;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = distToSegment(points[i], points[s], points[e]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > epsilon && idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  const out: Point[] = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(points[i]);
  return out;
}

/**
 * RDP on a closed polygon: split at the two mutually farthest-apart vertices so the
 * result doesn't depend on where the contour trace happened to start.
 */
export function simplifyPolygon(poly: Polygon, epsilon: number): Polygon {
  const n = poly.length;
  if (n < 4) return poly.slice();
  // Farthest point from vertex 0, then farthest from that: a cheap diameter estimate.
  let i0 = 0;
  let best = -1;
  for (let i = 0; i < n; i++) {
    const d = dist(poly[0], poly[i]);
    if (d > best) {
      best = d;
      i0 = i;
    }
  }
  let i1 = i0;
  best = -1;
  for (let i = 0; i < n; i++) {
    const d = dist(poly[i0], poly[i]);
    if (d > best) {
      best = d;
      i1 = i;
    }
  }
  const [a, b] = i0 < i1 ? [i0, i1] : [i1, i0];
  const first = poly.slice(a, b + 1);
  const second = poly.slice(b).concat(poly.slice(0, a + 1));
  const s1 = simplifyPolyline(first, epsilon);
  const s2 = simplifyPolyline(second, epsilon);
  return s1.slice(0, -1).concat(s2.slice(0, -1));
}

/** Andrew's monotone chain. Returns hull vertex *indices* into `points`, counter-clockwise in a y-up frame. */
export function convexHullIndices(points: Point[]): number[] {
  const n = points.length;
  if (n < 3) return points.map((_, i) => i);
  const idx = points.map((_, i) => i).sort((i, j) => points[i].x - points[j].x || points[i].y - points[j].y);
  const turn = (o: number, a: number, b: number) => cross(sub(points[a], points[o]), sub(points[b], points[o]));
  const lower: number[] = [];
  for (const i of idx) {
    while (lower.length >= 2 && turn(lower[lower.length - 2], lower[lower.length - 1], i) <= 0) lower.pop();
    lower.push(i);
  }
  const upper: number[] = [];
  for (let k = idx.length - 1; k >= 0; k--) {
    const i = idx[k];
    while (upper.length >= 2 && turn(upper[upper.length - 2], upper[upper.length - 1], i) <= 0) upper.pop();
    upper.push(i);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

export const convexHull = (points: Point[]): Point[] => convexHullIndices(points).map((i) => points[i]);

export interface Defect {
  /** Index into the polygon of the deepest point of the concavity. */
  index: number;
  point: Point;
  /** Distance from the hull edge to the deepest point. */
  depth: number;
  /** Hull edge endpoints bracketing the concavity. */
  start: Point;
  end: Point;
}

/**
 * Convexity defects of a simple polygon: for each hull edge, the polygon vertex
 * between its endpoints that lies farthest from it (like OpenCV's convexityDefects).
 * The armpits of a flat-laid shirt and the crotch of a pair of trousers are exactly
 * these points.
 */
export function convexityDefects(poly: Polygon, minDepth = 0): Defect[] {
  const n = poly.length;
  if (n < 4) return [];
  const hull = convexHullIndices(poly).sort((a, b) => a - b);
  const defects: Defect[] = [];
  for (let h = 0; h < hull.length; h++) {
    const s = hull[h];
    const e = hull[(h + 1) % hull.length];
    const span = (e - s + n) % n;
    if (span < 2) continue;
    let bestD = -1;
    let bestI = -1;
    for (let k = 1; k < span; k++) {
      const i = (s + k) % n;
      const d = distToLine(poly[i], poly[s], poly[e]);
      if (d > bestD) {
        bestD = d;
        bestI = i;
      }
    }
    if (bestI >= 0 && bestD >= minDepth) {
      defects.push({ index: bestI, point: poly[bestI], depth: bestD, start: poly[s], end: poly[e] });
    }
  }
  return defects.sort((a, b) => b.depth - a.depth);
}

/** Even–odd point-in-polygon test. */
export function pointInPolygon(p: Point, poly: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** Sorted x-coordinates where the horizontal line `y` crosses the polygon's edges. */
export function horizontalCrossings(poly: Polygon, y: number): number[] {
  const xs: number[] = [];
  for (let i = 0, n = poly.length; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    if (a.y > y !== b.y > y) xs.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y));
  }
  return xs.sort((p, q) => p - q);
}

/** Sorted y-coordinates where the vertical line `x` crosses the polygon's edges. */
export function verticalCrossings(poly: Polygon, x: number): number[] {
  const ys: number[] = [];
  for (let i = 0, n = poly.length; i < n; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % n];
    if (a.x > x !== b.x > x) ys.push(a.y + ((x - a.x) * (b.y - a.y)) / (b.x - a.x));
  }
  return ys.sort((p, q) => p - q);
}

/** The inside interval of a horizontal scanline that contains `x`, or null. */
export function intervalContaining(crossings: number[], x: number): [number, number] | null {
  for (let i = 0; i + 1 < crossings.length; i += 2) {
    if (crossings[i] <= x && x <= crossings[i + 1]) return [crossings[i], crossings[i + 1]];
  }
  return null;
}

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function bbox(points: Point[]): BBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

/** Rotate `p` by `angle` radians about `c`. */
export function rotateAbout(p: Point, c: Point, angle: number): Point {
  const cs = Math.cos(angle);
  const sn = Math.sin(angle);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * cs - dy * sn, y: c.y + dx * sn + dy * cs };
}

/**
 * Total-least-squares line fit. Returns a point on the line and a unit direction.
 * Used to refine paper edges to sub-pixel precision from many contour pixels.
 */
export function fitLine(points: Point[]): { p: Point; d: Point } {
  const n = points.length;
  let mx = 0;
  let my = 0;
  for (const q of points) {
    mx += q.x;
    my += q.y;
  }
  mx /= n;
  my /= n;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const q of points) {
    const dx = q.x - mx;
    const dy = q.y - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  // Principal eigenvector of the 2×2 scatter matrix.
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return { p: { x: mx, y: my }, d: { x: Math.cos(theta), y: Math.sin(theta) } };
}

/** Intersection of two infinite lines given as point + direction; null when parallel. */
export function intersectLines(p1: Point, d1: Point, p2: Point, d2: Point): Point | null {
  const den = cross(d1, d2);
  if (Math.abs(den) < 1e-12) return null;
  const t = cross(sub(p2, p1), d2) / den;
  return add(p1, scale(d1, t));
}

/** Exterior turning angle (radians, 0 = straight) at vertex `b` of the path a→b→c. */
export function turnAngle(a: Point, b: Point, c: Point): number {
  const u = sub(b, a);
  const v = sub(c, b);
  const lu = Math.hypot(u.x, u.y);
  const lv = Math.hypot(v.x, v.y);
  if (lu === 0 || lv === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot(u, v) / (lu * lv)));
  return Math.acos(cos);
}

/** Walk a closed polygon from index `from` to index `to` in the +1 direction (inclusive). */
export function walk(poly: Polygon, from: number, to: number): Point[] {
  const n = poly.length;
  const out: Point[] = [];
  for (let i = from; ; i = (i + 1) % n) {
    out.push(poly[i]);
    if (i === to) break;
    if (out.length > n) break;
  }
  return out;
}

/** Index of the polygon vertex nearest to `p`. */
export function nearestIndex(poly: Polygon, p: Point): number {
  let best = Infinity;
  let bi = 0;
  for (let i = 0; i < poly.length; i++) {
    const d = (poly[i].x - p.x) ** 2 + (poly[i].y - p.y) ** 2;
    if (d < best) {
      best = d;
      bi = i;
    }
  }
  return bi;
}

/** Resample a closed polygon to `count` points evenly spaced along its perimeter. */
export function resamplePolygon(poly: Polygon, count: number): Polygon {
  const n = poly.length;
  if (n === 0) return [];
  const total = perimeter(poly);
  const step = total / count;
  const out: Point[] = [];
  let seg = 0;
  let segStart = poly[0];
  let segEnd = poly[1 % n];
  let segLen = dist(segStart, segEnd);
  let along = 0;
  for (let k = 0; k < count; k++) {
    const target = k * step;
    while (along + segLen < target && seg < n) {
      along += segLen;
      seg++;
      segStart = poly[seg % n];
      segEnd = poly[(seg + 1) % n];
      segLen = dist(segStart, segEnd);
    }
    const t = segLen > 0 ? (target - along) / segLen : 0;
    out.push(lerp(segStart, segEnd, Math.max(0, Math.min(1, t))));
  }
  return out;
}
