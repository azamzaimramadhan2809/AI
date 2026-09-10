import { useState } from 'react';
import styles from './AiSettings.module.css';

// ── Icons ──────────────────────────────────────────────────────────────────

const IconUsers = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconBotPlus = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="7" width="16" height="13" rx="3" />
    <path d="M12 3v4" />
    <circle cx="8.5" cy="13" r="1" />
    <circle cx="15.5" cy="13" r="1" />
    <path d="M12 16h.01" />
    <path d="M19 3v4" />
    <path d="M16 6h6" />
  </svg>
);

const IconCpu = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3" />
    <path d="M15 1v3" />
    <path d="M9 20v3" />
    <path d="M15 20v3" />
    <path d="M20 9h3" />
    <path d="M20 14h3" />
    <path d="M1 9h3" />
    <path d="M1 14h3" />
  </svg>
);

// ── Tab config ─────────────────────────────────────────────────────────────

type TabId = 'characters' | 'studio' | 'hub';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'characters', label: 'Characters',       icon: <IconUsers size={16} /> },
  { id: 'studio',     label: 'Assistant Studio', icon: <IconBotPlus size={16} /> },
  { id: 'hub',        label: 'AI Hub',            icon: <IconCpu size={16} /> },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function AISettings() {
  const [activeTab, setActiveTab] = useState<TabId>('characters');

  return (
    <div className={styles.page}>

      {/* ── Ambient background orbs ── */}
      <div className={styles.bgOrbs} aria-hidden="true">
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      {/* ── Sticky top navbar ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h1 className={styles.title}>AI Settings</h1>
          <p className={styles.subtitle}>Manage your AI ecosystem</p>
        </div>

        <nav className={styles.tabs} aria-label="AI Settings sections">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <span className={styles.tabIcon}>{icon}</span>
              <span className={styles.tabLabel}>{label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* ── Main content area ── */}
      <main className={styles.content} />

    </div>
  );
}