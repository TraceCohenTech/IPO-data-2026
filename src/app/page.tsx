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
  Building2,
  AlertTriangle,
  Trophy,
  Skull,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowDown,
  ArrowUp,
  Flame,
  Target,
  BarChart3,
  Users,
  Layers,
  Zap,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────
   DATA — merged from JSON dataset + CSV + XLSX monthly returns
   All prices verified against source data. Current as of Apr 1, 2026.
   ───────────────────────────────────────────────────────────────── */

const companies = [
  {
    id: "etoro", name: "eToro", ticker: "ETOR", exchange: "NASDAQ",
    sector: "Fintech", founded: 2007, hq: "Tel Aviv, Israel", color: "#10b981",
    ipo: { date: "2025-05-14", price: 52.0, proceeds_m: 620, valuation_b: 4.2, above_range: true },
    day1: { open: 69.69, close: 67.0, change_pct: 28.8, market_cap_b: 5.64 },
    private: { raised_m: 612.5, peak_val_b: 3.5, notable: ["SoftBank Vision Fund 2", "Pitango VC", "Spark Capital"] },
    current: { price: 29.03, mcap_b: 2.4, from_ipo: -44.2, from_day1: -56.7, from_peak: -31.4, hi52: 79.96, lo52: 24.74 },
    narrative: "Social trading platform had a strong debut (+29%) fueled by crypto exposure and retail investor interest. Proved highly cyclical — trading at ~$29, well below $52 IPO price.",
  },
  {
    id: "hinge", name: "Hinge Health", ticker: "HNGE", exchange: "NYSE",
    sector: "Digital Health", founded: 2014, hq: "San Francisco, CA", color: "#14b8a6",
    ipo: { date: "2025-05-22", price: 32.0, proceeds_m: 437.3, valuation_b: 3.0, above_range: true },
    day1: { open: 39.25, close: 36.5, change_pct: 14.1, market_cap_b: 3.65 },
    private: { raised_m: 827.6, peak_val_b: 6.2, notable: ["Coatue", "Tiger Global", "Insight Partners", "Atomico"] },
    current: { price: 35.73, mcap_b: 3.57, from_ipo: 11.7, from_day1: -2.1, from_peak: -42.4, hi52: 54.5, lo52: 24.7 },
    narrative: "Digital MSK therapy platform. IPO'd at steep discount to $6.2B peak. One of four companies still trading above IPO price despite volatile monthly swings.",
  },
  {
    id: "mntn", name: "MNTN", ticker: "MNTN", exchange: "NASDAQ",
    sector: "AdTech / CTV", founded: 2018, hq: "Los Angeles, CA", color: "#f43f5e",
    ipo: { date: "2025-05-22", price: 16.0, proceeds_m: 187.2, valuation_b: 1.24, above_range: true },
    day1: { open: 21.0, close: 19.5, change_pct: 21.9, market_cap_b: 1.62 },
    private: { raised_m: 190.3, peak_val_b: 2.0, notable: ["Fidelity", "CPMG", "Blackstone Growth"] },
    current: { price: 6.57, mcap_b: 0.55, from_ipo: -58.9, from_day1: -66.3, from_peak: -72.5, hi52: 21.0, lo52: 4.5 },
    narrative: "CTV advertising platform. Steady decline as ad market softened and AI-driven ad platforms gained share. Down -59% from $16 IPO price.",
  },
  {
    id: "circle", name: "Circle", ticker: "CRCL", exchange: "NYSE",
    sector: "Crypto / Stablecoin", founded: 2013, hq: "New York, NY", color: "#22c55e",
    ipo: { date: "2025-06-05", price: 31.0, proceeds_m: 1100, valuation_b: 18.5, above_range: true },
    day1: { open: 75.0, close: 79.0, change_pct: 155.0, market_cap_b: 18.5 },
    private: { raised_m: 1200, peak_val_b: 9.0, notable: ["Accel", "General Catalyst", "Goldman Sachs", "BlackRock"] },
    current: { price: 92.61, mcap_b: 22.9, from_ipo: 198.7, from_day1: 17.2, from_peak: 154.4, hi52: 298.99, lo52: 31.0 },
    narrative: "The standout winner. USDC stablecoin adoption accelerated with favorable US crypto regulation. +199% from IPO and the only company trading above its peak private valuation.",
  },
  {
    id: "omada", name: "Omada Health", ticker: "OMDA", exchange: "NYSE",
    sector: "Digital Health", founded: 2011, hq: "San Francisco, CA", color: "#0d9488",
    ipo: { date: "2025-06-06", price: 19.0, proceeds_m: 150, valuation_b: 1.1, above_range: false },
    day1: { open: 23.0, close: 21.5, change_pct: 13.2, market_cap_b: 1.28 },
    private: { raised_m: 256, peak_val_b: 1.0, notable: ["Andreessen Horowitz", "Cigna Ventures", "US Venture Partners"] },
    current: { price: 11.78, mcap_b: 0.70, from_ipo: -38.0, from_day1: -45.2, from_peak: -30.0, hi52: 23.0, lo52: 8.5 },
    narrative: "Chronic condition management platform. Small IPO. Digital health sector fell out of favor as payers tightened budgets post-pandemic.",
  },
  {
    id: "chime", name: "Chime", ticker: "CHYM", exchange: "NASDAQ",
    sector: "Consumer Fintech", founded: 2012, hq: "San Francisco, CA", color: "#3b82f6",
    ipo: { date: "2025-06-12", price: 27.0, proceeds_m: 864, valuation_b: 11.6, above_range: true },
    day1: { open: 43.0, close: 37.11, change_pct: 37.4, market_cap_b: 18.4 },
    private: { raised_m: 2650, peak_val_b: 25.0, notable: ["Sequoia", "SoftBank", "Tiger Global", "Coatue", "DST Global"] },
    current: { price: 18.85, mcap_b: 6.9, from_ipo: -30.2, from_day1: -49.2, from_peak: -72.4, hi52: 44.94, lo52: 16.17 },
    narrative: "Landmark neobank IPO. Peak $25B (2021) vs current $6.9B = 72% destruction for peak investors. Early VCs like Sequoia remain profitable.",
  },
  {
    id: "figma", name: "Figma", ticker: "FIG", exchange: "NYSE",
    sector: "Design Software", founded: 2012, hq: "San Francisco, CA", color: "#ec4899",
    ipo: { date: "2025-07-31", price: 33.0, proceeds_m: 1100, valuation_b: 18.8, above_range: true },
    day1: { open: 100.0, close: 115.5, change_pct: 250.0, market_cap_b: 47.9 },
    private: { raised_m: 333, peak_val_b: 20.0, notable: ["Sequoia", "Index Ventures", "Greylock", "Kleiner Perkins", "a16z"] },
    current: { price: 21.14, mcap_b: 11.0, from_ipo: -35.9, from_day1: -81.7, from_peak: -45.0, hi52: 142.92, lo52: 19.82 },
    narrative: "Most dramatic IPO pop (+250% day 1). 40x oversubscribed, tiny float created artificial scarcity. Lock-up expiry in Jan 2026 triggered insider flood. Now $21 vs $115 day-1 close — worst outcome for day-1 buyers.",
  },
  {
    id: "klarna", name: "Klarna", ticker: "KLAR", exchange: "NYSE",
    sector: "BNPL / Fintech", founded: 2005, hq: "London, UK", color: "#f59e0b",
    ipo: { date: "2025-09-10", price: 40.0, proceeds_m: 1370, valuation_b: 15.1, above_range: true },
    day1: { open: 52.0, close: 45.82, change_pct: 14.6, market_cap_b: 19.65 },
    private: { raised_m: 4700, peak_val_b: 45.6, notable: ["Sequoia", "SoftBank Vision Fund 2", "Silver Lake", "BlackRock", "Atomico"] },
    current: { price: 13.28, mcap_b: 5.0, from_ipo: -66.8, from_day1: -71.0, from_peak: -89.0, hi52: 57.2, lo52: 12.06 },
    narrative: "Europe's most storied fintech. SoftBank's $639M at $45.6B is the worst VC bet in the cohort at -89%. Sequoia is the biggest winner — $500M invested, $2.65B+ return.",
  },
  {
    id: "figure", name: "Figure Tech", ticker: "FIGR", exchange: "NASDAQ",
    sector: "Blockchain Fintech", founded: 2018, hq: "Reno, NV", color: "#f97316",
    ipo: { date: "2025-09-11", price: 25.0, proceeds_m: 787.5, valuation_b: 5.3, above_range: true },
    day1: { open: 36.0, close: 31.11, change_pct: 24.4, market_cap_b: 7.62 },
    private: { raised_m: 400, peak_val_b: 3.2, notable: ["Apollo Global", "Ribbit Capital"] },
    current: { price: 33.56, mcap_b: 7.2, from_ipo: 34.2, from_day1: 7.9, from_peak: 125.0, hi52: 78.0, lo52: 25.01 },
    narrative: "One of four companies above IPO price. Profitable (26% net margin) and growing. Founded by SoFi co-founder Mike Cagney. Druckenmiller cornerstoned $50M at IPO.",
  },
  {
    id: "gemini", name: "Gemini", ticker: "GEMI", exchange: "NASDAQ",
    sector: "Crypto Exchange", founded: 2014, hq: "New York, NY", color: "#475569",
    ipo: { date: "2025-09-12", price: 28.0, proceeds_m: 425, valuation_b: 3.3, above_range: true },
    day1: { open: 37.01, close: 32.0, change_pct: 14.3, market_cap_b: 4.4 },
    private: { raised_m: 424, peak_val_b: 7.0, notable: ["Winklevoss Twins (founders)", "Cleo Capital"] },
    current: { price: 4.43, mcap_b: 0.5, from_ipo: -84.2, from_day1: -86.2, from_peak: -92.9, hi52: 45.89, lo52: 3.91 },
    narrative: "Worst post-IPO collapse. Three execs resigned simultaneously in Feb, 25% layoffs, Q4 earnings miss, and securities fraud class actions. $7B peak now $0.5B.",
  },
  {
    id: "via", name: "Via Transportation", ticker: "VIA", exchange: "NYSE",
    sector: "Transit Tech / GovTech", founded: 2012, hq: "New York, NY", color: "#a78bfa",
    ipo: { date: "2025-09-12", price: 46.0, proceeds_m: 493, valuation_b: 3.65, above_range: true },
    day1: { open: 44.0, close: 49.0, change_pct: 6.5, market_cap_b: 3.9 },
    private: { raised_m: 887, peak_val_b: 3.5, notable: ["Pitango VC", "83North", "Wellington Management"] },
    current: { price: 13.5, mcap_b: 1.1, from_ipo: -70.7, from_day1: -72.5, from_peak: -68.6, hi52: 56.31, lo52: 13.11 },
    narrative: "Transit tech for 800+ cities in 30+ countries. Waymo partnership created brief excitement. Bleecker Street short report in Dec was the crash catalyst. All 8 analysts have Strong Buy with $47 target.",
  },
  {
    id: "stubhub", name: "StubHub", ticker: "STUB", exchange: "NYSE",
    sector: "Marketplace / Events", founded: 2000, hq: "San Francisco, CA", color: "#ef4444",
    ipo: { date: "2025-09-17", price: 23.5, proceeds_m: 800, valuation_b: 8.6, above_range: false },
    day1: { open: 25.35, close: 22.0, change_pct: -6.4, market_cap_b: 7.5 },
    private: { raised_m: 4050, peak_val_b: 16.5, notable: ["Madrone Capital (Walton family)", "WestCap", "Bessemer VP"] },
    current: { price: 6.06, mcap_b: 2.2, from_ipo: -74.2, from_day1: -72.5, from_peak: -86.7, hi52: 27.89, lo52: 6.02 },
    narrative: "One of two companies to close below IPO price on day 1 — a bad omen that proved prescient. $2.85B in debt at 9% interest is the anchor. Walton family (Madrone Capital) is the most prominent loser.",
  },
  {
    id: "netskope", name: "Netskope", ticker: "NTSK", exchange: "NASDAQ",
    sector: "Cybersecurity", founded: 2012, hq: "Santa Clara, CA", color: "#0ea5e9",
    ipo: { date: "2025-09-18", price: 19.0, proceeds_m: 908, valuation_b: 7.3, above_range: true },
    day1: { open: 23.0, close: 22.49, change_pct: 18.4, market_cap_b: 8.79 },
    private: { raised_m: 1400, peak_val_b: 7.5, notable: ["ICONIQ Growth", "Lightspeed VP", "Accel", "Sequoia", "Canada Pension Plan"] },
    current: { price: 8.44, mcap_b: 2.8, from_ipo: -55.6, from_day1: -62.5, from_peak: -62.7, hi52: 27.99, lo52: 7.67 },
    narrative: "Cleanest IPO deal — priced essentially flat to $7.5B last private round. AI disruption fears (Claude Code Security launch) triggered sector-wide cybersecurity rout. $811M ARR growing 31%.",
  },
  {
    id: "navan", name: "Navan", ticker: "NAVN", exchange: "NASDAQ",
    sector: "Travel & Expense SaaS", founded: 2015, hq: "Palo Alto, CA", color: "#06b6d4",
    ipo: { date: "2025-10-30", price: 25.0, proceeds_m: 923, valuation_b: 6.2, above_range: false },
    day1: { open: 22.0, close: 20.0, change_pct: -20.0, market_cap_b: 6.7 },
    private: { raised_m: 2200, peak_val_b: 9.2, notable: ["Lightspeed VP", "Zeev Ventures", "a16z", "Coatue", "Greenoaks"] },
    current: { price: 12.83, mcap_b: 3.2, from_ipo: -48.7, from_day1: -35.9, from_peak: -65.2, hi52: 25.0, lo52: 8.11 },
    narrative: "Formerly TripActions. Opened AND closed below IPO price on day 1. B2B SaaS getting no love despite $800M ARR, 29% growth. Goldman Sachs named in Mar 2026 securities class action.",
  },
  {
    id: "equipmentshare", name: "EquipmentShare", ticker: "EQPT", exchange: "NYSE",
    sector: "Construction Tech", founded: 2014, hq: "Columbia, MO", color: "#eab308",
    ipo: { date: "2026-01-23", price: 24.5, proceeds_m: 747.3, valuation_b: 6.2, above_range: true },
    day1: { open: 28.5, close: 27.2, change_pct: 11.0, market_cap_b: 7.16 },
    private: { raised_m: 650, peak_val_b: 4.07, notable: ["Insight Partners", "Y Combinator", "General Catalyst"] },
    current: { price: 26.38, mcap_b: 6.95, from_ipo: 7.7, from_day1: -3.0, from_peak: 70.8, hi52: 32.0, lo52: 22.0 },
    narrative: "Construction equipment tech platform. IPO'd well above peak private valuation. Rose 16.3% on debut. Steady performer in the cohort.",
  },
];

