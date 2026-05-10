"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid, ReferenceLine, ScatterChart, Scatter,
} from "recharts";
import { WIDE_BUCKETS, YEAR_STATS, COMPANIES } from "@/lib/ipoData";

const PAL = {
  bg: "#080b12", card: "#0d1117", border: "#1b2332",
  text: "#c9d1d9", dim: "#6e7681", accent: "#58a6ff",
  green: "#3fb950", red: "#f85149", orange: "#d29922",
  yellow: "#e3b341", amber: "#e3a85a", teal: "#39d2c0",
};

const fmt = (n: number) => (n * 100).toFixed(0) + "%";
const fmtRet = (n: number) => (n >= 0 ? "+" : "") + (n * 100).toFixed(0) + "%";

const scatterAll = COMPANIES.map((d) => ({
  ...d,
  t: d.ticker,
  v: d.ipoVal,
  mc: d.currentCap,
  retCap: Math.min(Math.max(d.ret, -1), 10),
}));

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: "center", flex: 1, minWidth: 90 }}>
      <div style={{ fontSize: 10, color: PAL.dim, textTransform: "uppercase", letterSpacing: 1, fontFamily: "JetBrains Mono, monospace" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || PAL.accent, fontFamily: "JetBrains Mono, monospace" }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [view, setView] = useState("bars");

  const chartData = WIDE_BUCKETS.map((b) => ({
    label: b.label, winRate: b.winRate, meanRet: b.meanRet, medRet: b.medRet,
    bigWin: b.bigWin, bigLoss: b.bigLoss, n: b.n, color: b.color,
  }));

  return (
    <div style={{ background: PAL.bg, color: PAL.text, minHeight: "100vh", padding: "24px 20px", fontFamily: "'IBM Plex Sans', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: PAL.accent, textTransform: "uppercase", letterSpacing: 2, fontFamily: "JetBrains Mono, monospace", marginBottom: 6 }}>IPO Valuation Analysis · $10B Increments</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#e6edf3", lineHeight: 1.2 }}>The $10–20B Dead Zone</h1>
          <p style={{ color: PAL.dim, fontSize: 12.5, margin: "6px 0 0", lineHeight: 1.5 }}>
            70 US IPOs from 2021–2025 across the full valuation spectrum. The pattern is clear:
            small IPOs generate outlier returns, mid-range ($10–20B) IPOs almost universally destroy value,
            and mega-IPOs ($40B+) are a coin flip that usually lands on tails.
          </p>
        </div>

        {/* Key Stats Row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, background: PAL.card, border: `1px solid ${PAL.border}`, borderRadius: 8, padding: "14px 12px" }}>
          <Stat label="Best Bucket" value="$0–10B" color={PAL.green} />
          <Stat label="Dead Zone" value="$10–20B" color={PAL.red} />
          <Stat label="$40B+ Median" value="-50%" color={PAL.red} />
          <Stat label="Lone Mega Win" value="ARM" color={PAL.amber} />
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", gap: 2, marginBottom: 16, borderBottom: `1px solid ${PAL.border}` }}>
          {[
            { id: "bars", l: "Win Rate + Returns" },
            { id: "risk", l: "Risk Profile" },
            { id: "scatter", l: "Scatter" },
            { id: "year", l: "By Year" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              style={{
                background: view === t.id ? PAL.card : "transparent",
                color: view === t.id ? PAL.accent : PAL.dim,
                border: "none",
                borderBottom: view === t.id ? `2px solid ${PAL.accent}` : "2px solid transparent",
                padding: "7px 14px", cursor: "pointer", fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: view === t.id ? 600 : 400,
              }}
            >{t.l}</button>
          ))}
        </div>

        {/* CHARTS */}
        <div style={{ background: PAL.card, border: `1px solid ${PAL.border}`, borderRadius: 10, padding: "16px", marginBottom: 16 }}>
          {view === "bars" && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", marginBottom: 4 }}>Win Rate by IPO Valuation Bucket</div>
              <div style={{ fontSize: 10, color: PAL.dim, marginBottom: 12, fontFamily: "JetBrains Mono, monospace" }}>% of companies with positive return from IPO valuation to current market cap</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PAL.border} />
                  <XAxis dataKey="label" tick={{ fill: PAL.dim, fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fill: PAL.dim, fontSize: 10 }} domain={[0, 0.55]} />
                  <ReferenceLine y={0.5} stroke={PAL.green} strokeDasharray="4 4" strokeOpacity={0.5} />
                  <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", marginTop: 16, marginBottom: 4 }}>Median Return by Bucket</div>
              <div style={{ fontSize: 10, color: PAL.dim, marginBottom: 12, fontFamily: "JetBrains Mono, monospace" }}>Median reflects the typical outcome — not skewed by outlier winners like CRDO (+2,162%) or HOOD (+781%)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PAL.border} />
                  <XAxis dataKey="label" tick={{ fill: PAL.dim, fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fill: PAL.dim, fontSize: 10 }} domain={[-0.6, 0.15]} />
                  <ReferenceLine y={0} stroke={PAL.dim} strokeDasharray="4 4" />
                  <Bar dataKey="medRet" radius={[4, 4, 0, 0]}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.medRet >= 0 ? d.color : PAL.red} fillOpacity={0.8} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}

          {view === "risk" && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", marginBottom: 4 }}>Risk Profile: 100%+ Winners vs 50%+ Losers</div>
              <div style={{ fontSize: 10, color: PAL.dim, marginBottom: 12, fontFamily: "JetBrains Mono, monospace" }}>Green = % that more than doubled · Red = % that lost more than half</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PAL.border} />
                  <XAxis dataKey="label" tick={{ fill: PAL.dim, fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fill: PAL.dim, fontSize: 10 }} domain={[0, 0.55]} />
                  <Bar dataKey="bigWin" name="100%+ Winners" fill={PAL.green} fillOpacity={0.75} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bigLoss" name="50%+ Losers" fill={PAL.red} fillOpacity={0.75} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}>
                <span style={{ color: PAL.dim }}><span style={{ display: "inline-block", width: 10, height: 10, background: PAL.green, borderRadius: 2, marginRight: 4, verticalAlign: "middle", opacity: 0.75 }} />100%+ Winners</span>
                <span style={{ color: PAL.dim }}><span style={{ display: "inline-block", width: 10, height: 10, background: PAL.red, borderRadius: 2, marginRight: 4, verticalAlign: "middle", opacity: 0.75 }} />50%+ Losers</span>
              </div>
              <div style={{ marginTop: 12, padding: "10px 12px", background: "#0a1929", borderRadius: 6, border: `1px solid ${PAL.red}33`, fontSize: 11, color: PAL.dim, lineHeight: 1.5 }}>
                <span style={{ color: PAL.red, fontWeight: 600 }}>$10–20B is the worst risk/reward in the market.</span> Zero companies doubled. At $40B+, HALF the companies lost 50%+ of their value. The only bucket where big winners clearly outnumber big losers is $0–10B.
              </div>
            </>
          )}

          {view === "scatter" && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", marginBottom: 4 }}>IPO Valuation vs Return — All 70 Companies</div>
              <div style={{ fontSize: 10, color: PAL.dim, marginBottom: 12, fontFamily: "JetBrains Mono, monospace" }}>Returns capped at 1000% for readability · Color = valuation bucket</div>
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PAL.border} />
                  <XAxis type="number" dataKey="v" domain={[0, 80]} tick={{ fill: PAL.dim, fontSize: 10 }}
                    label={{ value: "IPO Valuation ($B)", position: "bottom", offset: 12, fill: PAL.dim, fontSize: 10 }} />
                  <YAxis type="number" dataKey="retCap" domain={[-1.1, 10]} tick={{ fill: PAL.dim, fontSize: 10 }}
                    tickFormatter={(v) => fmt(v)} />
                  <ReferenceLine y={0} stroke={PAL.dim} strokeDasharray="4 4" />
                  <ReferenceLine x={10} stroke={PAL.orange} strokeDasharray="3 3" strokeOpacity={0.4} />
                  <ReferenceLine x={20} stroke={PAL.teal} strokeDasharray="3 3" strokeOpacity={0.4} />
                  <ReferenceLine x={40} stroke={PAL.amber} strokeDasharray="3 3" strokeOpacity={0.4} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: "#161b22", border: `1px solid ${PAL.border}`, borderRadius: 6, padding: "8px 12px", fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: PAL.text }}>
                        <div style={{ fontWeight: 700 }}>{d.t} — {d.company}</div>
                        <div style={{ color: PAL.dim, fontSize: 10 }}>{d.sector} · {d.year}</div>
                        <div>${d.v}B → ${d.mc}B</div>
                        <div style={{ color: d.ret >= 0 ? PAL.green : PAL.red, fontWeight: 600 }}>{fmtRet(d.ret)}</div>
                      </div>
                    );
                  }} />
                  <Scatter data={scatterAll}>
                    {scatterAll.map((d, i) => {
                      const c = d.v < 10 ? PAL.green : d.v < 20 ? PAL.red : d.v < 40 ? PAL.teal : PAL.amber;
                      return <Cell key={i} fill={c} fillOpacity={0.8} r={5} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </>
          )}

          {view === "year" && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", marginBottom: 4 }}>Win Rate by IPO Year</div>
              <div style={{ fontSize: 10, color: PAL.dim, marginBottom: 12, fontFamily: "JetBrains Mono, monospace" }}>2021 was the worst vintage — peak hype pricing. 2022–2024 vintages recovered sharply.</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={YEAR_STATS} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={PAL.border} />
                  <XAxis dataKey="year" tick={{ fill: PAL.dim, fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fill: PAL.dim, fontSize: 10 }} domain={[0, 0.75]} />
                  <ReferenceLine y={0.5} stroke={PAL.green} strokeDasharray="4 4" strokeOpacity={0.5} />
                  <Tooltip
                    formatter={(v) => fmt(Number(v))}
                    labelStyle={{ color: PAL.text }}
                    contentStyle={{ background: "#161b22", border: `1px solid ${PAL.border}`, borderRadius: 6, fontSize: 11 }}
                  />
                  <Bar dataKey="winRate" name="Win Rate" radius={[4, 4, 0, 0]}>
                    {YEAR_STATS.map((d, i) => (
                      <Cell key={i} fill={d.winRate >= 0.5 ? PAL.green : d.winRate >= 0.3 ? PAL.orange : PAL.red} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
                {YEAR_STATS.map((y) => (
                  <div key={y.year} style={{ background: PAL.bg, borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>{y.year}</div>
                    <div style={{ fontSize: 10, color: PAL.dim }}>n={y.n}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: y.winRate >= 0.5 ? PAL.green : PAL.red, fontFamily: "JetBrains Mono, monospace" }}>{fmt(y.winRate)}</div>
                    <div style={{ fontSize: 10, color: y.medRet >= 0 ? PAL.green : PAL.red, fontFamily: "JetBrains Mono, monospace" }}>med {fmtRet(y.medRet)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* BUCKET DETAIL CARDS */}
        {WIDE_BUCKETS.map((b, idx) => (
          <div
            key={b.label}
            style={{
              background: PAL.card,
              border: `1px solid ${expanded === idx ? b.color + "66" : PAL.border}`,
              borderRadius: 10, padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "border-color 0.2s",
            }}
            onClick={() => setExpanded(expanded === idx ? null : idx)}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: b.color }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>{b.label}</div>
                  <div style={{ fontSize: 10, color: PAL.dim }}>{b.n} companies</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: PAL.dim, fontFamily: "JetBrains Mono, monospace" }}>Win Rate</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: b.winRate >= 0.4 ? PAL.green : PAL.red, fontFamily: "JetBrains Mono, monospace" }}>{fmt(b.winRate)}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: PAL.dim, fontFamily: "JetBrains Mono, monospace" }}>Median</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: b.medRet >= 0 ? PAL.green : PAL.red, fontFamily: "JetBrains Mono, monospace" }}>{fmtRet(b.medRet)}</div>
                </div>
                <div style={{ fontSize: 16, color: PAL.dim, transform: expanded === idx ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</div>
              </div>
            </div>

            {expanded === idx && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${PAL.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 12 }}>
                  {[
                    { l: "Mean Return", v: fmtRet(b.meanRet), c: b.meanRet >= 0 ? PAL.green : PAL.red },
                    { l: "Median Return", v: fmtRet(b.medRet), c: b.medRet >= 0 ? PAL.green : PAL.red },
                    { l: "Win Rate", v: fmt(b.winRate), c: b.winRate >= 0.4 ? PAL.green : PAL.red },
                    { l: "100%+ Hits", v: fmt(b.bigWin), c: PAL.green },
                    { l: "50%+ Wipes", v: fmt(b.bigLoss), c: b.bigLoss > 0 ? PAL.red : PAL.green },
                  ].map((s) => (
                    <div key={s.l} style={{ background: PAL.bg, borderRadius: 6, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: PAL.dim, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "JetBrains Mono, monospace" }}>{s.l}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: s.c, fontFamily: "JetBrains Mono, monospace" }}>{s.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 11, color: PAL.dim, lineHeight: 1.5, marginBottom: 10 }}>{b.note}</div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {[...b.examples].sort((a, bx) => bx.ret - a.ret).map((d) => (
                    <span
                      key={d.t}
                      style={{
                        fontSize: 10, fontFamily: "JetBrains Mono, monospace", padding: "3px 8px", borderRadius: 4,
                        background: d.ret >= 1 ? PAL.green + "18" : d.ret >= 0 ? PAL.accent + "18" : d.ret > -0.5 ? PAL.orange + "18" : PAL.red + "18",
                        color: d.ret >= 1 ? PAL.green : d.ret >= 0 ? PAL.accent : d.ret > -0.5 ? PAL.orange : PAL.red,
                        border: `1px solid ${d.ret >= 0 ? PAL.green : PAL.red}22`,
                      }}
                    >
                      {d.t} ${d.v}B→${d.mc}B {fmtRet(d.ret)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Bottom Thesis */}
        <div style={{ marginTop: 16, padding: "16px", background: PAL.card, border: `1px solid ${PAL.border}`, borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3", marginBottom: 8 }}>The Valuation Smile</div>
          <div style={{ fontSize: 12, color: PAL.dim, lineHeight: 1.65 }}>
            IPO returns follow a U-shaped curve across valuation.{" "}
            <span style={{ color: PAL.green, fontWeight: 600 }}>Sub-$10B</span> companies generate huge power-law returns because they have room to grow into their TAM.{" "}
            <span style={{ color: PAL.red, fontWeight: 600 }}>$10–20B</span> is the worst place to IPO — priced too high for upside but too small to be a platform monopoly.{" "}
            <span style={{ color: PAL.teal, fontWeight: 600 }}>$20–40B</span> companies are typically category-defining platforms that can sustain their valuations.{" "}
            But <span style={{ color: PAL.amber, fontWeight: 600 }}>$40B+</span> is mostly a graveyard — only ARM survived, while Rivian (−75%), DiDi (−99%), and Venture Global (−69%) show what happens when peak-hype pricing meets reality.
          </div>
          <div style={{ marginTop: 12, fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: PAL.accent }}>
            For LPs: the alpha is in sub-$10B IPOs where your VC portfolio companies go public. The $10–20B zone is where returns go to die.
          </div>
          <div style={{ fontSize: 10, color: PAL.dim, marginTop: 10, fontFamily: "JetBrains Mono, monospace" }}>
            70 companies · US-listed 2021–2025 · Market caps as of May 2026
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${PAL.border}`, display: "flex", justifyContent: "center", gap: 20, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}>
          <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" style={{ color: PAL.dim, textDecoration: "none" }}>
            ↗ @Trace_Cohen
          </a>
          <a href="mailto:t@nyvp.com" style={{ color: PAL.dim, textDecoration: "none" }}>
            ✉ t@nyvp.com
          </a>
        </div>
      </div>
    </div>
  );
}
