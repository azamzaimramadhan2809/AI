import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import styles from './ChatPage.module.css';

// ================================================================
// ICONS
// ================================================================

const IconSend = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconMic = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const IconPaperclip = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const IconCode = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconGlobe = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconMoreH = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
  </svg>
);
const IconCheck = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconBolt = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconBrain = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
  </svg>
);
const IconSearch = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconPhone = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconVideo = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconCopy = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconReply = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
  </svg>
);
const IconEdit = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconWarning = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconPin = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
  </svg>
);
const IconPlus = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconX = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconPause = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const IconPlay = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const IconChevronLeft = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconChevronRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ================================================================
// TYPES
// ================================================================

type Role = 'user' | 'ai';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
type AIOnlineStatus = 'online' | 'idle' | 'busy' | 'offline';
type AIPersonality = 'assistant' | 'tsundere' | 'professional' | 'hacker' | 'calm' | 'anime';

interface VoiceMessageData {
  blob: Blob;
  duration: number;          // seconds
  url: string;               // object URL
  waveformBars: number[];    // 40 values 0–1 for preview
}

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  replyTo?: { id: string; preview: string; role: Role };
  isPinned?: boolean;
  isEdited?: boolean;
  voiceMessage?: VoiceMessageData;
}

interface AICharacter {
  id: string;
  name: string;
  initials: string;
  avatarGradient: [string, string];
  accentColor: string;
  personality: AIPersonality;
  personalityTag: string;
  onlineStatus: AIOnlineStatus;
  isDesktopAI: boolean;
  lastMessage: string;
  lastActiveTime: Date;
  unreadCount: number;
  modelName: string;
}

interface SuggestionItem {
  icon: React.ReactNode;
  text: string;
  hint: string;
}

// ================================================================
// DATA
// ================================================================

const MAX_CHARS = 4000;

const AI_CHARACTERS: AICharacter[] = [
  {
    id: 'aiko',
    name: 'Aiko',
    initials: 'AI',
    avatarGradient: ['#f472b6', '#a855f7'],
    accentColor: '#f472b6',
    personality: 'tsundere',
    personalityTag: 'Tsundere Assistant',
    onlineStatus: 'online',
    isDesktopAI: false,
    lastMessage: "hmph... that's not what I meant",
    lastActiveTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 3,
    modelName: 'GPT-4o',
  },
  {
    id: 'jarvis',
    name: 'Jarvis',
    initials: 'JV',
    avatarGradient: ['#4fa3f7', '#a78bfa'],
    accentColor: '#4fa3f7',
    personality: 'assistant',
    personalityTag: 'AI Assistant',
    onlineStatus: 'online',
    isDesktopAI: true,
    lastMessage: "I can help you with that.",
    lastActiveTime: new Date(Date.now() - 1000 * 60 * 1),
    unreadCount: 0,
    modelName: 'claude-sonnet-4',
  },
  {
    id: 'nova',
    name: 'Nova',
    initials: 'NV',
    avatarGradient: ['#34d399', '#059669'],
    accentColor: '#34d399',
    personality: 'professional',
    personalityTag: 'Coding Expert',
    onlineStatus: 'idle',
    isDesktopAI: false,
    lastMessage: 'Your code has 2 errors',
    lastActiveTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 1,
    modelName: 'GPT-4 Turbo',
  },
  {
    id: 'kairo',
    name: 'Kairo',
    initials: 'KR',
    avatarGradient: ['#38bdf8', '#0ea5e9'],
    accentColor: '#38bdf8',
    personality: 'hacker',
    personalityTag: 'Security Expert',
    onlineStatus: 'busy',
    isDesktopAI: false,
    lastMessage: '> System scan complete.',
    lastActiveTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    modelName: 'GPT-4 Turbo',
  },
];

