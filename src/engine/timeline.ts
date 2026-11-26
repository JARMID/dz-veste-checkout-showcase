import {
  clamp,
  clamp01,
  easeInOutCubic,
  easeOutCubic,
  easeOutExpo,
  easeOutQuart,
  lerp,
  progressBetween,
  smoothstep,
  vineBoomImpulse,
  type VineBoomPhysics,
} from './easing';
import type { DiffScript } from '../data/diffScripts';

/**
 * Canonical constants mirrored directly from:
 * D:\Downloads\JP\audio\mastered_founder_voice\MASTERED_VOICE_MANIFEST.json -> hyper
 */
export const TIMELINE_DURATION = 49.43;
export const VINE_BOOM_TRIGGER = 22.59;
export const VINE_BOOM_PEAK = 22.827;

export type ActId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type FocusZone = 'overview' | 'form' | 'cta' | 'baridimob' | 'security' | 'reveal';
export type ContextualPanelKind = 'audit' | 'friction' | 'diff' | 'fraud' | 'reveal';

export interface TimelineChapter {
  readonly act: ActId;
  readonly clip: number;
  readonly code: string;
  readonly title: string;
  readonly shortLabel: string;
  readonly ghostWatermark: string;
  readonly voiceStart: number;
  readonly voiceEnd: number;
  /** Contiguous half-open visual window [windowStart, windowEnd) with zero inter-act gaps */
  readonly windowStart: number;
  readonly windowEnd: number;
  readonly captionSummary: string;
}

export const CHAPTERS: readonly TimelineChapter[] = [
  {
    act: 1,
    clip: 1,
    code: '01',
    title: 'Page COD Classique',
    shortLabel: 'Page COD',
    ghostWatermark: 'AUDIT COD',
    voiceStart: 0.0,
    voiceEnd: 5.32,
    windowStart: 0.0,
    windowEnd: 5.48,
    captionSummary: 'Page COD surchargée : 9 champs, CTA invisible et capture BaridiMob',
  },
  {
    act: 2,
    clip: 2,
    code: '02',
    title: '9 Champs Pour 1 Veste',
    shortLabel: '9 Champs',
    ghostWatermark: '9 CHAMPS',
    voiceStart: 5.48,
    voiceEnd: 9.05,
    windowStart: 5.48,
    windowEnd: 9.21,
    captionSummary: 'Nom, Prénom, Email, Tel 1, Tel 2, Adresse, Code Postal, Wilaya, Commune',
  },
  {
    act: 3,
    clip: 3,
    code: '03',
    title: 'Collapse : 9 → 3 Champs',
    shortLabel: '3 Champs',
    ghostWatermark: '9 → 3 COD',
    voiceStart: 9.21,
    voiceEnd: 12.51,
    windowStart: 9.21,
    windowEnd: 12.67,
    captionSummary: "fields.filter(['nom', 'telephone', 'wilaya']) · 58 Wilayas",
  },
  {
    act: 4,
    clip: 4,
    code: '04',
    title: 'CTA Gris → Luxe 56px',
    shortLabel: 'CTA 56px',
    ghostWatermark: '56PX AAA',
    voiceStart: 12.67,
    voiceEnd: 21.81,
    windowStart: 12.67,
    windowEnd: 22.03,
    captionSummary: 'Contraste 1.54:1 WCAG Fail → 18.6:1 AAA + hauteur pouce 56px',
  },
  {
    act: 5,
    clip: 5,
    code: '05',
    title: 'Faille Capture BaridiMob',
    shortLabel: 'Fraude 780 DA',
    ghostWatermark: 'FAUX REÇU',
    voiceStart: 22.03,
    voiceEnd: 28.23,
    windowStart: 22.03,
    windowEnd: 28.45,
    captionSummary: 'Alerte fraude : capture éditée de 7 800 DA à 780 DA en 10 secondes',
  },
  {
    act: 6,
    clip: 6,
    code: '06',
    title: 'Webhook HMAC + Agent IA',
    shortLabel: 'HMAC + IA',
    ghostWatermark: 'HMAC 18 µs',
    voiceStart: 28.45,
    voiceEnd: 36.66,
    windowStart: 28.45,
    windowEnd: 36.82,
    captionSummary: 'Webhook HMAC Vérifié 18 µs (PostgreSQL RLS) + Agent IA confirmé en 2s',
  },
  {
    act: 7,
    clip: 8,
    code: '07',
    title: 'Avant vs Après · AUDIT 48h',
    shortLabel: 'Reveal 48h',
    ghostWatermark: 'AUDIT 48H',
    voiceStart: 36.82,
    voiceEnd: 49.18,
    windowStart: 36.82,
    windowEnd: TIMELINE_DURATION + 0.01,
    captionSummary: 'Avant : 9 champs · CTA 1.54:1 · Capture 24h → Commente AUDIT (48h)',
  },
] as const;

