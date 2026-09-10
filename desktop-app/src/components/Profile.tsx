import React, { useState, useRef } from "react";
import styles from "./Profile.module.css";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_USER = {
  fullName: "Zaim Arrosyid",
  username: "zaim.dev",
  email: "zaim@jarvisai.app",
  plan: "Pro" as "Free" | "Pro" | "Premium",
  avatarUrl: "",
  joinDate: "January 2024",
  assistant: {
    name: "Jarvis",
    model: "Claude Sonnet 4",
    status: "online" as "online" | "offline",
  },
  stats: {
    characters: 4,
    chats: 153,
    messages: 4281,
    storageMB: 142,
  },
  connectedAccounts: [
    { id: "google", label: "Google", email: "zaim@gmail.com", connected: true },
    { id: "github", label: "GitHub", username: "@zaimarrosyid", connected: true },
    { id: "discord", label: "Discord", username: "zaim#0042", connected: false },
  ],
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const PlanBadge: React.FC<{ plan: "Free" | "Pro" | "Premium" }> = ({ plan }) => (
  <span className={`${styles.planBadge} ${styles[`plan${plan}`]}`}>{plan}</span>
);

const ProviderIcon: React.FC<{ id: string }> = ({ id }) => {
  const icons: Record<string, React.ReactNode> = {
    google: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    github: (
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
    discord: (
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
      </svg>
    ),
  };
  return <span className={styles.providerIconWrap}>{icons[id]}</span>;
};

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = getStrength(password);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  if (!password) return null;
  return (
    <div className={styles.strengthWrap}>
      <div className={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={styles.strengthBar}
            style={{ background: i <= strength ? colors[strength] : undefined }}
          />
        ))}
      </div>
      <span className={styles.strengthLabel} style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
};

// ─── Dialog ──────────────────────────────────────────────────────────────────

const Dialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, title, message, confirmLabel, danger, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className={styles.dialogOverlay} onClick={onCancel}>
      <div className={styles.dialogBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogTitle}>{title}</div>
        <div className={styles.dialogMessage}>{message}</div>
        <div className={styles.dialogActions}>
          <button className={styles.btnGhost} onClick={onCancel}>Cancel</button>
          <button
            className={danger ? styles.btnDanger : styles.btnPrimary}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const Profile: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account info state
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(MOCK_USER.fullName);
  const [username, setUsername] = useState(MOCK_USER.username);
  const [email, setEmail] = useState(MOCK_USER.email);
  const [pendingName, setPendingName] = useState(fullName);
  const [pendingUsername, setPendingUsername] = useState(username);
  const [pendingEmail, setPendingEmail] = useState(email);
  const [unsaved, setUnsaved] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Connected accounts
  const [accounts, setAccounts] = useState(MOCK_USER.connectedAccounts);

  // Dialog state
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Avatar
  const [avatarSrc, setAvatarSrc] = useState(MOCK_USER.avatarUrl);

  const handleEditToggle = () => {
    if (!editMode) {
      setPendingName(fullName);
      setPendingUsername(username);
      setPendingEmail(email);
    }
    setEditMode(!editMode);
    setUnsaved(false);
  };

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setUnsaved(true);
    };

  const handleSave = () => {
    setFullName(pendingName);
    setUsername(pendingUsername);
    setEmail(pendingEmail);
    setEditMode(false);
    setUnsaved(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setUnsaved(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarSrc(url);
    }
  };

  const handleDisconnect = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, connected: false } : a))
    );
  };

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.root}>
      {/* Background layered system */}
      <div className={styles.ambient} aria-hidden="true">
        <div className={styles.orbCenter} />
        <div className={styles.noiseLayer} />
      </div>

      <div className={styles.container}>

        {/* ── PROFILE HEADER ─────────────────────────────── */}
        <section className={`${styles.card} ${styles.headerCard}`}>
          <div className={styles.headerGlassReflect} aria-hidden="true" />
          <div className={styles.headerInner}>
            <div className={styles.avatarWrap} onClick={() => fileInputRef.current?.click()}>
              <div className={styles.avatarRing} />
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarInitials}>{initials}</div>
              )}
              <div className={styles.avatarOverlay}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.cameraIcon}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleAvatarChange}
              />
            </div>
            <div className={styles.headerMeta}>
              <div className={styles.headerName}>{fullName}</div>
              <div className={styles.headerUsername}>@{username}</div>
              <div className={styles.headerRow}>
                <PlanBadge plan={MOCK_USER.plan} />
                <span className={styles.joinDate}>Member since {MOCK_USER.joinDate}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── ACCOUNT INFORMATION ─────────────────────── */}
          <section className={`${styles.card} ${styles.accountCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <span className={styles.cardIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                Account Information
              </div>
              {unsaved && <span className={styles.unsavedDot}>Unsaved changes</span>}
              {!editMode && (
                <button className={styles.btnEdit} onClick={handleEditToggle}>Edit</button>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Full Name</label>
              <input
                className={`${styles.fieldInput} ${editMode ? styles.fieldInputActive : ""}`}
                value={editMode ? pendingName : fullName}
                onChange={handleFieldChange(setPendingName)}
                readOnly={!editMode}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Username</label>
              <input
                className={`${styles.fieldInput} ${editMode ? styles.fieldInputActive : ""}`}
                value={editMode ? pendingUsername : username}
                onChange={handleFieldChange(setPendingUsername)}
                readOnly={!editMode}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Email</label>
              <input
                className={`${styles.fieldInput} ${editMode ? styles.fieldInputActive : ""}`}
                value={editMode ? pendingEmail : email}
                onChange={handleFieldChange(setPendingEmail)}
                readOnly={!editMode}
                type="email"
              />
            </div>

            {/* Password fields — only visible in edit mode */}
            {editMode && (
              <div className={`${styles.pwSection} ${styles.slideUp}`}>
                <div className={styles.pwSectionDivider}>
                  <span className={styles.pwSectionLabel}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:11,height:11}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Change Password
                  </span>
                  <span className={styles.pwSectionHint}>optional</span>
                </div>
                {([
                  { label: "Current Password", value: currentPw, setter: setCurrentPw, show: showCurrentPw, toggle: () => setShowCurrentPw(v => !v) },
                  { label: "New Password",     value: newPw,     setter: setNewPw,     show: showNewPw,     toggle: () => setShowNewPw(v => !v) },
                  { label: "Confirm Password", value: confirmPw, setter: setConfirmPw, show: showConfirmPw, toggle: () => setShowConfirmPw(v => !v) },
                ] as const).map(({ label, value, setter, show, toggle }) => (
                  <div className={styles.fieldGroup} key={label}>
                    <label className={styles.fieldLabel}>{label}</label>
                    <div className={styles.pwWrap}>
                      <input
                        className={`${styles.fieldInput} ${styles.fieldInputActive}`}
                        type={show ? "text" : "password"}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder="••••••••"
                      />
                      <button className={styles.eyeBtn} onClick={toggle} type="button" tabIndex={-1}>
                        {show ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    {label === "New Password" && <PasswordStrength password={value} />}
                  </div>
                ))}
              </div>
            )}

            {editMode && (
              <div className={styles.editActions}>
                <button className={styles.btnGhost} onClick={handleCancel}>Cancel</button>
                <button className={styles.btnPrimary} onClick={handleSave}>Save Changes</button>
              </div>
            )}
          </section>

        {/* ── DESKTOP ASSISTANT + STATS ROW ───────────────── */}
        <div className={styles.gridTwo}>

          {/* Desktop Assistant */}
          <section className={`${styles.card} ${styles.assistantCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <span className={styles.cardIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                </span>
                Desktop Assistant
              </div>
            </div>
            <div className={styles.assistantBody}>
              <div className={styles.assistantAvatarWrap}>
                <div className={styles.assistantAvatar}>J</div>
                <span className={`${styles.onlineDot} ${MOCK_USER.assistant.status === "online" ? styles.onlineDotActive : ""}`} />
              </div>
              <div className={styles.assistantInfo}>
                <div className={styles.assistantName}>{MOCK_USER.assistant.name}</div>
                <div className={styles.assistantModel}>{MOCK_USER.assistant.model}</div>
                <div className={styles.assistantStatus}>
                  <span className={styles.onlinePulse} />
                  Online & Ready
                </div>
              </div>
            </div>
            <button className={`${styles.btnGhost} ${styles.fullWidth}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Change Assistant
            </button>
          </section>

          {/* Stats */}
          <section className={`${styles.card} ${styles.statsCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <span className={styles.cardIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </span>
                Statistics
              </div>
            </div>
            <div className={styles.statsGrid}>
              {[
                { label: "Characters", value: MOCK_USER.stats.characters, icon: "✦" },
                { label: "Total Chats", value: MOCK_USER.stats.chats, icon: "💬" },
                { label: "Messages", value: MOCK_USER.stats.messages.toLocaleString(), icon: "⚡" },
                { label: "Storage", value: `${MOCK_USER.stats.storageMB} MB`, icon: "🗄" },
              ].map(({ label, value, icon }) => (
                <div className={styles.statItem} key={label}>
                  <div className={styles.statIcon}>{icon}</div>
                  <div className={styles.statValue}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── CONNECTED ACCOUNTS ──────────────────────────── */}
        <section className={`${styles.card} ${styles.connectedCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </span>
              Connected Accounts
            </div>
            <button className={styles.btnEdit}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:12,height:12}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Connect New
            </button>
          </div>
          <div className={styles.providerList}>
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className={`${styles.providerCard} ${styles[`provider_${acc.id}`]}`}
              >
                <ProviderIcon id={acc.id} />
                <div className={styles.providerInfo}>
                  <div className={styles.providerName}>{acc.label}</div>
                  <div className={styles.providerSub}>
                    {acc.connected
                      ? (acc as any).email || (acc as any).username
                      : "Not connected"}
                  </div>
                </div>
                {acc.connected ? (
                  <div className={styles.providerRight}>
                    <span className={styles.connectedBadge}>Connected</span>
                    <button
                      className={styles.disconnectBtn}
                      onClick={() => handleDisconnect(acc.id)}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button className={styles.btnPrimary}>Connect</button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── DANGER ZONE ─────────────────────────────────── */}
        <section className={`${styles.card} ${styles.dangerCard}`}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <span className={`${styles.cardIcon} ${styles.cardIconDanger}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </span>
              Danger Zone
            </div>
          </div>
          <div className={styles.dangerRow}>
            <div className={styles.dangerInfo}>
              <div className={styles.dangerLabel}>Sign Out</div>
              <div className={styles.dangerDesc}>You will be redirected to the login screen.</div>
            </div>
            <button className={styles.btnLogout} onClick={() => setLogoutDialog(true)}>
              Logout
            </button>
          </div>
          <div className={styles.dangerDivider} />
          <div className={styles.dangerRow}>
            <div className={styles.dangerInfo}>
              <div className={styles.dangerLabel}>Delete Account</div>
              <div className={styles.dangerDesc}>
                Permanently deletes your account and all data. This cannot be undone.
              </div>
            </div>
            <button className={styles.btnDeleteAccount} onClick={() => setDeleteDialog(true)}>
              Delete Account
            </button>
          </div>
        </section>

      </div>

      {/* ── DIALOGS ────────────────────────────────────────── */}
      <Dialog
        open={logoutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out of Jarvis?"
        confirmLabel="Sign Out"
        onConfirm={() => setLogoutDialog(false)}
        onCancel={() => setLogoutDialog(false)}
      />
      <Dialog
        open={deleteDialog}
        title="Delete Account"
        message="This action cannot be undone. All your data, characters, and chat history will be permanently deleted."
        confirmLabel="Delete Forever"
        danger
        onConfirm={() => setDeleteDialog(false)}
        onCancel={() => setDeleteDialog(false)}
      />
    </div>
  );
};

export default Profile;