"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  CartesianGrid, ReferenceLine, ScatterChart, Scatter, ComposedChart,
  Line, Legend,
} from "recharts";
import { WIDE_BUCKETS, YEAR_STATS, COMPANIES, SECTOR_STATS } from "@/lib/ipoData";

// ─── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:     "#07111f",
  card:   "rgba(255,255,255,0.035)",
  card2:  "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.075)",
  borderHover: "rgba(56,189,248,0.35)",
  text:   "#f1f5f9",
  desc:   "#cbd5e1",
  muted:  "#64748b",
  accent: "#38bdf8",
  teal:   "#2dd4bf",
  green:  "#4ade80",
  orange: "#fb923c",
  red:    "#f87171",
  gold:   "#fbbf24",
  indigo: "#a78bfa",
};

// ─── Utilities ─────────────────────────────────────────────────────────────────
const pct = (n: number) => (n >= 0 ? "+" : "") + (n * 100).toFixed(0) + "%";
const winPct = (n: number) => Math.round(n * 100) + "%";
const retColor = (n: number) => n >= 1 ? C.green : n >= 0 ? C.accent : n > -0.5 ? C.orange : C.red;
function median(arr: number[]) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// ─── Derived / Static Data ─────────────────────────────────────────────────────
const allRets = COMPANIES.filter(c => c.ret !== null).map(c => c.ret as number);
const totalN  = COMPANIES.length;
const overallWin = Math.round(COMPANIES.filter(c => (c.ret ?? 0) >= 0).length / totalN * 100);
const overallMed = Math.round(median(allRets) * 100);

const sorted = [...COMPANIES].filter(c => c.ret !== null).sort((a,b) => (b.ret as number)-(a.ret as number));
const top5tickers  = sorted.slice(0,5).map(c => c.ticker);
const bot5tickers  = sorted.slice(-5).map(c => c.ticker);

const filterRets = (exclude: string[]) =>
  COMPANIES.filter(c => c.ret !== null && !exclude.includes(c.ticker)).map(c => c.ret as number);

const SENSITIVITY = [
  { label: "Full Dataset",     sub: "All 94 IPOs",              rets: allRets,                       color: C.accent },
  { label: "No PLTR",          sub: "Remove Palantir (+1415%)",  rets: filterRets(["PLTR"]),          color: C.teal  },
  { label: "No DIDI+RIVN",     sub: "Remove 2 biggest losers",  rets: filterRets(["DIDI","RIVN"]),   color: C.orange },
  { label: "No Top 5",         sub: "Remove top 5 by return",   rets: filterRets(top5tickers),       color: C.gold  },
  { label: "No Bottom 5",      sub: "Remove worst 5 by return", rets: filterRets(bot5tickers),       color: C.green },
  { label: "No Extremes",      sub: "Remove top & bottom 10",   rets: filterRets([...top5tickers,...bot5tickers]), color: C.indigo },
].map(s => ({
  ...s,
  n:      s.rets.length,
  medRet: Math.round(median(s.rets) * 100),
  meanRet: Math.round(mean(s.rets) * 100),
  winRate: Math.round(s.rets.filter(r => r >= 0).length / s.rets.length * 100),
}));

const RETURN_DIST = [
  { label: "< -80%",        min: -Infinity, max: -0.8,    color: "#ef4444" },
  { label: "-80 to -50%",   min: -0.8,      max: -0.5,    color: "#f97316" },
  { label: "-50 to -20%",   min: -0.5,      max: -0.2,    color: "#fb923c" },
  { label: "-20 to 0%",     min: -0.2,      max: 0,       color: "#fbbf24" },
  { label: "0 to +50%",     min: 0,         max: 0.5,     color: "#a3e635" },
  { label: "+50 to +100%",  min: 0.5,       max: 1,       color: "#4ade80" },
  { label: "+100 to +300%", min: 1,         max: 3,       color: "#2dd4bf" },
  { label: "> +300%",       min: 3,         max: Infinity, color: "#38bdf8" },
].map(b => ({
  ...b,
  count: COMPANIES.filter(c => c.ret !== null && (c.ret as number) >= b.min && (c.ret as number) < b.max).length,
}));

const SECTOR_CHART = SECTOR_STATS
  .filter(s => s.n >= 3)
  .sort((a, b) => b.medRet - a.medRet)
  .map(s => ({ ...s, medPct: Math.round(s.medRet * 100), winPct: Math.round(s.winRate * 100) }));

