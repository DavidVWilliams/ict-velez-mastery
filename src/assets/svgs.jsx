import React from 'react';

export const LiquiditySweepVisual = () => (
  <svg viewBox="0 0 600 280" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
    {/* Grid Lines */}
    <line x1="50" y1="50" x2="550" y2="50" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="110" x2="550" y2="110" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="170" x2="550" y2="170" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="230" x2="550" y2="230" stroke="#1e293b" strokeDasharray="4 4" />

    {/* BSL Level Line */}
    <line x1="50" y1="70" x2="550" y2="70" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 3" />
    <text x="60" y="62" fill="#ef4444" fontSize="12" fontWeight="600" fontFamily="monospace">Buy Side Liquidity (BSL) - Equal Highs</text>

    {/* SSL Level Line */}
    <line x1="50" y1="210" x2="550" y2="210" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 3" />
    <text x="60" y="228" fill="#10b981" fontSize="12" fontWeight="600" fontFamily="monospace">Sell Side Liquidity (SSL) - Equal Lows</text>

    {/* Candlestick 1 (Up) */}
    <line x1="120" y1="90" x2="120" y2="170" stroke="#10b981" strokeWidth="2" />
    <rect x="110" y="110" width="20" height="40" fill="#10b981" rx="2" />

    {/* Candlestick 2 (Down) */}
    <line x1="180" y1="100" x2="180" y2="190" stroke="#ef4444" strokeWidth="2" />
    <rect x="170" y="120" width="20" height="50" fill="#ef4444" rx="2" />

    {/* Candlestick 3 (Sweep Wick) */}
    <line x1="240" y1="45" x2="240" y2="180" stroke="#ef4444" strokeWidth="2" />
    <rect x="230" y="110" width="20" height="40" fill="#ef4444" rx="2" />
    <circle cx="240" cy="45" r="5" fill="#ef4444" />
    <text x="255" y="48" fill="#ef4444" fontSize="11" fontWeight="bold">BSL Sweep</text>

    {/* Candlestick 4 (Displacement Down) */}
    <line x1="300" y1="90" x2="300" y2="225" stroke="#ef4444" strokeWidth="2" />
    <rect x="290" y="95" width="20" height="115" fill="#ef4444" rx="2" />

    {/* Candlestick 5 (Retracement) */}
    <line x1="360" y1="120" x2="360" y2="190" stroke="#10b981" strokeWidth="2" />
    <rect x="350" y="135" width="20" height="35" fill="#10b981" rx="2" />

    {/* Candlestick 6 (Continuation) */}
    <line x1="420" y1="130" x2="420" y2="240" stroke="#ef4444" strokeWidth="2" />
    <rect x="410" y="145" width="20" height="75" fill="#ef4444" rx="2" />

    {/* Legend / Info Badge */}
    <rect x="430" y="20" width="150" height="36" fill="#0f172a" rx="6" stroke="#334155" />
    <text x="442" y="42" fill="#38bdf8" fontSize="11" fontWeight="bold">ICT Liquidity Model</text>
  </svg>
);

export const MSSVisual = () => (
  <svg viewBox="0 0 600 280" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
    {/* Grid Lines */}
    <line x1="50" y1="60" x2="550" y2="60" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="140" x2="550" y2="140" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="220" x2="550" y2="220" stroke="#1e293b" strokeDasharray="4 4" />

    {/* Structural Swing High Level */}
    <line x1="100" y1="90" x2="480" y2="90" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
    <text x="110" y="82" fill="#f59e0b" fontSize="11" fontWeight="600" fontFamily="monospace">Dealing Range High (Structural Pivot)</text>

    {/* Down swing */}
    <path d="M 100 180 L 150 210 L 200 150 L 260 190 L 320 120" fill="none" stroke="#64748b" strokeWidth="2" />

    {/* MSS Break Candle */}
    <line x1="380" y1="50" x2="380" y2="210" stroke="#10b981" strokeWidth="3" />
    <rect x="370" y="75" width="20" height="110" fill="#10b981" rx="2" />
    
    {/* Arrow highlighting MSS */}
    <path d="M 330 90 L 375 90" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
    <text x="395" y="65" fill="#10b981" fontSize="12" fontWeight="bold">Market Structure Shift (MSS)</text>

    {/* Subsequent Retest / FVG */}
    <rect x="410" y="110" width="80" height="50" fill="#38bdf8" fillOpacity="0.2" rx="4" stroke="#38bdf8" strokeDasharray="3 3" />
    <text x="418" y="138" fill="#38bdf8" fontSize="11" fontWeight="600">FVG / Retest Zone</text>

    {/* Badge */}
    <rect x="430" y="20" width="150" height="36" fill="#0f172a" rx="6" stroke="#334155" />
    <text x="442" y="42" fill="#10b981" fontSize="11" fontWeight="bold">Bullish MSS Engine</text>
  </svg>
);

