import { useTheme } from '../state/useTheme';
import { useHouseData } from '../state/useHouseData';
import { money } from '../lib/calc';
import { ScreenScroll } from '../components/Shell';

export function BalancesScreen({ onOpenParty }: { onOpenParty: (partyId: string) => void }) {
  const { t } = useTheme();
  const { household, members, parties } = useHouseData();

  const outstanding = parties.filter((p) => !p.isPrimary).reduce((a, p) => a + Math.max(p.balance, 0), 0);

  return (
    <ScreenScroll>
      <div style={{ padding: '10px 24px 4px' }}><span style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.03em', color: t.text }}>Balances</span></div>
      <div style={{ padding: '0 24px 14px', fontSize: 13, fontWeight: 600, color: t.text3 }}>Settled toward the house</div>

      <div style={{ margin: '0 22px 18px', background: t.ink, borderRadius: 24, padding: '20px 22px', color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)' }}>HOUSEHOLD</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 6 }}>{household?.name}</div>
        <div style={{ display: 'flex', gap: 26, marginTop: 16 }}>
          <div><div style={{ fontSize: 20, fontWeight: 800 }}>{members.length}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>housemates</div></div>
          <div><div style={{ fontSize: 20, fontWeight: 800 }}>{money(outstanding)}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>outstanding</div></div>
        </div>
      </div>

      <div style={{ padding: '0 22px' }}>
        {parties.map((p) => (
          <button key={p.id} onClick={() => onOpenParty(p.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `1px solid ${t.border}`, textAlign: 'left' }}>
            <span style={{ width: 50, height: 50, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#1c1c1c', flex: 'none' }}>{p.initials}</span>
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{p.label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: t.text3 }}>{p.role}</span>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flex: 'none' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: p.isPrimary ? '#14B8A6' : t.text }}>{p.isPrimary ? '+ ' : '− '}{money(Math.abs(p.balance))}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: t.text3 }}>{p.isPrimary ? 'collecting' : 'owes the house'}</span>
            </span>
          </button>
        ))}
      </div>
    </ScreenScroll>
  );
}
