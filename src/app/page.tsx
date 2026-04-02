"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  TrendingDown,
  DollarSign,
  Building2,
  AlertTriangle,
  Trophy,
  Skull,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   DATA — merged from JSON dataset + CSV + XLSX monthly returns
   ───────────────────────────────────────────────────────────────── */

const companies = [
  {
    id: "etoro", name: "eToro", ticker: "ETOR", exchange: "NASDAQ",
    sector: "Fintech", founded: 2007, hq: "Tel Aviv, Israel", color: "#10b981",
    ipo: { date: "2025-05-14", price: 52.0, proceeds_m: 620, valuation_b: 4.2, above_range: true },
    day1: { open: 69.69, close: 67.0, change_pct: 28.8, market_cap_b: 5.64 },
    private: { raised_m: 612.5, peak_val_b: 3.5, notable: ["SoftBank Vision Fund 2", "Pitango VC", "Spark Capital"] },
    current: { price: 29.03, mcap_b: 2.4, from_ipo: -44.2, from_day1: -56.7, from_peak: -31.3, hi52: 79.96, lo52: 24.74 },
    narrative: "Strong debut (+29%) fueled by crypto/retail interest. Proved highly cyclical. Now ~$29, well below $52 IPO price.",
  },
  {
    id: "hinge", name: "Hinge Health", ticker: "HNGE", exchange: "NYSE",
    sector: "Digital Health", founded: 2014, hq: "San Francisco, CA", color: "#14b8a6",
    ipo: { date: "2025-05-22", price: 32.0, proceeds_m: 437.3, valuation_b: 3.0, above_range: true },
    day1: { open: 39.25, close: 36.5, change_pct: 14.1, market_cap_b: 3.65 },
    private: { raised_m: 827.6, peak_val_b: 6.2, notable: ["Coatue", "Tiger Global", "Insight Partners", "Atomico"] },
    current: { price: 22.1, mcap_b: 2.3, from_ipo: -30.9, from_day1: -39.5, from_peak: -62.9, hi52: 52.0, lo52: 18.0 },
    narrative: "Digital MSK therapy platform. IPO'd at steep discount to $6.2B peak. Early clinical-evidence-driven model but public markets skeptical on unit economics.",
  },
  {
    id: "mntn", name: "MNTN", ticker: "MNTN", exchange: "NASDAQ",
    sector: "AdTech / CTV", founded: 2018, hq: "Los Angeles, CA", color: "#f43f5e",
    ipo: { date: "2025-05-22", price: 16.0, proceeds_m: 187.2, valuation_b: 1.24, above_range: true },
    day1: { open: 21.0, close: 19.5, change_pct: 21.9, market_cap_b: 1.62 },
    private: { raised_m: 190.3, peak_val_b: 2.0, notable: ["Fidelity", "CPMG", "Blackstone Growth"] },
    current: { price: 5.8, mcap_b: 0.5, from_ipo: -63.8, from_day1: -70.3, from_peak: -75.0, hi52: 21.0, lo52: 4.5 },
    narrative: "CTV advertising platform. IPO'd below peak private valuation. Steady decline as ad market softened and AI-driven ad platforms gained share.",
  },
  {
    id: "circle", name: "Circle", ticker: "CRCL", exchange: "NYSE",
    sector: "Crypto / Stablecoin", founded: 2013, hq: "New York, NY", color: "#22c55e",
    ipo: { date: "2025-06-05", price: 31.0, proceeds_m: 1050, valuation_b: 8.0, above_range: true },
    day1: { open: 75.0, close: 79.0, change_pct: 155.0, market_cap_b: 18.5 },
    private: { raised_m: 1200, peak_val_b: 9.0, notable: ["Accel", "General Catalyst", "Goldman Sachs", "BlackRock"] },
    current: { price: 92.61, mcap_b: 22.9, from_ipo: 198.7, from_day1: 17.2, from_peak: 154.6, hi52: 298.99, lo52: 31.0 },
    narrative: "The only true standout winner. USDC adoption + favorable crypto regulation. +199% from IPO. Only company above peak private valuation.",
  },
  {
    id: "omada", name: "Omada Health", ticker: "OMDA", exchange: "NYSE",
    sector: "Digital Health", founded: 2011, hq: "San Francisco, CA", color: "#0d9488",
    ipo: { date: "2025-06-06", price: 19.0, proceeds_m: 150, valuation_b: 1.1, above_range: false },
    day1: { open: 23.0, close: 21.5, change_pct: 13.2, market_cap_b: 1.28 },
    private: { raised_m: 256, peak_val_b: 1.0, notable: ["Andreessen Horowitz", "Cigna Ventures", "US Venture Partners"] },
    current: { price: 10.2, mcap_b: 0.6, from_ipo: -46.3, from_day1: -52.6, from_peak: -40.0, hi52: 23.0, lo52: 8.5 },
    narrative: "Chronic condition management platform. Small IPO. Digital health sector fell out of favor as payers tightened budgets post-pandemic.",
  },
  {
    id: "chime", name: "Chime", ticker: "CHYM", exchange: "NASDAQ",
    sector: "Consumer Fintech", founded: 2012, hq: "San Francisco, CA", color: "#3b82f6",
    ipo: { date: "2025-06-12", price: 27.0, proceeds_m: 864, valuation_b: 11.6, above_range: true },
    day1: { open: 43.0, close: 37.11, change_pct: 37.4, market_cap_b: 18.4 },
    private: { raised_m: 2650, peak_val_b: 25.0, notable: ["Sequoia", "SoftBank", "Tiger Global", "Coatue", "DST Global"] },
    current: { price: 18.85, mcap_b: 6.9, from_ipo: -30.2, from_day1: -49.2, from_peak: -72.4, hi52: 44.94, lo52: 16.17 },
    narrative: "Landmark neobank IPO. Peak $25B (2021) vs current $6.9B = 72% destruction for peak investors. Early VCs remain profitable.",
  },
  {
    id: "figma", name: "Figma", ticker: "FIG", exchange: "NYSE",
    sector: "Design Software", founded: 2012, hq: "San Francisco, CA", color: "#ec4899",
    ipo: { date: "2025-07-31", price: 33.0, proceeds_m: 1200, valuation_b: 18.8, above_range: true },
    day1: { open: 100.0, close: 115.5, change_pct: 250.0, market_cap_b: 47.9 },
    private: { raised_m: 333, peak_val_b: 20.0, notable: ["Sequoia", "Index Ventures", "Greylock", "Kleiner Perkins", "a16z"] },
    current: { price: 21.14, mcap_b: 11.0, from_ipo: -35.9, from_day1: -81.7, from_peak: -45.0, hi52: 142.92, lo52: 19.82 },
    narrative: "Most dramatic IPO pop (+250% day 1). Lock-up expiry in Jan 2026 triggered insider flood. Now $21 vs $115 day-1 close.",
  },
  {
    id: "klarna", name: "Klarna", ticker: "KLAR", exchange: "NYSE",
    sector: "BNPL / Fintech", founded: 2005, hq: "London, UK", color: "#f59e0b",
    ipo: { date: "2025-09-10", price: 40.0, proceeds_m: 1370, valuation_b: 15.1, above_range: true },
    day1: { open: 52.0, close: 45.82, change_pct: 14.6, market_cap_b: 19.65 },
    private: { raised_m: 4700, peak_val_b: 45.6, notable: ["Sequoia", "SoftBank Vision Fund 2", "Silver Lake", "BlackRock", "Atomico"] },
    current: { price: 13.28, mcap_b: 5.0, from_ipo: -66.8, from_day1: -71.0, from_peak: -89.0, hi52: 57.2, lo52: 12.06 },
    narrative: "Europe's most storied fintech. SoftBank at $45.6B entry is the worst VC bet in the cohort at -89%. Sequoia is the biggest winner — $500M in, $2.65B+ out.",
  },
  {
    id: "figure", name: "Figure Tech", ticker: "FIGR", exchange: "NASDAQ",
    sector: "Blockchain Fintech", founded: 2018, hq: "Reno, NV", color: "#f97316",
    ipo: { date: "2025-09-11", price: 25.0, proceeds_m: 787.5, valuation_b: 5.3, above_range: true },
    day1: { open: 36.0, close: 31.11, change_pct: 24.4, market_cap_b: 7.62 },
    private: { raised_m: 400, peak_val_b: 3.2, notable: ["Apollo Global", "Ribbit Capital"] },
    current: { price: 33.56, mcap_b: 7.2, from_ipo: 34.2, from_day1: 7.9, from_peak: 125.0, hi52: 78.0, lo52: 25.01 },
    narrative: "One of three companies above IPO price. Profitable (26% net margin). Founded by SoFi co-founder.",
  },
  {
    id: "gemini", name: "Gemini", ticker: "GEMI", exchange: "NASDAQ",
    sector: "Crypto Exchange", founded: 2014, hq: "New York, NY", color: "#64748b",
    ipo: { date: "2025-09-12", price: 28.0, proceeds_m: 425, valuation_b: 3.3, above_range: true },
    day1: { open: 37.01, close: 32.0, change_pct: 14.3, market_cap_b: 4.4 },
    private: { raised_m: 424, peak_val_b: 7.0, notable: ["Winklevoss Twins (founders)", "Cleo Capital"] },
    current: { price: 4.43, mcap_b: 0.5, from_ipo: -84.2, from_day1: -86.2, from_peak: -92.9, hi52: 45.89, lo52: 3.91 },
    narrative: "Worst post-IPO collapse. Exec resignations, 25% layoffs, earnings miss, securities fraud class actions. $7B peak now $0.5B.",
  },
  {
    id: "via", name: "Via Transportation", ticker: "VIA", exchange: "NYSE",
    sector: "Transit Tech / GovTech", founded: 2012, hq: "New York, NY", color: "#a78bfa",
    ipo: { date: "2025-09-12", price: 46.0, proceeds_m: 493, valuation_b: 3.65, above_range: true },
    day1: { open: 44.0, close: 49.0, change_pct: 6.5, market_cap_b: 3.9 },
    private: { raised_m: 887, peak_val_b: 3.5, notable: ["Pitango VC", "83North", "Wellington Management"] },
    current: { price: 13.5, mcap_b: 1.1, from_ipo: -70.7, from_day1: -72.5, from_peak: -68.6, hi52: 56.31, lo52: 13.11 },
    narrative: "Transit tech for 800+ cities. Waymo partnership briefly exciting. Bleecker Street short report in Dec was the crash catalyst.",
  },
  {
    id: "stubhub", name: "StubHub", ticker: "STUB", exchange: "NYSE",
    sector: "Marketplace / Events", founded: 2000, hq: "San Francisco, CA", color: "#ef4444",
    ipo: { date: "2025-09-17", price: 23.5, proceeds_m: 800, valuation_b: 8.6, above_range: false },
    day1: { open: 25.35, close: 22.0, change_pct: -6.4, market_cap_b: 7.5 },
    private: { raised_m: 4050, peak_val_b: 16.5, notable: ["Madrone Capital (Walton family)", "WestCap", "Bessemer VP"] },
    current: { price: 6.06, mcap_b: 2.2, from_ipo: -74.2, from_day1: -72.5, from_peak: -86.7, hi52: 27.89, lo52: 6.02 },
    narrative: "Only company to close below IPO price on day 1. $2.85B in debt at 9% interest is the anchor. Walton family is the most prominent loser.",
  },
  {
    id: "netskope", name: "Netskope", ticker: "NTSK", exchange: "NASDAQ",
    sector: "Cybersecurity", founded: 2012, hq: "Santa Clara, CA", color: "#0ea5e9",
    ipo: { date: "2025-09-18", price: 19.0, proceeds_m: 908, valuation_b: 7.3, above_range: true },
    day1: { open: 23.0, close: 22.49, change_pct: 18.4, market_cap_b: 8.79 },
    private: { raised_m: 1400, peak_val_b: 7.5, notable: ["ICONIQ Growth", "Lightspeed VP", "Accel", "Sequoia", "Canada Pension Plan"] },
    current: { price: 8.44, mcap_b: 2.8, from_ipo: -55.6, from_day1: -62.5, from_peak: -62.7, hi52: 27.99, lo52: 7.67 },
    narrative: "Cleanest IPO deal (flat to last private round). AI disruption fears triggered sector-wide rout. $811M ARR, 31% growth.",
  },
  {
    id: "navan", name: "Navan", ticker: "NAVN", exchange: "NASDAQ",
    sector: "Travel & Expense SaaS", founded: 2015, hq: "Palo Alto, CA", color: "#06b6d4",
    ipo: { date: "2025-10-30", price: 25.0, proceeds_m: 923, valuation_b: 6.2, above_range: false },
    day1: { open: 22.0, close: 20.0, change_pct: -20.0, market_cap_b: 6.7 },
    private: { raised_m: 2200, peak_val_b: 9.2, notable: ["Lightspeed VP", "Zeev Ventures", "a16z", "Coatue", "Greenoaks"] },
    current: { price: 12.83, mcap_b: 3.2, from_ipo: -48.7, from_day1: -35.9, from_peak: -65.2, hi52: 25.0, lo52: 8.11 },
    narrative: "Formerly TripActions. B2B SaaS getting no love despite $800M ARR, 29% growth. Securities class action filed Mar 2026.",
  },
  {
    id: "equipmentshare", name: "EquipmentShare", ticker: "EQPT", exchange: "NYSE",
    sector: "Construction Tech", founded: 2014, hq: "Columbia, MO", color: "#eab308",
    ipo: { date: "2026-01-23", price: 24.5, proceeds_m: 747.3, valuation_b: 6.2, above_range: true },
    day1: { open: 28.5, close: 27.2, change_pct: 11.0, market_cap_b: 7.16 },
    private: { raised_m: 650, peak_val_b: 4.07, notable: ["Insight Partners", "Y Combinator", "General Catalyst"] },
    current: { price: 25.8, mcap_b: 6.5, from_ipo: 5.3, from_day1: -5.1, from_peak: 59.7, hi52: 32.0, lo52: 22.0 },
    narrative: "Construction equipment tech platform. One of three companies trading above IPO price. IPO'd above peak private val. Steady performer.",
  },
];

