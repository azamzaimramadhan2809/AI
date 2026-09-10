import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MessageSquare,
  Cpu,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ArrowUpCircle,
  RefreshCw,
  Wifi,
  Check,
  Trash2,
  X,
} from "lucide-react";
import styles from "./Notification.module.css";

/* ---------------------------------------------------------------------
   Jarvis · Notifications
   Premium, minimal notification center. Pulls colors/spacing from the
   app's real design tokens (tokens.css) so it stays in sync with the
   sidebar's dark/light theme — no separate palette of its own.
--------------------------------------------------------------------- */

type NotificationKind =
  | "message"
  | "character"
  | "model"
  | "system"
  | "device"
  | "update"
  | "ai"
  | "security"
  | "backup";

interface NotificationItem {
  id: string;
  kind: NotificationKind;
  group: "Today" | "Yesterday" | "Earlier this week";
  date: string; // ISO timestamp
  title: string;
  desc: string;
  source: "Messages" | "AI Settings" | "System" | "Devices" | "Profile";
  action?: string;
  unread: boolean;
}

const TYPE_META: Record<NotificationKind, { icon: React.ElementType; hue: string }> = {
  message: { icon: MessageSquare, hue: "var(--accent-primary)" },
  character: { icon: Sparkles, hue: "var(--accent-secondary)" },
  model: { icon: Cpu, hue: "var(--accent-secondary)" },
  system: { icon: RefreshCw, hue: "var(--accent-cyan)" },
  device: { icon: Wifi, hue: "var(--accent-cyan)" },
  update: { icon: ArrowUpCircle, hue: "var(--accent-warm)" },
  ai: { icon: Sparkles, hue: "var(--accent-secondary)" },
  security: { icon: ShieldAlert, hue: "#f0617a" },
  backup: { icon: CheckCircle2, hue: "var(--accent-cyan)" },
};

/* Full date + time, e.g. "01/20/2026 06:00" */
function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
}

const SEED: NotificationItem[] = [
  {
    id: "n1",
    kind: "message",
    group: "Today",
    date: "2026-01-20T06:02:00",
    title: "New message from Aria",
    desc: "“I've drafted the quarterly summary — want me to walk you through it?”",
    source: "Messages",
    action: "Reply",
    unread: true,
  },
  {
    id: "n2",
    kind: "ai",
    group: "Today",
    date: "2026-01-20T05:46:00",
    title: "AI recommendation ready",
    desc: "Jarvis noticed a recurring focus pattern and prepared a lighter schedule for tomorrow.",
    source: "AI Settings",
    action: "Review",
    unread: true,
  },
  {
    id: "n3",
    kind: "model",
    group: "Today",
    date: "2026-01-20T05:23:00",
    title: "AI model downloaded",
    desc: "Atlas-Vision v3.2 finished installing and is ready for offline reasoning tasks.",
    source: "AI Settings",
    action: "Open",
    unread: true,
  },
  {
    id: "n4",
    kind: "security",
    group: "Today",
    date: "2026-01-20T04:40:00",
    title: "Security alert",
    desc: "A new device attempted to access your workspace from an unrecognized network.",
    source: "System",
    action: "Review",
    unread: false,
  },
  {
    id: "n5",
    kind: "character",
    group: "Yesterday",
    date: "2026-01-19T21:14:00",
    title: "Character updated",
    desc: "Your assistant persona “Nova” was refined with a calmer tone profile.",
    source: "Profile",
    unread: false,
  },
  {
    id: "n6",
    kind: "device",
    group: "Yesterday",
    date: "2026-01-19T18:02:00",
    title: "Device connected",
    desc: "Jarvis Hub Mini paired successfully and is now syncing ambient sensors.",
    source: "Devices",
    unread: false,
  },
  {
    id: "n7",
    kind: "system",
    group: "Yesterday",
    date: "2026-01-19T11:30:00",
    title: "System synced",
    desc: "All workspaces and memory threads are up to date across your devices.",
    source: "System",
    unread: false,
  },
  {
    id: "n8",
    kind: "update",
    group: "Earlier this week",
    date: "2026-01-17T09:00:00",
    title: "Update available",
    desc: "Jarvis OS 4.2 introduces faster context recall and a refined glass interface.",
    source: "System",
    action: "Install",
    unread: false,
  },
  {
    id: "n9",
    kind: "backup",
    group: "Earlier this week",
    date: "2026-01-17T03:15:00",
    title: "Backup completed",
    desc: "Your memory graph and settings were archived to encrypted local storage.",
    source: "System",
    unread: false,
  },
];

