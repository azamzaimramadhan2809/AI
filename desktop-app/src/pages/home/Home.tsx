import { useEffect, useMemo, useState } from "react"; // useState still needed for the clock
import { motion, type Variants } from "framer-motion";
import {
  Bell,
  Bot,
  CloudSun,
  Droplets,
  Image as ImageIcon,
  Laptop,
  Library,
  Link2,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Mic,
  Monitor,
  Newspaper,
  Settings2,
  Smartphone,
  Sparkles,
  Tablet,
  Wind,
} from "lucide-react";
import styles from "./Home.module.css";

// ---------------------------------------------------------------------------
// Mock data — replace with real sources once the backend is wired up.
// ---------------------------------------------------------------------------

const USER_NAME = "Zaim";

const WEATHER = {
  location: "Semarang",
  condition: "Partly Cloudy",
  temp: 28,
  feelsLike: 31,
  humidity: 78,
  wind: 9,
};

// `route` values match the NavId your App.tsx switch already expects
// ('notifications' | 'devices' | 'ai-settings' | 'chat').
const STATS = [
  { id: "notif", label: "Notifications", value: "3", caption: "unread", icon: Bell, route: "notifications" as const },
  { id: "devices", label: "Devices", value: "4", caption: "connected", icon: Laptop, route: "devices" as const },
  { id: "models", label: "AI Models", value: "3", caption: "active", icon: Bot, route: "ai-settings" as const },
  { id: "chats", label: "Chats", value: "27", caption: "conversations", icon: MessagesSquare, route: "chat" as const },
];

const QUICK_ACTIONS = [
  { id: "chat", label: "Open Chat", icon: MessageCircle },
  { id: "news", label: "Discover News", icon: Newspaper },
  { id: "image", label: "Generate Image", icon: ImageIcon },
  { id: "device", label: "Connect Device", icon: Link2 },
  { id: "library", label: "Open Library", icon: Library },
  { id: "settings", label: "Open AI Settings", icon: Settings2 },
];

const ACTIVITY = [
  { id: "a1", text: "You chatted with GPT-5 Assistant", time: "2 minutes ago", icon: MessageCircle },
  { id: "a2", text: "Laptop Sekolah connected", time: "5 minutes ago", icon: Laptop },
  { id: "a3", text: "New AI news available", time: "12 minutes ago", icon: Newspaper },
  { id: "a4", text: "Notification received", time: "25 minutes ago", icon: Bell },
];

const DEVICES = [
  { id: "d1", name: "Laptop Sekolah", online: true, icon: Laptop },
  { id: "d2", name: `${USER_NAME}'s Phone`, online: true, icon: Smartphone },
  { id: "d3", name: "Tablet Kelas", online: true, icon: Tablet },
  { id: "d4", name: "Gaming PC", online: false, icon: Monitor },
];

const TRENDING = ["AI", "OpenAI", "Bitcoin", "Technology", "Space", "Programming"];

const AI_STATUS = {
  assistant: "Jarvis Core",
  model: "GPT-5",
  status: "Online",
  voice: "Ready",
  memory: "Enabled",
};

// ---------------------------------------------------------------------------

function getGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
}

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

// Matches the subset of App.tsx's NavId that these stat cards link to.
type StatNavTarget = "notifications" | "devices" | "ai-settings" | "chat";

interface HomeProps {
  /** Pass App.tsx's setActiveNav here, e.g. <Home onNavigate={setActiveNav} /> */
  onNavigate: (target: StatNavTarget) => void;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.06, ease: EASE_OUT },
  }),
};

