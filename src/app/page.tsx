"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  CartesianGrid, ReferenceLine, ReferenceArea, ScatterChart, Scatter,
  ComposedChart, Line, AreaChart, Area, LabelList,
} from "recharts";
import { FINE_BUCKETS, YEAR_STATS, COMPANIES, SECTOR_STATS, BUCKET_BENCHMARK } from "@/lib/ipoData";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:     "#060d1a",
  card:   "rgba(255,255,255,0.038)",
  border: "rgba(255,255,255,0.07)",
  text:   "#f1f5f9",
  desc:   "#94a3b8",
  muted:  "#64748b",
  accent: "#38bdf8",
  teal:   "#2dd4bf",
  green:  "#10b981",
  lime:   "#84cc16",
  orange: "#f97316",
  red:    "#ef4444",
  gold:   "#f59e0b",
  violet: "#7c3aed",
};

// ─── Utilities ─────────────────────────────────────────────────────────────────
const p = (n: number) => (n >= 0 ? "+" : "") + (n * 100).toFixed(0) + "%";
const w = (n: number) => Math.round(n * 100) + "%";

function median(a: number[]) {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(a: number[]) { return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0; }

function retColor(r: number) { return r >= 1 ? C.green : r >= 0 ? C.accent : r > -0.5 ? C.orange : C.red; }
function retHeat(r: number)  {
  if (r >= 5)    return "#059669";
  if (r >= 2)    return "#10b981";
  if (r >= 1)    return "#34d399";
  if (r >= 0.5)  return "#6ee7b7";
  if (r >= 0)    return "#a7f3d0";
  if (r >= -0.3) return "#fca5a5";
  if (r >= -0.6) return "#f87171";
  if (r >= -0.9) return "#ef4444";
  return "#7f1d1d";
}
function retHeatText(r: number) { return (r >= 0.5 || r <= -0.5) ? "#fff" : "#1e293b"; }
function winHeat(wr: number | null) {
  if (wr === null) return "rgba(255,255,255,0.02)";
  if (wr >= 0.7)  return "rgba(16,185,129,0.55)";
  if (wr >= 0.5)  return "rgba(52,211,153,0.38)";
  if (wr >= 0.35) return "rgba(245,158,11,0.38)";
  if (wr >= 0.2)  return "rgba(248,113,113,0.38)";
  return "rgba(239,68,68,0.55)";
}

// ─── Derived data ──────────────────────────────────────────────────────────────
const allRets = COMPANIES.filter(c => c.ret !== null).map(c => c.ret as number);
const totalN  = COMPANIES.length;
const overallWin = Math.round(COMPANIES.filter(c => (c.ret ?? 0) >= 0).length / totalN * 100);
const overallMed = Math.round(median(allRets) * 100);

const bySorted = [...COMPANIES].filter(c => c.ret !== null).sort((a, b) => (b.ret as number) - (a.ret as number));
const top5t = bySorted.slice(0, 5).map(c => c.ticker);
const bot5t = bySorted.slice(-5).map(c => c.ticker);

const filterR = (ex: string[]) => COMPANIES.filter(c => c.ret !== null && !ex.includes(c.ticker)).map(c => c.ret as number);

const SENSITIVITY = [
  { label: "All 94 IPOs",  sub: "Full dataset",              rets: allRets,                     color: C.accent  },
  { label: "No PLTR",      sub: "Remove Palantir (+1415%)",  rets: filterR(["PLTR"]),            color: C.teal    },
  { label: "No DIDI+RIVN", sub: "Remove 2 mega losers",      rets: filterR(["DIDI","RIVN"]),     color: C.orange  },
  { label: "No Top 5",     sub: "Remove 5 best returns",     rets: filterR(top5t),               color: C.gold    },
  { label: "No Bottom 5",  sub: "Remove 5 worst returns",    rets: filterR(bot5t),               color: C.green   },
  { label: "No Extremes",  sub: "Remove top & bottom 10",   rets: filterR([...top5t,...bot5t]),  color: "#a78bfa" },
].map(s => ({
  ...s,
  n:       s.rets.length,
  medRet:  Math.round(median(s.rets) * 100),
  meanRet: Math.round(mean(s.rets) * 100),
  winRate: Math.round(s.rets.filter(r => r >= 0).length / s.rets.length * 100),
}));

const POWER_LAW = bySorted.map((c, i) => ({
  rank: i + 1, ret: Math.min(c.ret as number, 22),
  retReal: c.ret as number, ticker: c.ticker,
}));

const HEATMAP = YEAR_STATS.map(ys => ({
  year: ys.year,
  cells: FINE_BUCKETS.map(b => {
    const cos = COMPANIES.filter(c => c.year === ys.year && c.bucket === b.label);
    const wins = cos.filter(c => (c.ret ?? 0) >= 0).length;
    const rs = cos.map(c => c.ret as number);
    return {
      bucket: b.label, n: cos.length,
      winRate: cos.length ? wins / cos.length : null,
      medRet: cos.length ? median(rs) : null,
      tickers: cos.map(c => c.ticker),
    };
  }),
}));

const SECTORS = SECTOR_STATS.filter(s => s.n >= 3)
  .sort((a, b) => b.medRet - a.medRet)
  .map(s => ({ ...s, medPct: Math.round(s.medRet * 100), winPct: Math.round(s.winRate * 100) }));

const RET_DIST = [
  { label: "< -80%",        min: -Infinity, max: -0.8,    color: "#dc2626" },
  { label: "-80 to -50%",   min: -0.8,      max: -0.5,    color: "#ef4444" },
  { label: "-50 to -20%",   min: -0.5,      max: -0.2,    color: "#f97316" },
  { label: "-20 to 0%",     min: -0.2,      max: 0,       color: "#f59e0b" },
  { label: "0 to +50%",     min: 0,         max: 0.5,     color: "#84cc16" },
  { label: "+50 to +100%",  min: 0.5,       max: 1,       color: "#10b981" },
  { label: "+100 to +300%", min: 1,         max: 3,       color: "#2dd4bf" },
  { label: "> +300%",       min: 3,         max: Infinity, color: "#38bdf8" },
].map(b => ({
  ...b, count: COMPANIES.filter(c => c.ret !== null && (c.ret as number) >= b.min && (c.ret as number) < b.max).length,
}));

const LADDER = FINE_BUCKETS.map(b => ({
  ...b,
  winPct:  Math.round(b.winRate * 100),
  medPct:  Math.round(b.medRet * 100),
  meanPct: Math.round(b.meanRet * 100),
  isDead:  b.label === "$10-20B",
  isSweet: b.label === "$1-2B",
  barColor: b.label === "$10-20B" ? C.red : b.label === "$1-2B" ? C.green :
    b.winRate >= 0.5 ? C.teal : b.winRate >= 0.35 ? C.gold : C.orange,
}));

const MOSAIC = bySorted.map(c => ({ ...c, ret: c.ret as number }));

const SCATTER_BASE = COMPANIES.filter(c => c.ret !== null)
  .map(c => ({ t: c.ticker, v: c.ipoVal, mc: c.currentCap, ret: c.ret as number, retCap: Math.min(c.ret as number, 15), sector: c.sector, year: c.year }));
const NOTABLE_TICKERS = ["PLTR","CRDO","HOOD","RDDT","DIDI","RIVN","ARM","GDRX","CRWV","ALAB"];
const SCATTER_BG = SCATTER_BASE.filter(d => !NOTABLE_TICKERS.includes(d.t));
const SCATTER_FG = SCATTER_BASE.filter(d =>  NOTABLE_TICKERS.includes(d.t));

const YEAR_CHART = YEAR_STATS.map(y => ({
  ...y, label: String(y.year),
  winPct:  Math.round(y.winRate * 100),
  medPct:  Math.round(y.medRet * 100),
  meanPct: Math.round(y.meanRet * 100),
  barColor: y.winRate >= 0.5 ? C.green : y.winRate >= 0.3 ? C.gold : C.red,
}));

// Hall of Fame / Hall of Shame — top 10 and bottom 10 by return
const WIN_MAX = bySorted.length > 0 ? Math.round((bySorted[0].ret as number) * 100) : 2200;
const logMax = Math.log10(WIN_MAX + 1);
const HALL_WINNERS = bySorted.slice(0, 10).map((c, i) => ({
  ticker: c.ticker, retPct: Math.round((c.ret as number) * 100),
  ipoVal: c.ipoVal, year: c.year, rank: i + 1,
  barW: Math.round(Math.log10(Math.round((c.ret as number) * 100) + 1) / logMax * 100),
}));
const HALL_LOSERS = [...bySorted].slice(-10).reverse().map((c, i) => ({
  ticker: c.ticker, retPct: Math.round((c.ret as number) * 100),
  ipoVal: c.ipoVal, year: c.year, rank: bySorted.length - i,
  barW: Math.min(Math.abs(Math.round((c.ret as number) * 100)), 100),
}));

// Capital Scorecard — net $ value created / destroyed per bucket ($B)
const CAPITAL_SCORE = FINE_BUCKETS.map(b => {
  const cos = COMPANIES.filter(c => c.bucket === b.label && c.ret !== null && c.currentCap != null);
  const created   = cos.reduce((s, c) => s + Math.max(0,  (c.currentCap as number) - c.ipoVal), 0);
  const destroyed = cos.reduce((s, c) => s + Math.min(0,  (c.currentCap as number) - c.ipoVal), 0);
  return {
    label:     b.label,
    created:   parseFloat(created.toFixed(1)),
    destroyed: parseFloat(destroyed.toFixed(1)),
    net:       parseFloat((created + destroyed).toFixed(1)),
  };
});

const TT_STYLE = {
  contentStyle: { background: "#0f172a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, fontSize: 11, color: C.text },
  cursor: { fill: "rgba(255,255,255,.03)" },
};

// ─── Benchmark derived data ────────────────────────────────────────────────────
const benchCos = COMPANIES.filter((c: { alphaQQQ?: number }) => c.alphaQQQ !== undefined) as Array<{ ticker: string; company: string; bucket: string; alphaQQQ: number; alphaSPY: number; beatQQQ: boolean; beatSPY: boolean; ret: number }>;
const allAlphasQQQ = benchCos.map(c => c.alphaQQQ);
const medAlphaQQQ  = (() => { const s = [...allAlphasQQQ].sort((a,b)=>a-b), m = Math.floor(s.length/2); return s.length%2 ? s[m] : (s[m-1]+s[m])/2; })();
const TOP_ALPHA    = [...benchCos].sort((a,b) => b.alphaQQQ - a.alphaQQQ).slice(0, 10);
const BOT_ALPHA    = [...benchCos].sort((a,b) => a.alphaQQQ - b.alphaQQQ).slice(0, 10);
const BENCH_CHART  = BUCKET_BENCHMARK.map(b => ({
  ...b,
  ipoRetPct:  Math.round(b.meanIPORet * 100),
  qqqRetPct:  Math.round(b.meanQQQRet * 100),
  spyRetPct:  Math.round(b.meanSPYRet * 100),
  alphaQQQPct: parseFloat((b.meanAlphaQQQ).toFixed(3)),
  beatQQQPct100: Math.round(b.beatQQQPct * 100),
  beatSPYPct100: Math.round(b.beatSPYPct * 100),
}));

// ─── Hooks + components ────────────────────────────────────────────────────────
function useFadeIn(threshold = 0.06) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, style: { opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(28px)", transition: "opacity .65s ease, transform .65s ease" } };
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function AnimNum({ value, suffix = "", prefix = "", decimals = 0 }: { value: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const tick = useCallback(() => {
    const start = performance.now(), dur = 1300;
    const run = (now: number) => {
      const t = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - t, 3);
      const v = Math.round(value * e * Math.pow(10, decimals)) / Math.pow(10, decimals);
      setN(v);
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [value, decimals]);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { tick(); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [tick]);
  return <span ref={ref}>{prefix}{n.toFixed(decimals)}{suffix}</span>;
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, style } = useFadeIn();
  return <div ref={ref} style={{ ...style, transitionDelay: `${delay}ms` }}>{children}</div>;
}

function Glass({ children, style = {}, className = "" }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  return (
    <div className={className} style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", ...style,
    }}>{children}</div>
  );
}

function ChartTitle({ accent = C.accent, children }: { accent?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: -0.2 }}>{children}</span>
    </div>
  );
}

