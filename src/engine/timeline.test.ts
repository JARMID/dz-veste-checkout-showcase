import { describe, expect, it } from 'vitest';
import { ALGERIA_WILAYAS, getWilayaByCode } from '../data/wilayas';
import { ATLAS_JACKET, AVANT_COD_FIELDS, formatDzd } from '../data/product';
import { DIFF_SCRIPTS } from '../data/diffScripts';
import {
  CHAPTERS,
  TIMELINE_DURATION,
  VINE_BOOM_PEAK,
  VINE_BOOM_TRIGGER,
  computeTimelineFrame,
} from './timeline';
import { vineBoomImpulse } from './easing';
import { computeCursorPose } from '../components/OversizedCursor';
import { parseAppRoute } from '../App';

describe('Algerian 58-Wilaya dataset & product metadata', () => {
  it('contains all 58 unique wilayas numbered 01 through 58', () => {
    expect(ALGERIA_WILAYAS).toHaveLength(58);
    const codes = ALGERIA_WILAYAS.map((w) => w.code);
    expect(new Set(codes).size).toBe(58);
    expect(codes[0]).toBe('01');
    expect(codes[15]).toBe('16');
    expect(codes[57]).toBe('58');
  });

  it('has valid pricing invariants (domicile >= stopDesk > 0) for every wilaya', () => {
    for (const w of ALGERIA_WILAYAS) {
      expect(w.stopDeskDzd).toBeGreaterThanOrEqual(400);
      expect(w.domicileDzd).toBeGreaterThanOrEqual(w.stopDeskDzd);
      expect(w.nameFr.length).toBeGreaterThan(1);
      expect(w.nameAr.length).toBeGreaterThan(1);
    }
    expect(getWilayaByCode('16').nameFr).toBe('Alger');
    expect(getWilayaByCode('99').code).toBe('16');
  });

  it('defines exact 9 Avant COD fields collapsing to 3 kept fields', () => {
    expect(AVANT_COD_FIELDS).toHaveLength(9);
    const kept = AVANT_COD_FIELDS.filter((f) => f.kept).map((f) => f.id);
    expect(kept).toEqual(['nom', 'telephone', 'wilaya']);
    expect(formatDzd(ATLAS_JACKET.priceDzd)).toBe('7 800 DA');
  });
});

