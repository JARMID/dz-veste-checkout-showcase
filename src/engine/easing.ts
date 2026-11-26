/**
 * Pure deterministic easing and physics helpers for 60fps window.__seek(t).
 * Zero wall-clock timers, zero randomness, NaN/Infinity hardened.
 */

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const u = clamp01((x - edge0) / (edge1 - edge0));
  return u * u * (3 - 2 * u);
}

export function easeOutCubic(t: number): number {
  const u = clamp01(t);
  return 1 - Math.pow(1 - u, 3);
}

export function easeOutQuart(t: number): number {
  const u = clamp01(t);
  return 1 - Math.pow(1 - u, 4);
}

export function easeOutExpo(t: number): number {
  const u = clamp01(t);
  return u >= 1 ? 1 : 1 - Math.pow(2, -10 * u);
}

export function easeInOutCubic(t: number): number {
  const u = clamp01(t);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

export function progressBetween(t: number, start: number, end: number): number {
  if (!Number.isFinite(t) || end <= start) return t >= end ? 1 : 0;
  return clamp01((t - start) / (end - start));
}

export interface VineBoomPhysics {
  /** 0..1 anticipation compression ramp from triggerSec (22.59s) to peakSec (22.827s) */
  readonly anticipation: number;
  /** 0..1 impact energy peaking at exact peakSec (22.827s) */
  readonly impact: number;
  /** Horizontal damped shake offset in px (bounded inside safe cushion) */
  readonly shakeX: number;
  /** Vertical damped shake offset in px (bounded inside safe cushion) */
  readonly shakeY: number;
  /** Camera punch scale multiplier (0.976 compression -> 1.052 impact snap) */
  readonly punchScale: number;
  /** Crimson laser rim flash intensity (0 .. 0.44) */
  readonly flashOpacity: number;
  /** Crisp 2-frame white strike border flash (0..1 right around 22.827s) */
  readonly whiteFlash: number;
  /** Expanding shockwave ring progress (0..1 over 0.45s after 22.80s) */
  readonly shockwave: number;
  /** Horizontal RGB chromatic aberration split offset in px (0..5px) */
  readonly chromaPx: number;
}

/**
 * Exact Vine Boom visual physics synchronized to MASTERED_VOICE_MANIFEST.json -> hyper:
 *   vine_boom_trigger_sec = 22.59
 *   vine_boom_peak_sec    = 22.827
 *
 * Uses anticipation compression (22.59 -> 22.79s) dipping slightly inward before snapping
 * sharply outward at 22.827s with zero C0 jump across 60fps frame quantization.
 */
export function vineBoomImpulse(
  t: number,
  triggerSec = 22.59,
  peakSec = 22.827
): VineBoomPhysics {
  if (!Number.isFinite(t) || t < triggerSec || t > peakSec + 0.72) {
    return {
      anticipation: 0,
      impact: 0,
      shakeX: 0,
      shakeY: 0,
      punchScale: 1,
      flashOpacity: 0,
      whiteFlash: 0,
      shockwave: 0,
      chromaPx: 0,
    };
  }

  const anticipation = smoothstep(triggerSec, peakSec, t);

  if (t < peakSec) {
    // 22.59 -> 22.79s: inhale compression dip (1.0 -> 0.978); 22.79 -> 22.827s: snap upward
    const preHit = smoothstep(peakSec - 0.037, peakSec, t);
    const compress = smoothstep(triggerSec, peakSec - 0.04, t) * (1 - preHit);
    return {
      anticipation,
      impact: preHit * 0.96,
      shakeX: Math.sin(preHit * Math.PI * 0.5) * 5,
      shakeY: -preHit * 4,
      punchScale: 1 - compress * 0.022 + preHit * 0.052,
      flashOpacity: preHit * 0.36,
      whiteFlash: preHit * 0.85,
      shockwave: preHit * 0.14,
      chromaPx: preHit * 4.5,
    };
  }

  const dt = t - peakSec;
  const decay = Math.exp(-dt * 7.8);
  const shakeX = Math.cos(dt * 86) * 8.5 * decay;
  const shakeY = Math.sin(dt * 108 + 0.6) * 6 * decay;
  const punchScale = 1 + 0.052 * Math.exp(-dt * 9.5);
  const flashOpacity = 0.44 * Math.exp(-dt * 6.5);
  const whiteFlash = Math.exp(-dt * 28);
  const shockwave = clamp01(0.14 + dt / 0.44);
  const chromaPx = 5.0 * Math.exp(-dt * 8.5);

  return {
    anticipation: 1,
    impact: clamp01(decay),
    shakeX,
    shakeY,
    punchScale,
    flashOpacity,
    whiteFlash,
    shockwave,
    chromaPx,
  };
}
