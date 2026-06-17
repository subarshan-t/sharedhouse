import { useState } from 'react';
import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import { ScreenScroll } from '../components/Shell';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AwayPeriodsScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTheme();
  const { members, awayPeriods, addAwayPeriod, deleteAwayPeriod } = useHouseData();
  const [memberId, setMemberId] = useState(members[0]?.id ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    if (!memberId || !startDate || !endDate) {
      setError('Pick a person and both dates.');
      return;
    }
    if (endDate <= startDate) {
      setError('End date must be after start date.');
      return;
    }
    setBusy(true);
    try {
      await addAwayPeriod(memberId, startDate, endDate, note);
      setStartDate(''); setEndDate(''); setNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = {
    width: '100%', fontSize: 14, fontWeight: 600, color: t.text, background: t.surface,
    borderRadius: 12, padding: '11px 13px', marginTop: 6,
  };

  return (
    <ScreenScroll>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px 4px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>
        </button>
        <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: t.text }}>Away periods</span>
      </div>
      <div style={{ padding: '8px 24px 14px', fontSize: 13, fontWeight: 600, color: t.text3 }}>
        Log a trip away and weeks-home (and so each bill split) will automatically account for it.
      </div>

      <div style={{ padding: '4px 24px 18px' }}>
        <div style={{ background: t.surface, borderRadius: 18, padding: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: t.text3 }}>
            Who was away
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} style={inputStyle}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.display_name}</option>)}
            </select>
          </label>
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <label style={{ flex: 1, fontSize: 12, fontWeight: 700, color: t.text3 }}>
              From
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </label>
            <label style={{ flex: 1, fontSize: 12, fontWeight: 700, color: t.text3 }}>
              To
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </label>
          </div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: t.text3, marginTop: 12 }}>
            Note (optional)
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Bali trip" style={inputStyle} />
          </label>
          {error && <div style={{ color: '#E5715A', fontSize: 12, fontWeight: 700, marginTop: 10 }}>{error}</div>}
          <button
            onClick={submit} disabled={busy}
            style={{ width: '100%', marginTop: 14, padding: '13px 0', borderRadius: 14, background: '#14B8A6', color: '#fff', fontSize: 14, fontWeight: 800, opacity: busy ? 0.6 : 1 }}
          >
            {busy ? 'Saving…' : 'Log away period'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        {awayPeriods.length === 0 && (
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text3, padding: '8px 0' }}>No away periods logged yet.</div>
        )}
        {awayPeriods.map((a) => {
          const m = members.find((mm) => mm.id === a.member_id);
          return (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: `1px solid ${t.border}` }}>
              {m && <span style={{ width: 34, height: 34, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#1c1c1c', flex: 'none' }}>{m.initials}</span>}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{m?.display_name ?? 'Unknown'}{a.note ? ` · ${a.note}` : ''}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.text3 }}>{fmtDate(a.start_date)} – {fmtDate(a.end_date)}</div>
              </div>
              <button onClick={() => void deleteAwayPeriod(a.id)} style={{ color: '#E5715A', fontSize: 12, fontWeight: 700 }}>Remove</button>
            </div>
          );
        })}
      </div>
    </ScreenScroll>
  );
}