/* Monthly return data from PortfoliosLab (XLSX) — month-over-month % */
const monthlyReturns: Record<string, { months: number[]; returns: number[]; labels: string[] }> = {
  ETOR: { months: [0,1,2,3,4,5,6,7,8,9,10,11,12], returns: [0,-11.6,12.5,-10,-26,-7,-10.2,13.3,-16.3,-16.3,4.3,-2.1,-0.1], labels: ["May'25","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr",""] },
  HNGE: { months: [0,1,2,3,4,5,6,7,8,9,10,11], returns: [0,3.4,33.2,-13.1,24.8,-12.5,1.4,-1.7,-5,-24.9,22.5,-14], labels: ["May'25","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr"] },
  MNTN: { months: [0,1,2,3,4,5,6,7,8,9,10,11,12], returns: [0,-4.3,-13.3,28.8,-27.5,-9.1,-10.6,-17.7,-12.5,-23,6.1,-9.8,1], labels: ["May'25","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr",""] },
  CRCL: { months: [0,1,2,3,4,5,6,7,8,9,10,11], returns: [0,484.8,1.2,-28.1,0.5,-4.2,-37.1,-0.8,-19.4,30.5,14.4,-4.9], labels: ["Jun'25","Jul","Aug","Sep","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr",""] },
  OMDA: { months: [0,1,2,3,4,5,6,7,8,9,10,11], returns: [0,-20.4,-4.3,35.2,-6.7,11.1,-23.8,-15.8,-5.3,-17.9,2.4,0.3], labels: ["Jun'25","Jul","Aug","Sep","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr",""] },
  CHYM: { months: [0,1,2,3,4,5,6,7,8,9,10,11], returns: [0,-7,-0.3,-23.3,-23.6,-14.9,23.1,19.1,1,-12.9,-15.4,-0.5], labels: ["Jun'25","Jul","Aug","Sep","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr",""] },
  FIG: { months: [0,1,2,3,4,5,6,7,8,9], returns: [0,-39.2,-26.2,-3.9,-27.8,3.9,-30.6,13.4,-28.1,-3.4], labels: ["Aug'25","Sep","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr",""] },
  KLAR: { months: [0,1,2,3,4,5,6,7,8], returns: [0,-20,2.5,-16.2,-8.1,-20.2,-41.2,-3.5,1.5], labels: ["Sep'25","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr",""] },
  FIGR: { months: [0,1,2,3,4,5,6,7,8], returns: [0,16.9,8.9,-8.5,12.7,39.3,-55.6,34.3,-3.1], labels: ["Sep'25","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr",""] },
  GEMI: { months: [0,1,2,3,4,5,6,7], returns: [0,-25.1,-23.4,-40.1,-9.8,-15.9,-27.7,-0.3], labels: ["Sep'25","Oct","Nov","Dec","Jan'26","Feb","Mar","Apr"] },
  EQPT: { months: [0,1,2,3], returns: [0,3.5,-8.2,2.1], labels: ["Jan'26","Feb","Mar","Apr"] },
};

