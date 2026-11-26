import React from 'react';
import { clamp01, easeOutExpo, progressBetween } from '../engine/easing';

export interface CaptionPhrase {
  readonly start: number;
  readonly end: number;
  readonly words: readonly { text: string; accent?: 'emerald' | 'crimson' | 'chalk'; ltr?: boolean }[];
}

/**
 * Verbatim word-anchored kinetic captions matching Khalef Abdelmadjid's EXACT spoken
 * Algerian Darija & French audio in `hyper_master_with_vineboom.wav` (49.43s, Vine Boom @ 22.83s).
 */
export const HYPER_CAPTION_PHRASES: readonly CaptionPhrase[] = [
  // Clip 1: 0.00s - 5.32s ("صايي لي e-commerçants تاع دزاير، عندكم باج تاع كوموند هنا، بانتلي تسحق شوية خدمة.")
  {
    start: 0.0,
    end: 2.65,
    words: [
      { text: 'صايي لي' },
      { text: 'e-commerçants', accent: 'chalk', ltr: true },
      { text: 'تاع دزاير،' },
    ],
  },
  {
    start: 2.65,
    end: 5.4,
    words: [
      { text: 'عندكم باج تاع كوموند هنا،' },
      { text: 'بانتلي تسحق شوية خدمة.', accent: 'crimson' },
    ],
  },
  // Clip 2: 5.48s - 9.05s ("نبداو بهاد الفورمولار اللي فيه neuf champs غير باش يشري فيستا.")
  {
    start: 5.48,
    end: 9.15,
    words: [
      { text: 'نبداو بهاد الفورمولار اللي فيه' },
      { text: '9 champs', accent: 'crimson', ltr: true },
      { text: 'غير باش يشري فيستا.' },
    ],
  },
  // Clip 3: 9.21s - 12.51s ("نحو قاع هاد الشي نخلو غير le nom، numéro، والولاية.")
  {
    start: 9.21,
    end: 12.6,
    words: [
      { text: 'نحو قاع هاد الشي نخلو غير' },
      { text: 'le nom', accent: 'emerald', ltr: true },
      { text: '،' },
      { text: 'numéro', accent: 'emerald', ltr: true },
      { text: 'والولاية.', accent: 'emerald' },
    ],
  },
  // Clip 4: 12.67s - 21.81s ("والبوطون هادا وعلاه راهو غري؟ ما تعرف إذا يتكليكا ولا لالا. نديرولو كونتراست واضح، نقسمولو spacing، ونكبروه للتيليفون.")
  {
    start: 12.67,
    end: 16.85,
    words: [
      { text: 'والبوطون هادا وعلاه راهو' },
      { text: 'غري؟', accent: 'crimson' },
      { text: 'ما تعرف إذا يتكليكا ولا لالا.' },
    ],
  },
  {
    start: 16.85,
    end: 21.95,
    words: [
      { text: 'نديرولو كونتراست واضح،', accent: 'emerald' },
      { text: 'spacing', accent: 'chalk', ltr: true },
      { text: 'ونكبروه للتيليفون.', accent: 'emerald' },
    ],
  },
  // Clip 5: 22.03s - 28.23s ("هايليك الديڨاااا ابعتلي سكرينشوت بريديموب. هادي راك تقولهم ديرولي فوتوشوب باش نتفاهمو.")
  {
    start: 22.03,
    end: 25.0,
    words: [
      { text: 'هايليك الديڨاااا!', accent: 'crimson' },
      { text: 'ابعتلي سكرينشوت بريديموب.', accent: 'crimson' },
    ],
  },
  {
    start: 25.0,
    end: 28.38,
    words: [
      { text: 'هادي راك تقولهم' },
      { text: 'ديرولي فوتوشوب', accent: 'crimson' },
      { text: 'باش نتفاهمو.' },
    ],
  },
  // Clip 6: 28.45s - 36.66s ("بون نبدلوها بـ webhook check اللي مبلوكي في PostgreSQL، ونزيدو agent AI اللي يكونفيرمي لا كوموند في زوج ثواني بلا ما يستناو حتى لغدوة.")
  {
    start: 28.45,
    end: 32.55,
    words: [
      { text: 'نبدلوها بـ' },
      { text: 'webhook check', accent: 'emerald', ltr: true },
      { text: 'مبلوكي في' },
      { text: 'PostgreSQL', accent: 'emerald', ltr: true },
    ],
  },
  {
    start: 32.55,
    end: 36.75,
    words: [
      { text: 'ونزيدو' },
      { text: 'agent AI', accent: 'emerald', ltr: true },
      { text: 'يكونفيرمي في زوج ثواني', accent: 'emerald' },
      { text: 'بلا ما يستناو لغدوة.' },
    ],
  },
  // Clip 8: 36.82s - 49.43s ("Franchement la page القديمة نمدلها 3 commandes perdues على 17 boutons cassés، خاطر التقييم أصلا ما عندو حتى معنى. حاب نعاودلك تاعك ولا نخدمك وحدة جديدة personnalisée كيما تحب في 48 ساعة، اكتبلي audit في لي كومونتار.")
  {
    start: 36.82,
    end: 42.4,
    words: [
      { text: 'la page القديمة نمدلها' },
      { text: '3 commandes perdues', accent: 'crimson', ltr: true },
      { text: 'على' },
      { text: '17 boutons cassés', accent: 'crimson', ltr: true },
    ],
  },
  {
    start: 42.4,
    end: 45.4,
    words: [
      { text: 'خاطر التقييم أصلا' },
      { text: 'ما عندو حتى معنى.', accent: 'chalk' },
    ],
  },
  {
    start: 45.4,
    end: 49.5,
    words: [
      { text: 'حاب نعاودلك تاعك في' },
      { text: '48h', accent: 'emerald', ltr: true },
      { text: 'اكتبلي' },
      { text: 'AUDIT', accent: 'emerald', ltr: true },
      { text: 'في لي كومونتار.' },
    ],
  },
] as const;