describe('Deterministic 49.43s timeline engine (MASTERED_VOICE_MANIFEST -> hyper)', () => {
  it('covers contiguous half-open windows across [0, 49.43] with zero gaps', () => {
    expect(CHAPTERS).toHaveLength(7);
    expect(CHAPTERS[0]!.windowStart).toBe(0);
    for (let i = 0; i < CHAPTERS.length - 1; i += 1) {
      expect(CHAPTERS[i]!.windowEnd).toBeCloseTo(CHAPTERS[i + 1]!.windowStart, 6);
    }
    expect(CHAPTERS[CHAPTERS.length - 1]!.windowEnd).toBeGreaterThanOrEqual(TIMELINE_DURATION);
  });

  it('handles NaN, -Infinity, +Infinity, and out-of-range timestamps safely', () => {
    expect(computeTimelineFrame(Number.NaN).time).toBe(0);
    expect(computeTimelineFrame(-5).time).toBe(0);
    expect(computeTimelineFrame(Number.NEGATIVE_INFINITY).time).toBe(0);
    expect(computeTimelineFrame(999).time).toBe(TIMELINE_DURATION);
    expect(computeTimelineFrame(Number.POSITIVE_INFINITY).time).toBe(0);
  });

  it('keeps all normalized [0..1] progress channels strictly bounded across 500 frames', () => {
    for (let i = 0; i <= 500; i += 1) {
      const t = (i / 500) * TIMELINE_DURATION;
      const f = computeTimelineFrame(t);
      const bounded = [
        f.globalProgress,
        f.themeProgress,
        f.auditMarkersProgress,
        f.formSpotlight,
        f.formCollapseProgress,
        f.formStrikeProgress,
        f.ctaSpotlight,
        f.ctaMorphProgress,
        f.ctaCaliperProgress,
        f.baridiSpotlight,
        f.fraudEditProgress,
        f.securitySwapProgress,
        f.hmacRevealProgress,
        f.aiAgentRevealProgress,
        f.deterministicPulse,
        f.diffPanelOpacity,
        f.diffTypingProgress,
        f.revealWipeProgress,
        f.ratingMorphProgress,
        f.auditFooterProgress,
      ];
      for (const val of bounded) {
        expect(Number.isFinite(val)).toBe(true);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    }
  });

  it('produces identical state for repeated random-access seeks (determinism)', () => {
    const a = computeTimelineFrame(22.83);
    computeTimelineFrame(3.0);
    computeTimelineFrame(44.0);
    const b = computeTimelineFrame(22.83);
    expect(b).toEqual(a);
  });

  it('matches all 6 verification timestamps accurately', () => {
    // t = 3.0s: Cluttered Avant COD page
    const f3 = computeTimelineFrame(3.0);
    expect(f3.act).toBe(1);
    expect(f3.themeProgress).toBe(0);
    expect(f3.formCollapseProgress).toBe(0);
    expect(f3.auditMarkersProgress).toBeGreaterThan(0.75);

    // t = 11.0s: VS Code diff active + collapsing 9 fields -> 3
    const f11 = computeTimelineFrame(11.0);
    expect(f11.act).toBe(3);
    expect(f11.activeDiffId).toBe('form');
    expect(f11.diffPanelOpacity).toBe(1);
    expect(f11.diffTypingProgress).toBeGreaterThan(0.75);
    expect(f11.formCollapseProgress).toBeGreaterThan(0.5);

    // t = 19.0s: CTA contrast + 56px luxury transformation live
    const f19 = computeTimelineFrame(19.0);
    expect(f19.act).toBe(4);
    expect(f19.activeDiffId).toBe('cta');
    expect(f19.ctaMorphProgress).toBeGreaterThan(0.95);
    expect(f19.ctaCaliperProgress).toBe(1);

    // t = 22.827s & 22.83s: Exact Vine Boom impact peak + fraud receipt tamper
    const fPeakExact = computeTimelineFrame(VINE_BOOM_PEAK);
    const f2283 = computeTimelineFrame(22.83);
    expect(fPeakExact.act).toBe(5);
    expect(fPeakExact.vineBoom.impact).toBeCloseTo(1, 3);
    expect(fPeakExact.vineBoom.flashOpacity).toBeGreaterThan(0.4);
    expect(f2283.vineBoom.impact).toBeGreaterThan(0.95);
    expect(f2283.vineBoom.punchScale).toBeGreaterThan(1.045);
    expect(f2283.vineBoom.chromaPx).toBeGreaterThan(2);
    expect(f2283.vineBoom.shockwave).toBeGreaterThan(0);
    expect(f2283.fraudEditProgress).toBeGreaterThan(0.5);
    expect(vineBoomImpulse(VINE_BOOM_TRIGGER - 0.05).impact).toBe(0);

    // Oversized protagonist cursor enters physically, taps Acts 3..6, exits cleanly before Act 7
    expect(computeCursorPose(0.5, '9x16').visible).toBe(false);
    expect(computeCursorPose(9.28, '9x16').scale).toBeLessThan(0.95);
    expect(computeCursorPose(22.66, '16x9').ripple).toBeGreaterThan(0);
    expect(computeCursorPose(44.0, '9x16').visible).toBe(false);
    expect(computeCursorPose(44.0, '16x9').visible).toBe(false);

    // t = 33.0s: PostgreSQL HMAC Verified 18us + AI Confirmation Agent 2s
    const f33 = computeTimelineFrame(33.0);
    expect(f33.act).toBe(6);
    expect(f33.activeDiffId).toBe('webhook');
    expect(f33.hmacRevealProgress).toBe(1);
    expect(f33.aiAgentRevealProgress).toBeGreaterThan(0.85);
    expect(f33.themeProgress).toBe(1);

    // t = 44.0s: Finished luxury dark storefront + rating morph + AUDIT 48h footer
    const f44 = computeTimelineFrame(44.0);
    expect(f44.act).toBe(7);
    expect(f44.revealWipeProgress).toBe(1);
    expect(f44.ratingMorphProgress).toBe(1);
    expect(f44.auditFooterProgress).toBe(1);
    expect(DIFF_SCRIPTS.form.lines.length).toBeGreaterThan(0);
  });

  it('parses URL query routes cleanly with safe fallbacks', () => {
    expect(parseAppRoute('')).toEqual({
      capture: false,
      viewport: '9x16',
      theme: 'dark',
      initialTime: 0,
    });
    expect(parseAppRoute('?capture=1&viewport=16x9&theme=light&t=22.83')).toEqual({
      capture: true,
      viewport: '16x9',
      theme: 'light',
      initialTime: 22.83,
    });
    expect(parseAppRoute('?capture=1&viewport=invalid&t=NaN')).toEqual({
      capture: true,
      viewport: '9x16',
      theme: 'dark',
      initialTime: 0,
    });
  });
});