// Build cumulative returns from monthly
function buildCumulative(ticker: string): number[] {
  const data = monthlyReturns[ticker];
  if (!data) return [];
  const cum: number[] = [0];
  let val = 100;
  for (let i = 1; i < data.returns.length; i++) {
    val = val * (1 + data.returns[i] / 100);
    cum.push(Math.round((val - 100) * 10) / 10);
  }
  return cum;
}

// Performance line data — use cumulative from XLSX monthly returns
const perfTickers = ["ETOR", "HNGE", "MNTN", "CRCL", "OMDA", "CHYM", "FIG", "KLAR", "FIGR", "GEMI", "EQPT"];
const perfColors: Record<string, string> = {
  ETOR: "#10b981", HNGE: "#14b8a6", MNTN: "#f43f5e", CRCL: "#22c55e",
  OMDA: "#0d9488", CHYM: "#3b82f6", FIG: "#ec4899", KLAR: "#f59e0b",
  FIGR: "#f97316", GEMI: "#64748b", EQPT: "#eab308",
};
const perfNames: Record<string, string> = {
  ETOR: "eToro", HNGE: "Hinge Health", MNTN: "MNTN", CRCL: "Circle",
  OMDA: "Omada", CHYM: "Chime", FIG: "Figma", KLAR: "Klarna",
  FIGR: "Figure Tech", GEMI: "Gemini", EQPT: "EquipmentShare",
};

