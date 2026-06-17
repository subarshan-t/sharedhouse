import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import { CATS, amtParts, billShare, money } from '../lib/calc';
import { ScreenScroll } from '../components/Shell';

export function BillDetailScreen({ billId, onBack }: { billId: string; onBack: () => void }) {
  const { t } = useTheme();
  const {
    periodExpenses, members, weeksFor, totalWeeks, currentMember, myParty, memberById,
  } = useHouseData();

  const bill = periodExpenses.find((b) => b.id === billId);
  if (!bill) return null;

  const c = CATS[bill.category];
  const logger = memberById(bill.logged_by);
  const totalParts = amtParts(bill.amount);
  const maxW = Math.max(...members.map((p) => weeksFor(p.id)), 1);

  const partyShare = myParty ? myParty.memberIds.reduce((a, id) => a + billShare(bill.amount, weeksFor(id), totalWeeks), 0) : 0;

  return (
    <ScreenScroll>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px 4px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 24px 0' }}>
        <span style={{ width: 64, height: 64, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={c.fg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={c.path}></path></svg>
        </span>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: t.text, marginTop: 13 }}>{bill.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', color: t.text, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 6 }}>
          <span style={{ fontSize: 18, color: t.text3, marginRight: 2 }}>$</span><span style={{ fontSize: 34, lineHeight: 1 }}>{totalParts.d}</span><span style={{ fontSize: 18, color: t.text3 }}>.{totalParts.c}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {bill.provider && <span style={{ background: t.surface, color: t.text2, fontSize: 11.5, fontWeight: 700, padding: '6px 12px', borderRadius: 999 }}>{bill.provider}</span>}
          <span style={{ background: 'rgba(20,184,166,0.12)', color: '#14B8A6', fontSize: 11.5, fontWeight: 800, padding: '6px 12px', borderRadius: 999 }}>Split by weeks home</span>
        </div>
        {logger && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, background: t.surface, padding: '7px 13px 7px 7px', borderRadius: 999 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: logger.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#1c1c1c', flex: 'none' }}>{logger.initials}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: t.text2 }}>Logged by {logger.display_name}</span>
          </div>
        )}
      </div>

      <div style={{ margin: '18px 22px 6px', background: t.surface, borderRadius: 16, padding: '13px 16px', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 1 }}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 8v5M12 16h.01"></path></svg>
        <span style={{ fontSize: 12.5, lineHeight: 1.5, fontWeight: 600, color: t.text2 }}>
          Divided by the weeks each person was home this period — <b style={{ color: t.text }}>{totalWeeks} person-weeks</b> in total.
        </span>
      </div>

      <div style={{ padding: '8px 24px 0' }}>
        {members.map((p) => {
          const w = weeksFor(p.id);
          const share = billShare(bill.amount, w, totalWeeks);
          const me = p.id === currentMember?.id;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: `1px solid ${t.border}`, background: me ? 'rgba(20,184,166,0.06)' : 'transparent' }}>
              <span style={{ width: 44, height: 44, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#1c1c1c', flex: 'none' }}>{p.initials}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{p.display_name}</span>
                  {me && <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.05em', color: '#14B8A6', background: 'rgba(20,184,166,0.12)', padding: '2px 6px', borderRadius: 5 }}>YOU</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span style={{ height: 6, borderRadius: 99, background: '#14B8A6', width: `${Math.round((w / maxW) * 100)}%`, minWidth: 6 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.text3, whiteSpace: 'nowrap' }}>{w}/{totalWeeks} wks</span>
                </div>
              </span>
              <span style={{ fontWeight: 800, fontSize: 15, color: t.text, flex: 'none' }}>{money(share)}</span>
            </div>
          );
        })}
      </div>

      {myParty && !myParty.isPrimary && (
        <div style={{ margin: '18px 22px 0', background: t.surface, borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text3 }}>{myParty.label} owe{myParty.memberIds.length === 1 ? 's' : ''}</div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#14B8A6' }}>{money(partyShare)}</div>
        </div>
      )}
    </ScreenScroll>
  );
}
