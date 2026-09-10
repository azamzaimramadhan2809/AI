import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Palette,
  Globe2,
  Bell,
  BrainCircuit,
  Mic,
  RefreshCcw,
  ShieldCheck,
  HardDrive,
  Gauge,
  Info,
  ChevronRight,
} from 'lucide-react';
import styles from './Settings.module.css';

/**
 * ------------------------------------------------------------------
 * Section registry
 * ------------------------------------------------------------------
 * This is the single source of truth for the left navigation panel
 * AND for what the right content pane renders.
 *
 * When real sections are ready, drop them in:
 *   settings/sections/Appearance.tsx
 *   settings/sections/LanguageRegion.tsx
 *   settings/sections/Notifications.tsx
 *   settings/sections/AIBehavior.tsx
 *   settings/sections/Voice.tsx
 *   settings/sections/DeviceSync.tsx
 *   settings/sections/Privacy.tsx
 *   settings/sections/Storage.tsx
 *   settings/sections/StartupPerformance.tsx
 *   settings/sections/About.tsx
 *
 * ...and wire them into `SECTION_COMPONENTS` at the bottom of this
 * file. Settings.tsx itself (layout, nav, search, animation) never
 * has to change.
 * ------------------------------------------------------------------
 */

export type SectionId =
  | 'appearance'
  | 'language'
  | 'notifications'
  | 'ai-behavior'
  | 'voice'
  | 'device-sync'
  | 'privacy'
  | 'storage'
  | 'startup'
  | 'about';

interface SettingsCategory {
  id: SectionId;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  description: string;
  upcoming: string[];
}

const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'appearance',
    icon: Palette,
    title: 'Appearance',
    subtitle: 'Theme, color & density',
    description: 'Control how JARVIS looks — from accent color to motion intensity.',
    upcoming: ['Theme settings', 'Accent colors', 'Animations', 'UI density'],
  },
  {
    id: 'language',
    icon: Globe2,
    title: 'Language & Region',
    subtitle: 'Locale, time & units',
    description: 'Set the language JARVIS speaks in and how it formats dates, time, and units.',
    upcoming: ['Display language', 'Voice response language', 'Time & date format', 'Measurement units'],
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    subtitle: 'Alerts & sounds',
    description: 'Decide what JARVIS notifies you about, and how it gets your attention.',
    upcoming: ['System alerts', 'Sound & tone pack', 'Do not disturb schedule', 'Priority contacts'],
  },
  {
    id: 'ai-behavior',
    icon: BrainCircuit,
    title: 'AI Behavior',
    subtitle: 'Personality & responses',
    description: 'Shape how JARVIS thinks, responds, and adapts to you over time.',
    upcoming: ['Personality profile', 'Response length', 'Proactivity level', 'Memory & context'],
  },
  {
    id: 'voice',
    icon: Mic,
    title: 'Voice',
    subtitle: 'Wake word & speech',
    description: 'Configure how JARVIS listens and how it sounds when it talks back.',
    upcoming: ['Wake word', 'Voice identity', 'Microphone settings', 'Speaker settings'],
  },
  {
    id: 'device-sync',
    icon: RefreshCcw,
    title: 'Device Sync',
    subtitle: 'Connected devices',
    description: 'Manage the devices linked to your JARVIS instance and how they stay in sync.',
    upcoming: ['Linked devices', 'Sync frequency', 'Cross-device handoff', 'Offline behavior'],
  },
  {
    id: 'privacy',
    icon: ShieldCheck,
    title: 'Privacy & Security',
    subtitle: 'Data & permissions',
    description: 'Review what JARVIS can access and how your data is protected.',
    upcoming: ['App permissions', 'Data retention', 'Encryption status', 'Login & authentication'],
  },
  {
    id: 'storage',
    icon: HardDrive,
    title: 'Storage',
    subtitle: 'Cache & data usage',
    description: 'See what JARVIS is storing locally and clear it up when you need to.',
    upcoming: ['Cache usage', 'Conversation history', 'Downloaded models', 'Clear data'],
  },
  {
    id: 'startup',
    icon: Gauge,
    title: 'Startup & Performance',
    subtitle: 'Boot & resource usage',
    description: 'Tune how JARVIS starts up and how much of your system it uses.',
    upcoming: ['Launch on startup', 'Background resource limits', 'Hardware acceleration', 'Diagnostics'],
  },
  {
    id: 'about',
    icon: Info,
    title: 'About',
    subtitle: 'Version & info',
    description: 'Version details, release notes, and everything under the hood.',
    upcoming: ['App version', 'Release notes', 'Licenses', 'Support & feedback'],
  },
];

