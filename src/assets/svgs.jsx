// src/assets/svgs.jsx
import React from 'react';

export const Candle = ({ x, o, c, h, l }) => {
  const isGreen = c <= o; 
  const color = isGreen ? '#10b981' : '#ef4444';
  const bodyY = Math.min(o, c);
  const bodyH = Math.max(Math.abs(c - o), 2);
  return (
    <g>
      <line x1={x} y1={h} x2={x} y2={l} stroke={color} strokeWidth="2" />
      <rect x={x - 5} y={bodyY} width="10" height={bodyH} fill={color} stroke={color} />
    </g>
  );
};

export const LiquiditySweepVisual = () => (
  <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans bg-slate-950 rounded-xl border border-slate-800 shadow-inner p-4 my-4">
    <text x="20" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" letterSpacing="2">VISUAL: SELL-SIDE LIQUIDITY SWEEP</text>
    <line x1="50" y1="200" x2="550" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
    <text x="50" y="220" fill="#ef4444" fontSize="14" fontWeight="bold">Retail Support (Resting Sell-Stops / SSL)</text>
    <Candle x={100} o={100} c={150} h={80} l={160} />
    <Candle x={140} o={150} c={180} h={140} l={190} />
    <Candle x={180} o={180} c={140} h={130} l={190} />
    <Candle x={300} o={160} c={190} h={150} l={200} />
    <Candle x={380} o={120} c={170} h={100} l={180} />
    <Candle x={420} o={170} c={250} h={160} l={260} />
    <Candle x={460} o={250} c={150} h={140} l={260} />
    <circle cx="420" cy="260" r="15" fill="none" stroke="#eab308" strokeWidth="3" />
    <text x="440" y="265" fill="#eab308" fontSize="14" fontWeight="bold">Liquidity Purge / Stop Run</text>
  </svg>
);

export const MSSVisual = () => (
  <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans bg-slate-950 rounded-xl border border-slate-800 shadow-inner p-4 my-4">
    <text x="20" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" letterSpacing="2">VISUAL: MARKET STRUCTURE SHIFT (MSS)</text>
    <line x1="50" y1="250" x2="550" y2="250" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
    <line x1="50" y1="120" x2="550" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,5" />
    <text x="50" y="110" fill="#38bdf8" fontSize="12" fontWeight="bold">Intermediate-Term High (MSS Trigger)</text>
    <Candle x={180} o={160} c={120} h={110} l={170} />
    <Candle x={300} o={220} c={280} h={210} l={290} /> 
    <Candle x={340} o={280} c={180} h={170} l={290} /> 
    <Candle x={380} o={180} c={80} h={70} l={190} /> 
    <rect x="360" y="60" width="80" height="140" fill="none" stroke="#10b981" strokeWidth="3" rx="10" />
    <text x="450" y="120" fill="#10b981" fontSize="16" fontWeight="bold">Displacement Wave</text>
  </svg>
);

export const FVGVisual = () => (
  <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans bg-slate-950 rounded-xl border border-slate-800 shadow-inner p-4 my-4">
    <text x="20" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" letterSpacing="2">VISUAL: FAIR VALUE GAP (FVG)</text>
    <Candle x={150} o={250} c={200} h={180} l={260} />
    <text x="135" y="280" fill="#94a3b8" fontSize="14" fontWeight="bold">Candle 1</text>
    <line x1="150" y1="180" x2="350" y2="180" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
    <Candle x={250} o={200} c={60} h={50} l={210} />
    <text x="235" y="280" fill="#10b981" fontSize="14" fontWeight="bold">Candle 2</text>
    <Candle x={350} o={60} c={40} h={30} l={100} />
    <text x="335" y="280" fill="#94a3b8" fontSize="14" fontWeight="bold">Candle 3</text>
    <line x1="350" y1="100" x2="450" y2="100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
    <rect x="150" y="100" width="200" height="80" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
    <text x="160" y="145" fill="#a5b4fc" fontSize="16" fontWeight="bold">Price Inefficiency (FVG)</text>
  </svg>
);

export const SMAVisual = () => (
  <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans bg-slate-950 rounded-xl border border-slate-800 shadow-inner p-4 my-4">
    <text x="20" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" letterSpacing="2">VISUAL: 200 SMA MACRO BASELINE</text>
    <path d="M 50 250 Q 300 200 550 50" fill="none" stroke="#eab308" strokeWidth="4" />
    <text x="50" y="270" fill="#fde047" fontSize="14" fontWeight="bold">200 SMA (Ascending Baseline)</text>
    <rect x="230" y="100" width="100" height="60" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
    <text x="340" y="130" fill="#a5b4fc" fontSize="14" fontWeight="bold">FVG Zone</text>
    <Candle x={100} o={40} c={70} h={30} l={80} />
    <Candle x={150} o={70} c={110} h={60} l={120} />
    <Candle x={200} o={110} c={150} h={100} l={160} />
    <Candle x={250} o={150} c={130} h={120} l={160} /> 
    <Candle x={300} o={130} c={60} h={50} l={140} /> 
    <text x="320" y="70" fill="#10b981" fontSize="14" fontWeight="bold">Ignition Confirmation</text>
  </svg>
);

