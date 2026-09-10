import { useState, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  BatteryWarning,
  Zap,
  Wifi,
  WifiOff,
  Lock,
  Moon,
  RotateCcw,
  Power,
  BellRing,
  X,
  Cpu,
  HardDrive,
  MemoryStick,
  Thermometer,
  Clock,
  Info,
  Settings2,
  PlugZap,
  PlugZap2,
  ChevronRight,
} from 'lucide-react';
import styles from './Devices.module.css';

// ================================================================
// TYPES
// ================================================================

type DeviceType = 'phone' | 'laptop' | 'desktop' | 'tablet';
type DeviceStatus = 'online' | 'offline';

interface DeviceSpecs {
  model: string;
  os: string;
  battery?: number;          // undefined for desktops without battery
  isCharging?: boolean;
  storageUsedGB: number;
  storageTotalGB: number;
  ramUsedGB: number;
  ramTotalGB: number;
  cpuUsage: number;          // percentage
  temperatureC?: number;     // optional
}

interface Device {
  id: string;
  customName: string;
  type: DeviceType;
  status: DeviceStatus;
  lastSeen: string;          // human readable, e.g. "2 hours ago"
  specs: DeviceSpecs;
}

// type ModalKind = 'control' | 'details' | null;

// ================================================================
// MOCK DATA
// ================================================================

const MOCK_DEVICES: Device[] = [
  {
    id: 'dev-1',
    customName: "Azam's Phone",
    type: 'phone',
    status: 'online',
    lastSeen: 'Active now',
    specs: {
      model: 'iPhone 13 Pro',
      os: 'iOS 17.4.1',
      battery: 82,
      isCharging: true,
      storageUsedGB: 187,
      storageTotalGB: 256,
      ramUsedGB: 4.2,
      ramTotalGB: 6,
      cpuUsage: 18,
    },
  },
  {
    id: 'dev-2',
    customName: 'Laptop Sekolah',
    type: 'laptop',
    status: 'online',
    lastSeen: 'Active now',
    specs: {
      model: 'Lenovo Legion 5 Pro',
      os: 'Windows 11 Pro',
      battery: 64,
      isCharging: false,
      storageUsedGB: 412,
      storageTotalGB: 1024,
      ramUsedGB: 11.4,
      ramTotalGB: 16,
      cpuUsage: 42,
      temperatureC: 58,
    },
  },
  {
    id: 'dev-3',
    customName: 'Gaming PC',
    type: 'desktop',
    status: 'offline',
    lastSeen: '2 hours ago',
    specs: {
      model: 'Custom Desktop PC',
      os: 'Windows 11 Pro',
      storageUsedGB: 890,
      storageTotalGB: 2048,
      ramUsedGB: 0,
      ramTotalGB: 32,
      cpuUsage: 0,
      temperatureC: 34,
    },
  },
  {
    id: 'dev-4',
    customName: 'Study Tablet',
    type: 'tablet',
    status: 'offline',
    lastSeen: 'Yesterday at 9:41 PM',
    specs: {
      model: 'iPad Air 5th Gen',
      os: 'iPadOS 17.2',
      battery: 23,
      isCharging: false,
      storageUsedGB: 41,
      storageTotalGB: 64,
      ramUsedGB: 0,
      ramTotalGB: 8,
      cpuUsage: 0,
    },
  },
  {
    id: 'dev-5',
    customName: 'Office PC',
    type: 'desktop',
    status: 'online',
    lastSeen: 'Active now',
    specs: {
      model: 'Custom Desktop PC',
      os: 'Windows 11 Pro',
      storageUsedGB: 256,
      storageTotalGB: 512,
      ramUsedGB: 6.8,
      ramTotalGB: 16,
      cpuUsage: 12,
      temperatureC: 41,
    },
  },
  {
    id: 'dev-6',
    customName: "Mom's Phone",
    type: 'phone',
    status: 'online',
    lastSeen: 'Active now',
    specs: {
      model: 'Samsung Galaxy S24 Ultra',
      os: 'Android 14',
      battery: 56,
      isCharging: false,
      storageUsedGB: 98,
      storageTotalGB: 256,
      ramUsedGB: 5.1,
      ramTotalGB: 12,
      cpuUsage: 9,
    },
  },
];

