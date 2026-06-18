import { useTheme } from '../state/useTheme';

export type NavKey = 'home' | 'bills' | 'people' | 'profile';

const TABS: { key: NavKey; label: string; path: string }[] = [
  { key: 'home', label: 'Home', path: 'M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5' },
  { key: 'bills', label: 'Bills', path: 'M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21zM9 8h6M9 12h6' },
  { key: 'people', label: 'People', path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { key: 'profile', label: 'Profile', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-1a7 7 0 0 1 14 0v1' },
];

export function BottomNav({ active, onNavigate }: { active: NavKey; onNavigate: (k: NavKey) => void }) {
  const { t } = useTheme();
  return (
    <div style={{
      flex: 'none', background: t.nav, borderTop: `1px solid ${t.border}`,
      padding: '9px 16px calc(16px + env(safe-area-inset-bottom, 0px))', display: 'flex', alignItems: 'flex-start',
    }}
    >
      {TABS.map((tab) => {
        const a = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onNavigate(tab.key)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
          >
            <span style={{
              width: 48, height: 38, borderRadius: 14, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: a ? t.ink : 'transparent', transition: 'background .25s',
            }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={a ? '#fff' : t.text3} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.path}></path>
              </svg>
            </span>
            <span style={{
              fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase',
              fontWeight: a ? 700 : 600, color: a ? t.text : t.text3,
            }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