export const PO3Visual = () => (
  <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans bg-slate-950 rounded-xl border border-slate-800 shadow-inner p-4 my-4">
    <text x="20" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" letterSpacing="2">VISUAL: POWER OF 3 (AMD)</text>
    <line x1="50" y1="180" x2="550" y2="180" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
    <text x="50" y="170" fill="#94a3b8" fontSize="12" fontWeight="bold">Midnight Open Price</text>
    <rect x="80" y="160" width="120" height="40" fill="#334155" fillOpacity="0.5" stroke="#475569" strokeWidth="2" />
    <text x="90" y="220" fill="#94a3b8" fontSize="12">Accumulation</text>
    <path d="M 200 180 Q 250 80 300 180" fill="none" stroke="#ef4444" strokeWidth="3" />
    <text x="230" y="70" fill="#ef4444" fontSize="12" fontWeight="bold">Judas Swing (Manipulation)</text>
    <path d="M 300 180 Q 400 300 500 280" fill="none" stroke="#10b981" strokeWidth="3" />
    <text x="380" y="320" fill="#10b981" fontSize="12" fontWeight="bold">Distribution (Expansion)</text>
  </svg>
);

export const MatrixVisual = () => (
  <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans bg-slate-950 rounded-xl border border-slate-800 shadow-inner p-4 my-4">
    <text x="20" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" letterSpacing="2">VISUAL: DISCOUNT MATRIX & OTE</text>
    <rect x="150" y="200" width="300" height="40" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1" />
    <line x1="100" y1="150" x2="500" y2="150" stroke="#f87171" strokeWidth="2" strokeDasharray="5,5"/>
    <text x="100" y="145" fill="#f87171" fontSize="10">50% Equilibrium (Do not buy above)</text>
    <line x1="100" y1="200" x2="500" y2="200" stroke="#60a5fa" strokeWidth="1" />
    <text x="100" y="195" fill="#60a5fa" fontSize="10">62% Retracement</text>
    <line x1="100" y1="220" x2="500" y2="220" stroke="#3b82f6" strokeWidth="2" />
    <text x="100" y="215" fill="#3b82f6" fontSize="10" fontWeight="bold">70.5% (OTE Sweet Spot)</text>
    <line x1="100" y1="240" x2="500" y2="240" stroke="#60a5fa" strokeWidth="1" />
    <text x="100" y="235" fill="#60a5fa" fontSize="10">79% Retracement</text>
    <Candle x={180} o={280} c={180} h={170} l={290} />
    <Candle x={210} o={180} c={80} h={70} l={190} />
    <Candle x={240} o={80} c={30} h={20} l={90} />
    <Candle x={270} o={30} c={100} h={20} l={110} />
    <Candle x={300} o={100} c={170} h={90} l={180} />
    <Candle x={330} o={170} c={220} h={160} l={230} /> 
    <Candle x={360} o={220} c={140} h={130} l={230} /> 
    <text x={375} y={225} fill="#bfdbfe" fontSize="14" fontWeight="bold">Optimal Trade Entry</text>
  </svg>
);

export const BreakerVisual = () => (
  <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans bg-slate-950 rounded-xl border border-slate-800 shadow-inner p-4 my-4">
    <text x="20" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" letterSpacing="2">VISUAL: BULLISH BREAKER BLOCK</text>
    <path d="M 50 200 L 150 100 L 250 280 L 350 50 L 450 120" fill="none" stroke="#64748b" strokeWidth="2" />
    <text x="130" y="90" fill="#94a3b8" fontSize="12">High</text>
    <text x="230" y="300" fill="#94a3b8" fontSize="12">Lower Low (Stop Run)</text>
    <text x="320" y="40" fill="#94a3b8" fontSize="12">Higher High (MSS)</text>
    <rect x="130" y="100" width="340" height="40" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2" strokeDasharray="4,4"/>
    <text x="480" y="125" fill="#10b981" fontSize="14" fontWeight="bold">Breaker Retest</text>
    <circle cx="450" cy="120" r="8" fill="#10b981" />
  </svg>
);

export const SMTVisual = () => (
  <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans bg-slate-950 rounded-xl border border-slate-800 shadow-inner p-4 my-4">
    <text x="20" y="30" fill="#a5b4fc" fontSize="12" fontWeight="bold" letterSpacing="2">VISUAL: SMART MONEY TECHNIQUE (SMT)</text>
    <line x1="50" y1="180" x2="550" y2="180" stroke="#334155" strokeWidth="2"/>
    <text x="50" y="70" fill="#94a3b8" fontSize="14" fontWeight="bold">S&P 500 (ES)</text>
    <path d="M 50 120 L 150 160 L 250 100 L 350 190" fill="none" stroke="#ef4444" strokeWidth="3" />
    <text x="320" y="210" fill="#ef4444" fontSize="12">Lower Low</text>
    <text x="50" y="220" fill="#94a3b8" fontSize="14" fontWeight="bold">NASDAQ (NQ)</text>
    <path d="M 50 270 L 150 310 L 250 250 L 350 290" fill="none" stroke="#10b981" strokeWidth="3" />
    <text x="320" y="315" fill="#10b981" fontSize="12">Higher Low (SMT Divergence!)</text>
    <circle cx="350" cy="290" r="8" fill="#10b981" />
  </svg>
);