// ================================================================
// HELPERS
// ================================================================

const DEVICE_ICON: Record<DeviceType, ReactNode> = {
  phone: <Smartphone strokeWidth={1.6} />,
  laptop: <Laptop strokeWidth={1.6} />,
  desktop: <Monitor strokeWidth={1.6} />,
  tablet: <Tablet strokeWidth={1.6} />,
};

const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  phone: 'Smartphone',
  laptop: 'Laptop',
  desktop: 'Desktop PC',
  tablet: 'Tablet',
};

function hasBattery(type: DeviceType): boolean {
  return type === 'phone' || type === 'laptop' || type === 'tablet';
}

function getBatteryIcon(level: number, charging: boolean) {
  if (charging) return <Zap strokeWidth={1.8} />;
  if (level >= 60) return <BatteryFull strokeWidth={1.8} />;
  if (level >= 30) return <BatteryMedium strokeWidth={1.8} />;
  if (level >= 15) return <BatteryLow strokeWidth={1.8} />;
  return <BatteryWarning strokeWidth={1.8} />;
}

function getBatteryColorClass(level: number, charging: boolean): string {
  if (charging) return styles.batteryCharging;
  if (level <= 15) return styles.batteryCritical;
  if (level <= 30) return styles.batteryLow;
  return styles.batteryNormal;
}

// ================================================================
// SUB-COMPONENTS
// ================================================================