const YEAR_CHART = YEAR_STATS.map(y => ({
  ...y,
  label: String(y.year),
  winPct: Math.round(y.winRate * 100),
  medPct: Math.round(y.medRet * 100),
  meanPct: Math.round(y.meanRet * 100),
  color: y.winRate >= 0.5 ? C.green : y.winRate >= 0.35 ? C.gold : C.red,
}));

const LISTING_DATA = (() => {
  const types = ["Traditional IPO", "Direct listing", "ADR IPO"];
  return types.map(t => {
    const cos = COMPANIES.filter(c => c.listingType === t && c.ret !== null);
    if (!cos.length) return null;
    const rs = cos.map(c => c.ret as number);
    return {
      type: t === "Traditional IPO" ? "Traditional" : t === "Direct listing" ? "Direct Listing" : "ADR",
      n: cos.length,
      winPct: Math.round(cos.filter(c => (c.ret as number) >= 0).length / cos.length * 100),
      medPct: Math.round(median(rs) * 100),
    };
  }).filter(Boolean);
})() as { type: string; n: number; winPct: number; medPct: number }[];

const SCATTER_DATA = COMPANIES
  .filter(c => c.ret !== null)
  .map(c => ({ t: c.ticker, v: c.ipoVal, mc: c.currentCap, ret: c.ret as number, retCap: Math.min(Math.max(c.ret as number, -1), 10), sector: c.sector, year: c.year }));

const NOTABLE = [
  { ticker: "PLTR", name: "Palantir",       year: 2020, ret: "+1415%", val: "$21.8B", note: "Greatest outlier in dataset. AI defense → $330B.",  color: C.accent },
  { ticker: "CRDO", name: "Credo Tech",     year: 2022, ret: "+2162%", val: "$1.6B",  note: "Best return in dataset. 22x. Semiconductors win.",  color: C.green  },
  { ticker: "GDRX", name: "GoodRx",         year: 2020, ret: "−95%",   val: "$18.9B", note: "Dead zone proof. Profitable. Losing. $18.9B→$1B.", color: C.red    },
  { ticker: "RIVN", name: "Rivian",         year: 2021, ret: "−75%",   val: "$77B",   note: "Largest US IPO since Facebook. Still sinking.",     color: C.red    },
  { ticker: "ARM",  name: "ARM Holdings",   year: 2023, ret: "+196%",  val: "$54B",   note: "Only $40B+ mega-IPO to massively outperform.",      color: C.teal   },
  { ticker: "RDDT", name: "Reddit",         year: 2024, ret: "+393%",  val: "$6.4B",  note: "AI data licensing changed the calculus.",           color: C.teal   },
  { ticker: "HOOD", name: "Robinhood",      year: 2021, ret: "+781%",  val: "$8B",    note: "2021 disaster turned 8x winner. Crypto cycle.",     color: C.accent },
  { ticker: "CRWV", name: "CoreWeave",      year: 2025, ret: "+174%",  val: "$23B",   note: "Down on day 1. Up 174% in 2 months. AI infra.",     color: C.teal   },
];