export interface TimelineFrameState {
  readonly time: number;
  readonly duration: number;
  readonly globalProgress: number;
  readonly act: ActId;
  readonly chapter: TimelineChapter;
  readonly actProgress: number;
  readonly focusZone: FocusZone;
  readonly activePanel: ContextualPanelKind;

  /** 0 = Avant cluttered COD styling, 1 = Apres obsidian luxury storefront */
  readonly themeProgress: number;

  /** 0..1 reveal of initial 3 diagnostic leak badges in Act 1 */
  readonly auditMarkersProgress: number;

  /** 0..1 crimson highlight on the 9 bloated fields in Act 2 */
  readonly formSpotlight: number;
  /** 0..1 collapse progress from 9 inputs down to 3 crisp fields in Act 3 */
  readonly formCollapseProgress: number;
  /** 0..1 strike-through highlight on the 6 removed fields before collapse */
  readonly formStrikeProgress: number;

  /** 0..1 spotlight isolation on the washed-out grey CTA in Act 4 */
  readonly ctaSpotlight: number;
  /** 0..1 transformation from grey #9ca3af/#d1d5db 36px CTA to 56px luxury CTA */
  readonly ctaMorphProgress: number;
  /** 0..1 spacing & 56px thumb caliper overlay visibility in Act 4 */
  readonly ctaCaliperProgress: number;

  /** 0..1 spotlight on the BaridiMob screenshot upload box in Act 5 */
  readonly baridiSpotlight: number;
  /** 0..1 fake receipt tamper animation (7 800 DA -> 780 DA) */
  readonly fraudEditProgress: number;
  /** Exact Vine Boom damped physics peaking at 22.827s */
  readonly vineBoom: VineBoomPhysics;

  /** 0..1 swap from BaridiMob upload box to HMAC Webhook + AI Agent cards in Act 6 */
  readonly securitySwapProgress: number;
  /** 0..1 reveal of PostgreSQL HMAC Verified 18us badge */
  readonly hmacRevealProgress: number;
  /** 0..1 reveal of inline AI Confirmation Agent 2s card */
  readonly aiAgentRevealProgress: number;
  /** 0..1 deterministic green pulse intensity derived purely from sin(t) */
  readonly deterministicPulse: number;

  /** Active VS Code diff panel configuration (null when hidden) */
  readonly activeDiffId: DiffScript['id'] | null;
  /** 0..1 entrance slide/opacity of the floating VS Code diff window */
  readonly diffPanelOpacity: number;
  /** 0..1 deterministic character typing progress inside the active VS Code diff */
  readonly diffTypingProgress: number;

  /** 0..1 Before vs After two-beat laser curtain wipe in Act 7 */
  readonly revealWipeProgress: number;
  /** 0..1 playful rating badge morph (0 = Avant rating, 1 = Apres proof + AUDIT CTA) */
  readonly ratingMorphProgress: number;
  /** 0..1 final JARMID AUDIT 48h footer banner visibility */
  readonly auditFooterProgress: number;
  /** 0..1 deterministic Ken Burns progress on Act 7 jacket showcase */
  readonly heroKenBurns: number;