const cumulativeData: Record<string, number[]> = {};
perfTickers.forEach((t) => { cumulativeData[t] = buildCumulative(t); });

const maxMonths = Math.max(...perfTickers.map((t) => cumulativeData[t].length));
const monthLabels = Array.from({ length: maxMonths }, (_, i) => `M${i}`);

const unifiedLineData = monthLabels.map((label, i) => {
  const point: Record<string, string | number | null> = { month: label };
  perfTickers.forEach((t) => {
    const cum = cumulativeData[t];
    point[t] = i < cum.length ? cum[i] : null;
  });
  return point;
});

const investorWinners = [
  { investor: "Sequoia Capital", company: "Klarna", notes: "$500M in, $2.65B+ out. Best VC return in cohort." },
  { investor: "Accel", company: "Circle", notes: "Early CRCL backer. Circle +199% from IPO." },
  { investor: "Sequoia Capital", company: "Figma", notes: "Early backer. $11B mkt cap vs sub-$100M entry." },
  { investor: "Zeev Ventures", company: "Navan", notes: "Seed-stage. Still profitable from cost basis." },
  { investor: "Michael Cagney", company: "Figure Tech", notes: "Founder return. FIGR +34% from IPO." },
  { investor: "General Catalyst", company: "Circle", notes: "Growth stage entry. Current $22.9B vs $1B entry." },
];