const MESSAGES_BY_AI: Record<string, Message[]> = {
  jarvis: [
    {
      id: '1', role: 'ai',
      content: "Hello! I'm Jarvis, your AI assistant. I'm ready to help you with analysis, writing, coding, research, or just about anything else. What would you like to work on today?",
      timestamp: new Date(Date.now() - 1000 * 60 * 3), status: 'read',
    },
    {
      id: '2', role: 'user',
      content: "Can you explain how transformers work in machine learning?",
      timestamp: new Date(Date.now() - 1000 * 60 * 2), status: 'read',
    },
    {
      id: '3', role: 'ai',
      content: "Transformers are neural network architectures built around the **attention mechanism**. Instead of processing sequences step-by-step like RNNs, they process all tokens simultaneously and learn which parts of the input to \"attend\" to.\n\nThe key idea is the self-attention layer — for each token, it computes a weighted sum of all other tokens, where weights reflect relevance. This allows the model to capture long-range dependencies efficiently.\n\nModern LLMs like GPT-4, Claude, and Gemini are all transformer-based. Want me to go deeper into any specific component?",
      timestamp: new Date(Date.now() - 1000 * 60 * 1), status: 'read',
    },
  ],
  aiko: [
    { id: 'a1', role: 'ai', content: "H-Hmph. You're here. I wasn't waiting or anything!", timestamp: new Date(Date.now() - 1000 * 60 * 10), status: 'read' },
    { id: 'a2', role: 'user', content: "Hey Aiko, can you help me?", timestamp: new Date(Date.now() - 1000 * 60 * 8), status: 'read' },
    { id: 'a3', role: 'ai', content: "I-It's not like I want to help you... but fine. What do you need? Don't get the wrong idea!", timestamp: new Date(Date.now() - 1000 * 60 * 5), status: 'read' },
  ],
  nova: [
    { id: 'n1', role: 'ai', content: "Hello. I'm Nova, specialized in code review and development. How can I assist?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'read' },
  ],
  kairo: [
    { id: 'k1', role: 'ai', content: "> KAIRO ONLINE\n> Security protocols active.\n\nState your query.", timestamp: new Date(Date.now() - 1000 * 60 * 30), status: 'read' },
  ],
};

const AI_REPLIES: Record<AIPersonality, string[]> = {
  assistant: [
    "I received your message. This is a placeholder — connect your API endpoint for real responses.",
    "Got it! I'm processing that now. Wire up the backend to see real completions.",
  ],
  tsundere: [
    "I-It's not like I care about your question, but... here's what I think. Hmph.",
    "Don't read too much into this answer. I'm only helping because I feel like it.",
  ],
  professional: [
    "Understood. Based on my analysis, here is a structured response to your query.",
    "Acknowledged. Let me provide a comprehensive breakdown of the situation.",
  ],
  hacker: [
    "> Processing query...\n> Result: Information retrieved.\n\nHere's what I found in the system.",
    "> Scanning...\n> Output ready.\n\nData compiled successfully.",
  ],
  calm: [
    "Of course. Let me walk you through this gently, step by step.",
    "That's a wonderful question. Here's what I've gathered for you.",
  ],
  anime: [
    "Kyaa~! That's such an interesting question, senpai! Let me help! ✨",
    "H-Hai! I'll do my very best to answer that for you! (◕‿◕✿)",
  ],
};

const SUGGESTIONS: SuggestionItem[] = [
  { icon: <IconBolt size={14} />, text: "Summarize a document or article",  hint: "Paste any text to analyze" },
  { icon: <IconCode size={14} />, text: "Help me debug or write code",       hint: "Any language supported" },
  { icon: <IconBrain size={14} />, text: "Explain a complex concept simply", hint: "Science, math, tech & more" },
  { icon: <IconSearch size={14} />, text: "Research and compare options",    hint: "Get structured breakdowns" },
];

const ATTACH_OPTIONS = [
  { icon: '🖼️', label: 'Image',     accept: 'image/*' },
  { icon: '🎬', label: 'Video',     accept: 'video/*' },
  { icon: '🎵', label: 'Audio',     accept: 'audio/*' },
  { icon: '📄', label: 'Document',  accept: '.doc,.docx,.txt' },
  { icon: '📑', label: 'PDF',       accept: '.pdf' },
  { icon: '💻', label: 'Code File', accept: '.js,.ts,.py,.go,.rs' },
  { icon: '📦', label: 'Archive',   accept: '.zip,.tar,.gz' },
  { icon: '📊', label: 'Spreadsheet', accept: '.xls,.xlsx,.csv' },
];

// ================================================================
// EMOJI DATA — full categorized unicode set
// ================================================================

const EMOJI_CATEGORIES = [
  {
    id: 'recent',
    label: 'Recent',
    icon: '🕐',
    emojis: [] as string[], // populated from localStorage key 'jarvis_recent_emojis'
  },
  {
    id: 'smileys',
    label: 'Smileys & People',
    icon: '😀',
    emojis: [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩',
      '😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨',
      '😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕',
      '🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁',
      '😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞',
      '😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺',
      '👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾',
      '👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆',
      '🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️',
      '💅','🤳','💪','🦵','🦶','👂','🦻','👃','🦷','🦴','👀','👁️','👅','👄','💋','🫦',
    ],
  },
  {
    id: 'nature',
    label: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵',
      '🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴',
      '🦄','🐝','🐛','🦋','🐌','🐞','🐜','🪲','🦟','🦗','🪳','🕷️','🦂','🐢','🐍',
      '🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈',
      '🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬',
      '🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐈','🐓',
      '🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁',
      '🌸','🌹','🌺','🌻','🌼','🌷','🌱','🌿','🍀','🍁','🍂','🍃','🍄','🌾','💐',
      '🌲','🌳','🌴','🌵','🎋','🎍','🌊','🌬️','🌀','🌈','⛈️','🌩️','🔥','💧','🌊',
    ],
  },
  {
    id: 'food',
    label: 'Food & Drink',
    icon: '🍕',
    emojis: [
      '🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍉','🍑','🍒','🍌','🍍','🥭','🍏','🍐',
      '🥝','🍅','🫒','🥑','🍆','🥦','🌽','🌶️','🫑','🥒','🥬','🧅','🧄','🥔','🍠',
      '🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖',
      '🌭','🍔','🍟','🍕','🫓','🌮','🌯','🫔','🥙','🧆','🥚','🍱','🍘','🍣','🍛',
      '🍜','🍝','🍲','🍛','🍣','🍤','🍙','🍚','🍥','🥮','🍢','🧁','🍰','🎂','🍮',
      '🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','☕','🍵','🧃','🥤','🧋','🍺',
      '🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🥢','🧂',
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: '⚽',
    emojis: [
      '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🏒','🥅','⛳',
      '🎯','🎳','🏋️','🤼','🤸','🤺','🏇','⛷️','🏂','🪂','🏌️','🧗','🚵','🎠','🎡',
      '🎪','🤹','🎭','🎨','🖼️','🎰','🎲','🧩','🪅','🎮','🎳','🎯','🎻','🎺','🥁',
      '🎸','🎷','🎵','🎶','🎼','🎤','🎧','📻','🎬','🎥','📽️','🎞️','📺','📸','📷',
    ],
  },
  {
    id: 'travel',
    label: 'Travel & Places',
    icon: '✈️',
    emojis: [
      '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🛵',
      '🏍️','🛺','🚲','🛴','🛹','🛼','🚁','🛸','✈️','🚀','🛶','⛵','🚤','🛥️','🚢',
      '⛽','🗺️','🌍','🌎','🌏','🏔️','⛰️','🗻','🏕️','🏖️','🏜️','🏝️','🏟️','🏛️','🏗️',
      '🏘️','🏚️','🏠','🏡','🏢','🏬','🏣','🏤','🏥','🏦','🏨','🏩','💒','🏪','🏫',
      '🗼','🗽','🗾','🎑','⛩️','🎆','🎇','🧨','🌆','🌇','🌃','🌉','🌁','🏙️','🌌',
    ],
  },
  {
    id: 'objects',
    label: 'Objects',
    icon: '💡',
    emojis: [
      '💎','💍','👑','🎩','👒','🧢','⛑️','📱','💻','⌨️','🖥️','🖨️','🖱️','💾','💿',
      '📀','📷','📸','📹','🎥','☎️','📞','📟','📠','📺','📻','🧭','⏱️','⏲️','⏰',
      '⌚','⌛','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧱','💰','💳','💸','💵','🪙',
      '📧','📨','📩','📬','📦','📫','🗃️','📋','📁','📂','🗂️','📓','📔','📒','📕',
      '📗','📘','📙','📚','📖','🔖','🏷️','💰','🔑','🗝️','🔨','🪓','⛏️','⚒️','🛠️',
      '🔧','🔩','⚙️','🪤','🧲','🔬','🔭','💊','🩺','🩹','🩻','🧪','🧫','🧬','🦠',
      '🚪','🪟','🛏️','🛋️','🪑','🚿','🛁','🪥','🧴','🪒','🧹','🧺','🧻','🪣','🧼',
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols',
    icon: '❤️',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓',
      '💗','💖','💝','💘','💟','☮️','✝️','☪️','🕉️','✡️','🔯','☯️','🛐','⛎','♈',
      '♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️',
      '📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵',
      '🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯',
      '💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🔕','🔇','🔈','🔉','🔊','📢','📣',
      '🔔','🔕','🎵','🎶','🎼','💹','🔃','🔄','🔙','🔚','🔛','🔜','🔝','🆙','🆒',
      '🆕','🆓','🔟','🔢','🔣','🔤','🅰️','🅱️','🆎','🆑','🅾️','🆘','✅','☑️','🔘',
      '⭐','🌟','💫','✨','🌈','🔥','💥','❄️','🌊','🎉','🎊','🎈','🎁','🎀','🪄',
    ],
  },
];

// ================================================================
// UTILITIES
// ================================================================

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatRelTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000)     return 'now';
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ================================================================
// STATUS ICON
// ================================================================