export interface KineticCaptionBarProps {
  time: number;
  compact?: boolean;
  theme?: 'light' | 'dark';
}

export const KineticCaptionBar: React.FC<KineticCaptionBarProps> = React.memo(
  ({ time, compact = false, theme = 'dark' }) => {
    const active =
      HYPER_CAPTION_PHRASES.find((p) => time >= p.start && time < p.end) ??
      HYPER_CAPTION_PHRASES[HYPER_CAPTION_PHRASES.length - 1]!;

    const localP = clamp01(progressBetween(time, active.start, active.end));
    const entryP = easeOutExpo(progressBetween(time, active.start, active.start + 0.2));
    const wordCount = active.words.length;
    const activeWordIdx = Math.min(wordCount - 1, Math.floor(localP * wordCount));
    const isLight = theme === 'light';

    return (
      <div
        className="flex w-full justify-center"
        style={{
          opacity: entryP,
          transform: `translate3d(0, ${(1 - entryP) * 10}px, 0)`,
        }}
      >
        <div
          dir="rtl"
          className={`inline-flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 rounded-[22px] border backdrop-blur-xl ${
            isLight
              ? 'border-[#09090b]/15 bg-[#0b1120]/94 shadow-[0_18px_42px_rgba(15,23,42,0.22)]'
              : 'border-white/[0.16] bg-[#07080b]/94 shadow-[0_18px_46px_rgba(0,0,0,0.68)]'
          } ${compact ? 'px-7 py-4' : 'px-4 py-2.5 sm:px-6 sm:py-3'}`}
        >
          {active.words.map((w, idx) => {
            const isCurrent = idx === activeWordIdx;
            const isPast = idx < activeWordIdx;
            const color =
              w.accent === 'crimson'
                ? '#f87171'
                : w.accent === 'emerald'
                  ? '#34d399'
                  : isCurrent || w.accent === 'chalk'
                    ? '#ffffff'
                    : isPast
                      ? '#e2e8f0'
                      : '#94a3b8';

            return (
              <bdi
                key={`${active.start}-${idx}`}
                dir={w.ltr ? 'ltr' : 'rtl'}
                className={`inline-block px-1 font-bold tracking-tight ${
                  compact ? 'text-[34px] leading-snug' : 'text-[18px] sm:text-[24px] leading-snug'
                }`}
                style={{
                  color,
                  fontFamily: w.ltr ? 'var(--font-display)' : 'var(--font-arabic)',
                  transform: isCurrent ? 'translate3d(0, -1.5px, 0)' : 'none',
                  textShadow:
                    isCurrent && w.accent === 'crimson'
                      ? '0 0 20px rgba(239, 68, 68, 0.55)'
                      : isCurrent && w.accent === 'emerald'
                        ? '0 0 18px rgba(16, 185, 129, 0.45)'
                        : 'none',
                }}
              >
                {w.text}
              </bdi>
            );
          })}
        </div>
      </div>
    );
  }
);

KineticCaptionBar.displayName = 'KineticCaptionBar';