const investorWrecked = [
  { investor: "2021 Gemini Investors", company: "Gemini", notes: "$7B entry. Now $0.5B = -93%.", loss: -93 },
  { investor: "SoftBank VF2", company: "Klarna", notes: "$639M at $45.6B. Now $5B = -89%.", loss: -89 },
  { investor: "Madrone (Walton family)", company: "StubHub", notes: "22.1% at IPO. Now -74%.", loss: -74 },
  { investor: "SoftBank", company: "Chime", notes: "In at $25B. Now $6.9B = -72%.", loss: -72 },
  { investor: "Tiger Global", company: "Chime", notes: "Late stage near $25B peak. Deep underwater.", loss: -72 },
  { investor: "Greenoaks Capital", company: "Navan", notes: "Led $9.2B round. Now $3.2B = -65%.", loss: -65 },
  { investor: "Canada Pension Plan", company: "Netskope", notes: "In at $7.5B. Now $2.8B = -63%.", loss: -63 },
];

const themes = [
  "Lock-up expiry (months 6-12) was destructive for nearly all companies",
  "AI disruption fears hit cybersecurity stocks hard (Netskope)",
  "Crypto cycle drove Circle's outperformance and Gemini's collapse",
  "B2B non-AI SaaS (Navan, Via) unloved despite strong fundamentals",
  "Figma's 250% day-1 pop was a trap for retail buyers",
  "Consumer fintech (Chime, Klarna, eToro) all fell sharply",
  "Peak 2021 private valuations created unavoidable IPO down-rounds",
  "Securities class actions filed against Gemini, Navan, and Via",
  "Digital health (Hinge, Omada) struggled post-pandemic",
  "Only 3 of 15 companies trade above IPO price today",
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

function fmt(n: number | null | undefined, d = 1): string {
  if (n == null) return "N/A";
  return n.toFixed(d);
}

function pctColor(pct: number | null | undefined): string {
  if (pct == null) return "text-slate-400";
  return pct > 0 ? "text-emerald-600" : pct < 0 ? "text-red-600" : "text-slate-600";
}

/* ─── COMPONENTS ──────────────────────────────────────────────── */

function StatCard({ label, value, sub, icon, accent = "text-slate-900" }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
        {icon}{label}
      </div>
      <div className={`text-2xl sm:text-3xl font-bold ${accent}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function CompanyCard({ c }: { c: typeof companies[0] }) {
  const [open, setOpen] = useState(false);
  const isWinner = c.current.from_ipo > 0;
  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all ${isWinner ? "border-emerald-200" : "border-slate-200"}`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base truncate">{c.name}</h3>
              <span className="text-xs text-slate-500">{c.ticker} · {c.exchange} · {c.sector}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-slate-900">${fmt(c.current.price, 2)}</div>
            <div className={`text-xs font-semibold ${pctColor(c.current.from_ipo)}`}>
              {c.current.from_ipo > 0 ? "+" : ""}{fmt(c.current.from_ipo)}% from IPO
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="text-[10px] text-slate-500 uppercase">IPO Price</div>
            <div className="text-sm font-semibold text-slate-800">${c.ipo.price}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="text-[10px] text-slate-500 uppercase">Day 1 Close</div>
            <div className="text-sm font-semibold text-slate-800">${c.day1.close}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="text-[10px] text-slate-500 uppercase">Mkt Cap</div>
            <div className="text-sm font-semibold text-slate-800">${fmt(c.current.mcap_b)}B</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Day 1 Pop</span>
            <span className={`font-semibold ${pctColor(c.day1.change_pct)}`}>
              {c.day1.change_pct > 0 ? "+" : ""}{fmt(c.day1.change_pct)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">From Day 1</span>
            <span className={`font-semibold ${pctColor(c.current.from_day1)}`}>
              {c.current.from_day1 > 0 ? "+" : ""}{fmt(c.current.from_day1)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">From Peak Private</span>
            <span className={`font-semibold ${pctColor(c.current.from_peak)}`}>
              {c.current.from_peak > 0 ? "+" : ""}{fmt(c.current.from_peak)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">IPO Valuation</span>
            <span className="font-semibold text-slate-800">${fmt(c.ipo.valuation_b)}B</span>
          </div>
        </div>
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors py-1">
          {open ? "Less" : "More"} {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 p-4 sm:p-5 bg-slate-50 space-y-3">
          <p className="text-xs text-slate-700 leading-relaxed">{c.narrative}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-slate-500">Founded:</span> <span className="text-slate-800 font-medium">{c.founded}</span></div>
            <div><span className="text-slate-500">HQ:</span> <span className="text-slate-800 font-medium">{c.hq}</span></div>
            <div><span className="text-slate-500">IPO Proceeds:</span> <span className="text-slate-800 font-medium">${c.ipo.proceeds_m}M</span></div>
            <div><span className="text-slate-500">Total Raised:</span> <span className="text-slate-800 font-medium">${c.private.raised_m}M</span></div>
            <div><span className="text-slate-500">Peak Private Val:</span> <span className="text-slate-800 font-medium">${fmt(c.private.peak_val_b)}B</span></div>
            <div><span className="text-slate-500">52w Range:</span> <span className="text-slate-800 font-medium">${fmt(c.current.lo52, 2)} - ${fmt(c.current.hi52, 2)}</span></div>
          </div>
          {c.private.notable && (
            <div>
              <div className="text-[10px] text-slate-500 uppercase mb-1">Key Investors</div>
              <div className="flex flex-wrap gap-1">
                {c.private.notable.map((inv) => (
                  <span key={inv} className="bg-white border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full">{inv}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs max-w-[220px]">
      <div className="font-semibold text-slate-900 mb-1">{label}</div>
      {payload.filter((p) => p.value != null).sort((a, b) => b.value - a.value).map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-600">{perfNames[p.name] || p.name}</span>
          </div>
          <span className={`font-semibold ${pctColor(p.value)}`}>{p.value > 0 ? "+" : ""}{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────────────────── */

export default function Dashboard() {
  const [tab, setTab] = useState<"all" | "winners" | "losers">("all");

  const filtered = tab === "winners" ? companies.filter((c) => c.current.from_ipo > 0)
    : tab === "losers" ? companies.filter((c) => c.current.from_ipo <= 0) : companies;

  const totalProceeds = companies.reduce((s, c) => s + c.ipo.proceeds_m, 0);
  const totalCap = companies.reduce((s, c) => s + c.current.mcap_b, 0);
  const totalPeak = companies.reduce((s, c) => s + c.private.peak_val_b, 0);
  const destroyed = totalPeak - totalCap;
  const avgReturn = companies.reduce((s, c) => s + c.current.from_ipo, 0) / companies.length;
  const sorted = [...companies].sort((a, b) => a.current.from_ipo - b.current.from_ipo);
  const medianReturn = sorted[Math.floor(sorted.length / 2)].current.from_ipo;

  const ipoReturnBars = [...companies].sort((a, b) => b.current.from_ipo - a.current.from_ipo)
    .map((c) => ({ name: c.ticker, fullName: c.name, value: c.current.from_ipo, color: c.color }));

  const day1Bars = [...companies].sort((a, b) => b.day1.change_pct - a.day1.change_pct)
    .map((c) => ({ name: c.ticker, fullName: c.name, value: c.day1.change_pct, color: c.color }));

  const destructionData = companies.filter((c) => c.private.peak_val_b > c.current.mcap_b)
    .sort((a, b) => (b.private.peak_val_b - b.current.mcap_b) - (a.private.peak_val_b - a.current.mcap_b))
    .map((c) => ({ name: c.ticker, fullName: c.name, peak: c.private.peak_val_b, current: c.current.mcap_b, color: c.color }));

  const sectorMap: Record<string, { val: number; count: number }> = {};
  companies.forEach((c) => {
    if (!sectorMap[c.sector]) sectorMap[c.sector] = { val: 0, count: 0 };
    sectorMap[c.sector].val += c.current.mcap_b;
    sectorMap[c.sector].count += 1;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">2025 IPO Class</h1>
              <p className="text-slate-500 text-sm sm:text-base mt-1">15 VC-backed IPOs · ${(totalProceeds / 1000).toFixed(1)}B raised · Performance as of April 1, 2026</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={14} />
              Sources: Yahoo Finance, Bloomberg, SEC, PortfoliosLab
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Total IPO Proceeds" value={`$${(totalProceeds / 1000).toFixed(1)}B`} sub={`Across ${companies.length} IPOs (May 2025 – Jan 2026)`} icon={<DollarSign size={14} />} />
          <StatCard label="Combined Market Cap" value={`$${fmt(totalCap)}B`} sub={`Peak private: $${fmt(totalPeak)}B`} icon={<Building2 size={14} />} />
          <StatCard label="Avg Return from IPO" value={`${fmt(avgReturn)}%`} sub={`Median: ${fmt(medianReturn)}%`} icon={<TrendingDown size={14} />} accent="text-red-600" />
          <StatCard label="Value Destroyed" value={`$${fmt(destroyed)}B`} sub="From peak private valuations" icon={<AlertTriangle size={14} />} accent="text-red-600" />
        </div>

        {/* SCORECARD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">Best Performer</div>
            <div className="text-xl font-bold text-emerald-800">Circle (CRCL)</div>
            <div className="text-sm text-emerald-700">+198.7% from IPO price</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-xs font-medium text-red-700 uppercase tracking-wide mb-1">Worst Performer</div>
            <div className="text-xl font-bold text-red-800">Gemini (GEMI)</div>
            <div className="text-sm text-red-700">-84.2% from IPO · -92.9% from peak</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Biggest Day 1 Pop</div>
            <div className="text-xl font-bold text-amber-800">Figma (FIG)</div>
            <div className="text-sm text-amber-700">+250% day 1 · Now -82% from close</div>
          </div>
        </div>

        {/* PERFORMANCE CHART */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Cumulative Post-IPO Performance</h2>
          <p className="text-xs text-slate-500 mb-4">Cumulative returns from Day 1 close, computed from PortfoliosLab monthly data. Month 0 = IPO close.</p>
          <div className="h-[300px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={unifiedLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v: any) => `${v}%`} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                {perfTickers.map((t) => (
                  <Line key={t} type="monotone" dataKey={t} stroke={perfColors[t]} strokeWidth={2} dot={false} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {perfTickers.map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-600">
                <div className="w-3 h-1 rounded-full" style={{ backgroundColor: perfColors[t] }} />
                {perfNames[t]}
              </div>
            ))}
          </div>
        </div>

        {/* TWO COLUMN CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Current Return from IPO Price</h2>
            <p className="text-xs text-slate-500 mb-4">Only 3 of {companies.length} companies trade above their IPO price.</p>
            <div className="h-[420px] sm:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ipoReturnBars} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v: any) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#334155", fontWeight: 600 }} width={45} />
                  <ReferenceLine x={0} stroke="#334155" />
                  <Tooltip formatter={(v: any) => [`${v > 0 ? "+" : ""}${v}%`, "Return"]}
                    labelFormatter={(l: any) => ipoReturnBars.find((d) => d.name === l)?.fullName || l} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {ipoReturnBars.map((d, i) => (<Cell key={i} fill={d.value > 0 ? "#10b981" : "#ef4444"} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Day 1 Performance</h2>
            <p className="text-xs text-slate-500 mb-4">% change from IPO price to Day 1 close. {companies.filter((c) => c.day1.change_pct > 0).length} of {companies.length} popped.</p>
            <div className="h-[420px] sm:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={day1Bars} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v: any) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#334155", fontWeight: 600 }} width={45} />
                  <ReferenceLine x={0} stroke="#334155" />
                  <Tooltip formatter={(v: any) => [`${v > 0 ? "+" : ""}${v}%`, "Day 1"]}
                    labelFormatter={(l: any) => day1Bars.find((d) => d.name === l)?.fullName || l} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {day1Bars.map((d, i) => (<Cell key={i} fill={d.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* VALUE DESTRUCTION */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Value Destruction: Peak Private vs Current Market Cap</h2>
          <p className="text-xs text-slate-500 mb-4">${fmt(destroyed)}B in combined value destroyed. Klarna alone lost ${fmt(45.6 - 5.0)}B from its 2021 high.</p>
          <div className="h-[280px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destructionData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v: any) => `$${v}B`} />
                <Tooltip formatter={(v: any, name: any) => [`$${v}B`, name === "peak" ? "Peak Private" : "Current Mkt Cap"]}
                  labelFormatter={(l: any) => destructionData.find((d) => d.name === l)?.fullName || l} />
                <Bar dataKey="peak" name="peak" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" name="current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-300" /> Peak Private Valuation</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500" /> Current Market Cap</div>
          </div>
        </div>

        {/* COMPANY CARDS */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-900">Company Profiles</h2>
            <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
              {(["all", "winners", "losers"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}>
                  {t === "all" ? `All (${companies.length})` : t === "winners" ? `Winners (${companies.filter((c) => c.current.from_ipo > 0).length})` : `Losers (${companies.filter((c) => c.current.from_ipo <= 0).length})`}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => <CompanyCard key={c.id} c={c} />)}
          </div>
        </div>

        {/* INVESTOR SCOREBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-emerald-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Investor Winners</h2>
            </div>
            <div className="space-y-3">
              {investorWinners.map((w, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{w.investor} <span className="text-slate-400 font-normal">· {w.company}</span></div>
                    <div className="text-xs text-slate-600">{w.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Skull size={18} className="text-red-600" />
              <h2 className="text-lg font-bold text-slate-900">Investor Wrecked</h2>
            </div>
            <div className="space-y-3">
              {investorWrecked.sort((a, b) => a.loss - b.loss).map((w, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900">{w.investor} <span className="text-slate-400 font-normal">· {w.company}</span></div>
                      <span className="text-xs font-bold text-red-600 ml-2">{w.loss}%</span>
                    </div>
                    <div className="text-xs text-slate-600">{w.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FULL TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Full Cohort Table</h2>
          <p className="text-xs text-slate-500 mb-4">All {companies.length} IPOs sorted by current return. Prices as of April 1, 2026.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Company</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">IPO Date</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">IPO $</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Day 1</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Current</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">From IPO</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">From Peak</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Mkt Cap</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Raised</th>
                </tr>
              </thead>
              <tbody>
                {[...companies].sort((a, b) => b.current.from_ipo - a.current.from_ipo).map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-semibold text-slate-900">{c.name}</span>
                        <span className="text-slate-400">{c.ticker}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600">{c.ipo.date}</td>
                    <td className="py-2.5 px-2 text-right text-slate-800 font-medium">${c.ipo.price}</td>
                    <td className="py-2.5 px-2 text-right text-slate-800 font-medium">${c.day1.close}</td>
                    <td className="py-2.5 px-2 text-right text-slate-900 font-bold">${fmt(c.current.price, 2)}</td>
                    <td className={`py-2.5 px-2 text-right font-bold ${pctColor(c.current.from_ipo)}`}>
                      {c.current.from_ipo > 0 ? "+" : ""}{fmt(c.current.from_ipo)}%
                    </td>
                    <td className={`py-2.5 px-2 text-right font-bold ${pctColor(c.current.from_peak)}`}>
                      {c.current.from_peak > 0 ? "+" : ""}{fmt(c.current.from_peak)}%
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-800">${fmt(c.current.mcap_b)}B</td>
                    <td className="py-2.5 px-2 text-right text-slate-600">${c.ipo.proceeds_m}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* THEMES */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Key Themes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {themes.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg p-3">
                <span className="text-slate-400 font-bold text-xs mt-0.5">{i + 1}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTOR BREAKDOWN */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Sector Breakdown by Current Market Cap</h2>
          <p className="text-xs text-slate-500 mb-4">Proportional to combined current market capitalization.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(sectorMap).sort(([, a], [, b]) => b.val - a.val).map(([sector, data]) => (
              <div key={sector} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="text-xs text-slate-500">{sector}</div>
                <div className="text-lg font-bold text-slate-900">${fmt(data.val)}B</div>
                <div className="text-xs text-slate-400">{data.count} {data.count === 1 ? "company" : "companies"}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener" className="hover:text-slate-700 transition-colors">Twitter</a>
        {" | "}
        <a href="mailto:t@nyvp.com" className="hover:text-slate-700 transition-colors">t@nyvp.com</a>
      </footer>
    </div>
  );
}