const INSIGHTS = [
  { n:1,  title: "The PLTR Paradox",                  body: "Remove Palantir (+1415%) and the overall mean collapses from +96% to +30%. One company rewrites the dataset narrative. The median (-14%) barely moves — showing just how extreme this one outlier is." },
  { n:2,  title: "The $10–20B Dead Zone Is Structural", body: "9 companies IPO'd at $10–20B. Only 2 are positive. Median: -41%. This isn't bad luck — companies at this valuation are priced to perfection with zero tolerance for execution risk." },
  { n:3,  title: "2021: The Worst Vintage Since the Dot-Com Crash", body: "The median 2021 IPO has lost 47% of its value. Peak ZIRP, peak FOMO, peak multiples — companies that priced at 50-100× revenue are still paying the price 4+ years later." },
  { n:4,  title: "2022 Was the Best Vintage in the Dataset",  body: "5 companies that IPO'd in 2022 have an 88% median return. When the window nearly closes, only the genuinely strong fight through. Forced discipline created the best cohort." },
  { n:5,  title: "Semiconductors: 100% Win Rate",             body: "Every single semiconductor IPO in the dataset is positive. CRDO (+2162%), ATAT (+948%), ARM (+196%), ACMR (+230%). The AI chip supercycle created category-wide multiple expansion." },
  { n:6,  title: "The Power Law Is Violent",                  body: "The $0–10B bucket: 38% win rate, +96% mean return. The gap shows how extreme the winners are. CRDO at 22x isn't just a win — it obliterates the losses of 10 companies." },
  { n:7,  title: "Size Doesn't Buy Safety at IPO",            body: "$40B+ IPOs: 29% win rate, -30% median. DiDi -99%, Rivian -75%, Venture Global -69%. Mega-valuations at IPO amplify downside — there's nowhere to grow into." },
  { n:8,  title: "Direct Listings Price More Fairly",         body: "Direct listings (PLTR, COIN, RBLX, ASAN) structurally set prices without underwriter pressure or first-day pop games. Price discovery is more honest and the starting bar is set correctly." },
  { n:9,  title: "GoodRx: The Dead Zone in Real Time",        body: "GoodRx: profitable, dominant market share, real revenue. IPO'd $18.9B in 2020. Now $1B. -95%. The dead zone doesn't care about your fundamentals when the multiple is wrong." },
  { n:10, title: "AI Tailwind Is Sector-Defining",            body: "AI/Data Infra: 67% win rate, +174% median. Semiconductors: 100% win rate. The AI cycle is creating multiple expansion across every company in the compute stack." },
  { n:11, title: "Marketplace Models Underperform",           body: "Marketplaces: 38% win, -55% median. VRM -99%, WISH -99%, UDMY -81%, STUB -88%. Take-rate businesses require massive ongoing capital — markets eventually reprice this." },
  { n:12, title: "2025 Is Already Printing Losses",           body: "2025 cohort: 27% win rate, -20% median. StubHub -88%, Gemini -89%. High rates + high scrutiny = brutal environment. CRWV (+174%) is the exception that proves the rule." },
];

const RECORDS = [
  { emoji: "🚀", value: "+2,162%", label: "Best Return",          detail: "CRDO · Credo Technology · 2022 · $1.6B IPO" },
  { emoji: "💀", value: "−99%",    label: "Worst Return",         detail: "DIDI · DiDi Global · 2021 · $68B IPO" },
  { emoji: "🔥", value: "+1,415%", label: "Biggest Outlier",      detail: "PLTR · Palantir · 2020 · $21.8B direct listing" },
  { emoji: "📉", value: "$77B",    label: "Largest Mega-Flop",    detail: "RIVN · Rivian · 2021 · now worth $19B (−75%)" },
  { emoji: "🎯", value: "100%",    label: "Semis Win Rate",        detail: "CRDO · ARM · ATAT · ACMR — every chip IPO wins" },
  { emoji: "⚡", value: "22×",     label: "Best MOIC",             detail: "CRDO · $1.6B → $36B in 3 years" },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: C.accent, textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: C.text, marginBottom: 6 }}>
      {children}
    </h2>
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: C.accent, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{children}</span>
    </div>
  );
}

function InsightBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,rgba(56,189,248,0.07),rgba(45,212,191,0.05))",
      border: "1px solid rgba(56,189,248,0.2)", borderRadius: 12, padding: "14px 18px", marginTop: 16,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginRight: 8 }}>KEY INSIGHT</span>
      <span style={{ fontSize: 12, color: C.desc, lineHeight: 1.7 }}>{children}</span>
    </div>
  );
}

function GlassCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="card-hover" style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      ...style,
    }}>
      {children}
    </div>
  );
}

