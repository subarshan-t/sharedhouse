import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import { useAuth } from '../state/useAuth';
import { money } from '../lib/calc';
import { ScreenScroll } from '../components/Shell';

const SETTINGS_ROWS = [
  { key: 'notifications', label: 'Notifications', path: 'M18 8a6 6 0 1 0-12 0c0 7-2.5 9-2.5 9h17S18 15 18 8M13.7 21a2 2 0 0 1-3.4 0' },
  { key: 'payment', label: 'Payment methods', path: 'M2 7h20v12H2zM2 11h20' },
  { key: 'members', label: 'House members', path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
];

export function ProfileScreen({ onOpenWeeks }: { onOpenWeeks: () => void }) {
  const { t, dark, toggleDark } = useTheme();
  const { household, currentMember, weeksFor, balanceFor } = useHouseData();
  const { signOut } = useAuth();

  if (!household || !currentMember) return null;

  const partnerLabel = currentMember.couple_group
    ? 'partner in the house'
    : currentMember.is_primary_tenant ? 'primary tenant' : 'tenant';

  return (
    <ScreenScroll>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px 8px' }}>
        <span style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.03em', color: t.text }}>Profile</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 24px 8px' }}>
        <span style={{ width: 84, height: 84, borderRadius: '50%', background: currentMember.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1c1c1c', fontWeight: 800, fontSize: 28 }}>{currentMember.initials}</span>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: t.text, marginTop: 12 }}>{currentMember.display_name}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text3, marginTop: 3 }}>{household.name} · {partnerLabel}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: '18px 22px 6px' }}>
        <div style={{ background: t.surface, borderRadius: 18, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{weeksFor(currentMember.id)}</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: t.text3, marginTop: 3 }}>WKS HOME</div>
        </div>
        <div style={{ background: t.surface, borderRadius: 18, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#E5715A' }}>{money(Math.max(balanceFor(currentMember.id), 0))}</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: t.text3, marginTop: 3 }}>YOU OWE</div>
        </div>
        <div style={{ background: t.surface, borderRadius: 18, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#14B8A6' }}>{money(Number(currentMember.weekly_rent))}</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: t.text3, marginTop: 3 }}>RENT / WK</div>
        </div>
      </div>
      <div style={{ padding: '14px 22px 0' }}>
        <div style={{ background: t.surface, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 18px', borderBottom: `1px solid ${t.border}` }}>
            <span style={{ color: t.text2, display: 'flex' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 0 12 6 6 0 0 1 0-12z"></path></svg></span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: t.text }}>Dark mode</span>
            <button onClick={toggleDark} style={{ width: 48, height: 28, borderRadius: 999, background: dark ? '#14B8A6' : t.border, position: 'relative', transition: 'background .25s', flex: 'none' }}>
              <span style={{ position: 'absolute', top: 3, left: dark ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .25s', boxShadow: '0 2px 5px rgba(0,0,0,0.25)' }} />
            </button>
          </div>
          <button onClick={onOpenWeeks} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 18px', borderBottom: `1px solid ${t.border}`, textAlign: 'left' }}>
            <span style={{ color: t.text2, display: 'flex' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"></path></svg></span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: t.text }}>Bill periods &amp; weeks</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"></path></svg>
          </button>
          {SETTINGS_ROWS.map((r) => (
            <button key={r.key} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 18px', borderBottom: `1px solid ${t.border}`, textAlign: 'left' }}>
              <span style={{ color: t.text2, display: 'flex' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={r.path}></path></svg></span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: t.text }}>{r.label}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"></path></svg>
            </button>
          ))}
          <button onClick={signOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 18px', textAlign: 'left' }}>
            <span style={{ color: '#E5715A', display: 'flex' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path></svg></span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#E5715A' }}>Log out</span>
          </button>
        </div>
      </div>
    </ScreenScroll>
  );
}
