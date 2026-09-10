import React, { useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import styles from "./AuthPage.module.css";

// ─── Types ───────────────────────────────────────────────────────
type Mode = "login" | "register";

interface FieldError {
  [key: string]: string;
}

// ─── Spring config ───────────────────────────────────────────────
const spring = { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.9 };
const springGentle = { type: "spring" as const, stiffness: 260, damping: 28, mass: 1 };

// ─── Eye Icon ────────────────────────────────────────────────────
const EyeIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

// ─── Input field ─────────────────────────────────────────────────
const AuthInput: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  icon?: React.ReactNode;
}> = ({ label, type = "text", value, onChange, placeholder, error, autoComplete, icon }) => {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div className={styles.fieldWrap}>
      <label className={styles.fieldLabel}>{label}</label>
      <motion.div
        className={`${styles.inputWrap} ${focused ? styles.inputFocused : ""} ${error ? styles.inputError : ""}`}
        animate={focused ? { scale: 1.005 } : { scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input
          className={`${styles.input} ${icon ? styles.inputWithIcon : ""}`}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <motion.button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPw((v) => !v)}
            whileTap={{ scale: 0.88 }}
            tabIndex={-1}
          >
            <EyeIcon open={showPw} />
          </motion.button>
        )}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            className={styles.fieldError}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Password Strength ───────────────────────────────────────────
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const getScore = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const score = getScore(password);
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <motion.div
      className={styles.strengthWrap}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
    >
      <div className={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={styles.strengthBar}
            animate={{ background: i <= score ? colors[score] : "var(--border-subtle)" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <span className={styles.strengthLabel} style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </motion.div>
  );
};

// ─── Forgot Password Modal ────────────────────────────────────────
const ForgotModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1400);
  };

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalBox}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 12 }}
        transition={spring}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.modalIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className={styles.modalTitle}>Reset Password</h3>
              <p className={styles.modalDesc}>
                Enter your email address and we'll send you a verification link.
              </p>
              <AuthInput
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <div className={styles.modalActions}>
                <motion.button
                  className={styles.btnGhost}
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className={styles.btnPrimary}
                  onClick={handleSend}
                  disabled={!email || loading}
                  whileHover={{ scale: 1.02, boxShadow: "0 0 24px var(--accent-primary-glow)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? (
                    <span className={styles.btnSpinner} />
                  ) : (
                    "Send Link"
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              className={styles.modalSuccess}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring}
            >
              <motion.div
                className={styles.successRing}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...spring, delay: 0.1 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
              <h3 className={styles.modalTitle}>Link Sent</h3>
              <p className={styles.modalDesc}>
                Verification link has been sent to your email.
                <br />
                Check your inbox and follow the instructions.
              </p>
              <motion.button
                className={`${styles.btnPrimary} ${styles.fullWidth}`}
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Done
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// ─── Main AuthPage ────────────────────────────────────────────────
const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPw, setLoginPw] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const [errors, setErrors] = useState<FieldError>({});

  const isRegister = mode === "register";

  const switchTo = useCallback((m: Mode) => {
    setErrors({});
    setLoading(false);
    setMode(m);
  }, []);

  const validateLogin = () => {
    const e: FieldError = {};
    if (!loginIdentifier) e.loginIdentifier = "Email or username is required";
    if (!loginPw) e.loginPw = "Password is required";
    return e;
  };

  const validateRegister = () => {
    const e: FieldError = {};
    if (!regName) e.regName = "Full name is required";
    if (!regUsername) e.regUsername = "Username is required";
    else if (regUsername.length < 3) e.regUsername = "At least 3 characters";
    if (!regEmail) e.regEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(regEmail)) e.regEmail = "Enter a valid email";
    if (!regPw) e.regPw = "Password is required";
    else if (regPw.length < 8) e.regPw = "At least 8 characters";
    if (!regConfirm) e.regConfirm = "Please confirm your password";
    else if (regPw !== regConfirm) e.regConfirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = () => {
    const e = isRegister ? validateRegister() : validateLogin();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setLoading(true);
    // UI only — no backend
    setTimeout(() => setLoading(false), 1800);
  };

  // Orb parallax on card position
  const cardX = useMotionValue(0);
  const orbX = useSpring(useTransform(cardX, [-60, 60], [-30, 30]), springGentle);

  return (
    <div className={styles.root}>
      {/* ── Background layers ── */}
      <div className={styles.bgGradient} aria-hidden="true" />

      {/* Floating orbs */}
      <motion.div
        className={`${styles.orb} ${styles.orbBlue}`}
        animate={{ x: isRegister ? 80 : -80 }}
        transition={springGentle}
        aria-hidden="true"
      />
      <motion.div
        className={`${styles.orb} ${styles.orbPurple}`}
        animate={{ x: isRegister ? -60 : 60 }}
        transition={springGentle}
        aria-hidden="true"
      />
      <motion.div
        className={`${styles.orb} ${styles.orbCyan}`}
        animate={{ x: isRegister ? 40 : -40, y: isRegister ? -30 : 30 }}
        transition={springGentle}
        aria-hidden="true"
      />
      <div className={styles.noise} aria-hidden="true" />

      {/* ── Card ── */}
      <div className={styles.stage}>
        <motion.div
          className={styles.card}
          animate={{ x: isRegister ? 40 : -40 }}
          transition={springGentle}
          onAnimationStart={() => { cardX.set(isRegister ? 40 : -40); }}
        >
          {/* Card ambient glow */}
          <motion.div
            className={styles.cardGlow}
            animate={{ opacity: isRegister ? 0.6 : 0.4, x: isRegister ? 40 : -40 }}
            transition={springGentle}
            aria-hidden="true"
          />

          {/* Glass reflection */}
          <div className={styles.glassReflect} aria-hidden="true" />

          {/* ── Mode indicator pills ── */}
          <div className={styles.modePills}>
            <div className={styles.pillTrack}>
              <motion.div
                className={styles.pillActive}
                animate={{ x: isRegister ? "100%" : "0%" }}
                transition={spring}
              />
              <button
                className={`${styles.pill} ${!isRegister ? styles.pillSelected : ""}`}
                onClick={() => switchTo("login")}
              >
                Sign In
              </button>
              <button
                className={`${styles.pill} ${isRegister ? styles.pillSelected : ""}`}
                onClick={() => switchTo("register")}
              >
                Register
              </button>
            </div>
          </div>

          {/* ── Brand header ── */}
          <div className={styles.brand}>
            <motion.div
              className={styles.brandMark}
              animate={{ rotate: isRegister ? 45 : 0 }}
              transition={spring}
            >
              <svg viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="24" height="24" rx="8" fill="var(--accent-primary)" opacity="0.15" />
                <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" stroke="var(--accent-primary)" strokeWidth="1.5" fill="none" />
                <circle cx="16" cy="16" r="3" fill="var(--accent-primary)" />
              </svg>
            </motion.div>
            <div>
              <div className={styles.brandName}>Jarvis</div>
              <div className={styles.brandSub}>AI Assistant</div>
            </div>
          </div>

          {/* ── Form area ── */}
          <div className={styles.formArea}>
            <AnimatePresence mode="wait">
              {/* ── LOGIN ── */}
              {!isRegister && (
                <motion.div
                  key="login"
                  className={styles.form}
                  initial={{ opacity: 0, x: -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -28 }}
                  transition={{ ...springGentle, duration: 0.28 }}
                >
                  <div className={styles.formHeading}>
                    <h2 className={styles.formTitle}>Welcome back</h2>
                    <p className={styles.formSub}>Sign in to your workspace</p>
                  </div>

                  <AuthInput
                    label="Email or Username"
                    value={loginIdentifier}
                    onChange={(v) => { setLoginIdentifier(v); setErrors((e) => ({ ...e, loginIdentifier: "" })); }}
                    placeholder="you@example.com or @handle"
                    autoComplete="username"
                    error={errors.loginIdentifier}
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    }
                  />
                  <AuthInput
                    label="Password"
                    type="password"
                    value={loginPw}
                    onChange={(v) => { setLoginPw(v); setErrors((e) => ({ ...e, loginPw: "" })); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={errors.loginPw}
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    }
                  />

                  <div className={styles.forgotRow}>
                    <motion.button
                      className={styles.forgotBtn}
                      onClick={() => setForgotOpen(true)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Forgot password?
                    </motion.button>
                  </div>

                  <motion.button
                    className={styles.btnPrimary}
                    onClick={handleSubmit}
                    disabled={loading}
                    whileHover={{ scale: 1.015, boxShadow: "0 0 32px var(--accent-primary-glow)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading ? <span className={styles.btnSpinner} /> : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                        Sign In
                      </>
                    )}
                  </motion.button>

                  <p className={styles.switchText}>
                    Don't have an account?{" "}
                    <motion.button
                      className={styles.switchLink}
                      onClick={() => switchTo("register")}
                      whileHover={{ x: 2 }}
                    >
                      Create one →
                    </motion.button>
                  </p>
                </motion.div>
              )}

              {/* ── REGISTER ── */}
              {isRegister && (
                <motion.div
                  key="register"
                  className={styles.form}
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 28 }}
                  transition={{ ...springGentle, duration: 0.28 }}
                >
                  <div className={styles.formHeading}>
                    <h2 className={styles.formTitle}>Create account</h2>
                    <p className={styles.formSub}>Join your AI workspace today</p>
                  </div>

                  <div className={styles.fieldRow}>
                    <AuthInput
                      label="Full Name"
                      value={regName}
                      onChange={(v) => { setRegName(v); setErrors((e) => ({ ...e, regName: "" })); }}
                      placeholder="Zaim Arrosyid"
                      autoComplete="name"
                      error={errors.regName}
                    />
                    <AuthInput
                      label="Username"
                      value={regUsername}
                      onChange={(v) => { setRegUsername(v); setErrors((e) => ({ ...e, regUsername: "" })); }}
                      placeholder="zaim.dev"
                      autoComplete="username"
                      error={errors.regUsername}
                    />
                  </div>

                  <AuthInput
                    label="Email"
                    type="email"
                    value={regEmail}
                    onChange={(v) => { setRegEmail(v); setErrors((e) => ({ ...e, regEmail: "" })); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.regEmail}
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                    }
                  />
                  <AuthInput
                    label="Password"
                    type="password"
                    value={regPw}
                    onChange={(v) => { setRegPw(v); setErrors((e) => ({ ...e, regPw: "" })); }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={errors.regPw}
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    }
                  />
                  <AnimatePresence>
                    {regPw && <PasswordStrength password={regPw} />}
                  </AnimatePresence>

                  <AuthInput
                    label="Confirm Password"
                    type="password"
                    value={regConfirm}
                    onChange={(v) => { setRegConfirm(v); setErrors((e) => ({ ...e, regConfirm: "" })); }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    error={errors.regConfirm}
                  />

                  <motion.button
                    className={styles.btnPrimary}
                    onClick={handleSubmit}
                    disabled={loading}
                    whileHover={{ scale: 1.015, boxShadow: "0 0 32px var(--accent-primary-glow)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading ? <span className={styles.btnSpinner} /> : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                        Create Account
                      </>
                    )}
                  </motion.button>

                  <p className={styles.switchText}>
                    Already have an account?{" "}
                    <motion.button
                      className={styles.switchLink}
                      onClick={() => switchTo("login")}
                      whileHover={{ x: -2 }}
                    >
                      ← Sign in
                    </motion.button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          <div className={styles.cardFooter}>
            <span className={styles.footerDot} />
            <span className={styles.footerText}>Secured · End-to-end encrypted</span>
            <span className={styles.footerDot} />
          </div>
        </motion.div>
      </div>

      {/* ── Forgot Password Modal ── */}
      <AnimatePresence>
        {forgotOpen && <ForgotModal onClose={() => setForgotOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;