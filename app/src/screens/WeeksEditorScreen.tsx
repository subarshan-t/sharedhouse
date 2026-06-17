import { useEffect, useState } from 'react';
import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import { ScreenScroll } from '../components/Shell';

export function WeeksEditorScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTheme();
  const { members, currentPeriod, weeksFor, updateWeeks } = useHouseData();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs local drafts whenever the member/period list changes
    setDrafts(Object.fromEntries(members.map((m) => [m.id, String(weeksFor(m.id))])));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- weeksFor is derived from weeksHome, which is already covered by the members/currentPeriod refresh
  }, [members, currentPeriod]);

  async function save(memberId: string) {
    const weeks = parseFloat(drafts[memberId]) || 0;
    setBusyId(memberId);
    try {
      await updateWeeks(memberId, weeks);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ScreenScroll>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px 4px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>
        </button>
        <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: t.text }}>Weeks home</span>
      </div>
      <div style={{ padding: '8px 24px 14px', fontSize: 13, fontWeight: 600, color: t.text3 }}>
        {currentPeriod ? `Weeks each person was home during ${currentPeriod.label} — used to prorate bills.` : 'No active billing period.'}
      </div>
      <div style={{ padding: '0 24px' }}>
        {members.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: `1px solid ${t.border}` }}>
            <span style={{ width: 38, height: 38, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#1c1c1c', flex: 'none' }}>{m.initials}</span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: t.text }}>{m.display_name}</span>
            <input
              type="text" inputMode="decimal" value={drafts[m.id] ?? ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value.replace(/[^0-9.]/g, '') }))}
              onBlur={() => save(m.id)}
              style={{ width: 52, textAlign: 'right', fontSize: 15, fontWeight: 800, color: t.text, background: t.surface, borderRadius: 10, padding: '8px 10px' }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: t.text3, width: 30 }}>{busyId === m.id ? '…' : 'wks'}</span>
          </div>
        ))}
      </div>
    </ScreenScroll>
  );
}