  /** Camera scale, 3D tilt & breathing offset */
  readonly cameraScale: number;
  readonly cameraTranslateY: number;
  readonly cameraRotateX: number;
  readonly cameraRotateY: number;

  /** WebGL shader atmospheric mood intensities (0..1) */
  readonly shaderCrimson: number;
  readonly shaderEmerald: number;

  /** Deterministic periodic helpers for Capture Mode (zero CSS keyframes) */
  readonly marqueeOffsetPx: number;
  readonly cursorBlinkOn: boolean;
  readonly specularSweepPct: number;
  readonly ghostDriftPx: number;
}

export function getChapterAtTime(rawT: number): TimelineChapter {
  const t = clamp(rawT, 0, TIMELINE_DURATION);
  for (let i = CHAPTERS.length - 1; i >= 0; i -= 1) {
    const ch = CHAPTERS[i]!;
    if (t >= ch.windowStart) {
      return ch;
    }
  }
  return CHAPTERS[0]!;
}

/**
 * Pure, deterministic frame state computation for any timestamp t in [0, 49.43].
 * Every visual attribute in both Capture Mode and Visitor Playback/Scroll derives strictly from this output.
 */
export function computeTimelineFrame(rawT: number): TimelineFrameState {
  const time = clamp(rawT, 0, TIMELINE_DURATION);
  const globalProgress = clamp01(time / TIMELINE_DURATION);
  const chapter = getChapterAtTime(time);
  const act = chapter.act;
  const actProgress = progressBetween(time, chapter.windowStart, chapter.windowEnd);

  // Act 1 diagnostic reticles (0.65s -> 3.4s)
  const auditMarkersProgress = easeOutCubic(progressBetween(time, 0.65, 3.4));

  // Act 2 -> Act 3 Form spotlight and clean 2-beat 9-to-3 collapse
  // Beat A (9.25 -> 9.95s): crimson strike + slide fade-out
  // Beat B (9.90 -> 10.95s): tight clean closure so t=11.0s shows crisp 3 obsidian fields (zero smear!)
  const formSpotlightIn = easeOutCubic(progressBetween(time, 5.48, 6.2));
  const formSpotlightOut = 1 - easeOutCubic(progressBetween(time, 12.2, 12.65));
  const formSpotlight = clamp01(formSpotlightIn * formSpotlightOut);

  const formStrikeProgress = easeOutCubic(progressBetween(time, 9.22, 9.88));
  const formCollapseProgress = easeInOutCubic(progressBetween(time, 9.75, 10.92));

  // Act 4 CTA spotlight and grey -> luxury 56px morph
  const ctaSpotlightIn = easeOutCubic(progressBetween(time, 12.67, 13.45));
  const ctaSpotlightOut = 1 - easeOutCubic(progressBetween(time, 21.55, 22.02));
  const ctaSpotlight = clamp01(ctaSpotlightIn * ctaSpotlightOut);

  const ctaMorphProgress = easeOutQuart(progressBetween(time, 15.65, 18.95));
  const ctaCaliperProgress = clamp01(
    easeOutCubic(progressBetween(time, 16.2, 17.2)) *
      (1 - easeOutCubic(progressBetween(time, 21.35, 21.95)))
  );

  // Act 5 BaridiMob screenshot danger & Vine Boom peak at 22.827s
  const baridiSpotlightIn = easeOutExpo(progressBetween(time, 22.03, 22.55));
  const baridiSpotlightOut = 1 - easeOutCubic(progressBetween(time, 28.0, 28.44));
  const baridiSpotlight = clamp01(baridiSpotlightIn * baridiSpotlightOut);

  const vineBoom = vineBoomImpulse(time, VINE_BOOM_TRIGGER, VINE_BOOM_PEAK);
  const fraudEditProgress = easeOutQuart(progressBetween(time, 22.52, 23.15));

  // Act 6 Security replacement: HMAC 18us + AI Agent 2s
  const securitySwapProgress = easeOutQuart(progressBetween(time, 29.45, 31.2));
  const hmacRevealProgress = easeOutQuart(progressBetween(time, 29.75, 31.65));
  const aiAgentRevealProgress = easeOutQuart(progressBetween(time, 31.45, 33.15));

  // Crisp Avant -> Obsidian dark theme crossfade (zero lingering mid-grey)
  const themePhase1 = easeOutQuart(progressBetween(time, 9.35, 10.45)) * 0.96;
  const themePhase2 = easeOutCubic(progressBetween(time, 15.6, 17.2)) * 0.04;
  const themeProgress = clamp01(themePhase1 + themePhase2);

  // Active VS Code Diff panel routing (Acts 3, 4, 6)
  let activeDiffId: DiffScript['id'] | null = null;
  let diffPanelOpacity = 0;
  let diffTypingProgress = 0;

  if (act === 3) {
    activeDiffId = 'form';
    diffPanelOpacity = clamp01(
      easeOutQuart(progressBetween(time, 9.21, 9.6)) *
        (1 - easeOutCubic(progressBetween(time, 12.3, 12.66)))
    );
    diffTypingProgress = easeOutCubic(progressBetween(time, 9.32, 11.4));
  } else if (act === 4) {
    activeDiffId = 'cta';
    diffPanelOpacity = clamp01(
      easeOutQuart(progressBetween(time, 14.9, 15.4)) *
        (1 - easeOutCubic(progressBetween(time, 21.5, 22.02)))
    );
    diffTypingProgress = easeOutCubic(progressBetween(time, 15.2, 18.75));
  } else if (act === 6) {
    activeDiffId = 'webhook';
    diffPanelOpacity = clamp01(
      easeOutQuart(progressBetween(time, 28.45, 28.95)) *
        (1 - easeOutCubic(progressBetween(time, 36.25, 36.81)))
    );
    diffTypingProgress = easeOutCubic(progressBetween(time, 28.7, 32.35));
  }

  // Act 7 Two-Beat Laser Curtain Reveal:
  // 36.90s..38.10s: fast open 0.12 -> 0.50 | 38.10s..39.35s: crisp comparison hold @ 0.50
  // 39.35s..41.35s: easeOutExpo sweep 0.50 -> 1.00 (full luxury Apres storefront)
  let revealWipeProgress = 0;
  if (time >= 36.82) {
    if (time < 38.1) {
      revealWipeProgress = lerp(0.1, 0.5, easeOutCubic(progressBetween(time, 36.85, 38.1)));
    } else if (time < 39.35) {
      revealWipeProgress = 0.5;
    } else {
      revealWipeProgress = lerp(0.5, 1.0, easeOutExpo(progressBetween(time, 39.35, 41.35)));
    }
  }
  const ratingMorphProgress = easeOutQuart(progressBetween(time, 40.9, 42.9));
  const auditFooterProgress = easeOutQuart(progressBetween(time, 41.6, 43.3));
  const heroKenBurns = smoothstep(37.5, TIMELINE_DURATION, time);

  // Focus zone and companion rail panel routing
  let focusZone: FocusZone = 'overview';
  let activePanel: ContextualPanelKind = 'audit';

  if (act === 1) {
    focusZone = 'overview';
    activePanel = 'audit';
  } else if (act === 2) {
    focusZone = 'form';
    activePanel = 'friction';
  } else if (act === 3) {
    focusZone = 'form';
    activePanel = 'diff';
  } else if (act === 4) {
    focusZone = 'cta';
    activePanel = time >= 14.85 ? 'diff' : 'friction';
  } else if (act === 5) {
    focusZone = 'baridimob';
    activePanel = 'fraud';
  } else if (act === 6) {
    focusZone = 'security';
    activePanel = 'diff';
  } else {
    focusZone = 'reveal';
    activePanel = 'reveal';
  }

  // Subtle alive sin-wave breath + 3D perspective tilt + bounded zoom
  const breathY = Math.sin(time * 1.7) * 2.5;
  let baseScale = 1.0;
  let baseY = 0;
  let cameraRotateX = 0;
  let cameraRotateY = 0;

  if (act === 1) {
    const p = easeOutCubic(progressBetween(time, 0, 4.8));
    baseScale = lerp(0.985, 1.0, p);
    cameraRotateY = lerp(-1.4, 0.4, p);
  } else if (act === 2) {
    const p = easeOutCubic(progressBetween(time, 5.48, 6.6));
    baseScale = lerp(1.0, 1.018, p);
    baseY = lerp(0, -3, p);
    cameraRotateX = lerp(0, 1.2, p);
  } else if (act === 3) {
    const p = easeInOutCubic(progressBetween(time, 9.21, 11.8));
    baseScale = lerp(1.018, 1.008, p);
    baseY = lerp(-3, -1, p);
    cameraRotateY = lerp(0.4, -1.2, p);
  } else if (act === 4) {
    const zoomIn = easeOutCubic(progressBetween(time, 12.67, 14.1));
    const settle = easeInOutCubic(progressBetween(time, 17.5, 20.5));
    baseScale = lerp(1.008, 1.022, zoomIn) - settle * 0.014;
    baseY = lerp(-1, -5, zoomIn) + settle * 3;
    cameraRotateX = lerp(0, -1.4, zoomIn) * (1 - settle * 0.6);
  } else if (act === 5) {
    const snap = easeOutExpo(progressBetween(time, 22.03, 22.65));
    baseScale = lerp(1.008, 1.016, snap);
    baseY = lerp(-2, -3, snap);
    cameraRotateY = vineBoom.impact * 1.5 * Math.cos(time * 32);
  } else if (act === 6) {
    const pull = easeOutCubic(progressBetween(time, 28.45, 30.8));
    baseScale = lerp(1.016, 1.0, pull);
    baseY = lerp(-3, 0, pull);
    cameraRotateY = lerp(0.9, 0, pull);
  } else {
    baseScale = 1.0;
    baseY = 0;
    cameraRotateY = Math.sin((time - 36.82) * 0.6) * 0.8;
  }

  const cameraScale = baseScale * vineBoom.punchScale;
  const cameraTranslateY = baseY + breathY + vineBoom.shakeY;

  // WebGL Obsidian Silk Shader mood blending
  const shaderCrimson = clamp01(baridiSpotlight * 0.55 + vineBoom.impact * 0.85);
  const shaderEmerald = clamp01(
    (act === 3 ? 0.35 : 0) +
      (act === 4 ? ctaMorphProgress * 0.35 : 0) +
      hmacRevealProgress * 0.65 +
      (act === 7 ? 0.55 : 0)
  ) * (1 - shaderCrimson * 0.85);

  // Deterministic periodic visuals derived strictly from t
  const deterministicPulse = 0.5 + 0.5 * Math.sin(time * Math.PI * 2.4);
  const marqueeOffsetPx = -((time * 72) % 360);
  const cursorBlinkOn = Math.floor(time * 2.6) % 2 === 0;
  const specularSweepPct = ((time * 22) % 140) - 20;
  const ghostDriftPx = Math.sin(time * 0.42) * 38;

  return {
    time,
    duration: TIMELINE_DURATION,
    globalProgress,
    act,
    chapter,
    actProgress,
    focusZone,
    activePanel,
    themeProgress,
    auditMarkersProgress,
    formSpotlight,
    formCollapseProgress,
    formStrikeProgress,
    ctaSpotlight,
    ctaMorphProgress,
    ctaCaliperProgress,
    baridiSpotlight,
    fraudEditProgress,
    vineBoom,
    securitySwapProgress,
    hmacRevealProgress,
    aiAgentRevealProgress,
    deterministicPulse,
    activeDiffId,
    diffPanelOpacity,
    diffTypingProgress,
    revealWipeProgress,
    ratingMorphProgress,
    auditFooterProgress,
    heroKenBurns,
    cameraScale,
    cameraTranslateY,
    cameraRotateX,
    cameraRotateY,
    shaderCrimson,
    shaderEmerald,
    marqueeOffsetPx,
    cursorBlinkOn,
    specularSweepPct,
    ghostDriftPx,
  };
}
