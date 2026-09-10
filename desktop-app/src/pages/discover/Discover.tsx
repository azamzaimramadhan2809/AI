import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  TrendingUp,
  Rocket,
  Cpu,
  Bitcoin,
  LineChart,
  FlaskConical,
  Gamepad2,
  Code2,
  Globe2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import styles from "./Discover.module.css";

/* ------------------------------------------------------------------ */
/*  Mock data — UI only, no backend / no API calls                     */
/* ------------------------------------------------------------------ */

type Tab = "forYou" | "international" | "national";

interface NewsCard {
  id: string;
  category: string;
  title: string;
  description: string;
  source: string;
  time: string;
  image: string;
  accent: string;
}

const PLACEHOLDERS = [
  "Search news, topics, questions, trends...",
  "Latest AI news...",
  "Latest earthquake updates...",
  "What happened in the world today?",
  "Why is Bitcoin going up today?",
  "Summarize the latest AI news.",
];

const QUICK_ACTIONS = [
  { label: "Latest AI News", icon: Sparkles },
  { label: "Technology", icon: Cpu },
  { label: "Crypto", icon: Bitcoin },
  { label: "Stocks", icon: LineChart },
  { label: "Science", icon: FlaskConical },
  { label: "Space", icon: Rocket },
  { label: "Gaming", icon: Gamepad2 },
  { label: "Programming", icon: Code2 },
  { label: "World News", icon: Globe2 },
];

const TRENDING = [
  "#AI",
  "#Bitcoin",
  "#SpaceX",
  "#OpenAI",
  "#Climate",
  "#Technology",
  "#Quantum",
  "#Web3",
];

const IMG = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

const FOR_YOU: NewsCard[] = [
  {
    id: "fy-1",
    category: "Artificial Intelligence",
    title: "Next-gen reasoning models are quietly rewriting how software gets built",
    description:
      "A wave of agentic coding assistants is shifting engineering work from typing to orchestrating — and the gap between teams who adopt them is widening fast.",
    source: "Synth Wire",
    time: "12m ago",
    image: IMG("photo-1677442136019-21780ecad995"),
    accent: "violet",
  },
  {
    id: "fy-2",
    category: "Space",
    title: "Private orbital station clears final pressure test ahead of crewed launch",
    description:
      "Engineers confirm the habitat module held integrity through a 36-hour simulated re-entry stress cycle, clearing the way for next quarter's crew rotation.",
    source: "Orbital Daily",
    time: "41m ago",
    image: IMG("photo-1446776653964-20c1d3a81b06"),
    accent: "cyan",
  },
  {
    id: "fy-3",
    category: "Markets",
    title: "Semiconductor stocks rally as AI chip demand outpaces supply forecasts",
    description:
      "Foundries are reporting backlog into next year, and analysts are quietly raising price targets across the board for the third week running.",
    source: "Capital Signal",
    time: "1h ago",
    image: IMG("photo-1611974789855-9c2a0a7236a3"),
    accent: "emerald",
  },
  {
    id: "fy-4",
    category: "Science",
    title: "Researchers map a new class of room-temperature superconducting candidates",
    description:
      "Early lab results hint at a material family that could sidestep the extreme cooling requirements that have limited real-world deployment for decades.",
    source: "LabFeed",
    time: "2h ago",
    image: IMG("photo-1532187863486-abf9dbad1b69"),
    accent: "amber",
  },
  {
    id: "fy-5",
    category: "Gaming",
    title: "Procedural world engine lets one indie studio ship a map the size of a continent",
    description:
      "The team behind the surprise hit explains how generative terrain tooling let four people do the work of a sixty-person open-world studio.",
    source: "Pixel Forge",
    time: "3h ago",
    image: IMG("photo-1542751371-adc38448a05e"),
    accent: "rose",
  },
  {
    id: "fy-6",
    category: "Business",
    title: "Remote-first companies are quietly outperforming on retention metrics again",
    description:
      "New workforce data suggests the productivity debate has settled in favor of flexibility — at least for companies that redesigned their workflows around it.",
    source: "The Ledger",
    time: "4h ago",
    image: IMG("photo-1497366216548-37526070297c"),
    accent: "sky",
  },
];

const INTERNATIONAL: NewsCard[] = [
  {
    id: "intl-1",
    category: "World",
    title: "Regional leaders reach a provisional framework on cross-border energy sharing",
    description:
      "After three rounds of closed-door talks, negotiators say a pilot grid-sharing agreement could be signed within the quarter.",
    source: "Globe Report",
    time: "30m ago",
    image: IMG("photo-1526778548025-fa2f459cd5c1"),
    accent: "cyan",
  },
  {
    id: "intl-2",
    category: "Economy",
    title: "Global shipping rates ease for the first time in five months",
    description:
      "Freight indices show container rates softening on major east-west routes as new vessel capacity finally comes online.",
    source: "Trade Currents",
    time: "1h ago",
    image: IMG("photo-1494412651409-8963ce7935a7"),
    accent: "violet",
  },
  {
    id: "intl-3",
    category: "Climate",
    title: "Coastal cities accelerate flood-barrier projects ahead of storm season",
    description:
      "Engineering teams across three continents are racing parallel timelines on adaptive sea-wall systems designed to respond to real-time tide data.",
    source: "EarthWatch",
    time: "2h ago",
    image: IMG("photo-1561484930-998b6a7b22e8"),
    accent: "emerald",
  },
  {
    id: "intl-4",
    category: "Diplomacy",
    title: "Trade delegation wraps two-day summit with new tariff exemptions on the table",
    description:
      "Officials describe the talks as the most productive in years, with a formal draft expected to circulate before the next general assembly.",
    source: "Globe Report",
    time: "5h ago",
    image: IMG("photo-1529107386315-e1a2ed48a620"),
    accent: "amber",
  },
];

