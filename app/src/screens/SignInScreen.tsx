import { useState } from 'react';
import { Shell, ScreenScroll } from '../components/Shell';
import { useTheme } from '../state/useTheme';
import { useAuth } from '../state/useAuth';

const ACCENT = '#14B8A6';

export function SignInScreen() {
  const { t } = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError('');
    if (!username.trim() || !password) { setError('Enter a username and password.'); return; }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(username, password);
      } else {
        await signUp(username, password, displayName);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const inputWrap = (icon: React.ReactNode, input: React.ReactNode) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11, background: t.surface,
      borderRadius: 15, padding: '15px 16px',
    }}
    >
      {icon}
      {input}
    </div>
  );

  return (
    <Shell accent={ACCENT}>
      <ScreenScroll>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 0 0', height: '100%' }}>
          <span style={{
            width: 58, height: 58, borderRadius: 18, background: 'linear-gradient(135deg,#14B5A6,#6CDF9F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 26px -8px rgba(20,180,160,0.7)',
          }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5"></path>
            </svg>
          </span>
          <div style={{ fontSize: 29, fontWeight: 800, letterSpacing: '-0.04em', color: t.text, marginTop: 22 }}>
            Welcome to hearth<span style={{ color: ACCENT }}>.</span>
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: t.text3, marginTop: 7, lineHeight: 1.5 }}>
            One house. Every bill, split fairly.
          </div>

          {mode === 'signup' && (
            <div style={{ marginTop: 26 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: t.text3, marginBottom: 8 }}>DISPLAY NAME</div>
              {inputWrap(
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-1a7 7 0 0 1 14 0v1"></path>
                </svg>,
                <input
                  type="text" placeholder="Suban" value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{ fontSize: 15, fontWeight: 600, color: t.text }}
                />,
              )}
            </div>
          )}

          <div style={{ marginTop: mode === 'signup' ? 16 : 26 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: t.text3, marginBottom: 8 }}>USERNAME</div>
            {inputWrap(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-1a7 7 0 0 1 14 0v1"></path>
              </svg>,
              <input
                type="text" autoCapitalize="none" placeholder="suban" value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ fontSize: 15, fontWeight: 600, color: t.text }}
              />,
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: t.text3, marginBottom: 8 }}>PASSWORD</div>
            {inputWrap(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.text3} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
                <rect x="4" y="10" width="16" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
              </svg>,
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ fontSize: 15, fontWeight: 600, color: t.text, letterSpacing: '0.16em' }}
              />,
            )}
          </div>

          {error && (
            <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700, color: '#E5715A' }}>{error}</div>
          )}

          <button
            onClick={submit}
            disabled={busy}
            style={{
              width: '100%', height: 56, borderRadius: 16, background: ACCENT, color: '#fff',
              fontWeight: 800, fontSize: 15, letterSpacing: '0.04em', marginTop: 24,
              boxShadow: `0 14px 30px -10px ${ACCENT}`, opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'PLEASE WAIT…' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '10px 0 22px', fontSize: 13, fontWeight: 600, color: t.text3 }}>
          {mode === 'signin' ? (
            <>New to the house? <button onClick={() => setMode('signup')} style={{ fontWeight: 800, color: ACCENT }}>Create one</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('signin')} style={{ fontWeight: 800, color: ACCENT }}>Sign in</button></>
          )}
        </div>
      </ScreenScroll>
    </Shell>
  );
}