/* ─── Cumulative performance data ─────────────────────────────── */
/* Sources: XLSX (PortfoliosLab monthly) for tickers with monthly data,
   JSON dataset cumulative returns for Via/StubHub/Netskope/Navan */

// From XLSX: month-over-month returns → we compute cumulative
const monthlyMoM: Record<string, number[]> = {
  ETOR: [0,-11.6,12.5,-10,-26,-7,-10.2,13.3,-16.3,-16.3,4.3,-2.1,-0.1],
  HNGE: [0,3.4,33.2,-13.1,24.8,-12.5,1.4,-1.7,-5,-24.9,22.5,-14],
  MNTN: [0,-4.3,-13.3,28.8,-27.5,-9.1,-10.6,-17.7,-12.5,-23,6.1,-9.8,1],
  CRCL: [0,484.8,1.2,-28.1,0.5,-4.2,-37.1,-0.8,-19.4,30.5,14.4,-4.9],
  OMDA: [0,-20.4,-4.3,35.2,-6.7,11.1,-23.8,-15.8,-5.3,-17.9,2.4,0.3],
  CHYM: [0,-7,-0.3,-23.3,-23.6,-14.9,23.1,19.1,1,-12.9,-15.4,-0.5],
  FIG:  [0,-39.2,-26.2,-3.9,-27.8,3.9,-30.6,13.4,-28.1,-3.4],
  KLAR: [0,-20,2.5,-16.2,-8.1,-20.2,-41.2,-3.5,1.5],
  FIGR: [0,16.9,8.9,-8.5,12.7,39.3,-55.6,34.3,-3.1],
  GEMI: [0,-25.1,-23.4,-40.1,-9.8,-15.9,-27.7,-0.3],
  EQPT: [0,3.5,-8.2,2.1],
};

