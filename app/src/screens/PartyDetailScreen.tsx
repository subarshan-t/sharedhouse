import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import { CATS, billShare, equalShare, money } from '../lib/calc';
import { ScreenScroll } from '../components/Shell';

export function PartyDetailScreen({
  partyId, onBack, onSettle, onRemind,
}: {
  partyId: string;
  onBack: () => void;
  onSettle: () => void;
  onRemind: () => void;
}) {
  const { t } = useTheme();
  const {
    parties, members, periodExpenses, commonExpenses, weeksFor, totalWeeks,
  } = useHouseData();

  const party = parties.find((p) => p.id === partyId);
  if (!party) return null;

  const owe = !party.isPrimary;
  const breakLabel = owe ? 'OWES THE HOUSE' : 'COLLECTING FROM';

  let breakdown: { title: string; meta: string; amt: string; iconBg: string; iconFg: string; iconPath: string }[] = [];

  if (owe) {
    const partyMembers = members.filter((m) => party.memberIds.includes(m.id));
    const rentTotal = partyMembers.reduce((a, m) => a + Number(m.weekly_rent), 0);
    if (rentTotal > 0) {
      breakdown.push({
        title: 'Rent', meta: 'This week', amt: money(rentTotal),
        iconBg: CATS.rent.bg, iconFg: CATS.rent.fg, iconPath: CATS.rent.path,
      });
    }
    periodExpenses.forEach((b) => {
      const c = CATS[b.category];
      const share = party.memberIds.reduce((a, id) => a + billShare(b.amount, weeksFor(id), totalWeeks), 0);
      breakdown.push({ title: b.name, meta: `Share of ${money(b.amount)}`, amt: money(share), iconBg: c.bg, iconFg: c.fg, iconPath: c.path });
    });
    const commonTotal = commonExpenses.reduce((a, c) => a + equalShare(c.amount, members.length) * party.memberIds.length, 0);
    if (commonExpenses.length) {
      breakdown.push({
        title: 'Common pool', meta: `${commonExpenses.length} shared item${commonExpenses.length === 1 ? '' : 's'}`,
        amt: money(commonTotal), iconBg: CATS.common.bg, iconFg: CATS.common.fg, iconPath: CATS.common.path,
      });
    }
  } else {
    breakdown = parties.filter((p) => !p.isPrimary).map((p) => ({
      title: p.label, meta: 'Rent + bills + pool', amt: money(Math.max(p.balance, 0)),
      iconBg: p.color, iconFg: '#3a6ea5',
      iconPath: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-1a7 7 0 0 1 14 0v1',
    }));
  }

  return (
    <ScreenScroll>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px 4px' }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 24px 6px' }}>
        <span style={{ width: 84, height: 84, borderRadius: '50%', background: party.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 26, color: '#1c1c1c' }}>{party.initials}</span>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', color: t.text, marginTop: 13 }}>{party.label}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text3, marginTop: 3 }}>{party.role}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: party.isPrimary ? '#14B8A6' : t.text, marginTop: 9 }}>
          {party.isPrimary ? `Collecting ${money(party.balance)}` : `Owes ${money(party.balance)}`}
        </div>
      </div>

      {owe && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, padding: '18px 24px 6px' }}>
          <button onClick={onSettle} style={{ height: 54, borderRadius: 16, background: t.ink, color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.04em' }}>SETTLE</button>
          <button onClick={onRemind} style={{ height: 54, borderRadius: 16, background: 'transparent', border: `1.6px solid ${t.border}`, color: t.text, fontWeight: 800, fontSize: 14, letterSpacing: '0.04em' }}>REMIND</button>
        </div>
      )}

      <div style={{ padding: '18px 24px 6px', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: t.text3 }}>{breakLabel}</div>
      <div style={{ padding: '0 24px' }}>
        {breakdown.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderBottom: `1px solid ${t.border}` }}>
            <span style={{ width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: r.iconBg, flex: 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={r.iconFg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={r.iconPath}></path></svg>
            </span>
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{r.title}</span>
              <span style={{ fontSize: 12, color: t.text3, fontWeight: 600 }}>{r.meta}</span>
            </span>
            <span style={{ fontWeight: 800, fontSize: 15, color: t.text, flex: 'none' }}>{r.amt}</span>
          </div>
        ))}
      </div>
    </ScreenScroll>
  );
}