export default function Home({ onNavigate }: HomeProps) {
  const now = useClock();

  const greeting = useMemo(() => getGreeting(now.getHours()), [now]);

  const dateLabel = useMemo(
    () =>
      now.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [now]
  );

  const timeLabel = useMemo(
    () =>
      now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    [now]
  );

  return (
    <div className={styles.page}>
      {/* Ambient layers */}
      <div className={styles.mesh} aria-hidden="true" />
      <div className={styles.orbCyan} aria-hidden="true" />
      <div className={styles.orbViolet} aria-hidden="true" />
      <div className={styles.orbAmber} aria-hidden="true" />

      <div className={styles.shell}>
        {/* ----------------------------------------------------------- Header */}
        <header className={styles.header}>
          <motion.div
            className={styles.headerContent}
            initial="hidden"
            animate="show"
          >
            <motion.p custom={0} variants={fadeUp} className={styles.eyebrow}>
              <Sparkles size={13} />
              Jarvis is online
            </motion.p>
            <motion.h1 custom={1} variants={fadeUp} className={styles.greeting}>
              {greeting}, {USER_NAME} <span className={styles.wave}>👋</span>
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className={styles.dateLabel}>
              {dateLabel}
            </motion.p>
            <motion.p custom={3} variants={fadeUp} className={styles.clock}>
              {timeLabel}
              <span className={styles.clockUnit}>WIB</span>
            </motion.p>
          </motion.div>
        </header>

        {/* ------------------------------------------------------- Top grid */}
        <section className={styles.topGrid}>
          <motion.div
            className={styles.weatherCard}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            whileHover={{ y: -3 }}
          >
            <div className={styles.weatherTop}>
              <div className={styles.weatherLocation}>
                <MapPin size={14} />
                {WEATHER.location}
              </div>
              <CloudSun size={28} className={styles.weatherIcon} />
            </div>

            <div className={styles.weatherTemp}>
              {WEATHER.temp}
              <span className={styles.weatherDeg}>°C</span>
            </div>
            <p className={styles.weatherCondition}>{WEATHER.condition}</p>

            <div className={styles.weatherMetaRow}>
              <span>Feels like {WEATHER.feelsLike}°C</span>
              <span className={styles.metaSep} />
              <span>
                <Droplets size={12} /> {WEATHER.humidity}%
              </span>
              <span className={styles.metaSep} />
              <span>
                <Wind size={12} /> {WEATHER.wind} km/h
              </span>
            </div>
          </motion.div>

          <div className={styles.statsRow}>
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.button
                  type="button"
                  key={stat.id}
                  className={styles.statCard}
                  onClick={() => onNavigate(stat.route)}
                  aria-label={`Open ${stat.label}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 * i, ease: EASE_OUT }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className={styles.statGlow} />
                  <Icon size={18} className={styles.statIcon} />
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statCaption}>{stat.caption}</span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* --------------------------------------------------- Quick actions */}
        <section className={styles.section}>
          <p className={styles.sectionEyebrow}>Quick Actions</p>
          <div className={styles.actionRow}>
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  type="button"
                  key={action.id}
                  className={styles.actionPill}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.04 * i }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Icon size={16} />
                  {action.label}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* -------------------------------------------------------- Main grid */}
        <section className={styles.mainGrid}>
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <p className={styles.panelTitle}>Recent Activity</p>
            <ul className={styles.activityList}>
              {ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.id}
                    className={styles.activityItem}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.06 * i }}
                  >
                    <span className={styles.activityIcon}>
                      <Icon size={15} />
                    </span>
                    <span className={styles.activityText}>{item.text}</span>
                    <span className={styles.activityTime}>{item.time}</span>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          <div className={styles.sideCol}>
            <motion.div
              className={styles.panel}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
            >
              <p className={styles.panelTitle}>AI Status</p>
              <div className={styles.aiStatusHead}>
                <span className={styles.aiPulse} />
                <span className={styles.aiAssistant}>{AI_STATUS.assistant}</span>
              </div>
              <dl className={styles.aiStatusGrid}>
                <div>
                  <dt>Model</dt>
                  <dd>{AI_STATUS.model}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className={styles.aiStatusOnline}>{AI_STATUS.status}</dd>
                </div>
                <div>
                  <dt>
                    <Mic size={11} /> Voice Mode
                  </dt>
                  <dd>{AI_STATUS.voice}</dd>
                </div>
                <div>
                  <dt>Memory</dt>
                  <dd>{AI_STATUS.memory}</dd>
                </div>
              </dl>
            </motion.div>

            <motion.div
              className={styles.panel}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT }}
            >
              <p className={styles.panelTitle}>Connected Devices</p>
              <ul className={styles.deviceList}>
                {DEVICES.map((device) => {
                  const Icon = device.icon;
                  return (
                    <li key={device.id} className={styles.deviceItem}>
                      <span className={styles.deviceIcon}>
                        <Icon size={15} />
                      </span>
                      <span className={styles.deviceName}>{device.name}</span>
                      <span
                        className={
                          device.online
                            ? styles.deviceStatusOnline
                            : styles.deviceStatusOffline
                        }
                      >
                        <span className={styles.statusDot} />
                        {device.online ? "Online" : "Offline"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* ----------------------------------------------------- Trending */}
        <section className={styles.section}>
          <p className={styles.sectionEyebrow}>Trending Discover</p>
          <div className={styles.chipRow}>
            {TRENDING.map((tag, i) => (
              <motion.span
                key={tag}
                className={styles.chip}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                whileHover={{ y: -2 }}
              >
                #{tag}
              </motion.span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}