/** Animated ambient background — floating soft glow orbs */
function AmbientBackground() {
  return (
    <div className={styles.ambientBg} aria-hidden="true">
      <motion.div
        className={`${styles.glowOrb} ${styles.glowOrb1}`}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`${styles.glowOrb} ${styles.glowOrb2}`}
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`${styles.glowOrb} ${styles.glowOrb3}`}
        animate={{ x: [0, 30, 0], y: [0, 25, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/** Small circular progress ring used in the details modal */
function UsageRing({ percent, label, icon, accent }: {
  percent: number;
  label: string;
  icon: ReactNode;
  accent: string;
}) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={styles.usageRingWrap}>
      <svg width="64" height="64" viewBox="0 0 64 64" className={styles.usageRingSvg}>
        <circle cx="32" cy="32" r={radius} className={styles.usageRingTrack} />
        <circle
          cx="32" cy="32" r={radius}
          className={styles.usageRingFill}
          style={{
            stroke: accent,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className={styles.usageRingIcon} style={{ color: accent }}>{icon}</div>
      <div className={styles.usageRingMeta}>
        <span className={styles.usageRingPercent}>{percent}%</span>
        <span className={styles.usageRingLabel}>{label}</span>
      </div>
    </div>
  );
}

/** Status pill — online/offline indicator */
function StatusPill({ status, lastSeen }: { status: DeviceStatus; lastSeen: string }) {
  const isOnline = status === 'online';
  return (
    <div className={`${styles.statusPill} ${isOnline ? styles.statusOnline : styles.statusOffline}`}>
      <span className={styles.statusDot} />
      {isOnline ? (
        <>
          {<Wifi size={11} strokeWidth={2} />}
          <span>Online</span>
        </>
      ) : (
        <>
          {<WifiOff size={11} strokeWidth={2} />}
          <span>{lastSeen}</span>
        </>
      )}
    </div>
  );
}

/** A single device card */
function DeviceCard({
  device,
  onToggleConnection,
  onOpenControl,
  onOpenDetails,
}: {
  device: Device;
  onToggleConnection: (id: string) => void;
  onOpenControl: (device: Device) => void;
  onOpenDetails: (device: Device) => void;
}) {
  const isOnline = device.status === 'online';
  const showBattery = hasBattery(device.type) && device.specs.battery !== undefined;

  return (
    <motion.div
      className={styles.deviceCard}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className={styles.cardGlow} aria-hidden="true" />

      {/* Top row: icon + status */}
      <div className={styles.cardTop}>
        <div className={`${styles.deviceIconWrap} ${isOnline ? styles.deviceIconOnline : ''}`}>
          {DEVICE_ICON[device.type]}
        </div>
        <StatusPill status={device.status} lastSeen={device.lastSeen} />
      </div>

      {/* Name + model */}
      <div className={styles.cardInfo}>
        <h3 className={styles.deviceCustomName}>{device.customName}</h3>
        <p className={styles.deviceModel}>{device.specs.model}</p>
      </div>

      {/* Battery row */}
      {showBattery && (
        <div className={styles.batteryRow}>
          <span className={`${styles.batteryIcon} ${getBatteryColorClass(device.specs.battery!, !!device.specs.isCharging)}`}>
            {getBatteryIcon(device.specs.battery!, !!device.specs.isCharging)}
          </span>
          <div className={styles.batteryBarTrack}>
            <motion.div
              className={`${styles.batteryBarFill} ${getBatteryColorClass(device.specs.battery!, !!device.specs.isCharging)}`}
              initial={{ width: 0 }}
              animate={{ width: `${device.specs.battery}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            />
          </div>
          <span className={styles.batteryPercent}>
            {device.specs.battery}%
            {device.specs.isCharging && <span className={styles.chargingLabel}> · Charging</span>}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className={styles.cardActions}>
        <button
          className={`${styles.actionBtn} ${isOnline ? styles.actionBtnDisconnect : styles.actionBtnConnect}`}
          onClick={() => onToggleConnection(device.id)}
        >
          {isOnline ? <PlugZap2 size={14} strokeWidth={2} /> : <PlugZap size={14} strokeWidth={2} />}
          {isOnline ? 'Disconnect' : 'Connect'}
        </button>
        <button
          className={styles.actionBtnSecondary}
          onClick={() => onOpenControl(device)}
          disabled={!isOnline}
          title={!isOnline ? 'Device must be online to control' : 'Control device'}
        >
          <Settings2 size={14} strokeWidth={2} />
          Control
        </button>
        <button
          className={styles.actionBtnSecondary}
          onClick={() => onOpenDetails(device)}
        >
          <Info size={14} strokeWidth={2} />
          Details
        </button>
      </div>
    </motion.div>
  );
}

/** Generic modal shell with backdrop blur + scale-in animation */
function ModalShell({ onClose, children, maxWidth = 460 }: {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}) {
  return (
    <motion.div
      className={styles.modalBackdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalShell}
        style={{ maxWidth }}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Control modal — manual device actions */
function ControlModal({ device, onClose }: { device: Device; onClose: () => void }) {
  const [pending, setPending] = useState<string | null>(null);

  const isComputer = device.type === 'laptop' || device.type === 'desktop';

  const actions = isComputer
    ? [
        { key: 'lock', label: 'Lock Device', desc: 'Immediately lock the screen', icon: <Lock strokeWidth={1.7} />, tone: 'default' },
        { key: 'sleep', label: 'Sleep', desc: 'Put device into low-power sleep', icon: <Moon strokeWidth={1.7} />, tone: 'default' },
        { key: 'restart', label: 'Restart', desc: 'Reboot the device', icon: <RotateCcw strokeWidth={1.7} />, tone: 'warn' },
        { key: 'shutdown', label: 'Shutdown', desc: 'Power off completely', icon: <Power strokeWidth={1.7} />, tone: 'danger' },
      ]
    : [
        { key: 'lock', label: 'Lock Device', desc: 'Immediately lock the screen', icon: <Lock strokeWidth={1.7} />, tone: 'default' },
        { key: 'ring', label: 'Ring Device', desc: 'Play sound to help locate it', icon: <BellRing strokeWidth={1.7} />, tone: 'default' },
        { key: 'restart', label: 'Restart', desc: 'Reboot the device', icon: <RotateCcw strokeWidth={1.7} />, tone: 'warn' },
        { key: 'shutdown', label: 'Shutdown', desc: 'Power off completely', icon: <Power strokeWidth={1.7} />, tone: 'danger' },
      ];

  function runAction(key: string) {
    setPending(key);
    // Mock async action — UI only, no backend
    setTimeout(() => setPending(null), 1400);
  }

  return (
    <ModalShell onClose={onClose}>
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderInfo}>
          <div className={styles.modalIconWrap}>{DEVICE_ICON[device.type]}</div>
          <div>
            <h2 className={styles.modalTitle}>{device.customName}</h2>
            <p className={styles.modalSubtitle}>Manual Control</p>
          </div>
        </div>
        <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className={styles.controlList}>
        {actions.map(action => (
          <button
            key={action.key}
            className={`${styles.controlItem} ${styles[`controlTone_${action.tone}`]}`}
            onClick={() => runAction(action.key)}
            disabled={pending !== null}
          >
            <span className={styles.controlIcon}>{action.icon}</span>
            <span className={styles.controlText}>
              <span className={styles.controlLabel}>{action.label}</span>
              <span className={styles.controlDesc}>{action.desc}</span>
            </span>
            {pending === action.key ? (
              <span className={styles.controlSpinner} />
            ) : (
              <ChevronRight size={16} strokeWidth={2} className={styles.controlChevron} />
            )}
          </button>
        ))}
      </div>

      <p className={styles.modalFootnote}>
        Tip: You can also say <span>"Jarvis, {actions[0].label.toLowerCase()} {device.customName}"</span> from anywhere.
      </p>
    </ModalShell>
  );
}

/** Details modal — full system info */
function DetailsModal({ device, onClose }: { device: Device; onClose: () => void }) {
  const { specs } = device;
  const storagePercent = Math.round((specs.storageUsedGB / specs.storageTotalGB) * 100);
  const ramPercent = specs.ramTotalGB > 0 ? Math.round((specs.ramUsedGB / specs.ramTotalGB) * 100) : 0;

  return (
    <ModalShell onClose={onClose} maxWidth={520}>
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderInfo}>
          <div className={styles.modalIconWrap}>{DEVICE_ICON[device.type]}</div>
          <div>
            <h2 className={styles.modalTitle}>{device.customName}</h2>
            <p className={styles.modalSubtitle}>{specs.model}</p>
          </div>
        </div>
        <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Usage rings */}
      <div className={styles.ringsRow}>
        <UsageRing percent={storagePercent} label="Storage" icon={<HardDrive size={16} strokeWidth={1.8} />} accent="#7B8CFF" />
        <UsageRing percent={ramPercent} label="Memory" icon={<MemoryStick size={16} strokeWidth={1.8} />} accent="#5FE3C0" />
        <UsageRing percent={specs.cpuUsage} label="CPU" icon={<Cpu size={16} strokeWidth={1.8} />} accent="#FFB36B" />
      </div>

      {/* Detail rows */}
      <div className={styles.detailGrid}>
        <DetailRow label="Device Type" value={DEVICE_TYPE_LABEL[device.type]} />
        <DetailRow label="Model" value={specs.model} />
        <DetailRow label="Operating System" value={specs.os} />
        {specs.battery !== undefined && (
          <DetailRow
            label="Battery"
            value={`${specs.battery}%${specs.isCharging ? ' · Charging' : ''}`}
          />
        )}
        <DetailRow label="Storage" value={`${specs.storageUsedGB} GB / ${specs.storageTotalGB} GB used`} />
        <DetailRow label="Memory (RAM)" value={specs.ramTotalGB > 0 ? `${specs.ramUsedGB} GB / ${specs.ramTotalGB} GB` : `${specs.ramTotalGB} GB total`} />
        <DetailRow label="CPU Usage" value={`${specs.cpuUsage}%`} />
        {specs.temperatureC !== undefined && (
          <DetailRow label="Temperature" value={`${specs.temperatureC}°C`} icon={<Thermometer size={13} strokeWidth={1.8} />} />
        )}
        <DetailRow
          label="Connection"
          value={device.status === 'online' ? 'Connected' : 'Disconnected'}
        />
        <DetailRow
          label="Last Sync"
          value={device.lastSeen}
          icon={<Clock size={13} strokeWidth={1.8} />}
        />
      </div>
    </ModalShell>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>
        {icon}
        {label}
      </span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

/** Add Device modal — mock flow only */
function AddDeviceModal({ onClose }: { onClose: () => void }) {
  const [scanning, setScanning] = useState(true);

  useState(() => {
    const t = setTimeout(() => setScanning(false), 2200);
    return () => clearTimeout(t);
  });

  return (
    <ModalShell onClose={onClose} maxWidth={420}>
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderInfo}>
          <div className={styles.modalIconWrap}><Wifi strokeWidth={1.7} /></div>
          <div>
            <h2 className={styles.modalTitle}>Add Device</h2>
            <p className={styles.modalSubtitle}>Scanning your network</p>
          </div>
        </div>
        <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className={styles.scanArea}>
        {scanning ? (
          <>
            <div className={styles.scanRadar}>
              <span className={styles.scanRing} />
              <span className={styles.scanRing} />
              <span className={styles.scanRing} />
              <Wifi size={22} strokeWidth={1.6} className={styles.scanCenterIcon} />
            </div>
            <p className={styles.scanText}>Searching for devices nearby…</p>
          </>
        ) : (
          <>
            <div className={styles.scanEmptyIcon}>
              <Smartphone size={22} strokeWidth={1.5} />
            </div>
            <p className={styles.scanText}>No new devices found</p>
            <p className={styles.scanHint}>Make sure the device is powered on and connected to the same network.</p>
          </>
        )}
      </div>
    </ModalShell>
  );
}

// ================================================================
// MAIN PAGE
// ================================================================

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [controlDevice, setControlDevice] = useState<Device | null>(null);
  const [detailsDevice, setDetailsDevice] = useState<Device | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);

  const onlineCount = useMemo(() => devices.filter(d => d.status === 'online').length, [devices]);

  function toggleConnection(id: string) {
    setDevices(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              status: d.status === 'online' ? 'offline' : 'online',
              lastSeen: d.status === 'online' ? 'Just now' : 'Active now',
            }
          : d
      )
    );
  }

  return (
    <div className={styles.page}>
      <AmbientBackground />

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Devices</h1>
          <p className={styles.subtitle}>
            Manage your connected ecosystem
            <span className={styles.headerDot}>·</span>
            <span className={styles.onlineCountText}>{onlineCount} of {devices.length} online</span>
          </p>
        </div>

        <motion.button
          className={styles.addDeviceBtn}
          onClick={() => setShowAddDevice(true)}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className={styles.addDeviceBtnGlow} aria-hidden="true" />
          <Plus size={16} strokeWidth={2.2} />
          Add Device
        </motion.button>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {devices.map(device => (
          <DeviceCard
            key={device.id}
            device={device}
            onToggleConnection={toggleConnection}
            onOpenControl={setControlDevice}
            onOpenDetails={setDetailsDevice}
          />
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {controlDevice && (
          <ControlModal device={controlDevice} onClose={() => setControlDevice(null)} />
        )}
        {detailsDevice && (
          <DetailsModal device={detailsDevice} onClose={() => setDetailsDevice(null)} />
        )}
        {showAddDevice && (
          <AddDeviceModal onClose={() => setShowAddDevice(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}