export const FVGVisual = () => (
  <svg viewBox="0 0 600 280" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
    {/* Grid Lines */}
    <line x1="50" y1="70" x2="550" y2="70" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="140" x2="550" y2="140" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="210" x2="550" y2="210" stroke="#1e293b" strokeDasharray="4 4" />

    {/* Candle 1 */}
    <line x1="150" y1="130" x2="150" y2="200" stroke="#10b981" strokeWidth="2" />
    <rect x="140" y="145" width="20" height="40" fill="#10b981" rx="2" />
    <text x="135" y="222" fill="#94a3b8" fontSize="10">Candle 1</text>

    {/* Candle 2 (Impulsive displacement) */}
    <line x1="230" y1="60" x2="230" y2="210" stroke="#10b981" strokeWidth="2" />
    <rect x="220" y="80" width="20" height="110" fill="#10b981" rx="2" />
    <text x="215" y="222" fill="#94a3b8" fontSize="10">Candle 2</text>

    {/* Candle 3 */}
    <line x1="310" y1="90" x2="310" y2="160" stroke="#10b981" strokeWidth="2" />
    <rect x="300" y="105" width="20" height="35" fill="#10b981" rx="2" />
    <text x="295" y="222" fill="#94a3b8" fontSize="10">Candle 3</text>

    {/* Fair Value Gap Highlight Box */}
    <rect x="180" y="90" width="170" height="50" fill="#6366f1" fillOpacity="0.25" rx="4" stroke="#6366f1" strokeWidth="1.5" />
    <text x="365" y="112" fill="#818cf8" fontSize="12" fontWeight="bold">Fair Value Gap (FVG)</text>

    {/* Consequent Encroachment (50% CE) Line */}
    <line x1="180" y1="115" x2="350" y2="115" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 2" />
    <text x="365" y="132" fill="#f43f5e" fontSize="11" fontWeight="600">50% CE (Midpoint)</text>

    {/* Badge */}
    <rect x="430" y="20" width="150" height="36" fill="#0f172a" rx="6" stroke="#334155" />
    <text x="442" y="42" fill="#6366f1" fontSize="11" fontWeight="bold">Imbalance Re-delivery</text>
  </svg>
);

export const SMAVisual = () => (
  <svg viewBox="0 0 600 280" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
    {/* Grid Lines */}
    <line x1="50" y1="60" x2="550" y2="60" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="140" x2="550" y2="140" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="220" x2="550" y2="220" stroke="#1e293b" strokeDasharray="4 4" />

    {/* 200 SMA Upward Sloping Curve */}
    <path d="M 60 210 Q 250 170 520 70" fill="none" stroke="#3b82f6" strokeWidth="3" />
    <text x="460" y="55" fill="#3b82f6" fontSize="12" fontWeight="bold">200 Simple Moving Average (SMA)</text>

    {/* Price action oscillating above 200 SMA */}
    <path d="M 80 180 L 130 140 L 180 190 L 240 120 L 300 160 L 370 90 L 440 130 L 510 60" fill="none" stroke="#10b981" strokeWidth="2" />

    {/* Filter Annotation */}
    <rect x="70" y="30" width="220" height="35" fill="#0f172a" rx="6" stroke="#1e3a8a" />
    <text x="82" y="52" fill="#60a5fa" fontSize="11" fontWeight="600">Slope Up = Long Executions Only</text>
  </svg>
);

export const PO3Visual = () => (
  <svg viewBox="0 0 600 280" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
    {/* Grid lines */}
    <line x1="50" y1="70" x2="550" y2="70" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="140" x2="550" y2="140" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="210" x2="550" y2="210" stroke="#1e293b" strokeDasharray="4 4" />

    {/* Midnight Open Reference Line */}
    <line x1="50" y1="140" x2="550" y2="140" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
    <text x="60" y="132" fill="#cbd5e1" fontSize="11" fontWeight="bold" fontFamily="monospace">Midnight EST Open Price</text>

    {/* Phase 1: Accumulation Box */}
    <rect x="70" y="125" width="120" height="35" fill="#334155" fillOpacity="0.4" rx="4" stroke="#64748b" />
    <text x="92" y="147" fill="#94a3b8" fontSize="11" fontWeight="bold">1. Accumulation</text>

    {/* Phase 2: Manipulation (Judas Swing) */}
    <path d="M 190 142 L 270 200" fill="none" stroke="#ef4444" strokeWidth="2.5" />
    <text x="220" y="225" fill="#ef4444" fontSize="11" fontWeight="bold">2. Manipulation (Judas Swing)</text>

    {/* Phase 3: True Distribution */}
    <path d="M 270 200 L 480 60" fill="none" stroke="#10b981" strokeWidth="3" />
    <text x="330" y="110" fill="#10b981" fontSize="12" fontWeight="bold">3. True Distribution Expansion</text>

    {/* Badge */}
    <rect x="430" y="20" width="150" height="36" fill="#0f172a" rx="6" stroke="#334155" />
    <text x="442" y="42" fill="#38bdf8" fontSize="11" fontWeight="bold">Power of Three (AMD)</text>
  </svg>
);

