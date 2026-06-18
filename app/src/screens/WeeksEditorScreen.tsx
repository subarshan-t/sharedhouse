import { useEffect, useState } from 'react';
import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import { ScreenScroll } from '../components/Shell';

export function WeeksEditorScreen({ onBack, onOpenAway }: { onBack: () => void; onOpenAway: () => void }) {
  const { t } = useTheme();
  const { members, currentPeriod, weeksFor, isManualWeeks, updateWeeks, resetWeeksToAuto } = useHouseData();
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

  async function reset(memberId: string) {
    setBusyId(memberId);
    try {
      await resetWeeksToAuto(memberId);
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
        {currentPeriod ? `Weeks each person was home during ${currentPeriod.label} — auto-calculated from move-in dates and away periods, used to prorate bills.` : 'No active billing period.'}
      </div>
      <div style={{ padding: '0 24px' }}>
        {members.map((m) => {
          const manual = isManualWeeks(m.id);
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: `1px solid ${t.border}` }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#1c1c1c', flex: 'none' }}>{m.initials}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{m.display_name}</div>
                {manual && (
                  <button onClick={() => reset(m.id)} style={{ fontSize: 11, fontWeight: 700, color: t.text3, textDecoration: 'underline', marginTop: 2 }}>
                    manually set · reset to auto
                  </button>
                )}
              </div>
              <input
                type="text" inputMode="decimal" value={drafts[m.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value.replace(/[^0-9.]/g, '') }))}
                onBlur={() => save(m.id)}
                style={{ width: 52, textAlign: 'right', fontSize: 15, fontWeight: 800, color: t.text, background: t.surface, borderRadius: 10, padding: '8px 10px' }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: t.text3, width: 30 }}>{busyId === m.id ? '…' : 'wks'}</span>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '18px 24px' }}>
        <button onClick={onOpenAway} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 0', borderRadius: 16, background: t.surface, fontSize: 14, fontWeight: 700, color: t.text }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"></path></svg>
          Manage away periods
        </button>
      </div>
    </ScreenScroll>
  );
}
