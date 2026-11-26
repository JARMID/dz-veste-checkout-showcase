import React, { useState } from 'react';
import { ATLAS_JACKET, AVANT_COD_FIELDS, formatDzd } from '../data/product';
import { ALGERIA_WILAYAS } from '../data/wilayas';

export interface AvantCheckoutViewProps {
  /** Compact density mode for Capture 9:16 / Split comparator */
  compact?: boolean;
  /** Interactive form input support in Visitor Mode */
  interactive?: boolean;
  /** Deterministic marquee offset in Capture Mode */
  marqueeOffsetPx?: number;
  /** Deterministic blink state in Capture Mode */
  blinkOn?: boolean;
}

export const AvantCheckoutView: React.FC<AvantCheckoutViewProps> = React.memo(
  ({ compact = false, interactive = false, marqueeOffsetPx, blinkOn = true }) => {
    const [values, setValues] = useState<Record<string, string>>(() =>
      Object.fromEntries(AVANT_COD_FIELDS.map((f) => [f.id, '']))
    );
    const [fakeError, setFakeError] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string>('recu_baridimob_01.jpg');

    const handleAvantSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!interactive) return;
      const missing = AVANT_COD_FIELDS.filter((f) => !values[f.id]?.trim()).length;
      if (missing > 0) {
        setFakeError(
          `Erreur : ${missing} champs obligatoires manquants (Email, Tel 2 et Code Postal requis !)`
        );
      } else {
        setFakeError(
          'Commande en attente : veuillez envoyer votre capture BaridiMob sur WhatsApp et patienter 24h.'
        );
      }
    };

    const marqueeStyle =
      typeof marqueeOffsetPx === 'number'
        ? { transform: `translate3d(${marqueeOffsetPx}px, 0, 0)` }
        : undefined;

    return (
      <div
        className="w-full overflow-hidden border-2 border-[#b8bcc4] bg-[#f3f4f6] text-[#1f2937] shadow-md"
        style={{ fontFamily: 'var(--font-avant)' }}
      >
        {/* Garish Cluttered Promo Marquee */}
        <div className="overflow-hidden bg-[#dc2626] py-1.5 text-white border-b-2 border-[#facc15]">
          <div
            className={
              marqueeStyle
                ? 'flex whitespace-nowrap gap-8 text-[11px] font-bold uppercase tracking-wider'
                : 'visitor-marquee-track flex whitespace-nowrap gap-8 text-[11px] font-bold uppercase tracking-wider'
            }
            style={marqueeStyle}
          >
            <span>PROMO -50% AUJOURD&apos;HUI SEULEMENT !! LIVRAISON 58 WILAYAS !!</span>
            <span>DERNIÈRES PIÈCES EN STOCK !! PAIEMENT À LA LIVRAISON OU BARIDIMOB !!</span>
            <span>PROMO -50% AUJOURD&apos;HUI SEULEMENT !! LIVRAISON 58 WILAYAS !!</span>
          </div>
        </div>

        {/* Dated Generic Store Header */}
        <div
          className={`flex items-center justify-between gap-2 border-b border-[#d1d5db] bg-white ${
            compact ? 'px-3 py-1.5' : 'px-3.5 sm:px-4 py-2.5'
          }`}
        >
          <div className="min-w-0">
            <div
              className={`truncate font-bold text-[#111827] ${compact ? 'text-[14px]' : 'text-[14px] sm:text-[17px]'}`}
              style={{ fontFamily: 'var(--font-avant-serif)' }}
            >
              DZ_FASHION_SHOP_16
            </div>
            <div className="truncate text-[10px] text-[#6b7280]">Accueil &gt; Vestes &gt; Promo Hiver</div>
          </div>
          <div
            className="shrink-0 whitespace-nowrap rounded-xs border border-[#ca8a04] bg-[#fef08a] px-2 py-0.5 text-[10px] font-bold text-[#991b1b] tabular-nums"
            style={{ opacity: blinkOn ? 1 : 0.65 }}
          >
            FIN PROMO: 00:14:52
          </div>
        </div>

        {/* Main Cluttered Body */}
        <div className={compact ? 'p-2.5 space-y-2' : 'p-4 space-y-3'}>
          {/* Clunky Product Box with Cheap Promo Sticker */}
          <div className="flex items-center gap-3 border border-[#d1d5db] bg-white p-2">
            <div
              className={`relative shrink-0 border border-[#9ca3af] bg-[#111214] overflow-hidden ${
                compact ? 'h-16 w-14' : 'h-24 w-20'
              }`}
            >
              <img
                src={ATLAS_JACKET.heroImage}
                alt={ATLAS_JACKET.name}
                loading="eager"
                decoding="sync"
                className="h-full w-full object-cover"
              />
              <span className="absolute top-0.5 left-0.5 bg-[#dc2626] px-1 py-0.5 text-[8px] font-black text-[#fef08a] leading-none">
                -50%
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div
                className={`font-bold text-[#111827] leading-tight truncate ${
                  compact ? 'text-[13px]' : 'text-[16px]'
                }`}
                style={{ fontFamily: 'var(--font-avant-serif)' }}
              >
                {ATLAS_JACKET.name} - Qualité Top
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={`font-bold text-[#dc2626] tabular-nums ${
                    compact ? 'text-[15px]' : 'text-[19px]'
                  }`}
                >
                  {formatDzd(ATLAS_JACKET.priceDzd)}
                </span>
                <span className="text-[11px] text-[#9ca3af] line-through tabular-nums">
                  {formatDzd(ATLAS_JACKET.compareAtPriceDzd)}
                </span>
              </div>
              <div className="mt-1 inline-block bg-[#ffedd5] border border-[#fb923c] px-1.5 py-0.5 text-[10px] font-bold text-[#9a3412]">
                47 personnes regardent cet article !
              </div>
            </div>
          </div>

          {/* Bloated 9-Field COD Form */}
          <form
            onSubmit={handleAvantSubmit}
            className="border border-[#cbd5e1] bg-white p-2.5 space-y-2"
          >
            <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-1">
              <span className="text-[11px] font-bold uppercase text-[#374151]">
                Formulaire de commande COD (Remplir tous les champs)
              </span>
              <span className="bg-[#fee2e2] px-1.5 py-0.5 text-[9px] font-bold text-[#b91c1c]">
                9 CHAMPS
              </span>
            </div>

            <div className={`grid grid-cols-2 ${compact ? 'gap-1.5' : 'gap-2'}`}>
              {AVANT_COD_FIELDS.map((field, index) => (
                <div key={field.id} className={field.spanTwo ? 'col-span-2' : 'col-span-1'}>
                  <label
                    htmlFor={interactive ? `avant-${field.id}` : undefined}
                    className="block text-[10px] font-bold text-[#4b5563] mb-0.5"
                  >
                    {index + 1}. {field.label}
                  </label>
                  {field.id === 'wilaya' ? (
                    <select
                      id={interactive ? `avant-${field.id}` : undefined}
                      disabled={!interactive}
                      value={values[field.id] || '16'}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                      }
                      className={`w-full border border-[#9ca3af] bg-[#f9fafb] px-2 text-[#374151] ${
                        compact ? 'h-6 text-[10px]' : 'h-8 text-[12px]'
                      }`}
                    >
                      <option value="">-- Choisir votre Wilaya --</option>
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.code} - {w.nameFr}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={interactive ? `avant-${field.id}` : undefined}
                      type="text"
                      readOnly={!interactive}
                      value={interactive ? values[field.id] : ''}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                      }
                      className={`w-full border border-[#9ca3af] bg-[#f9fafb] px-2 text-[#111827] placeholder:text-[#9ca3af] ${
                        compact ? 'h-6 text-[10px]' : 'h-8 text-[12px]'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Red-Flagged Manual BaridiMob Screenshot Upload Box */}
            <div className="border-2 border-dashed border-[#ef4444] bg-[#fef2f2] p-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-[#991b1b] leading-snug">
                  Envoyez une capture d&apos;écran BaridiMob (Upload Screenshot)
                </span>
                <span className="shrink-0 bg-[#dc2626] px-1.5 py-0.5 text-[8px] font-bold uppercase text-white">
                  MANUEL 24H
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    interactive && setUploadedFileName('capture_baridimob_modifiee.png')
                  }
                  className="cursor-pointer border border-[#9ca3af] bg-[#e5e7eb] px-2 py-0.5 text-[10px] text-[#374151]"
                >
                  Choisir un fichier
                </button>
                <span className="truncate text-[10px] text-[#6b7280] font-mono">
                  {uploadedFileName}
                </span>
              </div>
              <p className="mt-1 text-[9px] text-[#b91c1c]">
                Envoyez aussi le reçu sur WhatsApp et attendez demain pour confirmation.
              </p>
            </div>

            {/* Ugly Washed-Out Grey CTA Button (#9ca3af on #d1d5db) */}
            <div className="pt-0.5">
              <button
                type="submit"
                className="w-full cursor-pointer border border-[#cbd5e1] px-3 text-center font-normal"
                style={{
                  backgroundColor: '#d1d5db',
                  color: '#9ca3af',
                  height: compact ? '32px' : '36px',
                  fontSize: compact ? '11px' : '12px',
                  borderRadius: '3px',
                }}
              >
                Envoyer ma commande
              </button>
            </div>

            {interactive && fakeError && (
              <div className="border border-[#fca5a5] bg-[#fee2e2] px-2.5 py-1.5 text-[11px] font-semibold text-[#991b1b]">
                {fakeError}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
);

AvantCheckoutView.displayName = 'AvantCheckoutView';