function toComponentName(id: SectionId): string {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SectionId>('appearance');
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SETTINGS_CATEGORIES;
    return SETTINGS_CATEGORIES.filter(
      (cat) =>
        cat.title.toLowerCase().includes(q) ||
        cat.subtitle.toLowerCase().includes(q)
    );
  }, [query]);

  const activeCategory =
    SETTINGS_CATEGORIES.find((cat) => cat.id === activeSection) ??
    SETTINGS_CATEGORIES[0];

  const ActiveIcon = activeCategory.icon;

  return (
    <div className={styles.page}>
      <div className={styles.ambientGlowOne} aria-hidden="true" />
      <div className={styles.ambientGlowTwo} aria-hidden="true" />

      {/* LEFT: control panel navigation */}
      <nav className={styles.navPanel} aria-label="Settings categories">
        <div className={styles.navHeader}>
          <h1 className={styles.navTitle}>Settings</h1>
          <p className={styles.navCaption}>JARVIS control center</p>
        </div>

        <div className={styles.searchWrap}>
          <Search size={16} strokeWidth={2} className={styles.searchIcon} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search settings..."
            className={styles.searchInput}
            aria-label="Search settings"
          />
        </div>

        <div className={styles.navList} role="tablist" aria-orientation="vertical">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.id === activeSection;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSection(cat.id)}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="settingsActiveIndicator"
                    className={styles.activeIndicator}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className={styles.navIconWrap}>
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <span className={styles.navTextWrap}>
                  <span className={styles.navItemTitle}>{cat.title}</span>
                  <span className={styles.navItemSubtitle}>{cat.subtitle}</span>
                </span>
                <ChevronRight size={14} strokeWidth={2} className={styles.navChevron} />
              </button>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className={styles.noResults}>
              No settings match &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        <div className={styles.navFooter}>
          <span className={styles.statusDot} />
          <span className={styles.navFooterText}>Core online</span>
        </div>
      </nav>

      {/* RIGHT: dynamic content container */}
      <section className={styles.contentPanel} aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={styles.contentInner}
          >
            <header className={styles.contentHeader}>
              <span className={styles.contentIconWrap}>
                <ActiveIcon size={22} strokeWidth={1.5} />
              </span>
              <div>
                <h2 className={styles.contentTitle}>{activeCategory.title}</h2>
                <p className={styles.contentSubtitle}>{activeCategory.subtitle}</p>
              </div>
            </header>

            {/*
              PLACEHOLDER ONLY.
              Replace this block with:
                {SECTION_COMPONENTS[activeCategory.id]}
              once real section components exist under settings/sections/.
              No other part of this file needs to change.
            */}
            <div className={styles.placeholderCard}>
              <p className={styles.placeholderLead}>{activeCategory.description}</p>

              <p className={styles.placeholderCaption}>This section will contain:</p>
              <ul className={styles.placeholderList}>
                {activeCategory.upcoming.map((item) => (
                  <li key={item} className={styles.placeholderListItem}>
                    <span className={styles.placeholderDot} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className={styles.placeholderFootnote}>
                Routing target:{' '}
                <code className={styles.placeholderCode}>
                  settings/sections/{toComponentName(activeCategory.id)}.tsx
                </code>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}