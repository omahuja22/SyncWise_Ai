"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// ─── Motion System ─────────────────────────────────────────────
const EASING = [0.16, 1, 0.3, 1];
const stagger = (i, base = 0.06) => ({ delay: i * base });

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASING, delay: i * 0.06 },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASING, delay: i * 0.07 },
  }),
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "overview", label: "Overview", icon: "◈" },
  { id: "insights", label: "AI Insights", icon: "◉", badge: 3 },
  { id: "tasks", label: "Tasks", icon: "◫" },
  { id: "team", label: "Team", icon: "◎" },
  { id: "reports", label: "Reports", icon: "◧" },
];

const TASKS = [
  { id: 1, title: "Q3 product roadmap review", assignee: "Maya R.", priority: "high", risk: 82, status: "blocked", tags: ["product", "strategy"], insight: "3 dependencies unresolved. Blocking 2 downstream sprints." },
  { id: 2, title: "API rate-limit architecture", assignee: "Kai T.", priority: "high", risk: 67, status: "in_progress", tags: ["engineering", "infra"], insight: "Velocity dropped 18% this sprint. Consider pair programming session." },
  { id: 3, title: "Customer churn analysis", assignee: "Sara L.", priority: "medium", risk: 45, status: "in_progress", tags: ["data", "growth"], insight: "On track. Early signals show 12% improvement vs last quarter." },
  { id: 4, title: "Design system tokens v2", assignee: "Nico B.", priority: "low", risk: 21, status: "review", tags: ["design"], insight: "Awaiting stakeholder sign-off. Low risk to timeline." },
  { id: 5, title: "Onboarding flow A/B test", assignee: "Priya M.", priority: "medium", risk: 38, status: "in_progress", tags: ["growth", "product"], insight: "Test running. Variant B showing +9% activation rate." },
];

const METRICS = [
  { label: "Sprint Velocity", value: "87", unit: "pts", delta: "+12%", positive: true },
  { label: "Team Health", value: "7.4", unit: "/10", delta: "-0.3", positive: false },
  { label: "Blocked Tasks", value: "4", unit: "", delta: "+2", positive: false },
  { label: "On-Time Rate", value: "91", unit: "%", delta: "+5%", positive: true },
];

const AI_STATES = [
  "Analyzing team performance…",
  "Scanning 47 signals…",
  "Modeling risk vectors…",
  "Cross-referencing patterns…",
];

const MEMBERS = [
  { name: "Maya R.", role: "Product Lead", load: 94, health: 6.2 },
  { name: "Kai T.", role: "Eng Lead", load: 78, health: 8.1 },
  { name: "Sara L.", role: "Data", load: 61, health: 9.0 },
  { name: "Nico B.", role: "Design", load: 55, health: 8.5 },
  { name: "Priya M.", role: "Growth", load: 72, health: 7.8 },
];