const GROUP_ORDER: NotificationItem["group"][] = ["Today", "Yesterday", "Earlier this week"];

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>(SEED);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<string, NotificationItem[]> = {};
    items.forEach((it) => {
      map[it.group] = map[it.group] || [];
      map[it.group].push(it);
    });
    return GROUP_ORDER.filter((g) => map[g]?.length).map((g) => [g, map[g]] as const);
  }, [items]);

  const unreadCount = items.filter((i) => i.unread).length;

  function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
  }

  function markRead(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unread: false } : i)));
  }

  function dismiss(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function confirmClearAll() {
    setItems([]);
    setConfirmOpen(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.bellWrap}>
              <motion.div
                className={styles.bellRing}
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className={styles.bellCore}
                animate={{ rotate: [0, -8, 8, -4, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
              >
                <Bell size={20} strokeWidth={1.8} />
              </motion.div>
              <motion.span
                className={styles.bellSpark}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div>
              <h1 className={styles.title}>
                Notifications
                {unreadCount > 0 && <span className={styles.unreadDot}>{unreadCount}</span>}
              </h1>
              <p className={styles.subtitle}>Stay updated with your AI ecosystem.</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.actionButton} onClick={markAllRead}>
              <Check size={15} strokeWidth={2} />
              Mark all as read
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setConfirmOpen(true)}
              disabled={items.length === 0}
            >
              <Trash2 size={15} strokeWidth={2} />
              Clear all
            </button>
          </div>
        </header>

        <div className={styles.list}>
          {grouped.length === 0 ? (
            <EmptyState />
          ) : (
            grouped.map(([groupName, groupItems]) => (
              <section key={groupName} className={styles.group}>
                <div className={styles.groupLabelRow}>
                  <span className={styles.groupLabelText}>{groupName}</span>
                  <span className={styles.groupLabelLine} />
                </div>
                <div className={styles.cards}>
                  <AnimatePresence initial={false}>
                    {groupItems.map((item, idx) => {
                      const meta = TYPE_META[item.kind];
                      const Icon = meta.icon;
                      return (
                        <motion.article
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 14, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.22 } }}
                          transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                          className={styles.card}
                          style={{ ["--hue" as string]: meta.hue, cursor: item.unread ? "pointer" : "default" }}
                          onClick={item.unread ? () => markRead(item.id) : undefined}
                        >
                          <div className={styles.cardGlow} />
                          <div className={styles.cardInner}>
                            <div className={styles.cardIconWrap}>
                              <Icon size={17} strokeWidth={1.8} style={{ color: meta.hue }} />
                            </div>

                            <div className={styles.cardBody}>
                              <div className={styles.cardTopRow}>
                                <h3 className={styles.cardTitle}>
                                  {item.title}
                                  {item.unread && <span className={styles.cardUnreadDot} />}
                                </h3>
                              </div>
                              <p className={styles.cardDesc}>{item.desc}</p>
                              <div className={styles.cardFooter}>
                                <span className={styles.cardSource}>{item.source}</span>
                                <span className={styles.cardDotSep} />
                                <span className={styles.cardTime}>{formatTimestamp(item.date)}</span>
                                {item.action && (
                                  <button
                                    className={styles.cardAction}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {item.action}
                                  </button>
                                )}
                              </div>
                            </div>

                            <button
                              aria-label="Dismiss"
                              className={styles.cardDismiss}
                              onClick={(e) => {
                                e.stopPropagation();
                                dismiss(item.id);
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalIconWrap}>
                <Trash2 size={20} strokeWidth={1.8} />
              </div>
              <h2 className={styles.modalTitle}>Clear all notifications?</h2>
              <p className={styles.modalDesc}>This action cannot be undone.</p>
              <div className={styles.modalActions}>
                <button className={styles.modalCancel} onClick={() => setConfirmOpen(false)}>
                  Cancel
                </button>
                <button className={styles.modalConfirm} onClick={confirmClearAll}>
                  Clear all
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.empty}
    >
      <motion.div
        className={styles.emptyOrb}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <CheckCircle2 size={30} strokeWidth={1.5} />
      </motion.div>
      <p className={styles.emptyTitle}>You're all caught up.</p>
      <p className={styles.emptySubtitle}>Jarvis will let you know when something needs your attention.</p>
    </motion.div>
  );
}