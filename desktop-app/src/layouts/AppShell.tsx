import { useState, type ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import styles from './AppShell.module.css';

// ── Types ──────────────────────────────────────────────────────────────────

type NavId = 'home' | 'chat' | 'ai-settings' | 'Discover' | 'library' | 'settings' | 'notifications' | 'devices' | 'profile';
type Theme = 'dark' | 'light';
interface AppShellProps {
  /** Controlled active nav item. Defaults to 'chat'. */
  activeNav?: NavId;
  /** Called when user switches nav items. */
  onNavChange?: (id: NavId) => void;
  /** Controlled theme. */
  theme?: Theme;
  /** Called when user toggles theme. */
  onThemeChange?: (theme: Theme, originX: number, originY: number) => void;
  /** Page / feature content rendered inside the main area. */
  children?: ReactNode;
}

// ── Helper icons (status bar) ──────────────────────────────────────────────

const IconCpu = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const IconWifi = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

const IconActivity = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconPlaceholder = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" opacity="0.4" />
  </svg>
);

// ── Utility ────────────────────────────────────────────────────────────────

function currentTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AppShell({
  activeNav: controlledNav,
  onNavChange,
  theme,
  onThemeChange,
  children,
}: AppShellProps) {
  const [internalNav, setInternalNav] = useState<NavId>('chat');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const activeNav = controlledNav !== undefined ? controlledNav : internalNav;

  const handleNavChange = (id: NavId) => {
    setInternalNav(id);
    onNavChange?.(id);
  };

  return (
    <div className={styles.shell}>
      {/* Atmospheric background */}
      <div className={styles.shellBg} aria-hidden="true" />

      {/* ── Sidebar slot ── */}
      <div
        className={[
          styles.sidebarSlot,
          sidebarExpanded ? styles.expanded : '',
        ].filter(Boolean).join(' ')}
      >
        <Sidebar
          activeNav={activeNav}
          onNavChange={handleNavChange}
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
          theme={theme}
          onThemeChange={onThemeChange}
        />
      </div>

      {/* ── Main area ── */}
      <main className={styles.main} aria-label="Main content area">
        {/* Full-bleed content — no padding so pages like ChatPage fill edge-to-edge */}
        <div className={styles.content}>
          {children ? (
            <div className={styles.pageSlot}>{children}</div>
          ) : (
            <div className={styles.emptySlot}>
              <div className={styles.emptySlotIcon}>
                <IconPlaceholder />
              </div>
              <span>No content rendered</span>
            </div>
          )}
        </div>

        {/* ── Status bar ── */}
        <footer className={styles.statusBar} aria-label="Status bar">
          <div className={styles.statusLeft}>
            <span className={styles.statusItem}>
              <span className={styles.statusDot} aria-hidden="true" />
              Connected
            </span>
            <span className={styles.statusItem}>
              <IconActivity />
              Model: claude-sonnet-4
            </span>
          </div>

          <div className={styles.statusRight}>
            <span className={styles.statusItem}>
              <IconCpu />
              CPU 12%
            </span>
            <span className={styles.statusItem}>
              <IconWifi />
              Online
            </span>
            <span className={styles.statusItem}>
              {currentTime()}
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}