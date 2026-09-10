import { useState, useEffect, useCallback } from 'react';
import AppShell from "./layouts/AppShell";
import Home from "./pages/home/Home";
import ChatPage from "./pages/chats/ChatPage";
import AiSettings from "./pages/ai_settings/AiSettings";
import Notification from './pages/notification/Notification';
import Devices from './pages/devices/Devices';
import Library from './pages/library/Library';
import Settings from './pages/settings/Settings';
import Discover from './pages/discover/Discover';
import Profile from "./components/Profile";

type NavId = 'home' | 'chat' | 'ai-settings' | 'Discover' | 'library' | 'settings' | 'notifications' | 'devices' | 'profile';
type Theme = 'dark' | 'light';

// ── Ripple theme toggle ─────────────────────────────────────────────────────
// Pakai View Transitions API kalau browser support,
// fallback ke smooth CSS transition kalau nggak support.

function triggerThemeTransition(
  nextTheme: Theme,
  originX: number,
  originY: number,
  callback: (theme: Theme) => void
) {
  const root = document.documentElement;

  // Fallback: kalau browser gak support View Transitions, langsung apply aja
  // CSS transition di tokens.css yang handle smooth-nya
  if (!document.startViewTransition) {
    callback(nextTheme);
    root.setAttribute('data-theme', nextTheme);
    return;
  }

  // Hitung radius ripple — harus cukup besar cover seluruh layar
  const maxRadius = Math.hypot(
    Math.max(originX, window.innerWidth  - originX),
    Math.max(originY, window.innerHeight - originY)
  );

  // Inject keyframes ripple sekali aja
  if (!document.getElementById('theme-ripple-style')) {
    const style = document.createElement('style');
    style.id = 'theme-ripple-style';
    style.textContent = `
      @keyframes theme-ripple-in {
        from { clip-path: circle(0px at var(--ripple-x) var(--ripple-y)); }
        to   { clip-path: circle(var(--ripple-r)  at var(--ripple-x) var(--ripple-y)); }
      }
      ::view-transition-new(root) {
        animation: theme-ripple-in 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      ::view-transition-old(root) {
        animation: none;
        z-index: 0;
      }
      ::view-transition-new(root) {
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }

  // Set CSS vars untuk posisi & radius ripple
  root.style.setProperty('--ripple-x', `${originX}px`);
  root.style.setProperty('--ripple-y', `${originY}px`);
  root.style.setProperty('--ripple-r', `${maxRadius}px`);

  // Jalankan View Transition
  const transition = document.startViewTransition(() => {
    callback(nextTheme);
    root.setAttribute('data-theme', nextTheme);
  });

  // Cleanup setelah selesai
  transition.finished.finally(() => {
    root.style.removeProperty('--ripple-x');
    root.style.removeProperty('--ripple-y');
    root.style.removeProperty('--ripple-r');
  });
}

// ── Component ───────────────────────────────────────────────────────────────

function App() {
  const [activeNav, setActiveNav] = useState<NavId>('home');
  const [theme, setTheme] = useState<Theme>('dark');

  // Set initial data-theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Dipanggil dari Sidebar dengan koordinat tombol klik
  const handleThemeChange = useCallback((nextTheme: Theme, originX: number, originY: number) => {
    triggerThemeTransition(nextTheme, originX, originY, setTheme);
  }, []);

  const renderPage = () => {
    switch (activeNav) {
      case 'chat':
        return <ChatPage />;
      case 'ai-settings':
        return <AiSettings />;
      case 'profile':
        return <Profile />;
      case 'notifications':
        return <Notification />;
      case 'devices':
        return <Devices />;
      case 'Discover':
        return <Discover />;
      case 'library':
        return <Library />;
      case 'settings':
        return <Settings />;
      case 'home':
      default:
        return <Home onNavigate={setActiveNav} />;
    }
  };

  return (
    <AppShell
      activeNav={activeNav}
      onNavChange={setActiveNav}
      theme={theme}
      onThemeChange={handleThemeChange}
    >
      {renderPage()}
    </AppShell>
  );
}

export default App;