function MessageStatusIcon({ status }: { status?: MessageStatus }) {
  if (!status) return null;
  if (status === 'sending')   return <span className={styles.statusSending} title="Sending">✈</span>;
  if (status === 'sent')      return <span className={styles.statusSent}><IconCheck size={11}/></span>;
  if (status === 'delivered') return <span className={styles.statusDelivered}><IconCheck size={11}/><IconCheck size={11} /></span>;
  if (status === 'read')      return <span className={styles.statusRead}><IconCheck size={11}/><IconCheck size={11} /></span>;
  if (status === 'failed')    return <span className={styles.statusFailed} title="Failed to send">⚠</span>;
  return null;
}

// ================================================================
// AI AVATAR
// ================================================================

function AIAvatar({ char, size = 'sm' }: { char: AICharacter; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div
      className={`${styles.avatar} ${styles[`avatarSize_${size}`]}`}
      style={{
        background: `linear-gradient(135deg, ${char.avatarGradient[0]}, ${char.avatarGradient[1]})`,
        boxShadow: `0 0 0 2px ${char.avatarGradient[0]}33, 0 2px 8px rgba(0,0,0,0.4)`,
      }}
      aria-label={char.name}
    >
      {char.initials}
    </div>
  );
}

// ================================================================
// ONLINE DOT
// ================================================================

function OnlineDot({ status }: { status: AIOnlineStatus }) {
  return <span className={`${styles.onlineDot} ${styles[`online_${status}`]}`} title={status} />;
}

// ================================================================
// MESSAGE ACTION MENU
// ================================================================

interface MsgMenuProps {
  x: number; y: number;
  message: Message;
  onClose: () => void;
  onCopy: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}

