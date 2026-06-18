import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../state/useTheme';

export function Shell({
  accent, children, nav, toast,
}: {
  accent: string;
  children: ReactNode;
  nav?: ReactNode;
  toast?: string;
}) {
  const { t } = useTheme();

  const pageVars = { '--page-bg': t.page } as CSSProperties;
  const phoneVars = { '--shell-bg': t.bg, '--shell-shadow': t.shadow, '--border-color': t.border } as CSSProperties;

  return (
    <div className="app-page" style={pageVars}>
      <div className="app-phone" style={phoneVars}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          {children}
        </div>

        {nav !== undefined ? nav : (
          <div style={{
            flex: 'none', height: 'calc(20px + env(safe-area-inset-bottom, 0px))', position: 'relative',
          }}
          >
            <div style={{
              position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)',
              width: 132, height: 5, borderRadius: 999, background: t.text3, opacity: 0.45,
            }}
            />
          </div>
        )}

        {toast && (
          <div style={{
            position: 'absolute', bottom: 'calc(104px + env(safe-area-inset-bottom, 0px))', left: '50%', transform: 'translateX(-50%)',
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
