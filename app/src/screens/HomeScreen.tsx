import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import type { Party } from '../state/HouseDataContext';
import { CATS, billShare, equalShare, money } from '../lib/calc';
import type { Expense } from '../lib/types';
import { ScreenScroll } from '../components/Shell';

export function HomeScreen({
  onOpenBill, onOpenAdd, onGoBills, onSettle,
}: {
  onOpenBill: (id: string) => void;
  onOpenAdd: () => void;
  onGoBills: () => void;
  onSettle: (party: Party, amount: number) => void;
}) {
  const { t } = useTheme();
  const {
    household, members, currentMember, myParty, periodExpenses, commonExpenses,
    weeksFor, totalWeeks, currentPeriod,
  } = useHouseData();

  if (!household || !currentMember || !myParty) return null;

  const isPrimary = myParty.isPrimary;
  const partyShare = (e: Expense) => myParty.memberIds.reduce((a, id) => a + billShare(e.amount, weeksFor(id), totalWeeks), 0);
  const partyCommonShare = (e: Expense) => equalShare(e.amount, members.length) * myParty.memberIds.length;

  const heroAmount = myParty.balance;
  const heroLabel = isPrimary ? 'COLLECTING FROM THE HOUSE' : `${myParty.label.toUpperCase()} OWE${myParty.memberIds.length > 1 ? '' : 'S'} ${household.name.toUpperCase()}`.slice(0, 60);

  return (
    <ScreenScroll>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px 16px' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.text3 }}>Welcome back</div>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em', color: t.text, marginTop: 1 }}>{household.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onOpenAdd} style={{ width: 42, height: 42, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"></path></svg>
          </button>
        </div>
      </div>

      <div style={{ margin: '0 22px', borderRadius: 26, overflow: 'hidden', boxShadow: '0 18px 38px -20px rgba(20,150,140,0.6)' }}>
        <div style={{ background: 'linear-gradient(118deg,#14B5A6 0%,#6CDF9F 52%,#F3DA57 105%)', padding: '22px 24px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.92)' }}>{heroLabel}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 9 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', color: '#fff', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {(() => { const m = money(heroAmount); return <>{m.split('.').map((p, i) => (<span key={i} style={{ fontSize: i === 0 ? 42 : 24, lineHeight: 1, opacity: i === 0 ? 1 : 0.85 }}>{i === 0 ? p : `.${p}`}</span>)) }</>; })()}
            </div>
            {currentPeriod && (
              <span style={{ marginTop: 8, background: 'rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700, fontSize: 12, padding: '5px 10px', borderRadius: 999 }}>{currentPeriod.label}</span>
            )}
          </div>
          <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
            {isPrimary ? 'Outstanding across the house' : "This week's rent + your share of bills"}
          </div>
        </div>
        <div style={{ display: 'flex', background: t.ink }}>
          {!isPrimary && (
            <>
              <button onClick={() => onSettle(myParty, Math.max(heroAmount, 0))} style={{ flex: 1, color: '#fff', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, fontSize: 13, letterSpacing: '0.04em' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                SETTLE UP
              </button>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.14)' }} />
            </>
          )}
          <button onClick={onOpenAdd} style={{ flex: 1, color: '#fff', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, fontSize: 13, letterSpacing: '0.04em' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"></path></svg>
            ADD
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 24px 8px' }}>
        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: t.text }}>Current bills</span>
        <button onClick={onGoBills} style={{ fontSize: 13, fontWeight: 700, color: '#14B8A6' }}>See all</button>
      </div>
      <div style={{ padding: '0 24px' }}>
        {periodExpenses.map((b) => {
          const c = CATS[b.category];
          return (
            <button key={b.id} onClick={() => onOpenBill(b.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: `1px solid ${t.border}`, textAlign: 'left' }}>
              <span style={{ width: 46, height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, flex: 'none' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.fg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={c.path}></path></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{b.name}</span>
                <span style={{ fontSize: 12, color: t.text3, fontWeight: 600 }}>{b.provider} · {money(b.amount)} total</span>
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flex: 'none' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: t.text }}>{money(isPrimary ? b.amount : partyShare(b))}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: t.text3 }}>{isPrimary ? 'total' : 'your share'}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '20px 24px 8px', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: t.text3 }}>COMMON POOL · SPLIT {members.length} WAYS</div>
      <div style={{ padding: '0 24px' }}>
        {commonExpenses.map((b) => {
          const c = CATS[b.category];
          return (
            <div key={b.id} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: `1px solid ${t.border}` }}>
              <span style={{ width: 46, height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, flex: 'none' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.fg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={c.path}></path></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{b.name}</span>
                <span style={{ fontSize: 12, color: t.text3, fontWeight: 600 }}>{b.provider ? `${b.provider} · ` : ''}{money(b.amount)} total</span>
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flex: 'none' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: t.text }}>{money(isPrimary ? b.amount : partyCommonShare(b))}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: t.text3 }}>{isPrimary ? 'total' : myParty.label.split(' & ')[0]}</span>
              </span>
            </div>
          );
        })}
      </div>
    </ScreenScroll>
  );
}