function MessageActionMenu({ x, y, message, onClose, onCopy, onReply, onEdit, onDelete, onPin }: MsgMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const isUser = message.role === 'user';
  const top  = Math.min(y, window.innerHeight - 240);
  const left = Math.min(x, window.innerWidth  - 200);

  const items = [
    { icon: <IconCopy  size={13} />, label: 'Copy',   action: onCopy,   danger: false },
    { icon: <IconReply size={13} />, label: 'Reply',  action: onReply,  danger: false },
    ...(isUser ? [{ icon: <IconEdit size={13} />, label: 'Edit', action: onEdit, danger: false }] : []),
    { icon: <IconPin   size={13} />, label: message.isPinned ? 'Unpin' : 'Pin', action: onPin, danger: false },
    { icon: <IconTrash size={13} />, label: 'Delete', action: onDelete, danger: true  },
  ];

  return (
    <div
      ref={ref}
      className={styles.msgMenu}
      style={{ position: 'fixed', top, left, zIndex: 9999 }}
      role="menu"
    >
      {items.map(item => (
        <button
          key={item.label}
          className={`${styles.msgMenuItem} ${item.danger ? styles.msgMenuDanger : ''}`}
          onClick={() => { item.action(); onClose(); }}
          role="menuitem"
        >
          <span className={styles.msgMenuIcon}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ================================================================
// REPLY STRIP
// ================================================================

function ReplyStrip({ replyTo, onClear }: { replyTo: NonNullable<Message['replyTo']>; onClear: () => void }) {
  return (
    <div className={styles.replyStrip}>
      <span className={styles.replyStripBar} />
      <div className={styles.replyStripContent}>
        <span className={styles.replyStripWho}>{replyTo.role === 'ai' ? 'Jarvis' : 'You'}</span>
        <span className={styles.replyStripText}>{replyTo.preview.slice(0, 80)}{replyTo.preview.length > 80 ? '…' : ''}</span>
      </div>
      <button className={styles.replyStripClose} onClick={onClear} aria-label="Cancel reply">
        <IconX size={12} />
      </button>
    </div>
  );
}

// ================================================================
// ATTACH POPUP
// ================================================================

function AttachPopup({ onSelect, onClose }: { onSelect: (accept: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} className={styles.attachPopup}>
      <div className={styles.attachGrid}>
        {ATTACH_OPTIONS.map(opt => (
          <button key={opt.label} className={styles.attachCard} onClick={() => { onSelect(opt.accept); onClose(); }}>
            <span className={styles.attachCardIcon}>{opt.icon}</span>
            <span className={styles.attachCardLabel}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// FULL EMOJI PICKER  — Discord/Telegram-style
// ================================================================

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('smileys');
  const [skinTone, setSkinTone] = useState<number>(0); // 0=default, 1-5=modifiers
  const [showSkinTonePicker, setShowSkinTonePicker] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent emojis
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('jarvis_recent_emojis');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  useEffect(() => { searchInputRef.current?.focus(); }, []);

  const skinToneModifiers = ['', '\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}'];

  function applySkinTone(emoji: string): string {
    if (skinTone === 0) return emoji;
    // Only apply to hand/person emojis (basic heuristic: codepoint in range)
    const cp = emoji.codePointAt(0) ?? 0;
    const supportsSkin = (cp >= 0x1F466 && cp <= 0x1F9FF) || (cp >= 0x261D && cp <= 0x270D);
    if (!supportsSkin) return emoji;
    return emoji + skinToneModifiers[skinTone];
  }

  function handleEmojiClick(rawEmoji: string) {
    const emoji = applySkinTone(rawEmoji);
    onSelect(emoji);
    // Update recent
    setRecentEmojis(prev => {
      const next = [rawEmoji, ...prev.filter(e => e !== rawEmoji)].slice(0, 40);
      try { localStorage.setItem('jarvis_recent_emojis', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  // Build categories with live recent list
  const allCategories = EMOJI_CATEGORIES.map(cat =>
    cat.id === 'recent' ? { ...cat, emojis: recentEmojis } : cat
  ).filter(cat => cat.id !== 'recent' || cat.emojis.length > 0);

  // Search filter
  const searchResults = search.trim().length > 0
    ? EMOJI_CATEGORIES.flatMap(c => c.emojis).filter((_, i) => i % 3 === 0 || search.length > 0)
      // Simple approach: search by label match — for a real app use emoji-regex
      // We filter across all emojis, deduped
      .filter((_e, _i, _arr) => true) // placeholder — we'll show all flat results
    : null;

  // Actually filter by searching emoji unicode name — simplified approach using flat list
  const flatFiltered = search.trim().length > 0
    ? EMOJI_CATEGORIES.flatMap(c => c.emojis).filter(e => {
        // Use codepoint to generate a rough "name" for matching
        const cp = e.codePointAt(0) ?? 0;
        return cp > 0; // show all — real impl would use emoji-data library
      }).slice(0, 80) // limit results
    : null;

  const currentCategory = allCategories.find(c => c.id === activeCat) ?? allCategories[0];
  const displayEmojis = flatFiltered ?? currentCategory?.emojis ?? [];

  const skinToneColors = ['#FCEA2B', '#FADCBC', '#E0BB95', '#BF8F68', '#9B6340', '#594339'];

  return (
    <div ref={ref} className={styles.emojiPickerFull} role="dialog" aria-label="Emoji picker">
      {/* Header */}
      <div className={styles.emojiPickerHeader}>
        <div className={styles.emojiSearchWrap}>
          <IconSearch size={13} />
          <input
            ref={searchInputRef}
            className={styles.emojiSearchInput}
            placeholder="Search emoji…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search emoji"
          />
          {search && (
            <button className={styles.emojiSearchClear} onClick={() => setSearch('')} aria-label="Clear search">
              <IconX size={11} />
            </button>
          )}
        </div>
        {/* Skin tone picker */}
        <div className={styles.skinToneWrap}>
          <button
            className={styles.skinToneBtn}
            style={{ background: skinToneColors[skinTone] }}
            onClick={() => setShowSkinTonePicker(s => !s)}
            title="Skin tone"
            aria-label="Select skin tone"
          />
          {showSkinTonePicker && (
            <div className={styles.skinTonePopover}>
              {skinToneColors.map((color, i) => (
                <button
                  key={i}
                  className={`${styles.skinToneOption} ${skinTone === i ? styles.skinToneOptionActive : ''}`}
                  style={{ background: color }}
                  onClick={() => { setSkinTone(i); setShowSkinTonePicker(false); }}
                  aria-label={`Skin tone ${i}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className={styles.emojiCategoryTabs} role="tablist">
          {allCategories.map(cat => (
            <button
              key={cat.id}
              className={`${styles.emojiCategoryTab} ${activeCat === cat.id ? styles.emojiCategoryTabActive : ''}`}
              onClick={() => setActiveCat(cat.id)}
              role="tab"
              aria-selected={activeCat === cat.id}
              title={cat.label}
            >
              <span className={styles.emojiCategoryTabIcon}>{cat.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* Category label */}
      <div className={styles.emojiCategoryLabel}>
        {search ? `Search results` : currentCategory?.label}
      </div>

      {/* Emoji grid */}
      <div className={styles.emojiGrid} role="grid">
        {displayEmojis.length === 0 ? (
          <div className={styles.emojiEmpty}>
            {search ? `No results for "${search}"` : 'No recent emojis yet'}
          </div>
        ) : (
          displayEmojis.map((e, i) => (
            <button
              key={`${e}-${i}`}
              className={styles.emojiGridBtn}
              onClick={() => handleEmojiClick(e)}
              title={e}
              role="gridcell"
            >
              {e}
            </button>
          ))
        )}
      </div>

      {/* Footer: preview */}
      <div className={styles.emojiPickerFooter}>
        <span className={styles.emojiPickerFooterHint}>Click to insert • Right-click for skin tones</span>
      </div>
    </div>
  );
}

// ================================================================
// VOICE RECORDING — live waveform
// ================================================================

type RecordingState = 'idle' | 'recording' | 'paused' | 'denied';

interface VoiceRecorderProps {
  onSend: (data: VoiceMessageData) => void;
  onCancel: () => void;
}

function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('recording');
  const [elapsed, setElapsed] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(48).fill(0.05));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef  = useRef<AudioContext | null>(null);
  const analyserRef      = useRef<AnalyserNode | null>(null);
  const sourceRef        = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const rafRef           = useRef<number>(0);
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedBarsRef  = useRef<number[]>([]); // all bars captured for final preview
  const canvasRef        = useRef<HTMLCanvasElement>(null);

  // Start recording on mount
  useEffect(() => {
    let mounted = true;
    let stream: MediaStream | null = null;

    (async () => {
      // Guard: browsers require a secure context (https or localhost) for getUserMedia
      if (!navigator.mediaDevices?.getUserMedia) {
        if (mounted) setRecordingState('denied');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        sourceRef.current = source;

        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.start(100);

        startTimer();
        startVisualizer(analyser);
      } catch (err) {
        // Permission denied / no device / blocked — show inline message instead of
        // crashing or spamming the console repeatedly.
        if (mounted) setRecordingState('denied');
      }
    })();

    return () => {
      mounted = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startTimer() {
    timerRef.current = setInterval(() => {
      setElapsed(s => s + 1);
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function startVisualizer(analyser: AnalyserNode) {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const NUM_BARS = 48;

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Average frequency bands into NUM_BARS
      const binSize = Math.floor(dataArray.length / NUM_BARS);
      const newBars = Array.from({ length: NUM_BARS }, (_, i) => {
        let sum = 0;
        for (let j = 0; j < binSize; j++) {
          sum += dataArray[i * binSize + j] ?? 0;
        }
        const avg = sum / binSize / 255;
        return Math.max(0.04, avg);
      });

      setBars(newBars);
      recordedBarsRef.current.push(...newBars);
    }
    draw();
  }

  function stopVisualizer() {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
  }

  function cleanup() {
    stopTimer();
    stopVisualizer();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
  }

  function handlePause() {
    setRecordingState('paused');
    mediaRecorderRef.current?.pause();
    stopTimer();
    stopVisualizer();
    setBars(Array(48).fill(0.05));
  }

  function handleResume() {
    setRecordingState('recording');
    mediaRecorderRef.current?.resume();
    startTimer();
    if (analyserRef.current) startVisualizer(analyserRef.current);
  }

  function handleDelete() {
    cleanup();
    onCancel();
  }

  function handleSend() {
    stopTimer();
    stopVisualizer();
    const mr = mediaRecorderRef.current;
    if (!mr) { onCancel(); return; }

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      // Downsample recorded bars to 40 points for preview waveform
      const allBars = recordedBarsRef.current;
      const step = Math.max(1, Math.floor(allBars.length / 40));
      const waveformBars = Array.from({ length: 40 }, (_, i) => allBars[i * step] ?? 0.05);
      onSend({ blob, duration: elapsed, url, waveformBars });
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
    };

    if (mr.state !== 'inactive') mr.stop();
  }

  const isPaused = recordingState === 'paused';
  const isDenied = recordingState === 'denied';

  // ── Permission denied / unavailable — show inline message instead of crashing ──
  if (isDenied) {
    return (
      <div className={`${styles.voiceRecorder} ${styles.voiceRecorderDenied}`}>
        <span className={styles.vrDeniedIcon}>
          <IconMic size={15} />
        </span>
        <div className={styles.vrDeniedText}>
          <strong>Microphone access denied.</strong>
          <span>Allow microphone permission in your browser settings to send voice messages.</span>
        </div>
        <button className={styles.vrDeleteBtn} onClick={onCancel} title="Close" aria-label="Close">
          <IconX size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.voiceRecorder}>
      {/* Delete */}
      <button className={styles.vrDeleteBtn} onClick={handleDelete} title="Cancel recording" aria-label="Cancel recording">
        <IconTrash size={15} />
      </button>

      {/* Waveform + timer */}
      <div className={styles.vrCenter}>
        {/* Timer */}
        <span className={`${styles.vrTimer} ${isPaused ? styles.vrTimerPaused : ''}`}>
          <span className={styles.vrTimerDot} />
          {formatDuration(elapsed)}
        </span>

        {/* Live waveform */}
        <div className={styles.vrWaveform} aria-hidden="true">
          {bars.map((h, i) => (
            <div
              key={i}
              className={`${styles.vrBar} ${isPaused ? styles.vrBarPaused : ''}`}
              style={{
                height: `${Math.max(4, h * 44)}px`,
                animationDelay: `${(i % 8) * 30}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Pause / Resume */}
      {isPaused ? (
        <button className={styles.vrResumeBtn} onClick={handleResume} title="Resume" aria-label="Resume recording">
          <IconPlay size={15} />
        </button>
      ) : (
        <button className={styles.vrPauseBtn} onClick={handlePause} title="Pause" aria-label="Pause recording">
          <IconPause size={15} />
        </button>
      )}

      {/* Send */}
      <button className={styles.vrSendBtn} onClick={handleSend} title="Send voice message" aria-label="Send voice message">
        <IconSend size={14} />
      </button>
    </div>
  );
}

// ================================================================
// VOICE MESSAGE BUBBLE — playback UI
// ================================================================

function VoiceMessageBubble({ vm, isUser }: { vm: VoiceMessageData; isUser: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(vm.url);
    audioRef.current = audio;
    audio.onended = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };
    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
        setCurrentTime(Math.floor(audio.currentTime));
      }
    };
    return () => { audio.pause(); audio.src = ''; };
  }, [vm.url]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  }

  const displayTime = playing ? formatDuration(currentTime) : formatDuration(vm.duration);

  return (
    <div className={`${styles.voiceBubble} ${isUser ? styles.voiceBubbleUser : styles.voiceBubbleAi}`}>
      {/* Play/Pause */}
      <button className={styles.vbPlayBtn} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <IconPause size={14} /> : <IconPlay size={14} />}
      </button>

      {/* Waveform preview */}
      <div className={styles.vbWaveform} aria-hidden="true">
        {vm.waveformBars.map((h, i) => {
          const filled = i / vm.waveformBars.length <= progress;
          return (
            <div
              key={i}
              className={`${styles.vbBar} ${filled ? styles.vbBarFilled : ''}`}
              style={{ height: `${Math.max(3, h * 32)}px` }}
            />
          );
        })}
      </div>

      {/* Duration */}
      <span className={styles.vbDuration}>{displayTime}</span>
    </div>
  );
}

// ================================================================
// SEARCH OVERLAY  — compact panel from top-right
// ================================================================

function SearchOverlay({ messages, onClose, onJump }: {
  messages: Message[];
  onClose: () => void;
  onJump: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const inputRef  = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const h = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const results = q.trim().length > 1
    ? messages.filter(m => m.content.toLowerCase().includes(q.toLowerCase()))
    : [];

  return (
    <div className={styles.searchPanel}>
      <div className={styles.searchInputWrap}>
        <IconSearch size={14} />
        <input
          ref={inputRef}
          className={styles.searchInput}
          placeholder="Search messages…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {q && <span className={styles.searchCount}>{results.length} result{results.length !== 1 ? 's' : ''}</span>}
        <button className={styles.searchClose} onClick={onClose}><IconX size={12}/></button>
      </div>
      {q.trim().length > 1 && (
        <div className={styles.searchResults}>
          {results.length === 0 && (
            <p className={styles.searchEmpty}>No messages matching "{q}"</p>
          )}
          {results.map(m => (
            <button key={m.id} className={styles.searchResult} onClick={() => { onJump(m.id); onClose(); }}>
              <span className={styles.searchResultRole}>{m.role === 'ai' ? '⚡ Jarvis' : '👤 You'}</span>
              <p className={styles.searchResultText}>{m.content.slice(0, 120)}{m.content.length > 120 ? '…' : ''}</p>
              <time className={styles.searchResultTime}>{formatTime(m.timestamp)}</time>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ================================================================
// AI LIST SIDEBAR
// ================================================================

interface AIListSidebarProps {
  characters: AICharacter[];
  activeId: string;
  onSelect: (id: string) => void;
}

function AIListSidebar({ characters, activeId, onSelect }: AIListSidebarProps) {
  const [search, setSearch]       = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const filtered = characters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.personalityTag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className={`${styles.aiSidebar} ${collapsed ? styles.aiSidebarCollapsed : ''}`}>
      {/* Header — always flex row, title fades out when collapsed */}
      <div className={styles.aiSidebarHead}>
        <div className={styles.aiSidebarHeadLeft}>
          <span className={`${styles.aiSidebarTitle} ${collapsed ? styles.aiSidebarTitleHidden : ''}`}>
            AI Characters
          </span>
        </div>
        <div className={styles.aiSidebarHeadRight}>
          <button
            className={`${styles.aiSidebarNewBtn} ${collapsed ? styles.aiSidebarNewBtnHidden : ''}`}
            title="Create new AI"
            aria-label="Create AI"
            tabIndex={collapsed ? -1 : 0}
          >
            <IconPlus size={14} />
          </button>
          <button
            className={styles.aiSidebarCollapseBtn}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* Search bar — slides + fades out when collapsed */}
      <div className={`${styles.aiSidebarSearchWrap} ${collapsed ? styles.aiSidebarSearchCollapsed : ''}`}>
        <div className={styles.aiSidebarSearch}>
          <IconSearch size={13} />
          <input
            className={styles.aiSidebarSearchInput}
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            tabIndex={collapsed ? -1 : 0}
          />
        </div>
      </div>

      <div className={styles.aiSidebarList}>
        {filtered.length === 0 ? (
          !collapsed && (
            <div className={styles.aiSidebarEmpty}>
              <p className={styles.aiSidebarEmptyText}>No AI assistant created yet</p>
              <button className={styles.aiSidebarCreateBtn}>Create Assistant</button>
            </div>
          )
        ) : (
          filtered.map(char => (
            <AICard
              key={char.id}
              char={char}
              isActive={activeId === char.id}
              collapsed={collapsed}
              onClick={() => onSelect(char.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function AICard({ char, isActive, collapsed, onClick }: {
  char: AICharacter; isActive: boolean; collapsed: boolean; onClick: () => void;
}) {
  if (collapsed) {
    return (
      <button
        className={`${styles.aiCardCollapsed} ${isActive ? styles.aiCardActive : ''}`}
        style={isActive ? { '--card-accent': char.accentColor } as React.CSSProperties : undefined}
        onClick={onClick}
        aria-current={isActive ? 'true' : undefined}
        title={`${char.name} — ${char.personalityTag}`}
      >
        {isActive && (
          <span className={styles.aiCardPip} style={{ background: char.accentColor }} />
        )}
        <div className={styles.aiCardAvatarWrap}>
          <AIAvatar char={char} size="md" />
          <OnlineDot status={char.onlineStatus} />
        </div>
        {char.unreadCount > 0 && (
          <span className={styles.aiCardBadgeCollapsed} style={{ background: char.accentColor }}>
            {char.unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      className={`${styles.aiCard} ${isActive ? styles.aiCardActive : ''}`}
      style={isActive ? { '--card-accent': char.accentColor } as React.CSSProperties : undefined}
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
    >
      {isActive && (
        <span className={styles.aiCardPip} style={{ background: char.accentColor }} />
      )}
      <div className={styles.aiCardAvatarWrap}>
        <AIAvatar char={char} size="md" />
        <OnlineDot status={char.onlineStatus} />
      </div>
      <div className={styles.aiCardInfo}>
        <div className={styles.aiCardRow1}>
          <span className={styles.aiCardName}>{char.name}</span>
          <span className={styles.aiCardTime}>{formatRelTime(char.lastActiveTime)}</span>
        </div>
        <span className={styles.aiCardTag}>{char.personalityTag}</span>
        <div className={styles.aiCardRow2}>
          <span className={styles.aiCardPreview}>{char.lastMessage}</span>
          {char.unreadCount > 0 && (
            <span className={styles.aiCardBadge} style={{ background: char.accentColor }}>
              {char.unreadCount}
            </span>
          )}
        </div>
        {char.isDesktopAI && (
          <span className={styles.desktopAIBadge} style={{ color: char.accentColor, borderColor: `${char.accentColor}44` }}>
            Desktop AI
          </span>
        )}
      </div>
    </button>
  );
}

// ================================================================
// CHAT HEADER
// ================================================================

interface ChatHeaderProps {
  char: AICharacter;
  onSearchOpen: () => void;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

function ChatHeader({ char, onSearchOpen, onVoiceCall, onVideoCall }: ChatHeaderProps) {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMore(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.headerAvatarWrap}>
          <AIAvatar char={char} size="sm" />
          <OnlineDot status={char.onlineStatus} />
        </div>
        <div className={styles.headerAIInfo}>
          <span className={styles.headerTitle}>{char.name}</span>
          <span className={styles.headerAIStatus}>
            {char.onlineStatus.charAt(0).toUpperCase() + char.onlineStatus.slice(1)}
          </span>
        </div>
        <button className={styles.headerModel} aria-label="Model selector">
          <span className={styles.modelDot} />
          <span className={styles.modelName}>{char.modelName}</span>
        </button>
      </div>
      <div className={styles.headerRight}>
        <button className={styles.headerBtn} onClick={onVoiceCall} aria-label="Voice call" title="Voice call">
          <IconPhone size={15} />
        </button>
        <button className={styles.headerBtn} onClick={onVideoCall} aria-label="Video call" title="Video call">
          <IconVideo size={15} />
        </button>

        {/* More dropdown */}
        <div className={styles.moreWrap} ref={moreRef}>
          <button
            className={`${styles.headerBtn} ${showMore ? styles.headerBtnActive : ''}`}
            onClick={() => setShowMore(s => !s)}
            aria-label="More options"
            title="More"
          >
            <IconMoreH size={15} />
          </button>

          {showMore && (
            <div className={styles.moreDropdown}>
              <button
                className={styles.moreItem}
                onClick={() => { onSearchOpen(); setShowMore(false); }}
              >
                <span className={styles.moreItemIcon}><IconSearch size={14} /></span>
                Search
              </button>
              <button
                className={styles.moreItem}
                onClick={() => setShowMore(false)}
              >
                <span className={styles.moreItemIcon}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                  </svg>
                </span>
                Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ================================================================
// MESSAGE BUBBLE
// ================================================================

interface BubbleProps {
  message: Message;
  char: AICharacter;
  onMenuOpen: (e: React.MouseEvent, msg: Message) => void;
}

function MessageBubble({ message, char, onMenuOpen }: BubbleProps) {
  const isUser = message.role === 'user';

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onMenuOpen(e, message);
  };

  return (
    <div
      className={`${styles.messageRow} ${isUser ? styles.user : styles.ai}`}
      onContextMenu={handleContextMenu}
    >
      {isUser ? (
        <div className={`${styles.avatar} ${styles.avatarUser}`} aria-label="You">U</div>
      ) : (
        <AIAvatar char={char} size="sm" />
      )}

      <div className={styles.bubbleGroup}>
        {message.replyTo && (
          <div className={`${styles.replyQuote} ${isUser ? styles.replyQuoteUser : ''}`}>
            <span className={styles.replyQuoteBar}
                  style={{ background: isUser ? 'var(--accent-primary)' : char.accentColor }} />
            <div>
              <span className={styles.replyQuoteWho}
                    style={{ color: isUser ? 'var(--accent-primary)' : char.accentColor }}>
                {message.replyTo.role === 'ai' ? char.name : 'You'}
              </span>
              <p className={styles.replyQuoteText}>{message.replyTo.preview.slice(0, 60)}…</p>
            </div>
          </div>
        )}

        {message.voiceMessage ? (
          <VoiceMessageBubble vm={message.voiceMessage} isUser={isUser} />
        ) : (
          <div
            className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi} ${message.isPinned ? styles.bubblePinned : ''}`}
          >
            {message.content.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
            {message.isEdited && <span className={styles.editedTag}>(edited)</span>}
          </div>
        )}

        <div className={styles.messageMeta}>
          {message.isPinned && <span className={styles.pinnedTag}>📌 Pinned</span>}
          <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
          {isUser && <MessageStatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// TYPING INDICATOR
// ================================================================

function TypingIndicator({ char }: { char: AICharacter }) {
  return (
    <div className={styles.typingRow}>
      <AIAvatar char={char} size="sm" />
      <div className={styles.typingBubble} aria-label={`${char.name} is typing`}>
        <span className={styles.typingDot} style={{ '--dot-color': char.accentColor } as React.CSSProperties} />
        <span className={styles.typingDot} style={{ '--dot-color': char.accentColor } as React.CSSProperties} />
        <span className={styles.typingDot} style={{ '--dot-color': char.accentColor } as React.CSSProperties} />
      </div>
    </div>
  );
}

// ================================================================
// EMPTY STATE
// ================================================================

function EmptySuggestions({ char, onSelect }: { char: AICharacter; onSelect: (text: string) => void }) {
  return (
    <div className={styles.suggestionsWrap}>
      <div className={styles.emptyHero}>
        <div className={styles.emptyHeroGlow} style={{ background: `radial-gradient(circle, ${char.accentColor}22, transparent 70%)` }} />
        <AIAvatar char={char} size="lg" />
      </div>
      <div className={styles.suggestionsHeading}>
        <div className={styles.suggestionsTitle}>Chat with {char.name}</div>
        <div className={styles.suggestionsSub}>{char.personalityTag} · {char.modelName}</div>
      </div>
      <div className={styles.suggestionsGrid}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} className={styles.suggestionCard} onClick={() => onSelect(s.text)}>
            <span className={styles.suggestionIcon}>{s.icon}</span>
            <span className={styles.suggestionText}>{s.text}</span>
            <span className={styles.suggestionHint}>{s.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ================================================================
// MAIN PAGE
// ================================================================

export default function ChatPage() {
  const [characters]        = useState<AICharacter[]>(AI_CHARACTERS);
  const [activeId, setActiveId] = useState<string>('jarvis');
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(MESSAGES_BY_AI);
  const [input, setInput]   = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const [msgMenu, setMsgMenu] = useState<{ msg: Message; x: number; y: number } | null>(null);
  const [replyTo, setReplyTo] = useState<Message['replyTo'] | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const [showEmoji, setShowEmoji]   = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const conversationRef = useRef<HTMLDivElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const msgRefs         = useRef<Map<string, HTMLElement>>(new Map());

  const activeChar  = characters.find(c => c.id === activeId)!;
  const messages    = allMessages[activeId] ?? [];
  const isEmpty     = messages.length === 0;
  const charCount   = input.length;
  const canSend     = input.trim().length > 0 && !isTyping;

  useEffect(() => {
    const el = conversationRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  useEffect(() => {
    const h = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMsgMenu(null); setShowAttach(false); setShowEmoji(false); setShowSearch(false);
        if (isVoiceMode) setIsVoiceMode(false);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isVoiceMode]);

  const simulateResponse = useCallback((userMsg: string) => {
    setIsTyping(true);
    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      const pool = AI_REPLIES[activeChar.personality];
      const response: Message = {
        id: uid(), role: 'ai',
        content: pool[Math.floor(Math.random() * pool.length)],
        timestamp: new Date(), status: 'read',
      };
      setAllMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), response] }));
      setIsTyping(false);
    }, delay);
  }, [activeChar.personality, activeId]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;
    const userMsg: Message = {
      id: uid(), role: 'user', content: text,
      timestamp: new Date(), status: 'sending',
      replyTo: replyTo ?? undefined,
    };
    setAllMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), userMsg] }));
    setInput('');
    setReplyTo(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setTimeout(() => setAllMessages(p => ({
      ...p, [activeId]: p[activeId].map(m => m.id === userMsg.id ? { ...m, status: 'sent' } : m),
    })), 600);
    setTimeout(() => setAllMessages(p => ({
      ...p, [activeId]: p[activeId].map(m => m.id === userMsg.id ? { ...m, status: 'delivered' } : m),
    })), 1200);

    simulateResponse(text);
  }, [input, isTyping, replyTo, activeId, simulateResponse]);

  const handleVoiceSend = useCallback((data: VoiceMessageData) => {
    const userMsg: Message = {
      id: uid(), role: 'user',
      content: `🎤 Voice message (${formatDuration(data.duration)})`,
      timestamp: new Date(), status: 'sending',
      voiceMessage: data,
      replyTo: replyTo ?? undefined,
    };
    setAllMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), userMsg] }));
    setIsVoiceMode(false);
    setReplyTo(null);

    setTimeout(() => setAllMessages(p => ({
      ...p, [activeId]: p[activeId].map(m => m.id === userMsg.id ? { ...m, status: 'sent' } : m),
    })), 600);
    setTimeout(() => setAllMessages(p => ({
      ...p, [activeId]: p[activeId].map(m => m.id === userMsg.id ? { ...m, status: 'delivered' } : m),
    })), 1200);

    simulateResponse('[voice message]');
  }, [replyTo, activeId, simulateResponse]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };
  const handleChange  = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) setInput(e.target.value);
  };

  const handleFileOpen = (accept?: string) => {
    if (fileInputRef.current) { fileInputRef.current.accept = accept ?? '*'; fileInputRef.current.click(); }
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const names = Array.from(files).map(f => f.name).join(', ');
    setInput(prev => prev ? `${prev} [${names}]` : `[${names}]`);
    e.target.value = '';
  };

  const handleSelectAI = (id: string) => {
    setActiveId(id);
    setInput('');
    setReplyTo(null);
    setMsgMenu(null);
    setShowAttach(false);
    setShowEmoji(false);
    setIsVoiceMode(false);
  };

  const handleMenuOpen = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    setMsgMenu({ msg, x: e.clientX, y: e.clientY });
  };
  const handleCopy    = () => msgMenu && navigator.clipboard.writeText(msgMenu.msg.content);
  const handleReply   = () => msgMenu && setReplyTo({ id: msgMenu.msg.id, preview: msgMenu.msg.content, role: msgMenu.msg.role });
  const handleDelete  = () => {
    if (!msgMenu) return;
    setAllMessages(p => ({ ...p, [activeId]: p[activeId].filter(m => m.id !== msgMenu.msg.id) }));
  };
  const handleEdit    = () => {
    if (!msgMenu) return;
    setInput(msgMenu.msg.content);
    textareaRef.current?.focus();
  };
  const handlePin     = () => {
    if (!msgMenu) return;
    setAllMessages(p => ({
      ...p, [activeId]: p[activeId].map(m => m.id === msgMenu.msg.id ? { ...m, isPinned: !m.isPinned } : m),
    }));
  };

  const jumpToMessage = (id: string) => {
    const el = msgRefs.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add(styles.highlightMsg);
    setTimeout(() => el.classList.remove(styles.highlightMsg), 2000);
  };

  const handleVoiceCall = () => alert(`📞 Voice call with ${activeChar.name} — connect voice API here.`);
  const handleVideoCall = () => alert(`📹 Video call with ${activeChar.name} — connect video API here.`);

  return (
    <div className={styles.page}>
      <AIListSidebar
        characters={characters}
        activeId={activeId}
        onSelect={handleSelectAI}
      />

      <div className={styles.chatArea}>
        <ChatHeader
          char={activeChar}
          onSearchOpen={() => setShowSearch(true)}
          onVoiceCall={handleVoiceCall}
          onVideoCall={handleVideoCall}
        />

        {showSearch && (
          <SearchOverlay
            messages={messages}
            onClose={() => setShowSearch(false)}
            onJump={jumpToMessage}
          />
        )}

        <div
          className={styles.conversation}
          ref={conversationRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {isEmpty ? (
            <EmptySuggestions char={activeChar} onSelect={text => { setInput(text); textareaRef.current?.focus(); }} />
          ) : (
            <>
              <div className={styles.dateDivider} aria-label="Today">
                <span className={styles.dateDividerText}>Today</span>
              </div>
              {messages.map(msg => (
                <div key={msg.id} ref={el => { if (el) msgRefs.current.set(msg.id, el); }}>
                  <MessageBubble message={msg} char={activeChar} onMenuOpen={handleMenuOpen} />
                </div>
              ))}
              {isTyping && <TypingIndicator char={activeChar} />}
            </>
          )}
        </div>

        {/* Input area */}
        <div className={styles.inputArea}>
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileChange} aria-hidden="true" />

          {/* Floating popups */}
          {showEmoji  && <EmojiPicker  onSelect={e => setInput(p => p + e)} onClose={() => setShowEmoji(false)} />}
          {showAttach && <AttachPopup  onSelect={handleFileOpen}            onClose={() => setShowAttach(false)} />}

          {/* Reply strip */}
          {replyTo && <ReplyStrip replyTo={replyTo} onClear={() => setReplyTo(null)} />}

          {/* Voice recorder replaces input card */}
          {isVoiceMode ? (
            <VoiceRecorder
              onSend={handleVoiceSend}
              onCancel={() => setIsVoiceMode(false)}
            />
          ) : (
            <div className={styles.inputCard}>
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeChar.name}…  (Enter to send, Shift+Enter for new line)`}
                rows={1}
                aria-label="Message input"
                aria-multiline="true"
                spellCheck
              />
              <div className={styles.inputActions}>
                <div className={styles.inputActionsLeft}>
                  <button
                    className={`${styles.actionBtn} ${showEmoji ? styles.actionBtnActive : ''}`}
                    onClick={() => { setShowEmoji(s => !s); setShowAttach(false); }}
                    aria-label="Emoji picker"
                    title="Emoji"
                  >
                    😊
                  </button>
                  <button
                    className={`${styles.actionBtn} ${showAttach ? styles.actionBtnActive : ''}`}
                    onClick={() => { setShowAttach(s => !s); setShowEmoji(false); }}
                    aria-label="Attach file"
                    title="Attach"
                  >
                    <IconPaperclip size={15} />
                  </button>
                  <button className={styles.actionBtn} aria-label="Code block" title="Insert code">
                    <IconCode size={15} />
                  </button>
                  <button className={styles.actionBtn} aria-label="Web search" title="Web search">
                    <IconGlobe size={15} />
                  </button>
                </div>

                <div className={styles.inputActionsRight}>
                  {charCount > MAX_CHARS * 0.8 && (
                    <span className={`${styles.charCount} ${charCount > MAX_CHARS * 0.95 ? styles.warn : ''}`} aria-live="polite">
                      {charCount}/{MAX_CHARS}
                    </span>
                  )}
                  <button
                    className={styles.micBtn}
                    onClick={() => { setIsVoiceMode(true); setShowEmoji(false); setShowAttach(false); }}
                    aria-label="Start voice recording"
                    title="Voice message"
                  >
                    <IconMic size={15} />
                  </button>
                  <button className={styles.sendBtn} onClick={handleSend} disabled={!canSend} aria-label="Send message">
                    <IconSend size={14} />
                    <span className={styles.sendLabel}>Send</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className={styles.inputHint}>Jarvis can make mistakes. Verify important information.</p>
        </div>
      </div>

      {msgMenu && (
        <MessageActionMenu
          x={msgMenu.x} y={msgMenu.y}
          message={msgMenu.msg}
          onClose={() => setMsgMenu(null)}
          onCopy={handleCopy}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPin={handlePin}
        />
      )}
    </div>
  );
}