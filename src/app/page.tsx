"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid, ReferenceLine, ScatterChart, Scatter, Line, Legend,
} from "recharts";
import { WIDE_BUCKETS, YEAR_STATS, COMPANIES } from "@/lib/ipoData";

// ─── Palette (matches ValueAddVC reference) ───────────────────────────────────
const C = {
  bg:      "#0f172a",
  card:    "#1e293b",
  card2:   "rgba(15,23,42,0.6)",
  border:  "#334155",
  text:    "#f1f5f9",
  desc:    "#cbd5e1",
  muted:   "#94a3b8",
  accent:  "#38bdf8",   // sky blue
  teal:    "#14b8a6",
  green:   "#22c55e",
  orange:  "#f97316",
  red:     "#ef4444",
  gold:    "#eab308",
};

const fmt    = (n: number) => (n * 100).toFixed(0) + "%";
const fmtRet = (n: number) => (n >= 0 ? "+" : "") + (n * 100).toFixed(0) + "%";
const retColor = (n: number) => n >= 1 ? C.green : n >= 0 ? C.accent : n > -0.5 ? C.orange : C.red;

// ─── Static data ──────────────────────────────────────────────────────────────
const NOTABLE_IPOS = [
  { date: "Dec 2020", ticker: "ABNB", name: "Airbnb",        firstDay: "+113%", ipoVal: "$47.3B", note: "Pandemic IPO that doubled overnight. Proved tech demand survived COVID.", stat2: "$3.5B raised" },
  { date: "Dec 2020", ticker: "DASH", name: "DoorDash",      firstDay: "+86%",  ipoVal: "$32.4B", note: "Food delivery king. Priced at $102, first-day close $189. +120% since.", stat2: "$3.4B raised" },
  { date: "Sep 2020", ticker: "SNOW", name: "Snowflake",      firstDay: "+112%", ipoVal: "$33.2B", note: "Largest software IPO ever at the time. Buffett bought in at IPO. +59% since.", stat2: "$3.4B raised" },
  { date: "Sep 2020", ticker: "PLTR", name: "Palantir",       firstDay: "+38%",  ipoVal: "$21.8B", note: "Direct listing — no underwriters. AI defense analytics. +1415% since.", stat2: "Direct listing" },
  { date: "Sep 2020", ticker: "GDRX", name: "GoodRx",         firstDay: "+51%",  ipoVal: "$18.9B", note: "The dead zone in action. $18.9B IPO → $1B today. -95% value destruction.", stat2: "$1.1B raised" },
  { date: "Nov 2021", ticker: "RIVN", name: "Rivian",         firstDay: "+29%",  ipoVal: "$77.0B", note: "Largest US IPO since Facebook. Peaked at $175B. Now -75% from IPO val.", stat2: "$13.7B raised" },
  { date: "Sep 2023", ticker: "ARM",  name: "ARM Holdings",   firstDay: "+25%",  ipoVal: "$54.0B", note: "The only $40B+ IPO to massively outperform. +196% on AI chip demand.", stat2: "$4.9B raised" },
  { date: "Mar 2024", ticker: "RDDT", name: "Reddit",         firstDay: "+48%",  ipoVal: "$6.4B",  note: "Social media's biggest IPO in years. AI data licensing strategy paying off. +393%.", stat2: "$748M raised" },
  { date: "Mar 2025", ticker: "CRWV", name: "CoreWeave",      firstDay: "-4%",   ipoVal: "$23.0B", note: "Down on day 1 — then +174% in 2 months. AI infrastructure demand is real.", stat2: "$1.5B raised" },
];