// ─── Cursor Glow Card ─────────────────────────────────────────────────────────
function GlowCard({ children, className = "", onClick, intensity = 0.15 }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      whileHover={{ y: -2, transition: { duration: 0.25, ease: EASING } }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden ${className}`}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {hovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(320px circle at ${pos.x}px ${pos.y}px, rgba(99,102,241,${intensity}), transparent 70%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

// ─── Typing Animation ─────────────────────────────────────────────────────────
function TypingText({ text, onComplete, speed = 28 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        setTimeout(() => onComplete?.(), 300);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-3.5 bg-indigo-400 ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

// ─── Risk Gauge ───────────────────────────────────────────────────────────────
function RiskGauge({ value, size = 56 }) {
  const r = 20, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - value / 100);
  const color = value > 70 ? "#ef4444" : value > 45 ? "#f59e0b" : "#22c55e";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
      <motion.circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1.2, ease: EASING, delay: 0.3 }}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
        fontSize="11" fontWeight="600" fill={color}>
        {value}
      </text>
    </svg>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, unit, delta, positive, index }) {
  return (
    <motion.div variants={scaleIn} custom={index}
      className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 hover:border-white/20 transition-colors duration-300">
      <div className="text-xs font-medium text-white/40 uppercase tracking-widest mb-2">{label}</div>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-semibold text-white/90 tabular-nums leading-none">{value}</span>
        {unit && <span className="text-sm text-white/30 mb-0.5">{unit}</span>}
      </div>
      <div className={`mt-2 text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
        {delta} vs last sprint
      </div>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav }) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASING }}
      className="w-56 shrink-0 flex flex-col h-screen sticky top-0 border-r border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <span className="text-white/90 font-semibold tracking-tight text-sm">SyncWise</span>
          <span className="ml-auto text-[10px] font-medium bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/30">AI</span>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item, i) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNav(item.id)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07, ease: EASING }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm relative transition-colors duration-200 group ${
                isActive ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-pill"
                    className="absolute inset-0 bg-white/[0.07] rounded-lg border border-white/[0.1]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASING }}
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10 text-base leading-none">{item.icon}</span>
              <span className="relative z-10 font-medium">{item.label}</span>
              {item.badge && (
                <span className="relative z-10 ml-auto text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-full px-1.5 py-0.5 font-semibold">
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
            AK
          </div>
          <div>
            <div className="text-xs font-medium text-white/80">Arjun Kumar</div>
            <div className="text-[10px] text-white/30">Product Lead</div>
          </div>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        </div>
      </div>
    </motion.aside>
  );
}

// ─── AI Insight Panel ─────────────────────────────────────────────────────────
function AIPanel({ hoveredTask }) {
  const [phase, setPhase] = useState("thinking"); // thinking | typed | result
  const [stepIndex, setStepIndex] = useState(0);
  const [riskValue, setRiskValue] = useState(0);
  const [displayRisk, setDisplayRisk] = useState(0);

  const task = hoveredTask || TASKS[0];

  useEffect(() => {
    setPhase("thinking");
    setStepIndex(0);
    const t1 = setTimeout(() => setStepIndex(1), 700);
    const t2 = setTimeout(() => setStepIndex(2), 1400);
    const t3 = setTimeout(() => setPhase("typed"), 2000);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [task.id]);

  useEffect(() => {
    if (phase === "typed") {
      const target = task.risk;
      let current = 0;
      const step = target / 28;
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        setDisplayRisk(Math.round(current));
        if (current >= target) {
          clearInterval(interval);
          setPhase("result");
          setRiskValue(target);
        }
      }, 35);
      return () => clearInterval(interval);
    }
  }, [phase, task]);

  const riskLevel = task.risk > 70 ? "HIGH" : task.risk > 45 ? "MED" : "LOW";
  const riskColor = task.risk > 70 ? "text-red-400" : task.risk > 45 ? "text-amber-400" : "text-emerald-400";
  const borderColor = task.risk > 70 ? "border-red-500/40" : task.risk > 45 ? "border-amber-500/40" : "border-emerald-500/40";
  const glowColor = task.risk > 70 ? "rgba(239,68,68,0.15)" : task.risk > 45 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)";

  return (
    <GlowCard
      className={`rounded-2xl border ${borderColor} bg-[#0d0d1a] overflow-hidden`}
      intensity={0.1}
    >
      {/* Breathing glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${glowColor}, transparent 70%)` }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]"
        />
        <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">AI Analysis</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] text-white/30">Live</span>
          <motion.div
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 px-5 pt-4 pb-5">
        {/* Task label */}
        <div className="text-[11px] font-medium text-white/30 uppercase tracking-wider mb-3">Analyzing</div>
        <div className="text-sm font-semibold text-white/80 mb-4 leading-snug">{task.title}</div>

        {/* Thinking steps */}
        <div className="space-y-1.5 mb-4">
          {AI_STATES.slice(0, 3).map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: stepIndex > i ? 0.45 : stepIndex === i ? 1 : 0.15, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-xs text-white/50"
            >
              <motion.div
                animate={stepIndex === i ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.6, repeat: stepIndex === i ? Infinity : 0 }}
                className={`w-1 h-1 rounded-full ${stepIndex > i ? "bg-indigo-400" : "bg-white/20"}`}
              />
              {s}
            </motion.div>
          ))}
        </div>

        <div className="h-px bg-white/[0.06] mb-4" />

        {/* Result */}
        <div className="flex items-center gap-4">
          <RiskGauge value={displayRisk} size={60} />
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-2xl font-bold tabular-nums ${riskColor}`}>{displayRisk}%</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === "result" ? 1 : 0 }}
                className={`text-xs font-bold tracking-widest uppercase ${riskColor}`}
              >
                {riskLevel} RISK
              </motion.span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={task.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: phase === "result" ? 1 : 0, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-white/45 leading-relaxed"
              >
                {task.insight}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  blocked: { label: "Blocked", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  in_progress: { label: "In Progress", color: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20" },
  review: { label: "Review", color: "text-amber-300 bg-amber-500/10 border-amber-500/20" },
};

const PRIORITY_DOT = { high: "bg-red-400", medium: "bg-amber-400", low: "bg-emerald-400" };

function TaskRow({ task, index, onHover }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[task.status];

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      onMouseEnter={() => onHover(task)}
      onMouseLeave={() => onHover(null)}
      onClick={() => setExpanded(!expanded)}
      className="group cursor-pointer"
    >
      <GlowCard className="bg-white/[0.025] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/15 transition-all duration-300">
        <div className="px-4 py-3.5 flex items-center gap-4">
          {/* Priority */}
          <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]} shadow-sm`} />

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white/80 group-hover:text-white/95 transition-colors truncate">
              {task.title}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {task.tags.map(t => (
                <span key={t} className="text-[10px] text-white/30 font-medium uppercase tracking-wider">{t}</span>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
              {task.assignee.split(" ").map(n => n[0]).join("")}
            </div>
            <span className="text-xs text-white/35">{task.assignee}</span>
          </div>

          {/* Status */}
          <div className={`hidden sm:block text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${cfg.color}`}>
            {cfg.label}
          </div>

          {/* Risk mini */}
          <div className="text-xs font-bold tabular-nums text-white/30 shrink-0 w-8 text-right">
            {task.risk}%
          </div>

          {/* Arrow */}
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.25, ease: EASING }}
            className="text-white/20 text-xs shrink-0"
          >›</motion.span>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASING }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0 border-t border-white/[0.05]">
                <div className="mt-3 text-xs text-white/45 leading-relaxed bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.05]">
                  <span className="text-indigo-400 font-semibold">AI: </span>
                  {task.insight}
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="text-[11px] font-medium text-white/50 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-3 py-1.5 transition-all duration-200">
                    View details
                  </button>
                  <button className="text-[11px] font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-500/[0.1] hover:bg-indigo-500/[0.18] border border-indigo-500/[0.2] rounded-lg px-3 py-1.5 transition-all duration-200">
                    Run AI fix →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlowCard>
    </motion.div>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "#6366f1", width = 80, height = 28 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