const TT = { contentStyle: { background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 11, color: C.text }, cursor: { fill: "rgba(255,255,255,0.04)" } };

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [chartTab,   setChartTab]   = useState<"volume"|"returns"|"dist"|"sector">("volume");
  const [sensitIdx,  setSensitIdx]  = useState(0);
  const [expanded,   setExpanded]   = useState<number|null>(null);
  const [cmpYear1,   setCmpYear1]   = useState(2021);
  const [cmpYear2,   setCmpYear2]   = useState(2023);
  useEffect(() => { document.body.style.opacity = "1"; }, []);

  const y1 = YEAR_STATS.find(y => y.year === cmpYear1)!;
  const y2 = YEAR_STATS.find(y => y.year === cmpYear2)!;

  const activeSens = SENSITIVITY[sensitIdx];

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes glow     { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        .card-hover { transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(56,189,248,.1); border-color: rgba(56,189,248,.3) !important; }
        .s1 { animation: fadeInUp .6s ease forwards; }
        .s2 { animation: fadeInUp .6s .1s ease both; }
        .s3 { animation: fadeInUp .6s .2s ease both; }
        .s4 { animation: fadeInUp .6s .3s ease both; }
        .tab-pill { transition: all .18s ease; cursor:pointer; border:none; }
        .tab-pill:hover { background:rgba(56,189,248,.12) !important; }
        .insight-row { transition: border-color .18s, background .18s; }
        .insight-row:hover { background:rgba(56,189,248,.04) !important; border-color:rgba(56,189,248,.2) !important; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#0a1626; } ::-webkit-scrollbar-thumb { background:#334155; border-radius:3px; }
      `}</style>

      <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "-apple-system,'SF Pro Display',BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 20px 80px" }}>

          {/* ── HEADER ─────────────────────────────────────────────────────────── */}
          <div className="s1" style={{
            textAlign: "center", padding: "60px 32px 52px", marginBottom: 52,
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(56,189,248,.1) 0%, transparent 70%), linear-gradient(180deg,rgba(14,30,55,.85) 0%,transparent 100%)",
            borderRadius: 28, border: `1px solid ${C.border}`, position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: 28, pointerEvents: "none",
              background: "radial-gradient(ellipse 50% 1px at 50% 0%, rgba(56,189,248,.5) 0%, transparent 100%)",
            }} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: C.accent, textTransform: "uppercase", marginBottom: 20 }}>
              2020 – 2025 · 94 US IPOs · Verified May 2026
            </div>
            <h1 style={{
              fontSize: 58, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginBottom: 20,
              background: `linear-gradient(140deg, #fff 0%, ${C.accent} 55%, ${C.teal} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              IPO Valuation<br />Intelligence
            </h1>
            <p style={{ color: C.desc, fontSize: 16, maxWidth: 580, margin: "0 auto 10px", lineHeight: 1.6 }}>
              The valuation dead zone, power-law winners, sector timing, and what 94 IPOs reveal about when and at what price to go public.
            </p>
            <p style={{ color: C.muted, fontSize: 12 }}>
              Excludes SPACs · blank-check companies · warrants-only listings
            </p>
          </div>

          {/* ── KPI STRIP ──────────────────────────────────────────────────────── */}
          <div className="s2" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 52 }}>
            {[
              { val: "94",            label: "Total IPOs",       sub: "2020–2025",               col: C.accent },
              { val: `${overallWin}%`, label: "Win Rate",        sub: "above IPO valuation",      col: C.green  },
              { val: `${overallMed}%`, label: "Median Return",   sub: "honest measure",           col: overallMed >= 0 ? C.green : C.orange },
              { val: "19%",           label: "2021 Win Rate",    sub: "worst vintage",            col: C.red    },
              { val: "100%",          label: "Semis Win Rate",   sub: "CRDO, ARM, ATAT, ACMR",   col: C.teal   },
              { val: "+2162%",        label: "Best Return",      sub: "CRDO · $1.6B IPO (2022)", col: C.accent },
            ].map((k, i) => (
              <GlassCard key={i} style={{ padding: "22px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: k.col, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: 12, color: C.text, fontWeight: 600, marginTop: 8 }}>{k.label}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>{k.sub}</div>
              </GlassCard>
            ))}
          </div>

          {/* ── CHART HUB ──────────────────────────────────────────────────────── */}
          <div className="s3" style={{ marginBottom: 52 }}>
            <GlassCard style={{ padding: 32 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
                {(["volume","returns","dist","sector"] as const).map(id => {
                  const labels: Record<string,string> = { volume: "Volume & Win Rate", returns: "Year Returns", dist: "Return Distribution", sector: "Sector Performance" };
                  const active = chartTab === id;
                  return (
                    <button key={id} className="tab-pill" onClick={() => setChartTab(id)} style={{
                      padding: "9px 20px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                      background: active ? C.accent : "rgba(255,255,255,.05)",
                      color:  active ? "#07111f" : C.desc,
                      border: active ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
                    }}>{labels[id]}</button>
                  );
                })}
              </div>

              {/* Tab: Volume & Win Rate */}
              {chartTab === "volume" && (
                <>
                  <ChartTitle>IPO Count & Win Rate by Vintage Year</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={YEAR_CHART} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                      <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" domain={[0,100]} tickFormatter={v => v+"%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TT} formatter={(v, name) => { const n = String(name); const lbl = n === "n" ? "Count" : n === "winPct" ? "Win Rate" : n; return [n === "n" ? String(v) : Number(v) + "%", lbl] as [string,string]; }} />
                      <Bar yAxisId="left" dataKey="n" name="n" radius={[6,6,0,0]} maxBarSize={48}>
                        {YEAR_CHART.map((d, i) => <Cell key={i} fill={d.color} opacity={0.85} />)}
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="winPct" name="winPct" stroke={C.accent} strokeWidth={2.5} dot={{ fill: C.accent, r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <InsightBox>2021 had the most IPOs (27) but the worst win rate (19%). 2022 had just 5 IPOs — only the strongest could get through — and they delivered an 88% median return. The IPO market&apos;s discipline is the best filter.</InsightBox>
                </>
              )}

              {/* Tab: Year Returns */}
              {chartTab === "returns" && (
                <>
                  <ChartTitle>Median vs Mean Return by Vintage Year (%)</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={YEAR_CHART} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                      <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => v+"%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TT} formatter={(v) => [Number(v) + "%", ""] as [string,string]} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                      <Bar dataKey="medPct" name="Median Return" radius={[5,5,0,0]} maxBarSize={36} fill={C.teal} opacity={0.9} />
                      <Line type="monotone" dataKey="meanPct" name="Mean Return" stroke={C.gold} strokeWidth={2.5} strokeDasharray="6 3" dot={{ fill: C.gold, r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 12 }} />
                  <InsightBox>The gap between mean (gold line) and median (teal bars) reveals the power law. In 2022, the mean (+637%) dwarfs the median (+88%) because CRDO returned 22×. In 2021, mean and median are both negative — no outliers saved the vintage.</InsightBox>
                </>
              )}

              {/* Tab: Return Distribution */}
              {chartTab === "dist" && (
                <>
                  <ChartTitle>Return Distribution — How 94 IPOs Are Spread Across Outcomes</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={RETURN_DIST} margin={{ top: 10, right: 10, bottom: 40, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                      <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 10, angle: -30, textAnchor: "end" }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TT} formatter={(v) => [String(v), "Companies"] as [string,string]} />
                      <Bar dataKey="count" radius={[6,6,0,0]} maxBarSize={58}>
                        {RETURN_DIST.map((d, i) => <Cell key={i} fill={d.color} opacity={0.9} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <InsightBox>The distribution is right-skewed and bimodal: a cluster of losers on the left (many in -80 to -50% range) and a long tail of outlier winners on the right (&gt;+300%). This classic power-law shape is why median ≠ mean, and why stock-picking matters more than diversification in IPOs.</InsightBox>
                </>
              )}

              {/* Tab: Sector Performance */}
              {chartTab === "sector" && (
                <>
                  <ChartTitle>Sector Median Return — Sectors with 3+ IPOs</ChartTitle>
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={SECTOR_CHART} layout="vertical" margin={{ top: 0, right: 60, bottom: 0, left: 130 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" horizontal={false} />
                      <XAxis type="number" tickFormatter={v => v+"%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="sector" tick={{ fill: C.desc, fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                      <ReferenceLine x={0} stroke="rgba(255,255,255,.2)" />
                      <Tooltip {...TT} formatter={(v) => [Number(v) + "%", "Median Return"] as [string,string]} />
                      <Bar dataKey="medPct" radius={[0,6,6,0]} maxBarSize={20}>
                        {SECTOR_CHART.map((d, i) => <Cell key={i} fill={d.medPct >= 0 ? C.teal : C.red} opacity={0.9} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <InsightBox>Semiconductors and AI/Data Infra dominate. SaaS/Software, despite being the largest category, has a -10% median — peak 2021 multiples wiped out most of the cohort. Marketplace models are the worst sector (-55% median): take-rate businesses proved far more capital-intensive than investors priced in.</InsightBox>
                </>
              )}
            </GlassCard>
          </div>

          {/* ── SCATTER: VALUATION vs RETURN ───────────────────────────────────── */}
          <div className="s4" style={{ marginBottom: 52 }}>
            <GlassCard style={{ padding: 32 }}>
              <SectionLabel>Scatter Analysis</SectionLabel>
              <SectionTitle>IPO Valuation vs Total Return</SectionTitle>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, marginTop: 4 }}>
                Each dot is one company. X = IPO valuation ($B), Y = total return (capped at 10× for readability). PLTR and CRDO extend far above the visible range.
              </p>
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                  <XAxis dataKey="v" name="IPO Val ($B)" type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => "$"+v+"B"} />
                  <YAxis dataKey="retCap" name="Return" type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => pct(v)} domain={[-1.1, 11]} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                  <Tooltip
                    {...TT}
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
                          <div style={{ fontWeight: 700, color: C.accent }}>{d.t}</div>
                          <div style={{ color: C.desc }}>IPO: ${d.v}B → ${d.mc.toFixed(1)}B</div>
                          <div style={{ color: retColor(d.ret) }}>Return: {pct(d.ret)}</div>
                          <div style={{ color: C.muted }}>{d.sector} · {d.year}</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={SCATTER_DATA} name="IPOs">
                    {SCATTER_DATA.map((d, i) => (
                      <Cell key={i} fill={retColor(d.ret)} opacity={0.75} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <InsightBox>No clear correlation between IPO valuation and return — but there is a band of destruction at $10–20B (all red) and a cluster of winners at &lt;$5B. The most striking pattern: the $20–40B bucket is bimodal — either PLTR-level outliers or total wipeouts. Nothing in between.</InsightBox>
            </GlassCard>
          </div>

          {/* ── SENSITIVITY ANALYSIS ───────────────────────────────────────────── */}
          <div style={{ marginBottom: 52 }}>
            <GlassCard style={{ padding: 32 }}>
              <SectionLabel>Sensitivity Analysis</SectionLabel>
              <SectionTitle>What Happens When You Remove Outliers?</SectionTitle>
              <p style={{ color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 24 }}>
                How dependent are the results on a handful of extreme winners and losers? Select a scenario to see how the dataset shifts.
              </p>

              {/* Scenario pills */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                {SENSITIVITY.map((s, i) => (
                  <button key={i} className="tab-pill" onClick={() => setSensitIdx(i)} style={{
                    padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: sensitIdx === i ? s.color : "rgba(255,255,255,.05)",
                    color: sensitIdx === i ? "#07111f" : C.desc,
                    border: sensitIdx === i ? `1px solid ${s.color}` : `1px solid ${C.border}`,
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Active stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
                {[
                  { label: "Companies", val: activeSens.n },
                  { label: "Win Rate",  val: activeSens.winRate + "%", col: activeSens.winRate >= 40 ? C.green : C.orange },
                  { label: "Median Return", val: (activeSens.medRet >= 0 ? "+" : "") + activeSens.medRet + "%", col: activeSens.medRet >= 0 ? C.green : C.red },
                  { label: "Mean Return",   val: (activeSens.meanRet >= 0 ? "+" : "") + activeSens.meanRet + "%", col: activeSens.meanRet >= 0 ? C.accent : C.orange },
                ].map((k, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.03)", borderRadius: 12, padding: "18px 16px", textAlign: "center", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: k.col ?? C.text, fontVariantNumeric: "tabular-nums" }}>{k.val}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{k.label}</div>
                  </div>
                ))}
              </div>

              {/* Comparison bar chart */}
              <ChartTitle>Median vs Mean Return Across All Scenarios</ChartTitle>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={SENSITIVITY} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                  <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v+"%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.25)" strokeDasharray="4 4" />
                  <Tooltip {...TT} formatter={(v) => [Number(v) + "%", ""] as [string,string]} />
                  <Bar dataKey="medRet" name="Median Return" fill={C.teal} opacity={0.85} radius={[5,5,0,0]} maxBarSize={40} />
                  <Line type="monotone" dataKey="meanRet" name="Mean Return" stroke={C.gold} strokeWidth={2.5} dot={{ fill: C.gold, r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
              <InsightBox>Removing PLTR barely moves the median (-14% → -16%) but crashes the mean (+96% → +30%). Removing the top 5 winners leaves a -20% median. Removing the bottom 5 losers pushes median to +3%. The dataset is far more sensitive to winners than losers — confirming the power-law asymmetry.</InsightBox>
            </GlassCard>
          </div>

          {/* ── VALUATION BUCKETS ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 52 }}>
            <GlassCard style={{ padding: 32 }}>
              <SectionLabel>Bucket Analysis</SectionLabel>
              <SectionTitle>Valuation Bucket Risk Profile</SectionTitle>
              <p style={{ color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 28 }}>
                Wide valuation brackets vs outcome. Each bucket&apos;s full story, with examples.
              </p>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={WIDE_BUCKETS.map(b => ({
                  ...b, winPct: Math.round(b.winRate * 100), medPct: Math.round(b.medRet * 100),
                }))} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                  <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v+"%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                  <Tooltip {...TT} formatter={(v) => [Number(v) + "%", ""] as [string,string]} />
                  <Bar dataKey="winPct" name="Win Rate" fill={C.accent} opacity={0.8} radius={[4,4,0,0]} maxBarSize={50} />
                  <Bar dataKey="medPct" name="Median Return" fill={C.teal} opacity={0.7} radius={[4,4,0,0]} maxBarSize={50} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 8 }} />
                </BarChart>
              </ResponsiveContainer>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginTop: 24 }}>
                {WIDE_BUCKETS.map((b, i) => (
                  <div key={i} className="card-hover insight-row" style={{
                    borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px",
                    background: "rgba(255,255,255,.02)", cursor: "pointer",
                  }} onClick={() => setExpanded(expanded === i ? null : i)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: b.color }}>{b.label}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{b.n} companies</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: b.winRate >= 0.5 ? C.green : b.winRate >= 0.3 ? C.gold : C.red }}>
                          {Math.round(b.winRate * 100)}% win
                        </div>
                        <div style={{ fontSize: 12, color: retColor(b.medRet) }}>{pct(b.medRet)} median</div>
                      </div>
                    </div>
                    {expanded === i && (
                      <>
                        <p style={{ fontSize: 12, color: C.desc, marginTop: 12, lineHeight: 1.7 }}>{b.note}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                          {b.examples.map((e) => (
                            <span key={e.t} style={{
                              fontSize: 11, padding: "4px 10px", borderRadius: 8, fontWeight: 600,
                              background: `${retColor(e.ret)}18`, color: retColor(e.ret),
                              border: `1px solid ${retColor(e.ret)}35`,
                            }}>
                              {e.t} {pct(e.ret)}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ── LISTING TYPE + YEAR COMPARISON ─────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 52 }}>
            {/* Listing Type */}
            <GlassCard style={{ padding: 28 }}>
              <SectionLabel>Structure Matters</SectionLabel>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, color: C.text, marginBottom: 6 }}>IPO Type vs Performance</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={LISTING_DATA} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                  <XAxis dataKey="type" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => v+"%"} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.2)" strokeDasharray="4 4" />
                  <Tooltip {...TT} formatter={(v) => [Number(v) + "%", ""] as [string,string]} />
                  <Bar dataKey="winPct" name="Win Rate" fill={C.accent} opacity={0.8} radius={[5,5,0,0]} maxBarSize={40} />
                  <Bar dataKey="medPct" name="Median Return" fill={C.teal} opacity={0.7} radius={[5,5,0,0]} maxBarSize={40} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 6 }} />
                </BarChart>
              </ResponsiveContainer>
              <InsightBox>Direct listings show stronger median performance — without underwriter first-day pop pressure, prices are set more fairly from day one.</InsightBox>
            </GlassCard>

            {/* Year Comparison */}
            <GlassCard style={{ padding: 28 }}>
              <SectionLabel>Vintage Comparison</SectionLabel>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, color: C.text, marginBottom: 6 }}>Head-to-Head: Two Vintages</h3>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, marginTop: 8 }}>
                {[setCmpYear1, setCmpYear2].map((setter, i) => (
                  <select key={i} value={i === 0 ? cmpYear1 : cmpYear2} onChange={e => setter(Number(e.target.value))} style={{
                    flex: 1, background: "rgba(255,255,255,.06)", border: `1px solid ${C.border}`, borderRadius: 10,
                    color: C.text, padding: "9px 12px", fontSize: 13, cursor: "pointer", outline: "none",
                  }}>
                    {YEAR_STATS.map(y => <option key={y.year} value={y.year}>{y.year}</option>)}
                  </select>
                ))}
              </div>
              {[
                { label: "Companies",     v1: y1.n,                                      v2: y2.n,                                      fmt: (v: number) => String(v),     better: "higher" as const },
                { label: "Win Rate",      v1: y1.winRate,                                v2: y2.winRate,                                fmt: (v: number) => winPct(v),     better: "higher" as const },
                { label: "Median Return", v1: y1.medRet,                                 v2: y2.medRet,                                 fmt: (v: number) => pct(v),        better: "higher" as const },
                { label: "Mean Return",   v1: y1.meanRet,                                v2: y2.meanRet,                                fmt: (v: number) => pct(v),        better: "higher" as const },
                { label: "Big Winners",   v1: y1.bigWin,                                 v2: y2.bigWin,                                 fmt: (v: number) => winPct(v),     better: "higher" as const },
                { label: "Big Losers",    v1: y1.bigLoss,                                v2: y2.bigLoss,                                fmt: (v: number) => winPct(v),     better: "lower"  as const },
              ].map((row, i) => {
                const w1 = row.better === "higher" ? row.v1 > row.v2 : row.v1 < row.v2;
                const w2 = row.better === "higher" ? row.v2 > row.v1 : row.v2 < row.v1;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 5 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, width: 90, textTransform: "uppercase", letterSpacing: 0.5 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: w1 ? C.green : w2 ? C.red : C.muted, minWidth: 70, textAlign: "center" }}>{row.fmt(row.v1)}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>vs</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: w2 ? C.green : w1 ? C.red : C.muted, minWidth: 70, textAlign: "center" }}>{row.fmt(row.v2)}</span>
                  </div>
                );
              })}
            </GlassCard>
          </div>

          {/* ── NOTABLE IPOs ────────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 52 }}>
            <GlassCard style={{ padding: 32 }}>
              <SectionLabel>Hall of Fame & Shame</SectionLabel>
              <SectionTitle>8 IPOs That Define the Era</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginTop: 24 }}>
                {NOTABLE.map((n, i) => (
                  <div key={i} className="card-hover" style={{
                    borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px",
                    background: "rgba(255,255,255,.025)", display: "flex", gap: 14, alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                      background: `${n.color}18`, border: `1px solid ${n.color}30`, flexShrink: 0,
                      fontSize: 13, fontWeight: 800, color: n.color,
                    }}>{n.ticker}</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{n.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: n.color }}>{n.ret}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>{n.val} · {n.year}</span>
                      </div>
                      <p style={{ fontSize: 12, color: C.desc, marginTop: 4, lineHeight: 1.6 }}>{n.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ── RECORDS ─────────────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 52 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <SectionLabel>Records</SectionLabel>
              <SectionTitle>Extremes & Milestones</SectionTitle>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {RECORDS.map((r, i) => (
                <GlassCard key={i} style={{ padding: "28px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{r.emoji}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.accent, letterSpacing: -0.5 }}>{r.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 6 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>{r.detail}</div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* ── INSIGHTS ────────────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 52 }}>
            <GlassCard style={{ padding: 32 }}>
              <SectionLabel>Research Findings</SectionLabel>
              <SectionTitle>12 Freakonomics-Style Insights</SectionTitle>
              <p style={{ color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 28 }}>
                What 94 IPOs across 6 years actually reveal — beyond the headlines.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {INSIGHTS.map((ins, i) => (
                  <div key={i} className="card-hover insight-row" style={{
                    borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px",
                    background: "rgba(255,255,255,.02)", display: "flex", gap: 14,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: `${C.accent}18`, border: `1px solid ${C.accent}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: C.accent, flexShrink: 0, marginTop: 1,
                    }}>{ins.n}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{ins.title}</div>
                      <div style={{ fontSize: 12, color: C.desc, lineHeight: 1.7 }}>{ins.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* ── THESIS ──────────────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 52 }}>
            <div style={{
              borderRadius: 24, padding: "40px 40px",
              background: "linear-gradient(135deg,rgba(56,189,248,.07) 0%,rgba(45,212,191,.05) 50%,rgba(167,139,250,.05) 100%)",
              border: "1px solid rgba(56,189,248,.15)", textAlign: "center",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: C.accent, textTransform: "uppercase", marginBottom: 16 }}>The Thesis</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, color: C.text, marginBottom: 16, maxWidth: 700, margin: "0 auto 16px" }}>
                The IPO valuation dead zone is real, structural, and predictable
              </h2>
              <p style={{ color: C.desc, fontSize: 15, maxWidth: 680, margin: "0 auto 16px", lineHeight: 1.7 }}>
                Companies that IPO between $10B–$20B face a structural trap: too big to be overlooked, too small to have pricing power, priced to perfection with no margin for error. The data shows this across every market cycle in the dataset.
              </p>
              <p style={{ color: C.muted, fontSize: 13, maxWidth: 640, margin: "0 auto" }}>
                The best returns cluster at &lt;$5B (power-law small caps) and the rare $20–40B outlier that compounds into a category-defining company. Everything in between is a valuation compression waiting to happen.
              </p>
            </div>
          </div>

          {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
          <div style={{ textAlign: "center", padding: "32px 0 0", borderTop: `1px solid ${C.border}` }}>
            <p style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>
              Data sourced from public filings, yfinance (May 2026). Excludes SPACs, blank-check companies, and warrants-only listings.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
              <a href="https://x.com/Trace_Cohen" target="_blank" rel="noreferrer" style={{ color: C.accent, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>𝕏 @Trace_Cohen</a>
              <a href="mailto:t@nyvp.com" style={{ color: C.accent, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>t@nyvp.com</a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