const RECORDS = [
  { emoji: "🚀", value: "+2,162%", label: "Best Return", detail: "CRDO — Credo Technology, $1.6B IPO (2022)" },
  { emoji: "💀", value: "-99%",    label: "Worst Return", detail: "DIDI — DiDi Global, $68B IPO (2021)" },
  { emoji: "🔥", value: "+1,415%", label: "Biggest Outlier", detail: "PLTR — Palantir, $21.8B direct listing (2020)" },
  { emoji: "📉", value: "$77B",    label: "Largest Mega-Flop at IPO", detail: "RIVN — Rivian, now worth $19B (-75%)" },
  { emoji: "🎯", value: "19%",     label: "2021 Win Rate", detail: "Worst vintage — only 1 in 5 companies positive" },
  { emoji: "💡", value: "60%",     label: "2022–24 Win Rate", detail: "Best back-to-back vintages in dataset" },
];

const FUN_FACTS = [
  { n: 1,  title: "The PLTR Paradox",          body: "Palantir's $21.8B direct listing is worth $330B today — a +1415% return. Remove it from the $20–40B bucket and the median collapses from +59% to deeply negative. One company rewrites the story." },
  { n: 2,  title: "The $10–20B Graveyard",     body: "Not one company that IPO'd between $10B–$20B has ever doubled since IPO in our dataset. The dead zone isn't a theory — it's 9 companies, 0 doubles, 33% wiped out 50%+." },
  { n: 3,  title: "2021: The Worst Vintage",   body: "The median 2021 IPO has lost 47% of its value. Companies that IPO'd at peak valuations during zero-rate euphoria are still paying the price 4+ years later." },
  { n: 4,  title: "GoodRx: Dead Zone Proof",   body: "GoodRx IPO'd at $18.9B in Sep 2020 — a textbook dead zone entry. It's now worth $1B. 95% value destruction from a profitable, growing healthcare company." },
  { n: 5,  title: "The 2022 Comeback",         body: "The 5 companies that IPO'd in 2022 have an 88% median return — the best vintage in the dataset. The IPO market forced discipline: only the best companies went public." },
  { n: 6,  title: "ARM: The Exception",        body: "ARM is the only $40B+ IPO in the dataset with positive returns. It's +196% from a $54B valuation. Every other mega-IPO — RIVN, DiDi, Venture Global — is deeply underwater." },
  { n: 7,  title: "Sub-$10B Power Law",        body: "The $0–10B bucket has a 38% win rate but a mean return of +96%. That gap — 38% winners, +96% mean — is the power law in action. The winners don't just win; they obliterate." },
  { n: 8,  title: "CRDO: The 22x",             body: "Credo Technology IPO'd at $1.6B in 2022. It's now worth $36B — a 22x return. It's the best-performing IPO in the dataset. It makes semiconductors the best-performing sector." },
];

// ─── Derived stats ─────────────────────────────────────────────────────────
const totalN      = COMPANIES.length;
const winners     = COMPANIES.filter(c => (c.ret ?? 0) >= 0).length;
const overallWin  = Math.round((winners / totalN) * 100);
const scatterAll  = COMPANIES
  .filter(c => c.ret !== null)
  .map(c => ({ ...c, t: c.ticker, v: c.ipoVal, mc: c.currentCap, retCap: Math.min(Math.max(c.ret as number, -1), 15) }));

const BUCKET_COLORS: Record<string, string> = {
  "$0-10B": C.green, "$10-20B": C.red, "$20-40B": C.teal, "$40B+": C.gold,
};

// ─── Reusable components ───────────────────────────────────────────────────
function ChartTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <div style={{ width: 4, height: 22, borderRadius: 2, background: C.accent, flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{children}</span>
    </div>
  );
}

function InsightBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,rgba(56,189,248,0.08),rgba(20,184,166,0.08))",
      border: `1px solid rgba(56,189,248,0.25)`, borderRadius: 10, padding: "12px 16px", marginTop: 14,
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 6 }}>💡 Key Insight</div>
      <div style={{ fontSize: 12, color: C.desc, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

const TT_STYLE = { background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text };

export default function App() {
  const [chartTab, setChartTab]     = useState<"volume"|"winrate"|"scatter"|"buckets">("volume");
  const [expanded, setExpanded]     = useState<number|null>(null);
  const [cmpYear1, setCmpYear1]     = useState(2021);
  const [cmpYear2, setCmpYear2]     = useState(2023);

  const y1 = YEAR_STATS.find(y => y.year === cmpYear1)!;
  const y2 = YEAR_STATS.find(y => y.year === cmpYear2)!;

  const bucketChartData = WIDE_BUCKETS.map(b => ({
    label: b.label, winRate: b.winRate, medRet: b.medRet, meanRet: b.meanRet,
    bigWin: b.bigWin, bigLoss: b.bigLoss, n: b.n,
    color: BUCKET_COLORS[b.label] ?? C.accent,
  }));

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", padding: "24px 20px", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div style={{
          textAlign: "center", marginBottom: 40, padding: "36px 30px",
          background: "linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%)",
          borderRadius: 20, border: `1px solid ${C.border}`,
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: C.accent, marginBottom: 10, letterSpacing: -0.5 }}>
            IPO Valuation Dashboard
          </h1>
          <p style={{ color: C.desc, fontSize: 15, marginBottom: 6 }}>
            94 US IPOs · 2020–2025 · The Valuation Dead Zone Exposed
          </p>
          <p style={{ color: C.muted, fontSize: 12 }}>
            Market caps verified via yfinance, May 2026 · Excludes SPACs, blank-check, and warrants-only listings
          </p>
        </div>

        {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 40 }}>
          {[
            { val: totalN,            label: "Total IPOs",       sub: "2020–2025",          color: C.accent },
            { val: `${overallWin}%`,  label: "Overall Win Rate", sub: "above IPO valuation", color: C.green },
            { val: "$0–10B",          label: "Best Bucket",      sub: "38% win rate, +96% mean", color: C.green },
            { val: "$10–20B",         label: "Dead Zone",        sub: "22% win rate, 0 doubles", color: C.red },
            { val: "+1,415%",         label: "Best Return",      sub: "PLTR · $21.8B → $330B",   color: C.accent },
            { val: "-99%",            label: "Worst Return",     sub: "DIDI · $68B → $0.5B",     color: C.red },
          ].map((k, i) => (
            <div key={i} style={{
              background: C.card, borderRadius: 14, padding: "20px 16px",
              border: `1px solid ${C.border}`, textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: k.color, fontVariantNumeric: "tabular-nums" }}>{k.val}</div>
              <div style={{ fontSize: 12, color: C.text, fontWeight: 600, marginTop: 4 }}>{k.label}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ─────────────────────────────────────────────────────── */}
        <div style={{ background: C.card, borderRadius: 20, padding: 28, marginBottom: 40, border: `1px solid ${C.border}` }}>
          {/* tab strip */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {([
              ["volume",  "IPO Count by Year"],
              ["winrate", "Win Rate & Returns"],
              ["scatter", "Valuation vs Return"],
              ["buckets", "Bucket Risk Profile"],
            ] as const).map(([id, label]) => (
              <button key={id} onClick={() => setChartTab(id)} style={{
                padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500,
                transition: "all 0.2s",
                background:   chartTab === id ? C.accent : C.card2,
                color:        chartTab === id ? C.bg     : C.desc,
                border:       chartTab === id ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
              }}>{label}</button>
            ))}
          </div>

          {chartTab === "volume" && (
            <>
              <ChartTitle>IPO Count by Vintage Year</ChartTitle>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
                2021 had the highest count (27). 2022 saw extreme drought — only 5 quality companies went public.
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={YEAR_STATS} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 12 }} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} />
                  <Tooltip contentStyle={TT_STYLE} labelStyle={{ color: C.text }} formatter={(v) => [`${v} companies`, "Count"]} />
                  <Bar dataKey="n" name="IPO Count" radius={[6, 6, 0, 0]}>
                    {YEAR_STATS.map((d, i) => (
                      <Cell key={i} fill={d.year === 2021 ? C.red : d.year === 2025 ? C.orange : C.accent} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <InsightBox>
                <strong style={{ color: C.text }}>2021 dominated by volume, but quality collapsed.</strong> 27 IPOs in 2021 vs. 5 in 2022 — yet the 2022 class has an 88% median return while 2021 sits at -47%. Fewer, better companies went public in 2022. The 2021 flood reflects zero-rate desperation.
              </InsightBox>
            </>
          )}

          {chartTab === "winrate" && (
            <>
              <ChartTitle>Win Rate & Median Return by Vintage</ChartTitle>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
                Win rate = % above IPO valuation · Bars = win rate · Line = median return
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={YEAR_STATS} margin={{ top: 5, right: 40, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 12 }} />
                  <YAxis yAxisId="left" tickFormatter={v => fmt(v)} tick={{ fill: C.muted, fontSize: 11 }} domain={[0, 0.75]} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={v => fmtRet(v)} tick={{ fill: C.muted, fontSize: 11 }} domain={[-0.6, 1.1]} />
                  <ReferenceLine yAxisId="left" y={0.5} stroke={C.green} strokeDasharray="4 4" strokeOpacity={0.5} />
                  <Tooltip contentStyle={TT_STYLE} labelStyle={{ color: C.text }}
                    formatter={(v, name) => [name === "Win Rate" ? fmt(Number(v)) : fmtRet(Number(v)), name]} />
                  <Bar yAxisId="left" dataKey="winRate" name="Win Rate" radius={[6, 6, 0, 0]} fillOpacity={0.85}>
                    {YEAR_STATS.map((d, i) => (
                      <Cell key={i} fill={d.winRate >= 0.5 ? C.green : d.winRate >= 0.35 ? C.orange : C.red} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="medRet" name="Median Return" stroke={C.accent} strokeWidth={2.5} dot={{ r: 4, fill: C.accent }} />
                </BarChart>
              </ResponsiveContainer>
              <InsightBox>
                <strong style={{ color: C.red }}>2021 is a catastrophe.</strong> 19% win rate, -47% median. Companies IPO&apos;d at peak valuations during zero-rate euphoria and have never recovered. The <strong style={{ color: C.green }}>2022–2024 window</strong> is the opposite: 60%+ win rates with positive medians — the best back-to-back vintages in the dataset.
              </InsightBox>
            </>
          )}

          {chartTab === "scatter" && (
            <>
              <ChartTitle>IPO Valuation vs Return — All 94 Companies</ChartTitle>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
                Returns capped at 1500% · Hover for details · Color = valuation bucket
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis type="number" dataKey="v" domain={[0, 80]} tick={{ fill: C.muted, fontSize: 10 }}
                    label={{ value: "IPO Valuation ($B)", position: "bottom", offset: 12, fill: C.muted, fontSize: 11 }} />
                  <YAxis type="number" dataKey="retCap" domain={[-1.1, 15]} tick={{ fill: C.muted, fontSize: 10 }}
                    tickFormatter={v => fmt(v)} />
                  <ReferenceLine y={0}  stroke={C.muted}  strokeDasharray="4 4" />
                  <ReferenceLine x={10} stroke={C.orange} strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine x={20} stroke={C.teal}   strokeDasharray="3 3" strokeOpacity={0.5} />
                  <ReferenceLine x={40} stroke={C.gold}   strokeDasharray="3 3" strokeOpacity={0.5} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ ...TT_STYLE, padding: "10px 14px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{d.t} — {d.company}</div>
                        <div style={{ color: C.muted, fontSize: 11 }}>{d.sector} · {d.year}</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>${d.v}B → ${d.mc}B</div>
                        <div style={{ color: retColor(d.ret ?? 0), fontWeight: 600, fontSize: 13 }}>
                          {fmtRet(d.ret ?? 0)} · {d.moic}x MOIC
                        </div>
                      </div>
                    );
                  }} />
                  <Scatter data={scatterAll}>
                    {scatterAll.map((d, i) => {
                      const c = d.v < 10 ? C.green : d.v < 20 ? C.red : d.v < 40 ? C.teal : C.gold;
                      return <Cell key={i} fill={c} fillOpacity={0.8} r={4.5} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
                {[["$0-10B", C.green], ["$10-20B", C.red], ["$20-40B", C.teal], ["$40B+", C.gold]].map(([l,c]) => (
                  <span key={l} style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />{l}
                  </span>
                ))}
              </div>
              <InsightBox>
                The scatter reveals the <strong style={{ color: C.text }}>valuation smile</strong>: returns cluster negative in the $10–40B range, with outliers only at the extremes. PLTR ($21.8B, +1415%) and ARM ($54B, +196%) are visible as lone high dots. The $10–20B band is almost entirely below the zero line.
              </InsightBox>
            </>
          )}

          {chartTab === "buckets" && (
            <>
              <ChartTitle>Risk Profile: 100%+ Winners vs 50%+ Losers by Bucket</ChartTitle>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
                The only bucket where big winners outnumber big losers is $0–10B
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bucketChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 12 }} />
                  <YAxis tickFormatter={v => fmt(v)} tick={{ fill: C.muted, fontSize: 11 }} domain={[0, 0.5]} />
                  <Tooltip contentStyle={TT_STYLE} formatter={(v) => fmt(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
                  <Bar dataKey="bigWin"  name="100%+ Winners" fill={C.green}  fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bigLoss" name="50%+ Losers"   fill={C.red}    fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <InsightBox>
                <strong style={{ color: C.red }}>$10–20B: zero doubles, 33% wiped out.</strong> At $40B+, half of all companies lost 50%+ of their value. The $0–10B bucket is the only one where the power law works in your favor — 23% of companies more than doubled.
              </InsightBox>
            </>
          )}
        </div>

        {/* ── YEAR COMPARISON TOOL ───────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(135deg,#1e3a5f 0%,#1e293b 100%)",
          borderRadius: 20, padding: 30, marginBottom: 40, border: `1px solid ${C.border}`,
        }}>
          <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6 }}>Vintage Year Comparison</h2>
          <p style={{ textAlign: "center", fontSize: 13, color: C.muted, marginBottom: 28 }}>Compare any two IPO years side by side</p>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginBottom: 28 }}>
            {[
              { val: cmpYear1, set: setCmpYear1 },
              { val: cmpYear2, set: setCmpYear2 },
            ].map((sel, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Year {idx + 1}</label>
                <select value={sel.val} onChange={e => sel.set(Number(e.target.value))} style={{
                  background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px",
                  color: C.text, fontSize: 16, fontWeight: 700, cursor: "pointer",
                }}>
                  {YEAR_STATS.map(y => <option key={y.year} value={y.year}>{y.year}</option>)}
                </select>
              </div>
            ))}
            <div style={{ fontSize: 18, fontWeight: 900, color: C.muted, marginTop: 16 }}>VS</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[y1, y2].map((y, idx) => (
              <div key={idx} style={{ background: C.card2, borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: C.accent, marginBottom: 16, textAlign: "center" }}>{y.year}</h3>
                {[
                  { label: "Companies", val: String(y.n) },
                  { label: "Win Rate",  val: fmt(y.winRate), color: y.winRate >= 0.5 ? C.green : y.winRate >= 0.35 ? C.orange : C.red },
                  { label: "Median Return", val: fmtRet(y.medRet), color: y.medRet >= 0 ? C.green : C.red },
                  { label: "Mean Return",   val: fmtRet(y.meanRet), color: y.meanRet >= 0 ? C.green : C.red },
                  { label: "100%+ Winners", val: fmt(y.bigWin),  color: C.green },
                  { label: "50%+ Losers",   val: fmt(y.bigLoss), color: y.bigLoss > 0.3 ? C.red : C.orange },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{s.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: s.color ?? C.text }}>{s.val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── NOTABLE IPO TIMELINE ───────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Notable IPO Moments</h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Landmark offerings that defined the 2020–2025 cycle</p>
          </div>
          <div style={{ position: "relative", paddingLeft: 32 }}>
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: C.border }} />
            {NOTABLE_IPOS.map((ev, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 24, paddingLeft: 24 }}>
                <div style={{ position: "absolute", left: -22, top: 4, width: 12, height: 12, borderRadius: "50%", background: C.accent, border: `2px solid ${C.bg}` }} />
                <div style={{ background: C.card, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}`, transition: "border-color 0.2s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{ev.date}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{ev.ticker} — {ev.name}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ background: "rgba(56,189,248,0.12)", color: C.accent, border: `1px solid rgba(56,189,248,0.3)`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>{ev.ipoVal} IPO</span>
                      <span style={{ background: Number(ev.firstDay.replace("%","").replace("+","")) >= 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: Number(ev.firstDay.replace("%","").replace("+","")) >= 0 ? C.green : C.red, border: `1px solid`, borderColor: Number(ev.firstDay.replace("%","").replace("+","")) >= 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>Day 1: {ev.firstDay}</span>
                      <span style={{ background: "rgba(100,116,139,0.15)", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 10px", fontSize: 11 }}>{ev.stat2}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: C.desc, marginTop: 10, lineHeight: 1.5 }}>{ev.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECORD HOLDERS ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Record Holders & Extremes</h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>The outliers that define the dataset</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {RECORDS.map((r, i) => (
              <div key={i} style={{
                background: "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",
                borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, textAlign: "center",
                transition: "transform 0.2s", cursor: "default",
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{r.emoji}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.accent, marginBottom: 6 }}>{r.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{r.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FUN FACTS ──────────────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(135deg,#1e3a5f 0%,#1e293b 100%)",
          borderRadius: 20, padding: 30, marginBottom: 40, border: `1px solid ${C.border}`,
        }}>
          <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            8 Freakonomics Findings
          </h2>
          <p style={{ textAlign: "center", fontSize: 13, color: C.muted, marginBottom: 28 }}>Non-obvious patterns from 94 IPOs across 6 years</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            {FUN_FACTS.map(f => (
              <div key={f.n} style={{
                background: C.card2, borderRadius: 12, padding: 20, border: `1px solid ${C.border}`,
                display: "flex", gap: 16, alignItems: "flex-start",
                transition: "border-color 0.2s, transform 0.2s", cursor: "default",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateX(0)"; }}
              >
                <div style={{ background: C.accent, color: C.bg, width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{f.n}</div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{f.title}</h4>
                  <p style={{ fontSize: 12, color: C.desc, lineHeight: 1.6 }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── VALUATION BUCKET CARDS ─────────────────────────────────────── */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Valuation Bucket Analysis</h2>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Click any bucket to expand company-level detail</p>
          </div>
        </div>

        {WIDE_BUCKETS.map((b, idx) => (
          <div key={b.label}
            style={{
              background: C.card,
              border: `1px solid ${expanded === idx ? b.color + "80" : C.border}`,
              borderRadius: 14, padding: "16px 20px", marginBottom: 12,
              cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
            }}
            onClick={() => setExpanded(expanded === idx ? null : idx)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 5, height: 36, borderRadius: 3, background: b.color }} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{b.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{b.n} companies</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                {[
                  { label: "Win Rate", val: fmt(b.winRate),    color: b.winRate >= 0.4 ? C.green : C.red },
                  { label: "Median",   val: fmtRet(b.medRet),  color: b.medRet >= 0 ? C.green : C.red },
                  { label: "Mean",     val: fmtRet(b.meanRet), color: b.meanRet >= 0 ? C.green : C.red },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>{s.label}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
                <div style={{ fontSize: 18, color: C.muted, transform: expanded === idx ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</div>
              </div>
            </div>

            {expanded === idx && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 14 }}>
                  {[
                    { l: "Mean Return",   v: fmtRet(b.meanRet), c: b.meanRet >= 0 ? C.green : C.red },
                    { l: "Median Return", v: fmtRet(b.medRet),  c: b.medRet  >= 0 ? C.green : C.red },
                    { l: "Win Rate",      v: fmt(b.winRate),     c: b.winRate >= 0.4 ? C.green : C.red },
                    { l: "100%+ Hits",    v: fmt(b.bigWin),      c: C.green },
                    { l: "50%+ Wipes",    v: fmt(b.bigLoss),     c: b.bigLoss > 0 ? C.red : C.green },
                  ].map(s => (
                    <div key={s.l} style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{s.l}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: C.desc, lineHeight: 1.6, marginBottom: 12 }}>{b.note}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[...b.examples].sort((a,bx) => (bx.ret??-999)-(a.ret??-999)).map(d => (
                    <span key={d.t} style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 5,
                      background: (d.ret??0) >= 1 ? C.green+"18" : (d.ret??0) >= 0 ? C.accent+"18" : (d.ret??0) > -0.5 ? C.orange+"18" : C.red+"18",
                      color:      (d.ret??0) >= 1 ? C.green      : (d.ret??0) >= 0 ? C.accent      : (d.ret??0) > -0.5 ? C.orange      : C.red,
                      border: `1px solid ${(d.ret??0) >= 0 ? C.green : C.red}30`,
                    }}>
                      {d.t} ${d.v}B→${d.mc}B {fmtRet(d.ret??0)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ── THESIS ─────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 40, padding: 28, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 14 }}>The Valuation Smile — What the Data Says</h2>
          <p style={{ fontSize: 13, color: C.desc, lineHeight: 1.8 }}>
            IPO returns follow a U-shaped curve across valuation tiers.{" "}
            <span style={{ color: C.green, fontWeight: 600 }}>Sub-$10B</span> companies generate power-law returns: most lose, but the winners obliterate. CRDO (+2162%), PLTR (+1415%), HOOD (+781%), RDDT (+393%) are real.{" "}
            <span style={{ color: C.red, fontWeight: 600 }}>$10–20B</span> is structurally broken — priced for perfection, no room to grow, no platform moat. GDRX (-95%), WISH (-99%), TASK (-85%).{" "}
            <span style={{ color: C.teal, fontWeight: 600 }}>$20–40B</span> requires a generational company: Palantir (+1415%) rescues the whole bucket. Without PLTR, the $20-40B median collapses.{" "}
            <span style={{ color: C.gold, fontWeight: 600 }}>$40B+</span> is mostly graveyard — RIVN (-75%), DiDi (-99%), Venture Global (-69%). ARM (+196%) is the lone exception that proves the rule.
          </p>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#0a1929", borderRadius: 10, border: `1px solid rgba(56,189,248,0.2)`, fontSize: 12, color: C.accent, lineHeight: 1.6 }}>
            <strong>Coming next:</strong> Expanding to 2015–2019 to test if the $10–20B dead zone is structural or a 2020–2021 bubble artifact. Uber IPO&apos;d at $82B in 2019 — how does that fit? Does the dead zone shift in different rate environments?
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 14 }}>
            94 companies · US-listed 2020–2025 · Market caps as of May 2026 · Excludes SPACs and blank-check IPOs
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>Built on public market data · Updated May 2026</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 13 }}>
            <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none" }}>↗ @Trace_Cohen</a>
            <a href="mailto:t@nyvp.com" style={{ color: C.accent, textDecoration: "none" }}>✉ t@nyvp.com</a>
          </div>
        </div>

      </div>
    </div>
  );
}