function Pill({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
      background: active ? color : "rgba(255,255,255,.05)",
      color: active ? "#060d1a" : C.desc,
      border: `1px solid ${active ? color : C.border}`,
      transition: "all .18s ease",
    }}>{label}</button>
  );
}

function InsightCallout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: 18, padding: "12px 16px", borderRadius: 12,
      background: "linear-gradient(135deg,rgba(56,189,248,.06),rgba(45,212,191,.04))",
      border: "1px solid rgba(56,189,248,.15)",
    }}>
      <span style={{ fontSize: 10, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, marginRight: 8 }}>Insight</span>
      <span style={{ fontSize: 13, color: C.desc, lineHeight: 1.7 }}>{children}</span>
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color: C.accent, textTransform: "uppercase", marginBottom: 8 }}>{children}</div>;
}
function STitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6, color: C.text, marginBottom: 6, lineHeight: 1.2 }}>{children}</h2>;
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const isMobile = useIsMobile();
  const [ladderBucket,  setLadderBucket]  = useState(0);
  const [mosaicYear,    setMosaicYear]    = useState<number|"all">("all");
  const [heatHover,     setHeatHover]     = useState<{ year: number; bucket: string; tickers: string[]; n: number; winRate: number|null; medRet: number|null } | null>(null);
  const [sensitIdx,     setSensitIdx]     = useState(0);
  const [scatterTab,    setScatterTab]    = useState<"scatter"|"curve">("scatter");
  const [chartTab,      setChartTab]      = useState<"volume"|"returns"|"dist">("volume");

  const activeSens   = SENSITIVITY[sensitIdx];
  const activeLadder = LADDER[ladderBucket];
  const mosaicData   = mosaicYear === "all" ? MOSAIC : MOSAIC.filter(c => c.year === mosaicYear);

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes glow    { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        .hover-lift { transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease; }
        .hover-lift:hover { transform:translateY(-3px); box-shadow:0 20px 60px rgba(56,189,248,.1); border-color:rgba(56,189,248,.28)!important; }
        .pill-btn { transition:all .18s ease; cursor:pointer; }
        .pill-btn:hover { background:rgba(56,189,248,.12)!important; }
        .mosaic-tile { transition:transform .18s ease,opacity .18s ease,z-index 0s; }
        .mosaic-tile:hover { transform:scale(1.15); z-index:10; }
        .heat-cell { transition:opacity .18s; cursor:default; }
        .heat-cell:hover { opacity:.85; }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#060d1a}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px}
        @media (max-width:700px) {
          .mosaic-tile:hover { transform:none; }
          .mob-1col { grid-template-columns:1fr !important; }
          .mob-2col { grid-template-columns:repeat(2,1fr) !important; }
        }
      `}</style>

      <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX: "hidden" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: isMobile ? "24px 16px 80px" : "36px 20px 100px" }}>

          {/* ═══ 1. HERO ══════════════════════════════════════════════════════════ */}
          <div style={{
            padding: isMobile ? "44px 24px 40px" : "70px 40px 60px",
            marginBottom: 56, borderRadius: 28,
            background: "radial-gradient(ellipse 90% 70% at 50% -20%, rgba(56,189,248,.12) 0%, transparent 65%), linear-gradient(180deg,rgba(14,30,55,.9) 0%,transparent 100%)",
            border: `1px solid ${C.border}`, position: "relative", overflow: "hidden", textAlign: "center",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${C.accent},transparent)`, opacity: .6 }} />
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 4, color: C.accent, textTransform: "uppercase", marginBottom: 22 }}>94 US IPOs · 2020–2025 · Data as of May 2026</div>
            <h1 style={{
              fontSize: isMobile ? 38 : 64, fontWeight: 900, letterSpacing: isMobile ? -1 : -2.5, lineHeight: 1.0, marginBottom: 22,
              background: `linear-gradient(140deg,#fff 0%,${C.accent} 50%,${C.teal} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block",
            }}>IPO Valuation<br />Intelligence</h1>
            <p style={{ color: C.desc, fontSize: isMobile ? 15 : 17, maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.6 }}>
              The valuation dead zone, power-law winners, and what six years of IPO data reveals about when — and at what price — to go public.
            </p>

            {/* Animated KPI strip */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 14, maxWidth: 760, margin: "0 auto 36px" }}>
              {[
                { val: totalN,          suf: "",   label: "Total IPOs",        col: C.accent, prefix: ""  },
                { val: overallWin,      suf: "%",  label: "Win Rate",          col: C.green,  prefix: ""  },
                { val: Math.abs(overallMed), suf: "%", label: "Median Return", col: C.orange, prefix: "-" },
                { val: 2162,            suf: "%",  label: "Best Return (CRDO)",col: C.teal,   prefix: "+" },
              ].map((k, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.05)", borderRadius: 14, padding: isMobile ? "16px 10px" : "20px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: k.col, letterSpacing: -1, lineHeight: 1 }}>
                    <AnimNum value={k.val} suffix={k.suf} prefix={k.prefix} />
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: .8 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Return spectrum bar */}
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, textAlign: "left", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Return distribution across all 94 IPOs</div>
              <div style={{ display: "flex", height: 12, borderRadius: 8, overflow: "hidden", gap: 2 }}>
                {RET_DIST.map((b, i) => (
                  <div key={i} title={`${b.label}: ${b.count} IPOs`} style={{
                    flex: b.count, background: b.color, borderRadius: 3, minWidth: b.count > 0 ? 4 : 0,
                    transition: "flex .5s ease",
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 10, color: C.red }}>← All losses</span>
                <span style={{ fontSize: 10, color: C.muted }}>Break-even</span>
                <span style={{ fontSize: 10, color: C.green }}>All gains →</span>
              </div>
            </div>
          </div>

          {/* ═══ 2. THE VALUATION LADDER ═══════════════════════════════════════════ */}
          <FadeIn>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Core Thesis</SLabel>
              <STitle>The Valuation Ladder</STitle>
              <p style={{ color: C.desc, fontSize: 13, marginBottom: 28, maxWidth: 700 }}>
                Every IPO bucket from sub-$1B to $40B+, ranked by win rate and median return. The dead zone at $10–20B is not an anomaly — it&apos;s a structural trap.
              </p>

              <ResponsiveContainer width="100%" height={isMobile ? 260 : 340}>
                <ComposedChart data={LADDER} margin={{ top: 20, right: 60, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                  <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" domain={[0, 100]} tickFormatter={v => v + "%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Win Rate", angle: -90, position: "insideLeft", fill: C.muted, fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[-80, 120]} tickFormatter={v => v + "%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Median Ret", angle: 90, position: "insideRight", fill: C.muted, fontSize: 10 }} />
                  <ReferenceArea yAxisId="left" x1="$10-20B" x2="$10-20B" fill="rgba(239,68,68,.12)" label={{ value: "DEAD ZONE", position: "top", fill: C.red, fontSize: 9, fontWeight: 800 }} />
                  <Tooltip
                    {...TT_STYLE}
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: "#0f172a", border: `1px solid ${d.barColor}40`, borderRadius: 12, padding: "12px 16px", fontSize: 12 }}>
                          <div style={{ fontWeight: 800, color: d.barColor, marginBottom: 6 }}>{d.label}</div>
                          <div style={{ color: C.desc }}>n = {d.n} companies</div>
                          <div style={{ color: d.winPct >= 50 ? C.green : C.orange }}>Win Rate: {d.winPct}%</div>
                          <div style={{ color: retColor(d.medPct / 100) }}>Median: {d.medPct >= 0 ? "+" : ""}{d.medPct}%</div>
                          <div style={{ color: C.muted }}>Mean: {d.meanPct >= 0 ? "+" : ""}{d.meanPct}%</div>
                        </div>
                      );
                    }}
                  />
                  <Bar yAxisId="left" dataKey="winPct" radius={[6, 6, 0, 0]} maxBarSize={60} name="Win Rate">
                    {LADDER.map((d, i) => <Cell key={i} fill={d.barColor} opacity={ladderBucket === i ? 1 : 0.65} />)}
                    <LabelList dataKey="n" position="top" formatter={(v: unknown) => `n=${v}`} style={{ fontSize: 9, fill: C.muted }} />
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="medPct" stroke={C.gold} strokeWidth={2.5} dot={{ fill: C.gold, r: 4 }} name="Median %" animationDuration={800} />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Bucket selector */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "20px 0 16px" }}>
                {LADDER.map((b, i) => (
                  <Pill key={i} label={b.label} active={ladderBucket === i} color={b.barColor} onClick={() => setLadderBucket(i)} />
                ))}
              </div>

              {/* Active bucket detail */}
              <div style={{
                padding: "20px 22px", borderRadius: 16,
                background: `${activeLadder.barColor}10`, border: `1px solid ${activeLadder.barColor}30`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: activeLadder.barColor }}>{activeLadder.label}</span>
                    <span style={{ fontSize: 13, color: C.muted, marginLeft: 10 }}>{activeLadder.n} companies</span>
                    {activeLadder.isDead  && <span style={{ marginLeft: 10, fontSize: 10, fontWeight: 700, background: C.red,   color: "#fff", padding: "2px 8px", borderRadius: 4 }}>DEAD ZONE</span>}
                    {activeLadder.isSweet && <span style={{ marginLeft: 10, fontSize: 10, fontWeight: 700, background: C.green, color: "#fff", padding: "2px 8px", borderRadius: 4 }}>SWEET SPOT</span>}
                  </div>
                  <div style={{ display: "flex", gap: isMobile ? 14 : 24, flexWrap: "wrap" }}>
                    {[{ label: "Win Rate",         val: w(activeLadder.winRate),  col: activeLadder.winRate >= 0.5 ? C.green : C.orange },
                      { label: "Median",           val: (activeLadder.medPct >= 0 ? "+" : "") + activeLadder.medPct + "%", col: retColor(activeLadder.medRet) },
                      { label: "Big Wins (>100%)",  val: w(activeLadder.bigWin),  col: C.teal },
                      { label: "Big Loss (>50%↓)",  val: w(activeLadder.bigLoss), col: C.red  },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: s.col }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: C.desc, lineHeight: 1.7, marginBottom: 12 }}>{activeLadder.note}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {activeLadder.examples.map((e) => (
                    <span key={e.t} style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 8, fontWeight: 700, cursor: "default",
                      background: `${retColor(e.ret)}18`, color: retColor(e.ret), border: `1px solid ${retColor(e.ret)}35`,
                    }}>{e.t} {p(e.ret)}</span>
                  ))}
                </div>
              </div>

              <InsightCallout>The $1–2B bucket has the best risk-adjusted entry: 60% win rate, +109% median. The $10–20B bucket is the structural floor: 22% win rate, -41% median, zero doubles. Not bad luck — structural mispricing at the premium-but-not-category-defining valuation.</InsightCallout>
            </Glass>
          </FadeIn>

          {/* ═══ 3. POWER LAW: SCATTER + CURVE ════════════════════════════════════ */}
          <FadeIn delay={80}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Power Law Analysis</SLabel>
              <STitle>The Distribution Is Not Normal</STitle>
              <div style={{ display: "flex", gap: 8, marginBottom: 24, marginTop: 8, flexWrap: "wrap" }}>
                {(["scatter","curve"] as const).map(id => (
                  <Pill key={id} label={id === "scatter" ? "Valuation vs Return Scatter" : "Rank-Ordered Return Curve"} active={scatterTab === id} color={C.accent} onClick={() => setScatterTab(id)} />
                ))}
              </div>

              {scatterTab === "scatter" && (
                <>
                  <ChartTitle>IPO Valuation ($B) vs Total Return — notable IPOs labeled</ChartTitle>
                  <ResponsiveContainer width="100%" height={isMobile ? 300 : 420}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                      <XAxis dataKey="v" type="number" name="IPO Val" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "$" + v + "B"} />
                      <YAxis dataKey="retCap" type="number" name="Return" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => (v >= 0 ? "+" : "") + (v * 100).toFixed(0) + "%"} domain={[-1.1, 16]} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" label={{ value: "Break-even", position: "right", fill: C.muted, fontSize: 9 }} />
                      <ReferenceLine x={10} stroke={`${C.red}60`} strokeDasharray="4 4" label={{ value: "Dead Zone →", position: "insideTopLeft", fill: C.red, fontSize: 9, fontWeight: 700 }} />
                      <Tooltip {...TT_STYLE} content={({ payload }) => {
                        if (!payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                            <div style={{ fontWeight: 800, color: retColor(d.ret) }}>{d.t}</div>
                            <div style={{ color: C.desc }}>${d.v}B IPO → ${d.mc?.toFixed(1)}B</div>
                            <div style={{ color: retColor(d.ret) }}>{p(d.ret)}</div>
                            <div style={{ color: C.muted }}>{d.sector} · {d.year}</div>
                          </div>
                        );
                      }} />
                      <Scatter data={SCATTER_BG} name="IPOs" opacity={0.5}>
                        {SCATTER_BG.map((d, i) => <Cell key={i} fill={retColor(d.ret)} r={4} />)}
                      </Scatter>
                      <Scatter data={SCATTER_FG} name="Notable" opacity={0.95}>
                        {SCATTER_FG.map((d, i) => <Cell key={i} fill={retColor(d.ret)} r={7} />)}
                        <LabelList dataKey="t" position="top" style={{ fontSize: 9, fontWeight: 700, fill: C.text }} />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  <InsightCallout>No correlation between IPO valuation and return — but there&apos;s a band of destruction at $10–20B (all red dots). The two superstars (CRDO at $1.6B, PLTR at $21.8B) float far above the field — separated from the pack by a factor of 10+.</InsightCallout>
                </>
              )}

              {scatterTab === "curve" && (
                <>
                  <ChartTitle>Power Law Curve — 94 IPOs ranked by return, best to worst</ChartTitle>
                  <p style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>CRDO (+2162%) and PLTR (+1415%) are capped at display max. Dashed line = break-even.</p>
                  <ResponsiveContainer width="100%" height={isMobile ? 280 : 380}>
                    <AreaChart data={POWER_LAW} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                      <defs>
                        <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor={C.teal}  stopOpacity={0.5} />
                          <stop offset="50%"  stopColor={C.green} stopOpacity={0.2} />
                          <stop offset="80%"  stopColor={C.red}   stopOpacity={0.3} />
                          <stop offset="100%" stopColor={C.red}   stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                      <XAxis dataKey="rank" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Rank (1 = best)", position: "insideBottom", offset: -10, fill: C.muted, fontSize: 10 }} />
                      <YAxis tickFormatter={v => (v >= 0 ? "+" : "") + (v * 100).toFixed(0) + "%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,.25)" strokeDasharray="6 3" label={{ value: "Break-even", position: "right", fill: C.muted, fontSize: 9 }} />
                      <Tooltip {...TT_STYLE} content={({ payload }) => {
                        if (!payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                            <div style={{ fontWeight: 800, color: retColor(d.retReal) }}>#{d.rank} {d.ticker}</div>
                            <div style={{ color: retColor(d.retReal) }}>{p(d.retReal)}</div>
                          </div>
                        );
                      }} />
                      <Area type="monotone" dataKey="ret" stroke={C.teal} strokeWidth={2} fill="url(#plGrad)" dot={false} animationDuration={1000} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <InsightCallout>The curve drops nearly vertically from rank 1 (CRDO, +2162%) to rank 10, then flattens near break-even for ranks 10–38, then slowly declines into a graveyard of -50% to -99% companies. This classic power-law shape means ~10 companies drive almost all positive returns in the entire dataset.</InsightCallout>
                </>
              )}
            </Glass>
          </FadeIn>

          {/* ═══ 4. HALL OF FAME / HALL OF SHAME ════════════════════════════════════ */}
          <FadeIn delay={60}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Best &amp; Worst</SLabel>
              <STitle>Hall of Fame vs Hall of Shame</STitle>
              <p style={{ color: C.desc, fontSize: 13, marginBottom: 28 }}>
                The top 10 and bottom 10 companies by total return since IPO. Bar width is log-scaled for winners; linear for losers.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 32 }}>
                {/* Winners */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Top 10 Winners</div>
                  {HALL_WINNERS.map((c, i) => (
                    <div key={c.ticker} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                      <div style={{ width: 18, fontSize: 10, color: C.muted, flexShrink: 0, textAlign: "right" }}>{i + 1}</div>
                      <div style={{ width: 44, fontSize: 11, fontWeight: 800, color: C.text, flexShrink: 0 }}>{c.ticker}</div>
                      <div style={{ flex: 1, height: 20, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden", position: "relative" }}>
                        <div style={{
                          position: "absolute", left: 0, top: 0, bottom: 0,
                          width: `${c.barW}%`,
                          background: `linear-gradient(90deg,${C.green}99,${C.teal}99)`,
                          borderRadius: 4,
                        }} />
                      </div>
                      <div style={{ width: 72, textAlign: "right", fontSize: 11, fontWeight: 800, color: C.green, flexShrink: 0 }}>
                        +{c.retPct.toLocaleString()}%
                      </div>
                      <div style={{ width: 32, textAlign: "right", fontSize: 10, color: C.muted, flexShrink: 0 }}>{c.year}</div>
                    </div>
                  ))}
                </div>
                {/* Losers */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.red, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Bottom 10 Losers</div>
                  {HALL_LOSERS.map((c, i) => (
                    <div key={c.ticker} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                      <div style={{ width: 18, fontSize: 10, color: C.muted, flexShrink: 0, textAlign: "right" }}>{i + 1}</div>
                      <div style={{ width: 44, fontSize: 11, fontWeight: 800, color: C.text, flexShrink: 0 }}>{c.ticker}</div>
                      <div style={{ flex: 1, height: 20, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden", position: "relative" }}>
                        <div style={{
                          position: "absolute", left: 0, top: 0, bottom: 0,
                          width: `${c.barW}%`,
                          background: `linear-gradient(90deg,${C.red}99,${C.orange}88)`,
                          borderRadius: 4,
                        }} />
                      </div>
                      <div style={{ width: 72, textAlign: "right", fontSize: 11, fontWeight: 800, color: C.red, flexShrink: 0 }}>
                        {c.retPct}%
                      </div>
                      <div style={{ width: 32, textAlign: "right", fontSize: 10, color: C.muted, flexShrink: 0 }}>{c.year}</div>
                    </div>
                  ))}
                </div>
              </div>
              <InsightCallout>The top 10 winners span semiconductors, data infra, and fintech — and include both tiny ($1.6B CRDO) and mega ($21.8B PLTR) IPOs. The bottom 10 are almost entirely 2021 marketplace and consumer tech names that priced at peak ZIRP multiples. Vintage and sector compounded the destruction.</InsightCallout>
            </Glass>
          </FadeIn>

          {/* ═══ 5. VINTAGE YEAR ANALYSIS ═════════════════════════════════════════ */}
          <FadeIn delay={60}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Vintage Analysis</SLabel>
              <STitle>The Year You IPO&apos;d Determined Your Fate</STitle>

              <div style={{ display: "flex", gap: 8, marginBottom: 24, marginTop: 8, flexWrap: "wrap" }}>
                {(["volume","returns","dist"] as const).map(id => (
                  <Pill key={id} label={id === "volume" ? "Count & Win Rate" : id === "returns" ? "Median vs Mean" : "Return Distribution"} active={chartTab === id} color={C.accent} onClick={() => setChartTab(id)} />
                ))}
              </div>

              {chartTab === "volume" && (
                <>
                  <ChartTitle accent={C.green}>IPO count (bars) + win rate (line) by vintage year</ChartTitle>
                  <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
                    <ComposedChart data={YEAR_CHART} margin={{ top: 10, right: 60, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                      <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="l" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="r" orientation="right" domain={[0,100]} tickFormatter={v => v+"%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TT_STYLE} formatter={(v, name) => [name === "n" ? String(v) : Number(v) + "%", name === "n" ? "IPOs" : "Win Rate"] as [string,string]} />
                      <Bar yAxisId="l" dataKey="n" radius={[7,7,0,0]} maxBarSize={52} animationDuration={700}>
                        {YEAR_CHART.map((d, i) => <Cell key={i} fill={d.barColor} opacity={0.8} />)}
                      </Bar>
                      <Line yAxisId="r" type="monotone" dataKey="winPct" stroke={C.accent} strokeWidth={2.5} dot={{ fill: C.accent, r: 5 }} animationDuration={900} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <InsightCallout>2021 had 27 IPOs (most of any year) but only 19% win rate — the worst vintage in the dataset. 2022 had just 5 IPOs and 60% win rate with +88% median return. Volume and quality move in opposite directions.</InsightCallout>
                </>
              )}

              {chartTab === "returns" && (
                <>
                  <ChartTitle accent={C.gold}>Median (bars) vs mean return (dashed line) — gap shows power-law effect</ChartTitle>
                  <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
                    <ComposedChart data={YEAR_CHART} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                      <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => v+"%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                      <Tooltip {...TT_STYLE} formatter={(v) => [Number(v) + "%", ""] as [string,string]} />
                      <Bar dataKey="medPct" name="Median" fill={C.teal} opacity={0.85} radius={[5,5,0,0]} maxBarSize={48} animationDuration={700} />
                      <Line type="monotone" dataKey="meanPct" name="Mean" stroke={C.gold} strokeWidth={2.5} strokeDasharray="7 3" dot={{ fill: C.gold, r: 5 }} animationDuration={900} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <InsightCallout>2022&apos;s mean (+637%) towers over its median (+88%) because CRDO returned 22×. 2023&apos;s mean (+193%) vs median (+17%) shows ARM (+196%) pulling the average. Every year has an outlier inflating the mean — which is why median is the honest number.</InsightCallout>
                </>
              )}

              {chartTab === "dist" && (
                <>
                  <ChartTitle accent={C.orange}>Return distribution histogram — how outcomes cluster</ChartTitle>
                  <ResponsiveContainer width="100%" height={isMobile ? 260 : 300}>
                    <BarChart data={RET_DIST} margin={{ top: 10, right: 10, bottom: 50, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                      <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 10, angle: -35, textAnchor: "end" }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TT_STYLE} formatter={(v) => [String(v), "Companies"] as [string,string]} />
                      <Bar dataKey="count" radius={[6,6,0,0]} maxBarSize={60} animationDuration={700}>
                        {RET_DIST.map((d, i) => <Cell key={i} fill={d.color} opacity={0.9} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <InsightCallout>The distribution is right-skewed and bimodal: the largest bucket is -80 to -50% (many 2021 casualties) AND &gt;+300% (the outlier cluster). The median falls between -20% and 0% — most IPOs quietly lose a little, while the tails dominate all performance discussion.</InsightCallout>
                </>
              )}
            </Glass>
          </FadeIn>

          {/* ═══ 6. YEAR × BUCKET HEATMAP ════════════════════════════════════════= */}
          <FadeIn delay={60}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Cross-Tab Matrix</SLabel>
              <STitle>Year × Valuation Bucket Heatmap</STitle>
              <p style={{ color: C.desc, fontSize: 13, marginBottom: 24 }}>
                Win rate per year-bucket cell. Dark red = mostly losses. Bright green = mostly wins. Empty = no IPOs that year in that bucket. Hover for detail.
              </p>

              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "separate", borderSpacing: 4, width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ fontSize: 10, color: C.muted, fontWeight: 700, textAlign: "right", paddingRight: 10, paddingBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Year</th>
                      {FINE_BUCKETS.map(b => (
                        <th key={b.label} style={{ fontSize: 9, color: b.label === "$10-20B" ? C.red : C.muted, fontWeight: b.label === "$10-20B" ? 800 : 600, textAlign: "center", paddingBottom: 6, minWidth: 68, letterSpacing: -0.3 }}>{b.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HEATMAP.map(row => (
                      <tr key={row.year}>
                        <td style={{ fontSize: 12, fontWeight: 700, color: C.muted, textAlign: "right", paddingRight: 10, paddingBottom: 4 }}>{row.year}</td>
                        {row.cells.map(cell => (
                          <td key={cell.bucket}
                            className="heat-cell"
                            onMouseEnter={() => setHeatHover({ year: row.year, ...cell })}
                            onMouseLeave={() => setHeatHover(null)}
                            style={{
                              background: winHeat(cell.winRate), borderRadius: 8, height: 52,
                              textAlign: "center", verticalAlign: "middle", padding: "4px 6px",
                              border: heatHover?.year === row.year && heatHover?.bucket === cell.bucket ? `1px solid ${C.accent}` : "1px solid transparent",
                            }}>
                            {cell.n > 0 ? (
                              <>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{Math.round((cell.winRate ?? 0) * 100)}%</div>
                                <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)" }}>n={cell.n}</div>
                              </>
                            ) : (
                              <div style={{ fontSize: 10, color: C.muted }}>—</div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {heatHover && heatHover.n > 0 && (
                <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: C.accent }}>{heatHover.year} · {heatHover.bucket}: </span>
                  <span style={{ color: heatHover.winRate !== null && heatHover.winRate >= 0.5 ? C.green : C.orange }}>{Math.round((heatHover.winRate ?? 0) * 100)}% win rate</span>
                  {heatHover.medRet !== null && <span style={{ color: C.muted }}> · {p(heatHover.medRet)} median</span>}
                  <span style={{ color: C.muted }}> · {heatHover.tickers.join(", ")}</span>
                </div>
              )}
              <InsightCallout>2021&apos;s $5–10B range is almost entirely red — the most populated IPO band in the worst vintage. 2022&apos;s $1–2B cell shows CRDO&apos;s 100% win rate. The $10–20B column is red across every year that has data — the dead zone transcends vintage cycles.</InsightCallout>
            </Glass>
          </FadeIn>

          {/* ═══ 7. COMPANY MOSAIC ════════════════════════════════════════════════ */}
          <FadeIn delay={40}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>All 94 Companies</SLabel>
              <STitle>The Full Mosaic</STitle>
              <p style={{ color: C.desc, fontSize: 13, marginBottom: 20 }}>
                Every IPO sorted by return, best to worst. Green = winner, red = loser. Filter by vintage year.
              </p>
              <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                {(["all", 2020, 2021, 2022, 2023, 2024, 2025] as const).map(y => (
                  <Pill key={y} label={String(y)} active={mosaicYear === y} color={C.accent} onClick={() => setMosaicYear(y)} />
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {mosaicData.map((c) => (
                  <div key={c.ticker} className="mosaic-tile" title={`${c.company}\n${c.year} · $${c.ipoVal}B IPO\nReturn: ${p(c.ret)}\nNow: $${(c.currentCap ?? 0).toFixed(1)}B`} style={{
                    width: isMobile ? 50 : 58, height: isMobile ? 40 : 46,
                    borderRadius: 8, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: retHeat(c.ret), cursor: "default",
                  }}>
                    <div style={{ fontSize: isMobile ? 8 : 9, fontWeight: 800, color: retHeatText(c.ret), lineHeight: 1 }}>{c.ticker}</div>
                    <div style={{ fontSize: 8, color: retHeatText(c.ret), opacity: 0.85, marginTop: 2, lineHeight: 1 }}>{p(c.ret)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                {[
                  { label: ">+200%",       bg: "#059669" },
                  { label: "+100 to 200%", bg: "#10b981" },
                  { label: "0 to +100%",   bg: "#a7f3d0" },
                  { label: "-30 to 0%",    bg: "#fca5a5" },
                  { label: "-30 to -60%",  bg: "#f87171" },
                  { label: "<-60%",        bg: "#7f1d1d" },
                ].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg }} />
                    <span style={{ fontSize: 10, color: C.muted }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </Glass>
          </FadeIn>

          {/* ═══ 8. SECTOR INTELLIGENCE ══════════════════════════════════════════ */}
          <FadeIn delay={60}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Sector Analysis</SLabel>
              <STitle>Where You Played Mattered as Much as When</STitle>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
                <div>
                  <ChartTitle accent={C.teal}>Sector median return — sectors with 3+ IPOs</ChartTitle>
                  <ResponsiveContainer width="100%" height={isMobile ? 300 : 340}>
                    <BarChart data={SECTORS} layout="vertical" margin={{ top: 0, right: 60, bottom: 0, left: 124 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" horizontal={false} />
                      <XAxis type="number" tickFormatter={v => v+"%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="sector" tick={{ fill: C.desc, fontSize: 10 }} axisLine={false} tickLine={false} width={118} />
                      <ReferenceLine x={0} stroke="rgba(255,255,255,.2)" />
                      <Tooltip {...TT_STYLE} formatter={(v) => [v + "%", "Median Return"] as [string,string]} />
                      <Bar dataKey="medPct" radius={[0,6,6,0]} maxBarSize={18} animationDuration={700}>
                        {SECTORS.map((d, i) => <Cell key={i} fill={d.medPct >= 0 ? C.teal : C.red} opacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <ChartTitle accent={C.violet}>Sector win rate vs median return (bubble size = n)</ChartTitle>
                  <ResponsiveContainer width="100%" height={isMobile ? 300 : 340}>
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                      <XAxis dataKey="winPct" type="number" name="Win Rate" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v+"%"} label={{ value: "Win Rate", position: "insideBottom", offset: -10, fill: C.muted, fontSize: 10 }} />
                      <YAxis dataKey="medPct" type="number" name="Median Return" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v+"%"} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                      <ReferenceLine x={50} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                      <Tooltip {...TT_STYLE} content={({ payload }) => {
                        if (!payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                            <div style={{ fontWeight: 700, color: C.accent }}>{d.sector}</div>
                            <div style={{ color: C.desc }}>n={d.n} · Win: {d.winPct}%</div>
                            <div style={{ color: d.medPct >= 0 ? C.green : C.red }}>Median: {d.medPct >= 0 ? "+" : ""}{d.medPct}%</div>
                          </div>
                        );
                      }} />
                      <Scatter data={SECTORS.map(s => ({ ...s, r: Math.sqrt(s.n) * 6 }))}>
                        {SECTORS.map((d, i) => <Cell key={i} fill={d.medPct >= 0 ? C.green : C.red} opacity={0.75} />)}
                        <LabelList dataKey="sector" position="top" style={{ fontSize: 8, fill: C.muted }} />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <InsightCallout>Semiconductors (top-right quadrant: 100% win rate, +394% median) and AI/Data Infra stand alone. SaaS/Software — despite being the largest category (15 IPOs) — is stuck in the bottom-left with -10% median. The AI tailwind created a structural sector divergence.</InsightCallout>
            </Glass>
          </FadeIn>

          {/* ═══ 9. CAPITAL SCORECARD ════════════════════════════════════════════ */}
          <FadeIn delay={60}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Capital Impact</SLabel>
              <STitle>Dollars Created and Destroyed by Bucket</STitle>
              <p style={{ color: C.desc, fontSize: 13, marginBottom: 28 }}>
                Net market cap change since IPO, aggregated by valuation bucket ($B). Green bars = value created. Red bars = value destroyed. Gold line = net.
              </p>
              <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
                <ComposedChart data={CAPITAL_SCORE} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                  <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => "$" + v + "B"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                  <Tooltip {...TT_STYLE} content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: C.accent, marginBottom: 4 }}>{d.label}</div>
                        <div style={{ color: C.green }}>Created: +${d.created.toFixed(1)}B</div>
                        <div style={{ color: C.red }}>Destroyed: ${d.destroyed.toFixed(1)}B</div>
                        <div style={{ color: C.gold, fontWeight: 700, marginTop: 4 }}>Net: {d.net >= 0 ? "+" : ""}${d.net.toFixed(1)}B</div>
                      </div>
                    );
                  }} />
                  <Bar dataKey="created"   name="Created"   fill={C.green} opacity={0.75} radius={[4,4,0,0]} maxBarSize={44} animationDuration={700} />
                  <Bar dataKey="destroyed" name="Destroyed" fill={C.red}   opacity={0.75} radius={[4,4,0,0]} maxBarSize={44} animationDuration={700} />
                  <Line type="monotone" dataKey="net" name="Net" stroke={C.gold} strokeWidth={2.5} strokeDasharray="6 3" dot={{ fill: C.gold, r: 4 }} animationDuration={900} />
                </ComposedChart>
              </ResponsiveContainer>
              <InsightCallout>The $20–40B bucket shows the largest gross creation (PLTR compounded from $21.8B to $330B+). The $40B+ bucket shows massive destruction — RIVN and DiDi alone vaporized over $100B in investor capital. The $1–2B sweet spot quietly generates strong net value relative to capital raised.</InsightCallout>
            </Glass>
          </FadeIn>

          {/* ═══ 10. SENSITIVITY LAB ════════════════════════════════════════════════ */}
          <FadeIn delay={60}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Sensitivity Analysis</SLabel>
              <STitle>How Dependent Is the Story on a Few Outliers?</STitle>
              <p style={{ color: C.desc, fontSize: 13, marginBottom: 24, marginTop: 4 }}>
                The mean return is almost entirely driven by a handful of outliers. The median is robust. Select a scenario to see how the dataset shifts.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                {SENSITIVITY.map((s, i) => (
                  <Pill key={i} label={s.label} active={sensitIdx === i} color={s.color} onClick={() => setSensitIdx(i)} />
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 12, marginBottom: 28 }}>
                {[
                  { label: "Companies",     val: String(activeSens.n),                                              col: C.text  },
                  { label: "Win Rate",      val: activeSens.winRate + "%",                                          col: activeSens.winRate >= 40 ? C.green : C.orange },
                  { label: "Median Return", val: (activeSens.medRet >= 0 ? "+" : "") + activeSens.medRet + "%",    col: activeSens.medRet >= 0 ? C.green : C.red },
                  { label: "Mean Return",   val: (activeSens.meanRet >= 0 ? "+" : "") + activeSens.meanRet + "%",  col: activeSens.meanRet >= 0 ? C.accent : C.orange },
                ].map((k, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.03)", borderRadius: 14, padding: "18px 16px", textAlign: "center", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: k.col, letterSpacing: -0.5 }}>{k.val}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{k.label}</div>
                  </div>
                ))}
              </div>
              <ChartTitle accent={C.gold}>Median (bars) and mean (line) across all 6 scenarios</ChartTitle>
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
                <ComposedChart data={SENSITIVITY} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                  <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v + "%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                  <Tooltip {...TT_STYLE} formatter={(v) => [Number(v) + "%", ""] as [string,string]} />
                  <Bar dataKey="medRet" name="Median" fill={C.teal} opacity={0.8} radius={[5,5,0,0]} maxBarSize={44} animationDuration={600} />
                  <Line type="monotone" dataKey="meanRet" name="Mean" stroke={C.gold} strokeWidth={2.5} strokeDasharray="6 3" dot={{ fill: C.gold, r: 5 }} animationDuration={800} />
                </ComposedChart>
              </ResponsiveContainer>
              <InsightCallout>Removing PLTR barely moves the median (-14% → -16%) but cuts the mean from +96% to +30%. Removing the top 5 returns drops median to -20% — but it was never great. The mean is a lie. The median is the truth. The power law makes these two numbers diverge by 110 percentage points.</InsightCallout>
            </Glass>
          </FadeIn>

          {/* ═══ 11. IPO VS INDEX BENCHMARKS ══════════════════════════════════════ */}
          <FadeIn delay={40}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Benchmark Comparison</SLabel>
              <STitle>IPO vs Index Benchmarks</STitle>
              <p style={{ color: C.desc, fontSize: 13, marginBottom: 28, marginTop: 4 }}>
                Comparing each IPO&apos;s return to QQQ and SPY measured from the same IPO date to May 15, 2026. Current benchmark prices: SPY $740.53 · QQQ $710.75 · NASDAQ 26,346.
              </p>

              {/* A. Headline stat row */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16, marginBottom: 40 }}>
                {[
                  { val: "23%",  label: "of IPOs beat QQQ",  sub: "Only 16 out of 70 companies outperformed QQQ from their IPO date", col: C.red },
                  { val: "29%",  label: "of IPOs beat SPY",  sub: "Only 20 out of 70 companies outperformed SPY from their IPO date",  col: C.orange },
                  { val: (medAlphaQQQ >= 0 ? "+" : "") + medAlphaQQQ.toFixed(2) + "x", label: "median alpha vs QQQ", sub: "Median IPO underperformed QQQ by 1.28x — the index wins most of the time", col: medAlphaQQQ >= 0 ? C.green : C.red },
                ].map((k, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.03)", borderRadius: 16, padding: "24px 20px", textAlign: "center", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 38, fontWeight: 900, color: k.col, letterSpacing: -1, lineHeight: 1 }}>{k.val}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 8, marginBottom: 6 }}>{k.label}</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* B. Grouped bar chart — IPO Return vs QQQ vs SPY by Bucket */}
              <ChartTitle accent={C.accent}>IPO Return vs QQQ vs SPY by Valuation Bucket</ChartTitle>
              <p style={{ color: C.desc, fontSize: 12, marginBottom: 16, marginTop: -12 }}>
                Average return from IPO date to today vs what SPY and QQQ returned over the same holding period.
              </p>
              <ResponsiveContainer width="100%" height={isMobile ? 240 : 280}>
                <BarChart data={BENCH_CHART} margin={{ top: 10, right: 10, bottom: 0, left: 0 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                  <XAxis dataKey="bucket" tick={{ fill: C.muted, fontSize: isMobile ? 8 : 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v + "%"} tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                  <Tooltip
                    {...TT_STYLE}
                    content={({ payload, label }) => {
                      if (!payload?.length) return null;
                      return (
                        <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                          <div style={{ fontWeight: 700, color: C.accent, marginBottom: 6 }}>{label}</div>
                          {payload.map((p, i: number) => (
                            <div key={i} style={{ color: p.color as string, marginBottom: 2 }}>
                              {String(p.name)}: {(p.value as number) >= 0 ? "+" : ""}{p.value}%
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="ipoRetPct"  name="IPO Return" fill={C.accent}  opacity={0.85} radius={[4,4,0,0]} maxBarSize={28} animationDuration={700} />
                  <Bar dataKey="qqqRetPct"  name="QQQ Return" fill={C.orange}  opacity={0.85} radius={[4,4,0,0]} maxBarSize={28} animationDuration={800} />
                  <Bar dataKey="spyRetPct"  name="SPY Return" fill={C.green}   opacity={0.85} radius={[4,4,0,0]} maxBarSize={28} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 20, marginTop: 12, marginBottom: 36, flexWrap: "wrap" }}>
                {[{ col: C.accent, label: "IPO Return" }, { col: C.orange, label: "QQQ Return" }, { col: C.green, label: "SPY Return" }].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: l.col }} />
                    <span style={{ fontSize: 11, color: C.muted }}>{l.label}</span>
                  </div>
                ))}
              </div>

              {/* C. Alpha bar chart */}
              <ChartTitle accent={C.teal}>Mean Alpha vs QQQ by Valuation Bucket</ChartTitle>
              <p style={{ color: C.desc, fontSize: 12, marginBottom: 16, marginTop: -12 }}>
                Alpha = IPO return minus QQQ return over the same period. Positive = IPO outperformed the index.
              </p>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
                <BarChart data={BENCH_CHART} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                  <XAxis dataKey="bucket" tick={{ fill: C.muted, fontSize: isMobile ? 8 : 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v + "x"} tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                  <Tooltip
                    {...TT_STYLE}
                    formatter={(v) => [((v as number) >= 0 ? "+" : "") + (v as number).toFixed(3) + "x", "Mean Alpha vs QQQ"] as [string, string]}
                  />
                  <Bar dataKey="alphaQQQPct" name="Alpha vs QQQ" radius={[4,4,0,0]} maxBarSize={36} animationDuration={700}>
                    {BENCH_CHART.map((entry, index) => (
                      <Cell key={index} fill={entry.alphaQQQPct >= 0 ? C.green : C.red} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* D. Beat rate chart */}
              <ChartTitle accent={C.gold} >% of IPOs That Beat QQQ vs SPY</ChartTitle>
              <p style={{ color: C.desc, fontSize: 12, marginBottom: 16, marginTop: -12 }}>
                How often individual IPOs beat the benchmark from their IPO date to today. 50% line = breakeven.
              </p>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
                <BarChart data={BENCH_CHART} margin={{ top: 10, right: 10, bottom: 0, left: 0 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                  <XAxis dataKey="bucket" tick={{ fill: C.muted, fontSize: isMobile ? 8 : 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v + "%"} domain={[0, 100]} tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={50} stroke={C.gold} strokeDasharray="6 3" label={{ value: "50%", fill: C.gold, fontSize: 10, position: "insideTopRight" }} />
                  <Tooltip
                    {...TT_STYLE}
                    formatter={(v) => [(v as number) + "%", ""] as [string, string]}
                  />
                  <Bar dataKey="beatQQQPct100" name="Beat QQQ" fill={C.orange} opacity={0.85} radius={[4,4,0,0]} maxBarSize={28} animationDuration={700} />
                  <Bar dataKey="beatSPYPct100" name="Beat SPY" fill={C.teal}   opacity={0.85} radius={[4,4,0,0]} maxBarSize={28} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: 20, marginTop: 12, marginBottom: 36, flexWrap: "wrap" }}>
                {[{ col: C.orange, label: "Beat QQQ %" }, { col: C.teal, label: "Beat SPY %" }].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: l.col }} />
                    <span style={{ fontSize: 11, color: C.muted }}>{l.label}</span>
                  </div>
                ))}
              </div>

              {/* E. Per-company alpha table — top 10 + bottom 10 */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
                {[
                  { title: "Top 10 by Alpha vs QQQ", data: TOP_ALPHA, isTop: true },
                  { title: "Bottom 10 by Alpha vs QQQ", data: BOT_ALPHA, isTop: false },
                ].map(({ title, data, isTop }) => (
                  <div key={title}>
                    <ChartTitle accent={isTop ? C.green : C.red}>{title}</ChartTitle>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr>
                          {["Ticker", "Bucket", "Alpha vs QQQ", "Beat?"].map(h => (
                            <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: C.muted, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((c, i) => (
                          <tr key={c.ticker} style={{ borderBottom: i < data.length - 1 ? `1px solid rgba(255,255,255,.04)` : "none" }}>
                            <td style={{ padding: "8px 8px", fontWeight: 800, color: C.text }}>{c.ticker}</td>
                            <td style={{ padding: "8px 8px", color: C.muted, fontSize: 11 }}>{c.bucket}</td>
                            <td style={{ padding: "8px 8px", fontWeight: 700, color: c.alphaQQQ >= 0 ? C.green : C.red }}>
                              {c.alphaQQQ >= 0 ? "+" : ""}{c.alphaQQQ.toFixed(1)}x
                            </td>
                            <td style={{ padding: "8px 8px" }}>
                              <span style={{
                                display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                                background: c.beatQQQ ? "rgba(16,185,129,.15)" : "rgba(239,68,68,.15)",
                                color: c.beatQQQ ? C.green : C.red,
                                border: `1px solid ${c.beatQQQ ? "rgba(16,185,129,.3)" : "rgba(239,68,68,.3)"}`,
                              }}>{c.beatQQQ ? "YES" : "NO"}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              <InsightCallout>Only 23% of IPOs beat QQQ — you&apos;d have been better off buying the index in most cases. The $1–2B bucket is the exception: 50% beat rate and massive alpha driven by CRDO (+20.6x vs QQQ). The $10–20B and $40B+ buckets have the worst beat rates (17%) and deepest negative alpha, confirming the dead zone is real on a risk-adjusted basis too.</InsightCallout>
            </Glass>
          </FadeIn>

          {/* ═══ 12. KEY INSIGHTS ════════════════════════════════════════════════= */}
          <FadeIn delay={40}>
            <Glass style={{ padding: isMobile ? "20px 16px" : 36, marginBottom: 48 }}>
              <SLabel>Research Findings</SLabel>
              <STitle>12 Insights the Data Actually Supports</STitle>
              <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { n:1,  color: C.red,    title: "The $10–20B Dead Zone Is Structural, Not Cyclical",       body: "9 companies IPO'd at $10–20B valuations. Only 2 are positive today. Median return: -41%. This pattern holds across 2020 and 2021 cohorts — it persists across different interest rate environments. It's structural: priced too big to re-rate higher, too small to have real pricing power, with no margin for any execution miss." },
                  { n:2,  color: C.orange, title: "The PLTR Paradox: One Company Rewrites Everything",       body: "Palantir (+1415%) accounts for the majority of the dataset's positive mean return. Remove it: mean drops from +96% to +30%. The median barely moves. This is the power law: one company at $21.8B compounding to $330B makes all other analyses secondary." },
                  { n:3,  color: C.green,  title: "2022 Forced Discipline — and the Best Cohort Emerged",   body: "2022 had just 5 IPOs and 60% win rate with +88% median. When the market closed to mediocrity, only genuinely strong companies got through. TPG (+88%), CRDO (+2162%), ATAT (+948%). The IPO market as a filter works when it's closed, not open." },
                  { n:4,  color: C.red,    title: "2021 Was a Collective Delusion — and the Data Proves It", body: "27 companies IPO'd in 2021. 22 are negative today. Median: -47%. The cohort priced at peak ZIRP multiples (many 40–100× revenue) and has never recovered. Companies like BIRD (-99%), BRZE (-61%), SG (-85%) were great businesses at wrong prices." },
                  { n:5,  color: C.teal,   title: "Semiconductors: 100% Win Rate, No Exception",            body: "CRDO (+2162%), ARM (+196%), ATAT (+948%), ACMR (+230%). Every semiconductor IPO in the dataset is positive. The AI chip supercycle isn't selective — it's lifting every company in the compute stack, regardless of size or specific market." },
                  { n:6,  color: C.accent, title: "The $1–2B Sweet Spot Has the Best Risk-Adjusted Entry",  body: "60% win rate, +109% median return, 50% big win rate. These companies are small enough to have 5–10× upside but large enough to have real businesses. CRDO, KGS, LMND, ACMR — the compounders tend to start here." },
                  { n:7,  color: C.orange, title: "Marketplace Models Are Structurally Broken at IPO",      body: "Marketplace/Commerce: 38% win, -55% median. VRM (-99%), WISH (-99%), STUB (-88%), UDMY (-81%). The take-rate business model requires massive capital and scale to work — most never get there, and public market investors eventually re-price the risk." },
                  { n:8,  color: C.violet, title: "The Power Law Is Extreme: Top 10 Companies Drive Everything", body: "The rank-ordered return curve drops nearly vertically from rank 1 (CRDO, +2162%) to rank 10, then flattens. The top 10 companies produce more total value than the other 84 combined. This isn't venture fund math — it's public market IPO math." },
                  { n:9,  color: C.red,    title: "Scale Doesn't Protect Mega-IPOs",                        body: "$40B+ bucket: 29% win rate, -30% median. RIVN (-75%), DiDi (-99%), Venture Global (-69%). Being large doesn't mean having room to grow. ARM (+196%) is the outlier — the only mega-IPO that massively outperformed — driven by AI chip demand nobody priced in at IPO." },
                  { n:10, color: C.green,  title: "GoodRx Is the Perfect Dead Zone Case Study",             body: "GoodRx: profitable, dominant market position, real revenue, large TAM. IPO'd at $18.9B in 2020. Now worth $1B. -95%. The dead zone doesn't care about your fundamentals when the entry multiple is wrong. Textbook structural trap." },
                  { n:11, color: C.gold,   title: "2025 Is Already Printing Losses — Despite Selective Market", body: "2025 cohort: 27% win rate, -20% median. StubHub -88%, Gemini -89%, Via -60%. Even in a supposedly post-ZIRP market, companies are overpaying to go public. CRWV (+174%) is the exception. The market is pricing AI premium into everything." },
                  { n:12, color: C.teal,   title: "The AI Cycle Is Sector-Wide, Not Company-Specific",      body: "AI/Data Infra (PLTR, CRWV, C3.ai): 67% win rate, +174% median. Semiconductors: 100% win rate. The AI wave isn't selective between companies — it's creating multiple expansion across every company that touches inference, training, or chip supply. Pick the sector, not just the company." },
                ].map((ins, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 16, padding: "20px 0",
                    borderBottom: i < 11 ? `1px solid ${C.border}` : "none",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginTop: 2,
                      background: `${ins.color}18`, border: `1px solid ${ins.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 900, color: ins.color,
                    }}>{ins.n}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{ins.title}</div>
                      <div style={{ fontSize: 13, color: C.desc, lineHeight: 1.75 }}>{ins.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Glass>
          </FadeIn>

          {/* ═══ 12. THESIS ══════════════════════════════════════════════════════= */}
          <FadeIn delay={40}>
            <div style={{
              borderRadius: 28, padding: isMobile ? "36px 24px" : "52px 48px", marginBottom: 48, textAlign: "center",
              background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(56,189,248,.1), transparent), linear-gradient(180deg,rgba(14,30,55,.8) 0%,rgba(6,13,26,0) 100%)",
              border: `1px solid ${C.border}`,
            }}>
              <SLabel>The Thesis</SLabel>
              <h2 style={{
                fontSize: isMobile ? 26 : 36, fontWeight: 900, letterSpacing: -1, lineHeight: 1.15, marginBottom: 20, maxWidth: 720, margin: "0 auto 20px",
                background: `linear-gradient(135deg,#fff 0%,${C.accent} 60%,${C.teal} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Valuation at IPO is the variable that matters most
              </h2>
              <p style={{ color: C.desc, fontSize: isMobile ? 14 : 15, maxWidth: 680, margin: "0 auto 20px", lineHeight: 1.7 }}>
                Not the business quality. Not the sector. Not the market environment. The entry valuation — specifically whether you IPO in the $10–20B dead zone or the $1–5B sweet spot — is the single strongest predictor of long-term return in this dataset.
              </p>
              <p style={{ color: C.muted, fontSize: 13, maxWidth: 600, margin: "0 auto" }}>
                The best compounders (CRDO, PLTR, HOOD, RDDT, ALAB) all entered below $10B. Every single $10–20B IPO has underperformed. The data is unambiguous.
              </p>
            </div>
          </FadeIn>

          {/* ═══ FOOTER ════════════════════════════════════════════════════════════ */}
          <div style={{ textAlign: "center", padding: "24px 0 0", borderTop: `1px solid ${C.border}` }}>
            <p style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>Data: public filings + yfinance (May 2026) · Excludes SPACs, blank-check companies, warrants-only listings · Not investment advice</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
              <a href="https://x.com/Trace_Cohen" target="_blank" rel="noreferrer" style={{ color: C.accent, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>𝕏 @Trace_Cohen</a>
              <a href="mailto:t@nyvp.com" style={{ color: C.accent, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>t@nyvp.com</a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