// From JSON: already cumulative % returns from day1 close
const jsonCumulative: Record<string, number[]> = {
  VIA:  [0, 10, 15, -5, -25, -55, -68, -72],
  STUB: [0, -8, -22, -36, -50, -58, -65, -73],
  NTSK: [0, 3, -10, -20, -35, -50, -55, -62],
  NAVN: [0, -12, -30, -42, -40, -43, -36],
};

function buildCumFromMoM(arr: number[]): number[] {
  const cum: number[] = [0];
  let v = 100;
  for (let i = 1; i < arr.length; i++) {
    v = v * (1 + arr[i] / 100);
    cum.push(Math.round((v - 100) * 10) / 10);
  }
  return cum;
}

const allTickers = ["ETOR","HNGE","MNTN","CRCL","OMDA","CHYM","FIG","KLAR","FIGR","GEMI","VIA","STUB","NTSK","NAVN","EQPT"];
const perfColors: Record<string, string> = {
  ETOR: "#10b981", HNGE: "#14b8a6", MNTN: "#f43f5e", CRCL: "#22c55e",
  OMDA: "#0d9488", CHYM: "#3b82f6", FIG: "#ec4899", KLAR: "#f59e0b",
  FIGR: "#f97316", GEMI: "#475569", VIA: "#a78bfa", STUB: "#ef4444",
  NTSK: "#0ea5e9", NAVN: "#06b6d4", EQPT: "#eab308",
};
const perfNames: Record<string, string> = {
  ETOR: "eToro", HNGE: "Hinge", MNTN: "MNTN", CRCL: "Circle",
  OMDA: "Omada", CHYM: "Chime", FIG: "Figma", KLAR: "Klarna",
  FIGR: "Figure", GEMI: "Gemini", VIA: "Via", STUB: "StubHub",
  NTSK: "Netskope", NAMN: "Navan", NAVN: "Navan", EQPT: "EqShare",
};

