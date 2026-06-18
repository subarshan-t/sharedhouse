import { useEffect, useRef, useState } from 'react';
import { AuthProvider } from './state/AuthContext';
import { useAuth } from './state/useAuth';
import { HouseDataProvider } from './state/HouseDataContext';
import { useHouseData } from './state/useHouseData';
import type { Party } from './state/HouseDataContext';
import { ThemeProvider } from './state/ThemeContext';
import { Shell } from './components/Shell';
import { BottomNav, type NavKey } from './components/BottomNav';
import { SignInScreen } from './screens/SignInScreen';
import { HomeScreen } from './screens/HomeScreen';
import { BillsScreen } from './screens/BillsScreen';
import { BillDetailScreen } from './screens/BillDetailScreen';
import { BalancesScreen } from './screens/BalancesScreen';
import { PartyDetailScreen } from './screens/PartyDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettleScreen } from './screens/SettleScreen';
import { AddExpenseScreen } from './screens/AddExpenseScreen';
import { WeeksEditorScreen } from './screens/WeeksEditorScreen';
import { AwayPeriodsScreen } from './screens/AwayPeriodsScreen';

type Screen = NavKey | 'billDetail' | 'party' | 'settle' | 'add' | 'weeks' | 'away';

function LoadingShell() {
  return (
    <Shell accent="#14B8A6">
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A8AEB4', fontWeight: 700 }}>
        Loading…
      </div>
    </Shell>
  );
}

function MainApp() {
  const { household, loading, parties, settleParty } = useHouseData();
  const [screen, setScreen] = useState<Screen>('home');
  const [selBillId, setSelBillId] = useState<string | null>(null);
  const [selPartyId, setSelPartyId] = useState<string | null>(null);
  const [settleTarget, setSettleTarget] = useState<{ party: Party; returnTo: Screen } | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  if (loading || !household) return <LoadingShell />;

  const accent = household.accent_color || '#14B8A6';
  const navKey: NavKey = screen === 'billDetail' ? 'bills' : screen === 'party' ? 'people'
    : screen === 'weeks' || screen === 'away' ? 'profile' : (screen as NavKey);
  const showNav = (['home', 'bills', 'people', 'profile'] as Screen[]).includes(screen);

  function openSettle(party: Party, returnTo: Screen) {
    setSettleTarget({ party, returnTo });
    setScreen('settle');
  }

  async function confirmSettle(amount: number) {
    if (!settleTarget) return;
    const { party, returnTo } = settleTarget;
    await settleParty(party, amount);
    setScreen(returnTo);
    flash('Marked as paid');
  }

  const selParty = selPartyId ? parties.find((p) => p.id === selPartyId) ?? null : null;

  let content: React.ReactNode = null;
  switch (screen) {
    case 'home':
      content = (
        <HomeScreen
          onOpenBill={(id) => { setSelBillId(id); setScreen('billDetail'); }}
          onOpenAdd={() => setScreen('add')}
          onGoBills={() => setScreen('bills')}
          onSettle={(party) => openSettle(party, 'home')}
        />
      );
      break;
    case 'bills':
      content = <BillsScreen onOpenBill={(id) => { setSelBillId(id); setScreen('billDetail'); }} />;
      break;
    case 'billDetail':
      content = selBillId && <BillDetailScreen billId={selBillId} onBack={() => setScreen('bills')} />;
      break;
    case 'people':
      content = <BalancesScreen onOpenParty={(id) => { setSelPartyId(id); setScreen('party'); }} />;
      break;
    case 'party':
      content = selPartyId && (
        <PartyDetailScreen
          partyId={selPartyId}
          onBack={() => setScreen('people')}
          onSettle={() => selParty && openSettle(selParty, 'party')}
          onRemind={() => flash('Reminder sent')}
        />
      );
      break;
    case 'profile':
      content = <ProfileScreen onOpenWeeks={() => setScreen('weeks')} />;
      break;
    case 'weeks':
      content = <WeeksEditorScreen onBack={() => setScreen('profile')} onOpenAway={() => setScreen('away')} />;
      break;
    case 'away':
      content = <AwayPeriodsScreen onBack={() => setScreen('weeks')} />;
      break;
    case 'settle':
      content = settleTarget && (
        <SettleScreen
          party={settleTarget.party}
          onBack={() => setScreen(settleTarget.returnTo)}
          onConfirm={(amount) => { void confirmSettle(amount); }}
        />
      );
      break;
    case 'add':
      content = (
        <AddExpenseScreen
          onBack={() => setScreen('home')}
          onSaved={() => { setScreen('home'); flash('Expense added'); }}
        />
      );
      break;
  }

  return (
    <Shell accent={accent} toast={toast} nav={showNav ? <BottomNav active={navKey} onNavigate={(k) => setScreen(k)} /> : undefined}>
      {content}
    </Shell>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingShell />;
  if (!session) return <SignInScreen />;
  return (
    <HouseDataProvider>
      <MainApp />
    </HouseDataProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