export const MatrixVisual = () => (
  <svg viewBox="0 0 600 280" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
    {/* Dealing Range Outer Box */}
    <rect x="150" y="40" width="300" height="200" fill="#090d16" stroke="#334155" strokeWidth="2" rx="6" />

    {/* Premium Zone (Upper Half) */}
    <rect x="150" y="40" width="300" height="100" fill="#ef4444" fillOpacity="0.12" />
    <text x="260" y="95" fill="#f87171" fontSize="14" fontWeight="bold" letterSpacing="1">PREMIUM ZONE (Sell / Short)</text>

    {/* Equilibrium Line (50%) */}
    <line x1="150" y1="140" x2="450" y2="140" stroke="#f59e0b" strokeWidth="2" />
    <text x="460" y="144" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">50% Equilibrium</text>

    {/* Discount Zone (Lower Half) */}
    <rect x="150" y="140" width="300" height="100" fill="#10b981" fillOpacity="0.12" />
    <text x="255" y="195" fill="#34d399" fontSize="14" fontWeight="bold" letterSpacing="1">DISCOUNT ZONE (Buy / Long)</text>

    {/* Dealing Range Labels */}
    <text x="80" y="45" fill="#94a3b8" fontSize="11" fontFamily="monospace">1.0 (High)</text>
    <text x="80" y="245" fill="#94a3b8" fontSize="11" fontFamily="monospace">0.0 (Low)</text>
    <line x1="135" y1="40" x2="150" y2="40" stroke="#94a3b8" />
    <line x1="135" y1="240" x2="150" y2="240" stroke="#94a3b8" />
  </svg>
);

export const BreakerVisual = () => (
  <svg viewBox="0 0 600 280" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
    {/* Grid */}
    <line x1="50" y1="80" x2="550" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="160" x2="550" y2="160" stroke="#1e293b" strokeDasharray="4 4" />

    {/* Failed Order Block Zone */}
    <rect x="180" y="110" width="120" height="50" fill="#f43f5e" fillOpacity="0.25" rx="4" stroke="#f43f5e" strokeWidth="1.5" />
    <text x="195" y="140" fill="#fb7185" fontSize="12" fontWeight="bold">Breaker Block (OB Flip)</text>

    {/* Price action breaking through */}
    <path d="M 80 190 L 160 135 L 240 180 L 340 70 L 450 135" fill="none" stroke="#38bdf8" strokeWidth="2.5" />

    {/* Retest arrow */}
    <path d="M 390 100 L 435 130" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
    <text x="350" y="90" fill="#10b981" fontSize="11" fontWeight="bold">Polarity Inversion Retest</text>

    {/* Badge */}
    <rect x="430" y="20" width="150" height="36" fill="#0f172a" rx="6" stroke="#334155" />
    <text x="442" y="42" fill="#fb7185" fontSize="11" fontWeight="bold">Institutional Breaker</text>
  </svg>
);

export const SMTVisual = () => (
  <svg viewBox="0 0 600 280" className="w-full h-auto bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
    {/* Grid */}
    <line x1="50" y1="80" x2="550" y2="80" stroke="#1e293b" strokeDasharray="4 4" />
    <line x1="50" y1="180" x2="550" y2="180" stroke="#1e293b" strokeDasharray="4 4" />

    {/* Asset 1 (ES Futures) - Higher High */}
    <path d="M 80 150 L 160 90 L 220 130 L 320 60 L 400 120" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
    <text x="325" y="45" fill="#38bdf8" fontSize="11" fontWeight="bold">ES Index: Higher High (Sweep)</text>

    {/* Asset 2 (NQ Futures) - Lower High (Divergence) */}
    <path d="M 80 200 L 160 140 L 220 170 L 320 95 L 400 150" fill="none" stroke="#a855f7" strokeWidth="2.5" />
    <text x="290" y="115" fill="#a855f7" fontSize="11" fontWeight="bold">NQ Index: Lower High (SMT Divergence)</text>

    {/* Badge */}
    <rect x="410" y="20" width="170" height="36" fill="#0f172a" rx="6" stroke="#334155" />
    <text x="422" y="42" fill="#c084fc" fontSize="11" fontWeight="bold">Smart Money Tool (SMT)</text>
  </svg>
);
