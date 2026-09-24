/**
 * Planar homographies. A sheet of paper with known size gives four point
 * correspondences between the photo and the floor plane (in millimetres); the
 * homography then maps any pixel on the floor to real-world millimetres, which
 * removes the camera's perspective from every measurement.
 */
import type { Point } from './geometry';

/** Row-major 3×3 matrix. */
export type Mat3 = [number, number, number, number, number, number, number, number, number];

/** Solve `A x = b` (n×n, row-major) by Gaussian elimination with partial pivoting. */
export function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-12) throw new Error('singular system');
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

/**
 * Direct linear transform from exactly four correspondences `src[i] → dst[i]`,
 * with h33 fixed to 1 (an 8×8 linear system).
 */
export function homographyFromPoints(src: Point[], dst: Point[]): Mat3 {
  if (src.length !== 4 || dst.length !== 4) throw new Error('need exactly 4 correspondences');
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i];
    const { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const h = solveLinear(A, b);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

export function applyHomography(H: Mat3, p: Point): Point {
  const w = H[6] * p.x + H[7] * p.y + H[8];
  return { x: (H[0] * p.x + H[1] * p.y + H[2]) / w, y: (H[3] * p.x + H[4] * p.y + H[5]) / w };
}

export function invertMat3(m: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-15) throw new Error('matrix not invertible');
  const k = 1 / det;
  return [
    A * k,
    -(b * i - c * h) * k,
    (b * f - c * e) * k,
    B * k,
    (a * i - c * g) * k,
    -(a * f - c * d) * k,
    C * k,
    -(a * h - b * g) * k,
    (a * e - b * d) * k,
  ];
}

export function multiplyMat3(a: Mat3, b: Mat3): Mat3 {
  const r = new Array<number>(9).fill(0) as Mat3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[i * 3 + k] * b[k * 3 + j];
      r[i * 3 + j] = s;
    }
  return r;
}

type V3 = [number, number, number];
const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export interface AspectEstimate {
  /** Estimated true width/height ratio of the rectangle, where width is the m1→m2 edge. */
  ratio: number;
  /** Estimated focal length in pixels, or null when the view is too close to fronto-parallel to tell. */
  focal: number | null;
}

/**
 * Recover the true aspect ratio of a rectangle from one perspective photo of it,
 * following Zhang & He, "Whiteboard scanning and image enhancement" (Digital Signal
 * Processing 17(2), 2007). Assumes square pixels and a principal point at the image
 * centre, which holds well for phone cameras.
 *
 * Corners follow the paper's convention: m1 = (0,0), m2 = (w,0), m3 = (0,h), m4 = (w,h),
 * i.e. top-left, top-right, bottom-left, bottom-right of the rectangle.
 */
export function estimateRectangleAspect(
  m1p: Point,
  m2p: Point,
  m3p: Point,
  m4p: Point,
  imageWidth: number,
  imageHeight: number,
): AspectEstimate {
  const u0 = imageWidth / 2;
  const v0 = imageHeight / 2;
  const h = (p: Point): V3 => [p.x, p.y, 1];
  const m1 = h(m1p);
  const m2 = h(m2p);
  const m3 = h(m3p);
  const m4 = h(m4p);
  const k2 = dot3(cross3(m1, m4), m3) / dot3(cross3(m2, m4), m3);
  const k3 = dot3(cross3(m1, m4), m2) / dot3(cross3(m3, m4), m2);
  const n2: V3 = [k2 * m2[0] - m1[0], k2 * m2[1] - m1[1], k2 * m2[2] - m1[2]];
  const n3: V3 = [k3 * m3[0] - m1[0], k3 * m3[1] - m1[1], k3 * m3[2] - m1[2]];
  const [n21, n22, n23] = n2;
  const [n31, n32, n33] = n3;

  // Near-fronto-parallel: the third components vanish and the focal length is unobservable.
  const scaleRef = Math.max(Math.abs(n21), Math.abs(n22), Math.abs(n31), Math.abs(n32), 1e-9);
  if (Math.abs(n23) / scaleRef < 1e-4 || Math.abs(n33) / scaleRef < 1e-4) {
    return { ratio: Math.sqrt((n21 * n21 + n22 * n22) / (n31 * n31 + n32 * n32)), focal: null };
  }

  const f2 =
    -(
      n21 * n31 -
      (n21 * n33 + n23 * n31) * u0 +
      n23 * n33 * u0 * u0 +
      (n22 * n32 - (n22 * n33 + n23 * n32) * v0 + n23 * n33 * v0 * v0)
    ) /
    (n23 * n33);

  if (!(f2 > 0) || !Number.isFinite(f2)) {
    // Noise can push f² negative for nearly frontal shots; fall back to the affine ratio.
    return { ratio: Math.sqrt((n21 * n21 + n22 * n22) / (n31 * n31 + n32 * n32)), focal: null };
  }
  const f = Math.sqrt(f2);
  // q = A^-1 n, with A = [[f,0,u0],[0,f,v0],[0,0,1]].
  const q = (n: V3): V3 => [(n[0] - u0 * n[2]) / f, (n[1] - v0 * n[2]) / f, n[2]];
  const q2 = q(n2);
  const q3 = q(n3);
  return { ratio: Math.sqrt(dot3(q2, q2) / dot3(q3, q3)), focal: f };
}