// ─── Team Grid ────────────────────────────────────────────────────────────────
function TeamGrid() {
  const sparkData = [
    [60, 70, 65, 90, 94, 88, 94],
    [80, 75, 72, 78, 80, 76, 78],
    [50, 55, 58, 60, 63, 61, 61],
    [40, 48, 52, 55, 54, 57, 55],
    [65, 68, 70, 72, 70, 74, 72],
  ];

  return (
    <motion.div variants={fadeUp} custom={6} className="bg-white/[0.025] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-sm font-semibold text-white/70">Team Capacity</span>
        <span className="text-xs text-white/25">7-day trend</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {MEMBERS.map((m, i) => (
          <GlowCard key={m.name} className="px-5 py-3 flex items-center gap-4" intensity={0.08}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600/80 to-indigo-700/80 flex items-center justify-center text-[10px] font-bold text-white/90 shrink-0">
              {m.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white/75">{m.name}</div>
              <div className="text-[10px] text-white/30">{m.role}</div>
            </div>
            <div className="flex-1 hidden md:block">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.load}%` }}
                    transition={{ duration: 1, ease: EASING, delay: 0.3 + i * 0.08 }}
                    className={`h-full rounded-full ${m.load > 85 ? "bg-red-400" : m.load > 70 ? "bg-amber-400" : "bg-indigo-400"}`}
                  />
                </div>
                <span className="text-[10px] text-white/30 tabular-nums w-8">{m.load}%</span>
              </div>
            </div>
            <Sparkline data={sparkData[i]} color={m.load > 85 ? "#f87171" : "#818cf8"} />
            <div className="text-right shrink-0">
              <div className={`text-xs font-bold tabular-nums ${m.health >= 8 ? "text-emerald-400" : m.health >= 7 ? "text-amber-400" : "text-red-400"}`}>
                {m.health}
              </div>
              <div className="text-[9px] text-white/20">health</div>
            </div>
          </GlowCard>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <div className="relative mb-8 pt-2">
      {/* Ambient background light */}
      <motion.div
        className="absolute -top-12 left-0 w-96 h-40 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.2), transparent 70%)" }}
      />

      <motion.div variants={fadeUp} custom={0}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          <span className="text-xs font-semibold text-white/35 uppercase tracking-widest">Monday, Apr 7 · Sprint 14</span>
        </div>
        <h1 className="text-4xl font-bold text-white/95 leading-tight tracking-tight">
          Good morning,{" "}
          <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
            Arjun.
          </span>
        </h1>
        <p className="mt-2 text-sm text-white/35 font-medium">
          Your team has{" "}
          <span className="text-amber-400 font-semibold">4 blocked tasks</span>{" "}
          and{" "}
          <span className="text-red-400 font-semibold">2 high-risk items</span>{" "}
          requiring attention today.
        </p>
      </motion.div>
    </div>
  );
}

"use client";
;

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;


}

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
    >
      {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SyncWiseDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [hoveredTask, setHoveredTask] = useState(null);

  return (
   <div className="min-h-screen bg-background text-foreground">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "128px 128px" }} />

      {/* Global grid lines (extremely subtle) */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />

      <Sidebar active={activeNav} onNav={setActiveNav} />

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>

              <Hero />

            {/* Metrics */}
            <motion.div variants={fadeUp} custom={1} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {METRICS.map((m, i) => (
                <MetricCard key={m.label} {...m} index={i} />
              ))}
            </motion.div>

            {/* Main split: tasks + AI */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 mb-5">

              {/* Tasks panel */}
              <div>
                <motion.div variants={fadeUp} custom={2} className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white/70">Active Tasks</h2>
                    <p className="text-xs text-white/25 mt-0.5">{TASKS.length} tasks · 2 critical</p>
                  </div>
                  <button className="text-xs font-medium text-white/35 hover:text-white/60 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-lg transition-all duration-200">
                    + Add task
                  </button>
                </motion.div>

                <div className="space-y-2">
                  {TASKS.map((task, i) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      index={i + 3}
                      onHover={(t) => setHoveredTask(t)}
                    />
                  ))}
                </div>
              </div>

              {/* AI Panel */}
              <div className="xl:sticky xl:top-6 self-start space-y-4">
                <motion.div variants={fadeUp} custom={3}>
                  <AIPanel hoveredTask={hoveredTask} />
                </motion.div>

                {/* Quick stats card */}
                <motion.div variants={fadeUp} custom={4}>
                  <GlowCard className="bg-white/[0.025] border border-white/[0.06] rounded-2xl overflow-hidden" intensity={0.1}>
                    <div className="px-4 py-3 border-b border-white/[0.05]">
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Sprint Health</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { label: "Completion rate", value: 68, color: "bg-indigo-500" },
                        { label: "Scope creep", value: 23, color: "bg-amber-400" },
                        { label: "Team morale", value: 74, color: "bg-emerald-400" },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-white/40">{item.label}</span>
                            <span className="text-white/60 font-medium tabular-nums">{item.value}%</span>
                          </div>
                          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 1.1, ease: EASING, delay: 0.6 }}
                              className={`h-full rounded-full ${item.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                </motion.div>
              </div>
            </div>

            {/* Team Grid */}
            <TeamGrid />

          </motion.div>
        </div>
      </main>
    </div>
  );
}
