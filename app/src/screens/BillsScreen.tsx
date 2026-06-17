import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import { CATS, money } from '../lib/calc';
import { ScreenScroll } from '../components/Shell';

export function BillsScreen({ onOpenBill }: { onOpenBill: (id: string) => void }) {
  const { t } = useTheme();
  const { currentPeriod, periodExpenses, commonExpenses, members, totalWeeks, memberById } = useHouseData();

  const periodTotal = periodExpenses.reduce((a, b) => a + b.amount, 0);

  return (
    <ScreenScroll>
      <div style={{ padding: '10px 24px 14px' }}><span style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.03em', color: t.text }}>Bills</span></div>

      {currentPeriod && (
        <div style={{ margin: '0 22px 18px', background: t.ink, borderRadius: 24, padding: '20px 22px', color: '#fff' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)' }}>BILLING PERIOD</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 6 }}>{currentPeriod.label}</div>
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <div><div style={{ fontSize: 19, fontWeight: 800 }}>{money(periodTotal)}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{periodExpenses.length} bills total</div></div>
            <div><div style={{ fontSize: 19, fontWeight: 800 }}>{totalWeeks} wks</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{totalWeeks} person-weeks</div></div>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01"></path></svg>
            Split by weeks home
          </div>
        </div>
      )}

      <div style={{ padding: '0 24px' }}>
        {periodExpenses.map((b) => {
          const c = CATS[b.category];
          const logger = memberById(b.logged_by);
          return (
            <button key={b.id} onClick={() => onOpenBill(b.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: `1px solid ${t.border}`, textAlign: 'left' }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, flex: 'none' }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c.fg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={c.path}></path></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 15.5, fontWeight: 700, color: t.text }}>{b.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {logger && (
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: logger.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#1c1c1c', flex: 'none' }}>{logger.initials}</span>
                  )}
                  <span style={{ fontSize: 12, color: t.text3, fontWeight: 600 }}>Logged by {logger?.display_name ?? '—'} · {b.provider}</span>
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 'none' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: t.text }}>{money(b.amount)}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"></path></svg>
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '22px 24px 8px', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: t.text3 }}>COMMON POOL · SPLIT EQUALLY</div>
      <div style={{ padding: '0 24px' }}>
        {commonExpenses.map((b) => {
          const c = CATS[b.category];
          const logger = memberById(b.logged_by);
          return (
            <div key={b.id} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: `1px solid ${t.border}` }}>
              <span style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, flex: 'none' }}>
                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c.fg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={c.path}></path></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 15.5, fontWeight: 700, color: t.text }}>{b.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {logger && (
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: logger.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#1c1c1c', flex: 'none' }}>{logger.initials}</span>
                  )}
                  <span style={{ fontSize: 12, color: t.text3, fontWeight: 600 }}>Logged by {logger?.display_name ?? '—'}{b.provider ? ` · ${b.provider}` : ''}</span>
                </span>
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flex: 'none' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: t.text }}>{money(b.amount)}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: t.text3 }}>{money(b.amount / Math.max(members.length, 1))} each</span>
              </span>
            </div>
          );
        })}
      </div>
    </ScreenScroll>
  );
}
