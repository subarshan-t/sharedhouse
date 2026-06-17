import { useState } from 'react';
import { useTheme } from '../state/useTheme';
import { amtParts } from '../lib/calc';
import type { Party } from '../state/HouseDataContext';
import { ScreenScroll } from '../components/Shell';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export function SettleScreen({
  party, onBack, onConfirm,
}: {
  party: Party;
  onBack: () => void;
  onConfirm: (amount: number) => void;
}) {
  const { t } = useTheme();
  const [digits, setDigits] = useState(String(Math.max(Math.round(party.balance * 100), 0)));
  const [busy, setBusy] = useState(false);

  function digit(d: string) {
    setDigits((cur) => {
      const base = (cur === '0' || !cur) ? '' : cur;
      const next = base + d;
      return next.length > 9 ? cur : next;
    });
  }
  function del() {
    setDigits((cur) => cur.slice(0, -1) || '0');
  }
  function bump(n: number) {
    setDigits((cur) => {
      let c = (parseInt(cur || '0', 10) || 0) + n * 100;
      if (c < 0) c = 0;
      return String(c);
    });
  }

  const cents = parseInt(digits || '0', 10) || 0;
  const amount = cents / 100;
  const a = amtParts(amount);

  async function confirm() {
    if (amount <= 0) return;
    setBusy(true);
    try {
      onConfirm(amount);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 24px 4px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>
        </button>
      </div>
      <ScreenScroll padBottom={false}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 24px 0' }}>
          <span style={{ width: 62, height: 62, borderRadius: '50%', background: party.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 19, color: '#1c1c1c' }}>{party.initials}</span>
          <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginTop: 10 }}>Settle with {party.label}</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: t.text2, marginTop: 20 }}>Amount to settle</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 12, padding: '0 24px' }}>
          <button onClick={() => bump(-1)} style={{ width: 38, height: 38, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text, flex: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14"></path></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'baseline', color: t.text, fontWeight: 800, letterSpacing: '-0.03em' }}>
            <span style={{ fontSize: 24, color: t.text3, marginRight: 5 }}>$</span><span style={{ fontSize: 44, lineHeight: 1 }}>{a.d}</span><span style={{ fontSize: 26, color: t.text3 }}>.{a.c}</span>
          </div>
          <button onClick={() => bump(1)} style={{ width: 38, height: 38, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text, flex: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"></path></svg>
          </button>
        </div>
        <div style={{ padding: '20px 24px 8px' }}>
          <button onClick={confirm} disabled={busy || amount <= 0} style={{ width: '100%', height: 58, borderRadius: 18, background: '#14B8A6', color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.04em', boxShadow: '0 14px 30px -10px #14B8A6', opacity: busy || amount <= 0 ? 0.6 : 1 }}>
            {busy ? 'SAVING…' : 'MARK AS PAID'}
          </button>
        </div>
        <div style={{ marginTop: 6, background: t.surface, borderRadius: '30px 30px 0 0', padding: '20px 22px 28px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13, flex: 1 }}>
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={k === 'del' ? del : k === '.' ? undefined : () => digit(k)}
              style={{ height: 54, borderRadius: 16, background: t.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, fontWeight: 700, color: t.text, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
            >
              {k === 'del' ? '⌫' : k}
            </button>
          ))}
        </div>
      </ScreenScroll>
    </div>
  );
}
