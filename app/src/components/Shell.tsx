import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../state/useTheme';

const STATUS_ICONS = (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor">
      <rect x="0" y="7" width="3" height="4" rx="1"></rect>
      <rect x="5" y="5" width="3" height="6" rx="1"></rect>
      <rect x="10" y="2.5" width="3" height="8.5" rx="1"></rect>
      <rect x="15" y="0" width="3" height="11" rx="1"></rect>
    </svg>
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
      <path d="M8.5 2.4c2.6 0 5 1 6.8 2.6l1.4-1.6A12 12 0 0 0 .3 3.4l1.4 1.6A10 10 0 0 1 8.5 2.4z"></path>
      <path d="M8.5 6.1c1.5 0 2.9.55 4 1.5l1.4-1.6a8.5 8.5 0 0 0-10.8 0l1.4 1.6a6 6 0 0 1 4-1.5z"></path>
      <path d="M8.5 9.3l2-2.2a4 4 0 0 0-4 0z"></path>
    </svg>
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4"></rect>
      <rect x="2" y="2" width="16" height="8" rx="1.5" fill="currentColor"></rect>
      <rect x="23" y="3.7" width="1.6" height="4.6" rx="0.8" fill="currentColor" opacity="0.4"></rect>
    </svg>
  </div>
);

export function Shell({
  accent, children, nav, toast,
}: {
  accent: string;
  children: ReactNode;
  nav?: ReactNode;
  toast?: string;
}) {
  const { dark, toggleDark, t } = useTheme();

  const pageStyle: CSSProperties = {
    minHeight: '100vh', background: t.page, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '38px 16px', position: 'relative',
    transition: 'background .3s',
  };

  const phoneStyle: CSSProperties = {
    position: 'relative', width: 392, height: 848, background: t.bg, borderRadius: 48,
    boxShadow: t.shadow, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    transition: 'background .3s', border: `1px solid ${t.border}`,
  };

  return (
    <div style={pageStyle}>
      <button
        onClick={toggleDark}
        style={{
          position: 'absolute', top: 22, right: 26, zIndex: 60, display: 'flex',
          alignItems: 'center', gap: 9, background: t.bg, color: t.text, border: `1px solid ${t.border}`,
          padding: '9px 15px 9px 13px', borderRadius: 999, fontWeight: 700, fontSize: 13,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>
        </svg>
        {dark ? 'Light' : 'Dark'}
      </button>

      <div style={phoneStyle}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px 4px', flex: 'none', color: t.text,
        }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>9:41</span>
          {STATUS_ICONS}
        </div>

        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {children}
        </div>

        {nav !== undefined ? nav : (
          <div style={{
            position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)',
            width: 132, height: 5, borderRadius: 999, background: t.text3, opacity: 0.45,
          }}
          />
        )}

        {toast && (
          <div style={{
            position: 'absolute', bottom: 104, left: '50%', transform: 'translateX(-50%)',
            background: t.ink, color: '#fff', padding: '13px 20px', borderRadius: 15,
            display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 14,
            whiteSpace: 'nowrap', boxShadow: '0 16px 36px rgba(0,0,0,0.35)', animation: 'toastIn .3s ease', zIndex: 50,
          }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

export function ScreenScroll({ children, padBottom = true }: { children: ReactNode; padBottom?: boolean }) {
  return (
    <div className="scrl" style={{ height: '100%', overflowY: 'auto', paddingBottom: padBottom ? 24 : 0, animation: 'scIn .32s ease' }}>
      {children}
    </div>
  );
}