const NATIONAL: NewsCard[] = [
  {
    id: "nat-1",
    category: "Local Economy",
    title: "New industrial corridor breaks ground, promising thousands of manufacturing jobs",
    description:
      "Officials say the development zone has already attracted commitments from several electronics and automotive suppliers.",
    source: "Daily Nusantara",
    time: "20m ago",
    image: IMG("photo-1487958449943-2429e8be8625"),
    accent: "sky",
  },
  {
    id: "nat-2",
    category: "Infrastructure",
    title: "Toll road expansion enters final phase, cutting commute times by a third",
    description:
      "Transportation officials confirmed the final stretch is on schedule for completion ahead of the upcoming holiday travel season.",
    source: "Metro Pulse",
    time: "1h ago",
    image: IMG("photo-1449824913935-59a10b8d2000"),
    accent: "rose",
  },
  {
    id: "nat-3",
    category: "Education",
    title: "Nationwide coding curriculum rollout reaches half of public secondary schools",
    description:
      "The ministry reports faster-than-expected adoption, with teacher training programs now expanding into rural districts.",
    source: "Daily Nusantara",
    time: "3h ago",
    image: IMG("photo-1503676260728-1c00da094a0b"),
    accent: "violet",
  },
  {
    id: "nat-4",
    category: "Health",
    title: "Telehealth network expansion reaches remote island communities for the first time",
    description:
      "A new satellite-linked clinic program is bringing specialist consultations to areas that previously required a full day's travel.",
    source: "Metro Pulse",
    time: "6h ago",
    image: IMG("photo-1576091160550-2173dba999ef"),
    accent: "emerald",
  },
];

const FEEDS: Record<Tab, NewsCard[]> = {
  forYou: FOR_YOU,
  international: INTERNATIONAL,
  national: NATIONAL,
};

const TABS: { key: Tab; label: string }[] = [
  { key: "forYou", label: "For You" },
  { key: "international", label: "International" },
  { key: "national", label: "National" },
];

/* ------------------------------------------------------------------ */

export default function Discover() {
  const [activeTab, setActiveTab] = useState<Tab>("forYou");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused || query) return;
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 2800);
    return () => clearInterval(id);
  }, [focused, query]);

  const cards = useMemo(() => FEEDS[activeTab], [activeTab]);

  const runAiSearch = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
    // UI only — this is where the AI assistant pipeline would be triggered.
  };

  return (
    <div className={styles.page}>
      <div className={styles.ambient}>
        <span className={`${styles.orb} ${styles.orbOne}`} />
        <span className={`${styles.orb} ${styles.orbTwo}`} />
        <span className={`${styles.orb} ${styles.orbThree}`} />
        <span className={styles.mesh} />
      </div>

      <div className={styles.content}>
        <motion.header
          className={styles.hero}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className={styles.eyebrow}>
            <Sparkles size={14} />
            Jarvis Discovery
          </span>
          <h1 className={styles.title}>Discover</h1>
          <p className={styles.subtitle}>
            Explore the world with AI-powered discovery.
          </p>
        </motion.header>

        <motion.div
          className={`${styles.searchShell} ${focused ? styles.searchShellFocused : styles.searchShellFloat}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.searchGlow} />
          <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <div className={styles.searchInputWrap}>
              <input
                ref={inputRef}
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runAiSearch(query);
                }}
              />
              {!query && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIndex}
                    className={styles.placeholder}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    {PLACEHOLDERS[placeholderIndex]}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
            <button
              type="button"
              className={styles.askButton}
              onClick={() => runAiSearch(query)}
            >
              <Sparkles size={15} />
              <span>Ask Jarvis</span>
            </button>
          </div>
        </motion.div>

        <div className={styles.chipRow}>
          {QUICK_ACTIONS.map(({ label, icon: Icon }, i) => (
            <motion.button
              key={label}
              className={styles.chip}
              onClick={() => runAiSearch(label)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <Icon size={14} />
              {label}
            </motion.button>
          ))}
        </div>

        <nav className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.span
                  layoutId="discoverTabIndicator"
                  className={styles.tabIndicator}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </button>
          ))}
        </nav>

        <section className={styles.trending}>
          <div className={styles.trendingLabel}>
            <TrendingUp size={14} />
            Trending now
          </div>
          <div className={styles.trendingChips}>
            {TRENDING.map((tag, i) => (
              <motion.span
                key={tag}
                className={styles.trendChip}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.04 * i }}
                whileHover={{ scale: 1.05 }}
                onClick={() => runAiSearch(tag)}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </section>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className={styles.grid}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {cards.map((card, i) => (
              <motion.article
                key={card.id}
                className={styles.card}
                data-accent={card.accent}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 * i }}
                whileHover={{ y: -6 }}
              >
                <div className={styles.cardMedia}>
                  <img src={card.image} alt="" loading="lazy" />
                  <div className={styles.cardMediaOverlay} />
                  <span className={styles.cardBadge}>{card.category}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDescription}>{card.description}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardSource}>{card.source}</span>
                    <span className={styles.cardDot} />
                    <span className={styles.cardTime}>
                      <Clock size={12} />
                      {card.time}
                    </span>
                    <ArrowUpRight size={15} className={styles.cardArrow} />
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}