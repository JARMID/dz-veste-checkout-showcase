export type DiffLineKind = 'context' | 'remove' | 'add';

export interface DiffLine {
  readonly lineNo: string;
  readonly kind: DiffLineKind;
  readonly code: string;
}

export interface DiffScript {
  readonly id: 'form' | 'cta' | 'webhook';
  readonly filename: string;
  readonly branchLabel: string;
  readonly summaryBadge: string;
  readonly lines: readonly DiffLine[];
}

export const DIFF_SCRIPTS: Record<DiffScript['id'], DiffScript> = {
  form: {
    id: 'form',
    filename: 'src/checkout/CheckoutForm.tsx',
    branchLabel: 'fix/cod-3-fields',
    summaryBadge: '-6 champs inutiles',
    lines: [
      { lineNo: '14', kind: 'context', code: 'const schema = [' },
      { lineNo: '15', kind: 'remove', code: "  'nom', 'prenom', 'email', 'tel1', 'tel2'," },
      { lineNo: '16', kind: 'remove', code: "  'adresse', 'code_postal', 'commune', 'wilaya'" },
      { lineNo: '17', kind: 'context', code: '];' },
      { lineNo: '18', kind: 'add', code: 'const codFields = fields.filter((f) =>' },
      { lineNo: '19', kind: 'add', code: "  ['nom', 'telephone', 'wilaya'].includes(f)" },
      { lineNo: '20', kind: 'add', code: '); // 9 champs -> 3 champs (58 Wilayas)' },
    ],
  },
  cta: {
    id: 'cta',
    filename: 'src/checkout/CheckoutCTA.tsx',
    branchLabel: 'fix/cta-contrast-56px',
    summaryBadge: 'WCAG 18.6:1 · 56px',
    lines: [
      { lineNo: '41', kind: 'context', code: '<button type="submit" className="' },
      { lineNo: '42', kind: 'remove', code: '  h-9 bg-[#d1d5db] text-[#9ca3af] text-xs' },
      { lineNo: '43', kind: 'add', code: '  min-h-[56px] w-full px-6 py-4 rounded-2xl' },
      { lineNo: '44', kind: 'add', code: '  bg-[#f5f5f2] text-[#060607] font-semibold' },
      { lineNo: '45', kind: 'add', code: '  tracking-tight shadow-xl active:scale-[0.98]' },
      { lineNo: '46', kind: 'context', code: '">Commander · 8 200 DA</button>' },
    ],
  },
  webhook: {
    id: 'webhook',
    filename: 'supabase/verify-baridimob.ts',
    branchLabel: 'sec/hmac-rls-ai',
    summaryBadge: 'HMAC 18 µs · IA 2s',
    lines: [
      { lineNo: '08', kind: 'remove', code: '<ScreenshotUpload label="Capture BaridiMob" />' },
      { lineNo: '09', kind: 'add', code: 'await verifyHmacSha256(req.headers, SECRET); // 18 µs' },
      { lineNo: '10', kind: 'add', code: 'await pg.sql`INSERT INTO tx_locks (ref) ON CONFLICT DO NOTHING`;' },
      { lineNo: '11', kind: 'add', code: '// PostgreSQL RLS Locked · Replay 100% bloqué' },
      { lineNo: '12', kind: 'add', code: 'await aiConfirmAgent.dispatch(order, { sla: "2s" });' },
    ],
  },
};