const cumulativeData: Record<string, number[]> = {};
Object.entries(monthlyMoM).forEach(([t, arr]) => { cumulativeData[t] = buildCumFromMoM(arr); });
Object.entries(jsonCumulative).forEach(([t, arr]) => { cumulativeData[t] = arr; });

const maxMonths = Math.max(...allTickers.map((t) => (cumulativeData[t] || []).length));
const monthIdxLabels = Array.from({ length: maxMonths }, (_, i) => `M${i}`);

const unifiedLineData = monthIdxLabels.map((label, i) => {
  const point: Record<string, string | number | null> = { month: label };
  allTickers.forEach((t) => {
    const cum = cumulativeData[t] || [];
    point[t] = i < cum.length ? cum[i] : null;
  });
  return point;
});

const investorWinners = [
  { investor: "Sequoia Capital", company: "Klarna", notes: "$500M in, $2.65B+ out. Best VC return in cohort." },
  { investor: "Accel", company: "Circle", notes: "Early CRCL backer. Circle +199% from IPO." },
  { investor: "Sequoia Capital", company: "Figma", notes: "Early backer. $11B mkt cap vs sub-$100M entry." },
  { investor: "General Catalyst", company: "Circle", notes: "Growth stage entry. Current $22.9B vs ~$1B entry." },
  { investor: "Zeev Ventures", company: "Navan", notes: "Seed-stage. Still profitable from cost basis." },
  { investor: "Michael Cagney", company: "Figure Tech", notes: "Founder return. FIGR +34% from IPO." },
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
  { text: "Lock-up expiry (months 6-12) was destructive for nearly all companies", detail: "Insider selling floods post-lock-up crushed prices. Figma lost 74% after its January 2026 lock-up expired." },
  { text: "AI disruption fears hit cybersecurity stocks hard", detail: "Anthropic's Claude Code Security launch in Feb 2026 triggered a sector-wide cybersecurity selloff, hammering Netskope." },
  { text: "Crypto cycle drove Circle's outperformance and Gemini's collapse", detail: "Favorable US regulation under Trump admin boosted USDC adoption (Circle), while exchange competition crushed Gemini." },
  { text: "B2B non-AI SaaS unloved despite strong fundamentals", detail: "Navan ($800M ARR, 29% growth) and Via ($434M revenue, 29% growth) trade at steep discounts despite healthy metrics." },
  { text: "Figma's 250% day-1 pop was a trap for retail buyers", detail: "40x oversubscription and tiny ~10% float created artificial scarcity. Bill Gurley criticized intentional underpricing as leaving $2.6B on the table." },
  { text: "Consumer fintech fell sharply as rates stayed high", detail: "Chime, Klarna, and eToro all declined 30-67% from IPO price as high interest rates pressured consumer lending models." },
  { text: "Peak 2021 private valuations created unavoidable down-rounds", detail: "Combined peak private valuations of $161B across the cohort vs $74B current market cap — $87B in value destroyed." },
  { text: "Securities class actions filed against 3 companies", detail: "Gemini (fraud), Navan (IPO concealment), and Via all face active securities class action lawsuits as of March 2026." },
  { text: "Digital health struggled post-pandemic", detail: "Hinge Health and Omada Health IPO'd at steep discounts to peak valuations as payer enthusiasm for virtual care cooled." },
  { text: "Only 4 of 15 companies trade above IPO price", detail: "Circle (+199%), Figure Tech (+34%), Hinge Health (+12%), and EquipmentShare (+8%) are the only winners. The other 11 are underwater." },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

function fmt(n: number | null | undefined, d = 1): string {
  if (n == null) return "N/A";
  return n.toFixed(d);
}

function pctColor(pct: number | null | undefined): string {
  if (pct == null) return "text-slate-600";
  return pct > 0 ? "text-emerald-600" : pct < 0 ? "text-red-600" : "text-slate-700";
}

function pctBadge(pct: number): React.ReactNode {
  const isUp = pct > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${isUp ? "text-emerald-600" : "text-red-600"}`}>
      {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {isUp ? "+" : ""}{fmt(pct)}%
    </span>
  );
}

/* ─── TOOLTIP COMPONENT ───────────────────────────────────────── */

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1 cursor-help">
      <Info size={12} className="text-slate-500 group-hover:text-slate-800 transition-colors" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl leading-relaxed">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </span>
    </span>
  );
}

/* ─── COMPONENTS ──────────────────────────────────────────────── */

function StatCard({ label, value, sub, icon, accent = "text-slate-900", tip }: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accent?: string; tip?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-5 flex flex-col gap-1 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-1.5 text-slate-600 text-[10px] sm:text-xs font-medium uppercase tracking-wide">
        {icon}{label}{tip && <InfoTip text={tip} />}
      </div>
      <div className={`text-xl sm:text-3xl font-bold tracking-tight ${accent}`}>{value}</div>
      {sub && <div className="text-[10px] sm:text-xs text-slate-600">{sub}</div>}
    </div>
  );
}

function CompanyCard({ c }: { c: typeof companies[0] }) {
  const [open, setOpen] = useState(false);
  const isWinner = c.current.from_ipo > 0;
  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${isWinner ? "border-emerald-200" : "border-slate-200"}`}>
      <div className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{c.name}</h3>
              <span className="text-[10px] sm:text-xs text-slate-600">{c.ticker} · {c.exchange} · {c.sector}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-base sm:text-lg font-bold text-slate-900">${fmt(c.current.price, 2)}</div>
            {pctBadge(c.current.from_ipo)}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center mb-3">
          <div className="bg-slate-50 rounded-lg p-1.5 sm:p-2">
            <div className="text-[9px] sm:text-[10px] text-slate-600 uppercase">IPO Price</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800">${c.ipo.price}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-1.5 sm:p-2">
            <div className="text-[9px] sm:text-[10px] text-slate-600 uppercase">Day 1 Close</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800">${c.day1.close}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-1.5 sm:p-2">
            <div className="text-[9px] sm:text-[10px] text-slate-600 uppercase">Mkt Cap</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-800">${fmt(c.current.mcap_b)}B</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Day 1 Pop</span>
            <span className={`font-semibold ${pctColor(c.day1.change_pct)}`}>{c.day1.change_pct > 0 ? "+" : ""}{fmt(c.day1.change_pct)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">From Day 1</span>
            <span className={`font-semibold ${pctColor(c.current.from_day1)}`}>{c.current.from_day1 > 0 ? "+" : ""}{fmt(c.current.from_day1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">From Peak Private</span>
            <span className={`font-semibold ${pctColor(c.current.from_peak)}`}>{c.current.from_peak > 0 ? "+" : ""}{fmt(c.current.from_peak)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">IPO Valuation</span>
            <span className="font-semibold text-slate-800">${fmt(c.ipo.valuation_b)}B</span>
          </div>
        </div>
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-center gap-1 text-xs text-slate-600 font-medium hover:text-slate-900 transition-colors py-1 min-h-[44px]">
          {open ? "Less" : "More details"} {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 p-3 sm:p-5 bg-slate-50 space-y-3">
          <p className="text-xs text-slate-700 leading-relaxed">{c.narrative}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-slate-600">Founded:</span> <span className="text-slate-900 font-medium">{c.founded}</span></div>
            <div><span className="text-slate-600">HQ:</span> <span className="text-slate-900 font-medium">{c.hq}</span></div>
            <div><span className="text-slate-600">IPO Proceeds:</span> <span className="text-slate-900 font-medium">${c.ipo.proceeds_m}M</span></div>
            <div><span className="text-slate-600">Total Raised:</span> <span className="text-slate-900 font-medium">${c.private.raised_m}M</span></div>
            <div><span className="text-slate-600">Peak Private:</span> <span className="text-slate-900 font-medium">${fmt(c.private.peak_val_b)}B</span></div>
            <div><span className="text-slate-600">52w Range:</span> <span className="text-slate-900 font-medium">${fmt(c.current.lo52, 2)} – ${fmt(c.current.hi52, 2)}</span></div>
          </div>
          {c.private.notable && (
            <div>
              <div className="text-[10px] text-slate-600 font-semibold uppercase mb-1">Key Investors</div>
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
  const filtered = payload.filter((p) => p.value != null).sort((a, b) => b.value - a.value);
  if (filtered.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xl text-xs max-w-[220px]">
      <div className="font-semibold text-slate-900 mb-1.5">{label}</div>
      <div className="space-y-0.5">
        {filtered.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-slate-800">{perfNames[p.name] || p.name}</span>
            </div>
            <span className={`font-semibold ${pctColor(p.value)}`}>{p.value > 0 ? "+" : ""}{p.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────────────────── */

export default function Dashboard() {
  const [tab, setTab] = useState<"all" | "winners" | "losers">("all");
  const [hoveredTheme, setHoveredTheme] = useState<number | null>(null);

  const filtered = tab === "winners" ? companies.filter((c) => c.current.from_ipo > 0)
    : tab === "losers" ? companies.filter((c) => c.current.from_ipo <= 0) : companies;

  const winnersCount = companies.filter((c) => c.current.from_ipo > 0).length;
  const losersCount = companies.filter((c) => c.current.from_ipo <= 0).length;
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

  const sectorMap: Record<string, { val: number; count: number; names: string[] }> = {};
  companies.forEach((c) => {
    if (!sectorMap[c.sector]) sectorMap[c.sector] = { val: 0, count: 0, names: [] };
    sectorMap[c.sector].val += c.current.mcap_b;
    sectorMap[c.sector].count += 1;
    sectorMap[c.sector].names.push(c.ticker);
  });

  const bestPerformer = [...companies].sort((a, b) => b.current.from_ipo - a.current.from_ipo)[0];
  const worstPerformer = [...companies].sort((a, b) => a.current.from_ipo - b.current.from_ipo)[0];
  const biggestDay1 = [...companies].sort((a, b) => b.day1.change_pct - a.day1.change_pct)[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── HERO ─── */}
      <header className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-500/20 text-red-400 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">Live Data</span>
                <span className="text-slate-400 text-[10px] sm:text-xs flex items-center gap-1.5"><Calendar size={12} /> Updated April 1, 2026</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                2025 IPO Class
              </h1>
              <p className="text-slate-400 text-sm sm:text-lg mt-2 max-w-2xl leading-relaxed">
                {companies.length} VC-backed companies went public between May 2025 and January 2026, raising ${(totalProceeds / 1000).toFixed(1)}B.
                Only {winnersCount} trade above their IPO price today.
              </p>
            </div>

            {/* Hero mini-stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">IPOs Tracked</div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{companies.length}</div>
                <div className="text-[10px] sm:text-xs text-slate-500">May &apos;25 – Jan &apos;26</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Total Raised</div>
                <div className="text-2xl sm:text-3xl font-bold text-white">${(totalProceeds / 1000).toFixed(1)}B</div>
                <div className="text-[10px] sm:text-xs text-slate-500">Combined proceeds</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="text-[10px] sm:text-xs text-red-400 uppercase tracking-wide">Avg Return</div>
                <div className="text-2xl sm:text-3xl font-bold text-red-400">{fmt(avgReturn)}%</div>
                <div className="text-[10px] sm:text-xs text-slate-500">From IPO price</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
                <div className="text-[10px] sm:text-xs text-emerald-400 uppercase tracking-wide">Winners</div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{winnersCount}</div>
                <div className="text-[10px] sm:text-xs text-slate-500">Above IPO price</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <StatCard
            label="Combined Mkt Cap"
            value={`$${fmt(totalCap)}B`}
            sub={`Peak private: $${fmt(totalPeak)}B`}
            icon={<Building2 size={14} />}
            tip="Sum of current market capitalization across all 15 companies in the cohort"
          />
          <StatCard
            label="Median Return"
            value={`${fmt(medianReturn)}%`}
            sub={`Avg: ${fmt(avgReturn)}%`}
            icon={<TrendingDown size={14} />}
            accent="text-red-600"
            tip="Median is more representative than average — Circle's +199% skews the mean upward"
          />
          <StatCard
            label="Value Destroyed"
            value={`$${fmt(destroyed)}B`}
            sub="From peak private valuations"
            icon={<AlertTriangle size={14} />}
            accent="text-red-600"
            tip="Difference between combined peak private valuations and current public market caps"
          />
          <StatCard
            label="Day 1 Broke IPO"
            value="2"
            sub="StubHub & Navan"
            icon={<Target size={14} />}
            accent="text-red-600"
            tip="Companies that closed below their IPO offer price on their first day of trading — historically a bearish signal"
          />
        </div>

        {/* SCORECARD */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">
              <Trophy size={14} /> Best Performer
            </div>
            <div className="text-xl font-bold text-emerald-800">{bestPerformer.name} ({bestPerformer.ticker})</div>
            <div className="text-sm text-emerald-700">+{fmt(bestPerformer.current.from_ipo)}% from IPO price</div>
            <div className="text-xs text-emerald-600 mt-1">Only company above peak private valuation</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 uppercase tracking-wide mb-1">
              <Flame size={14} /> Worst Performer
            </div>
            <div className="text-xl font-bold text-red-800">{worstPerformer.name} ({worstPerformer.ticker})</div>
            <div className="text-sm text-red-700">{fmt(worstPerformer.current.from_ipo)}% from IPO · {fmt(worstPerformer.current.from_peak)}% from peak</div>
            <div className="text-xs text-red-600 mt-1">Securities fraud class action filed</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">
              <Zap size={14} /> Biggest Day 1 Pop
            </div>
            <div className="text-xl font-bold text-amber-800">{biggestDay1.name} ({biggestDay1.ticker})</div>
            <div className="text-sm text-amber-700">+{fmt(biggestDay1.day1.change_pct)}% day 1 · Now {fmt(biggestDay1.current.from_day1)}% from close</div>
            <div className="text-xs text-amber-600 mt-1">40x oversubscribed, lock-up expiry crushed it</div>
          </div>
        </div>

        {/* PERFORMANCE CHART */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <BarChart3 size={18} className="text-slate-500" />
              Cumulative Post-IPO Performance
            </h2>
          </div>
          <p className="text-xs text-slate-700 mb-4">
            Tracks total return from each company&apos;s Day 1 closing price. Month 0 = IPO day close. Circle&apos;s 485% M1 spike driven by USDC regulatory tailwind.
            <InfoTip text="Monthly returns sourced from PortfoliosLab for most companies. Via, StubHub, Netskope, and Navan use cumulative data from the JSON dataset." />
          </p>
          <div className="h-[280px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={unifiedLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#334155" }} />
                <YAxis tick={{ fontSize: 10, fill: "#334155" }} tickFormatter={(v: any) => `${v}%`} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 3" />
                {allTickers.map((t) => (
                  <Line key={t} type="monotone" dataKey={t} stroke={perfColors[t]} strokeWidth={1.8} dot={false} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
            {allTickers.map((t) => (
              <div key={t} className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-800 font-medium">
                <div className="w-3 h-1 rounded-full" style={{ backgroundColor: perfColors[t] }} />
                {perfNames[t]}
              </div>
            ))}
          </div>
        </div>

        {/* TWO COLUMN CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Current Return from IPO Price</h2>
            <p className="text-xs text-slate-700 mb-4">
              {winnersCount} of {companies.length} trade above IPO price.
              <InfoTip text="Calculated as (current price - IPO offer price) / IPO offer price. Measures returns for investors who bought at the institutional offer price." />
            </p>
            <div className="h-[400px] sm:h-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ipoReturnBars} layout="vertical" margin={{ left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#334155" }} tickFormatter={(v: any) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#334155", fontWeight: 600 }} width={40} />
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

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Day 1 Performance</h2>
            <p className="text-xs text-slate-700 mb-4">
              % change from IPO price to Day 1 close.
              <InfoTip text="A big Day 1 'pop' means the IPO was underpriced — banks left money on the table. Figma's 250% pop was extreme; Bill Gurley estimated $2.6B in underpricing." />
            </p>
            <div className="h-[400px] sm:h-[520px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={day1Bars} layout="vertical" margin={{ left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#334155" }} tickFormatter={(v: any) => `${v}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#334155", fontWeight: 600 }} width={40} />
                  <ReferenceLine x={0} stroke="#334155" />
                  <Tooltip formatter={(v: any) => [`${v > 0 ? "+" : ""}${v}%`, "Day 1"]}
                    labelFormatter={(l: any) => day1Bars.find((d) => d.name === l)?.fullName || l} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {day1Bars.map((d, i) => (<Cell key={i} fill={d.value > 0 ? d.color : "#ef4444"} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* VALUE DESTRUCTION */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Value Destruction: Peak Private vs Current Market Cap</h2>
          <p className="text-xs text-slate-700 mb-4">
            ${fmt(destroyed)}B in combined value destroyed from peak private valuations. Klarna alone lost ${fmt(45.6 - 5.0)}B from its 2021 high.
            <InfoTip text="Peak private valuation is the highest valuation achieved during private fundraising rounds. Most peaks were in 2021 during the zero-interest-rate era." />
          </p>
          <div className="h-[260px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destructionData} margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#334155" }} interval={0} angle={-45} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: "#334155" }} tickFormatter={(v: any) => `$${v}B`} />
                <Tooltip formatter={(v: any, name: any) => [`$${v}B`, name === "peak" ? "Peak Private" : "Current Mkt Cap"]}
                  labelFormatter={(l: any) => destructionData.find((d) => d.name === l)?.fullName || l} />
                <Bar dataKey="peak" name="peak" fill="#1e293b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" name="current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-800 font-medium">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-900" /> Peak Private Valuation</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500" /> Current Market Cap</div>
          </div>
        </div>

        {/* COMPANY CARDS */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
              <Layers size={18} className="text-slate-500" />
              Company Profiles
            </h2>
            <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
              {(["all", "winners", "losers"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[36px] ${tab === t ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
                  {t === "all" ? `All (${companies.length})` : t === "winners" ? `Winners (${winnersCount})` : `Losers (${losersCount})`}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((c) => <CompanyCard key={c.id} c={c} />)}
          </div>
        </div>

        {/* INVESTOR SCOREBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-emerald-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Investor Winners</h2>
              <InfoTip text="Investors who achieved strong returns based on their entry valuation vs current public market value" />
            </div>
            <div className="space-y-3">
              {investorWinners.map((w, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{w.investor} <span className="text-slate-500 font-normal">· {w.company}</span></div>
                    <div className="text-xs text-slate-700">{w.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Skull size={18} className="text-red-600" />
              <h2 className="text-lg font-bold text-slate-900">Investor Wrecked</h2>
              <InfoTip text="Investors who entered at or near peak private valuations and are now deeply underwater at current public prices" />
            </div>
            <div className="space-y-3">
              {[...investorWrecked].sort((a, b) => a.loss - b.loss).map((w, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-900">{w.investor} <span className="text-slate-500 font-normal">· {w.company}</span></div>
                      <span className="text-xs font-bold text-red-600 flex-shrink-0">{w.loss}%</span>
                    </div>
                    <div className="text-xs text-slate-700">{w.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FULL TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Full Cohort Table</h2>
          <p className="text-xs text-slate-700 mb-4">All {companies.length} IPOs sorted by current return from IPO price. Prices as of April 1, 2026.</p>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-2.5 px-2 sm:px-3 text-slate-700 font-semibold">Company</th>
                  <th className="text-right py-2.5 px-2 text-slate-700 font-semibold">IPO Date</th>
                  <th className="text-right py-2.5 px-2 text-slate-700 font-semibold">IPO $</th>
                  <th className="text-right py-2.5 px-2 text-slate-700 font-semibold">Day 1</th>
                  <th className="text-right py-2.5 px-2 text-slate-700 font-semibold">Current</th>
                  <th className="text-right py-2.5 px-2 text-slate-700 font-semibold">From IPO</th>
                  <th className="text-right py-2.5 px-2 text-slate-700 font-semibold">From Peak</th>
                  <th className="text-right py-2.5 px-2 text-slate-700 font-semibold">Mkt Cap</th>
                  <th className="text-right py-2.5 px-2 text-slate-700 font-semibold">Raised</th>
                </tr>
              </thead>
              <tbody>
                {[...companies].sort((a, b) => b.current.from_ipo - a.current.from_ipo).map((c) => (
                  <tr key={c.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${c.current.from_ipo > 0 ? "bg-emerald-50/30" : ""}`}>
                    <td className="py-2.5 px-2 sm:px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="font-semibold text-slate-900">{c.name}</span>
                        <span className="text-slate-600 hidden sm:inline">{c.ticker}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-700 whitespace-nowrap">{c.ipo.date}</td>
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
                    <td className="py-2.5 px-2 text-right text-slate-700">${c.ipo.proceeds_m}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* THEMES */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Zap size={18} className="text-slate-500" />
            Key Themes
          </h2>
          <p className="text-xs text-slate-700 mb-4">Hover over each theme for more context.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {themes.map((t, i) => (
              <div
                key={i}
                className="relative group cursor-default"
                onMouseEnter={() => setHoveredTheme(i)}
                onMouseLeave={() => setHoveredTheme(null)}
              >
                <div className={`flex items-start gap-2 text-sm rounded-lg p-3 transition-all border ${hoveredTheme === i ? "bg-slate-100 border-slate-300 text-slate-900" : "bg-slate-50 border-transparent text-slate-700"}`}>
                  <span className="text-slate-500 font-bold text-xs mt-0.5 flex-shrink-0">{i + 1}</span>
                  <div>
                    <span>{t.text}</span>
                    <div className={`text-xs text-slate-600 mt-1 overflow-hidden transition-all duration-200 ${hoveredTheme === i ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
                      {t.detail}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTOR BREAKDOWN */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Users size={18} className="text-slate-500" />
            Sector Breakdown
          </h2>
          <p className="text-xs text-slate-700 mb-4">Current market cap by sector. Hover for company list.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {Object.entries(sectorMap).sort(([, a], [, b]) => b.val - a.val).map(([sector, data]) => (
              <div key={sector} className="group bg-slate-50 rounded-lg p-3 border border-slate-100 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-default">
                <div className="text-[10px] sm:text-xs text-slate-700 truncate">{sector}</div>
                <div className="text-base sm:text-lg font-bold text-slate-900">${fmt(data.val)}B</div>
                <div className="text-[10px] sm:text-xs text-slate-600">{data.count} {data.count === 1 ? "company" : "companies"}</div>
                <div className="text-[10px] text-slate-500 mt-1 overflow-hidden max-h-0 group-hover:max-h-8 transition-all duration-200">
                  {data.names.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DATA SOURCES */}
        <div className="text-center text-xs text-slate-600 py-2">
          Data sourced from Yahoo Finance, Bloomberg, CNBC, SEC filings, IPOScoop, Morningstar, PortfoliosLab, TechCrunch, and Reuters. Prices as of April 1, 2026.
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-300 py-6 text-center text-sm text-gray-600">
        <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener" className="hover:text-slate-700 transition-colors">Twitter</a>
        {" | "}
        <a href="mailto:t@nyvp.com" className="hover:text-slate-700 transition-colors">t@nyvp.com</a>
      </footer>
    </div>
  );
}
