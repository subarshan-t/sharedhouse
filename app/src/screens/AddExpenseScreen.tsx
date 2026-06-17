import { useMemo, useState } from 'react';
import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import { CATS, equalShare, money } from '../lib/calc';
import type { Category, SplitMode } from '../lib/types';
import { ScreenScroll } from '../components/Shell';

const CAT_KEYS: Category[] = ['rent', 'electricity', 'gas', 'water', 'internet', 'common'];

export function AddExpenseScreen({ onBack, onSaved }: { onBack: () => void; onSaved: () => void }) {
  const { t, dark } = useTheme();
  const { members, currentMember, totalWeeks, addExpense } = useHouseData();

  const [amountStr, setAmountStr] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('common');
  const [paidBy, setPaidBy] = useState(currentMember?.id ?? '');
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const amount = parseFloat(amountStr) || 0;

  const splitDefs = useMemo(() => {
    const defs: { k: SplitMode; label: string }[] = [{ k: 'equal', label: `Equally · ${members.length}` }];
    if (category !== 'common') defs.push({ k: 'weeks', label: 'By weeks' });
    defs.push({ k: 'custom', label: 'Custom' });
    return defs;
  }, [category, members.length]);

  let splitTitle = 'Split equally';
  let splitMeta = `${money(equalShare(amount, members.length))} each · ${members.length} housemates`;
  if (splitMode === 'weeks') { splitTitle = 'By weeks home'; splitMeta = `Prorated over ${totalWeeks} person-weeks`; }
  if (splitMode === 'custom') { splitTitle = 'Custom amounts'; splitMeta = 'Set each person manually'; }

  const customTotal = Object.values(customShares).reduce((a, v) => a + (parseFloat(v) || 0), 0);

  async function save() {
    setError('');
    if (!name.trim()) { setError('Give it a description.'); return; }
    if (amount <= 0) { setError('Enter an amount.'); return; }
    if (!paidBy) { setError('Choose who paid.'); return; }
    if (splitMode === 'custom' && Math.round(customTotal * 100) !== Math.round(amount * 100)) {
      setError(`Custom shares must add up to ${money(amount)}.`);
      return;
    }
    setBusy(true);
    try {
      await addExpense({
        name: name.trim(),
        category,
        amount,
        splitMode,
        paidBy,
        customShares: splitMode === 'custom'
          ? Object.fromEntries(Object.entries(customShares).map(([k, v]) => [k, parseFloat(v) || 0]))
          : undefined,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the expense.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenScroll>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px 4px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>
        </button>
        <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: t.text }}>Add expense</span>
      </div>

      <div style={{ textAlign: 'center', padding: '22px 0 6px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: t.text3 }}>AMOUNT</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: t.text3 }}>$</span>
          <input
            type="text" inputMode="decimal" placeholder="0.00" value={amountStr}
            onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9.]/g, ''))}
            style={{ width: 160, fontSize: 46, fontWeight: 800, color: t.text, textAlign: 'center', letterSpacing: '-0.02em' }}
          />
        </div>
      </div>

      <div style={{ padding: '8px 24px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: t.text3, marginBottom: 9 }}>DESCRIPTION</div>
        <input
          type="text" placeholder="What was it for?" value={name} onChange={(e) => setName(e.target.value)}
          style={{ background: t.surface, borderRadius: 16, padding: '15px 16px', fontSize: 15, fontWeight: 600, color: t.text }}
        />
      </div>

      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: t.text3, marginBottom: 11 }}>CATEGORY</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {CAT_KEYS.map((k) => {
            const c = CATS[k];
            const a = category === k;
            return (
              <button
                key={k}
                onClick={() => { setCategory(k); if (k === 'common' && splitMode === 'weeks') setSplitMode('equal'); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999,
                  border: `1.5px solid ${a ? '#14B8A6' : t.border}`, background: a ? 'rgba(20,184,166,0.12)' : t.surface,
                  fontWeight: 700, fontSize: 13, color: a ? '#14B8A6' : t.text2,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={c.path}></path></svg>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '22px 24px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: t.text3, marginBottom: 13 }}>PAID BY</div>
        <div className="scrl" style={{ display: 'flex', gap: 15, overflowX: 'auto' }}>
          {members.map((p) => {
            const a = paidBy === p.id;
            return (
              <button key={p.id} onClick={() => setPaidBy(p.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 'none' }}>
                <span style={{ width: 52, height: 52, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#1c1c1c', border: `3px solid ${a ? '#14B8A6' : 'transparent'}` }}>{p.initials}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: a ? '#14B8A6' : t.text2 }}>{p.display_name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '22px 24px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: t.text3, marginBottom: 11 }}>HOW TO SPLIT</div>
        <div style={{ display: 'flex', gap: 7, background: t.surface, borderRadius: 14, padding: 5 }}>
          {splitDefs.map((d) => {
            const a = splitMode === d.k;
            return (
              <button
                key={d.k}
                onClick={() => setSplitMode(d.k)}
                style={{
                  flex: 1, height: 42, borderRadius: 10, background: a ? (dark ? '#3A3C40' : '#FFFFFF') : 'transparent',
                  color: a ? t.text : t.text3, fontWeight: 800, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: a ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        {splitMode === 'custom' ? (
          <div style={{ marginTop: 13, background: t.surface, borderRadius: 16, padding: '10px 16px' }}>
            {members.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: '#1c1c1c', flex: 'none' }}>{p.initials}</span>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: t.text }}>{p.display_name}</span>
                <input
                  type="text" inputMode="decimal" placeholder="0.00"
                  value={customShares[p.id] ?? ''}
                  onChange={(e) => setCustomShares((s) => ({ ...s, [p.id]: e.target.value.replace(/[^0-9.]/g, '') }))}
                  style={{ width: 70, textAlign: 'right', fontSize: 14, fontWeight: 700, color: t.text }}
                />
              </div>
            ))}
            <div style={{ fontSize: 11.5, fontWeight: 700, color: customTotal === amount ? t.text3 : '#E5715A', paddingTop: 4 }}>
              {money(customTotal)} of {money(amount)} allocated
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 13, background: t.surface, borderRadius: 16, padding: '15px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: t.text }}>{splitTitle}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.text3, marginTop: 2 }}>{splitMeta}</div>
            </div>
          </div>
        )}
      </div>

      {error && <div style={{ padding: '14px 24px 0', fontSize: 12.5, fontWeight: 700, color: '#E5715A' }}>{error}</div>}

      <div style={{ padding: '24px 24px 0' }}>
        <button onClick={save} disabled={busy} style={{ width: '100%', height: 58, borderRadius: 18, background: '#14B8A6', color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.04em', boxShadow: '0 14px 30px -10px #14B8A6', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'SAVING…' : 'SAVE EXPENSE'}
        </button>
      </div>
    </ScreenScroll>
  );
}
