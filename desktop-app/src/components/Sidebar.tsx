import { useState, useRef, useCallback } from 'react';
import styles from './Sidebar.module.css';

// ── Icons ──────────────────────────────────────────────────────────────────

const IconBolt = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconHome = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const IconChat = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconAISettings = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
    <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none"/>
    <path d="M9 18c1 1 5 1 6 0" />
  </svg>
);

const IconNews = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8z" />
  </svg>
);

const IconLibrary = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconNotification = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconDevices = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="13" height="9" rx="1.5" />
    <path d="M1 16h15" />
    <rect x="17" y="6" width="5" height="10" rx="1.5" />
    <circle cx="19.5" cy="13.5" r="0.5" />
  </svg>
);

const IconSettings = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconChevronLeft = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconMoreVertical = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
  </svg>
);

const IconSun = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ── Types ──────────────────────────────────────────────────────────────────

type NavId = 'home' | 'chat' | 'ai-settings' | 'Discover' | 'library' | 'settings' | 'notifications' | 'devices' | 'profile';

interface NavItem {
  id: NavId;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  dot?: boolean;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',          label: 'Home',           icon: <IconHome />,                           group: 'main' },
  { id: 'chat',          label: 'Chat',           icon: <IconChat />, badge: '3',               group: 'main' },
  { id: 'Discover',      label: 'Discover',       icon: <IconNews />,                           group: 'main' },
  { id: 'notifications', label: 'Notifications',  icon: <IconNotification />,                   group: 'main' },
  { id: 'ai-settings',   label: 'AI Settings',    icon: <IconAISettings />, dot: true,          group: 'system' },
  { id: 'devices',       label: 'Devices',        icon: <IconDevices />,                        group: 'system' },
  { id: 'library',       label: 'Library',        icon: <IconLibrary />,                        group: 'system' },
  { id: 'settings',      label: 'Settings',       icon: <IconSettings />,                       group: 'system' },
];

interface SidebarProps {
  activeNav?: NavId;
  onNavChange?: (id: NavId) => void;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  theme?: 'dark' | 'light';
  onThemeChange?: (theme: 'dark' | 'light', originX: number, originY: number) => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Sidebar({
  activeNav = 'home',
  onNavChange,
  expanded: controlledExpanded,
  onExpandedChange,
  theme: controlledTheme,
  onThemeChange,
}: SidebarProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [internalTheme, setInternalTheme] = useState<'dark' | 'light'>('dark');
  const [iconAnimating, setIconAnimating] = useState(false);
  // animating class: aktif sesaat saat toggle untuk trigger keyframe stagger
  const [isAnimating, setIsAnimating] = useState(false);
  const animatingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const currentTheme = controlledTheme !== undefined ? controlledTheme : internalTheme;
  const isDark = currentTheme === 'dark';

  // Trigger class .animating selama durasi animasi (450ms)
  const triggerAnimating = useCallback(() => {
    if (animatingTimerRef.current) clearTimeout(animatingTimerRef.current);
    setIsAnimating(true);
    animatingTimerRef.current = setTimeout(() => setIsAnimating(false), 500);
  }, []);

  const handleToggle = () => {
    triggerAnimating();
    const next = !isExpanded;
    setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: 'dark' | 'light' = isDark ? 'light' : 'dark';
    setInternalTheme(next);
    const rect = e.currentTarget.getBoundingClientRect();
    const originX = rect.left + rect.width  / 2;
    const originY = rect.top  + rect.height / 2;
    setIconAnimating(true);
    setTimeout(() => setIconAnimating(false), 420);
    onThemeChange?.(next, originX, originY);
  };

  const handleNavClick = (id: NavId) => {
    onNavChange?.(id);
  };

  // Group nav items
  const mainItems   = NAV_ITEMS.filter(i => i.group === 'main');
  const systemItems = NAV_ITEMS.filter(i => i.group === 'system');

  // Global item index untuk stagger — dihitung lintas group
  const itemIndexMap = new Map<NavId, number>();
  NAV_ITEMS.forEach((item, idx) => itemIndexMap.set(item.id, idx));

  const renderNavItem = (item: NavItem) => {
    const isActive = activeNav === item.id;
    const itemIndex = itemIndexMap.get(item.id) ?? 0;

    return (
      <button
        key={item.id}
        className={[styles.navItem, isActive ? styles.active : ''].filter(Boolean).join(' ')}
        onClick={() => handleNavClick(item.id)}
        aria-current={isActive ? 'page' : undefined}
        aria-label={item.label}
        title={!isExpanded ? item.label : undefined}
        // CSS custom property untuk stagger delay
        style={{ '--item-index': itemIndex } as React.CSSProperties}
      >
        <span className={styles.navIconWrap}>
          {item.icon}
          {item.dot && !item.badge && (
            <span className={styles.navDot} aria-hidden="true" />
          )}
        </span>
        <span className={styles.navItemLabel}>{item.label}</span>
        {item.badge && (
          <span className={styles.navBadge} aria-label={`${item.badge} unread`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  // Build sidebar class list
  const sidebarClasses = [
    styles.sidebar,
    isExpanded  ? styles.expanded  : '',
    isAnimating ? styles.animating : '',
  ].filter(Boolean).join(' ');

  return (
    <aside
      className={sidebarClasses}
      aria-label="Main navigation"
    >
      {/* ── Logo ── */}
      <div className={styles.logoArea}>
        <div className={styles.logoMark}>
          <div className={styles.logoRing} />
          <div className={styles.logoInner}>
            <span className={styles.logoIcon}>
              <IconBolt size={18} />
            </span>
          </div>
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoName}>Delta</span>
          <span className={styles.logoSub}>AI Assistant</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Navigation ── */}
      <nav className={styles.nav} role="navigation">
        {/* Main group */}
        <span className={styles.navLabel}>Main</span>
        {mainItems.map(renderNavItem)}

        {/* System group */}
        <span className={styles.navLabel}>System</span>
        {systemItems.map(renderNavItem)}

        <div className={styles.navSpacer} />
      </nav>

      {/* ── Bottom actions ── */}
      <div className={styles.bottomActions}>
        <button
          className={styles.themeToggle}
          onClick={handleThemeToggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <span className={[styles.themeIconWrap, iconAnimating ? styles.themeIconAnimating : ''].filter(Boolean).join(' ')}>
            {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
          </span>
          <span className={styles.themeLabel}>
            {isDark ? 'Light mode' : 'Dark mode'}
          </span>
        </button>

        <button
          className={styles.collapseBtn}
          onClick={handleToggle}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <span className={styles.collapseIconWrap}>
            <span className={styles.collapseChevron}>
              <IconChevronLeft size={15} />
            </span>
          </span>
          <span className={styles.collapseBtnLabel}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
        </button>
      </div>

      {/* ── Profile ── */}
      <div
        className={[styles.profileArea, activeNav === 'profile' ? styles.profileAreaActive : ''].filter(Boolean).join(' ')}
        role="button"
        tabIndex={0}
        aria-label="User profile"
        onClick={() => handleNavClick('profile')}
        onKeyDown={(e) => e.key === 'Enter' && handleNavClick('profile')}
      >
        <div className={styles.avatar}>
          J
          <span className={styles.avatarStatus} aria-label="Online" />
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>Azam Za'im R.</div>
          <div className={styles.profileRole}>Pro · Active</div>
        </div>
        <span className={styles.profileMore} aria-hidden="true">
          <IconMoreVertical size={14} />
        </span>
      </div>
    </aside>
  );
}