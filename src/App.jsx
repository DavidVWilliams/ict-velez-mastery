import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';
import {
  BookOpen,
  GraduationCap,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  Zap,
  Brain,
  ShieldAlert,
  Layers,
  Compass,
  HelpCircle,
  Check,
  Sparkles,
  Lock,
  RefreshCw,
  FileText,
  Eye,
  Percent,
  Bookmark,
  Search,
  Activity,
  Grid,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Volume2,
  VolumeX,
  MessageSquare,
  Wand2,
  Loader2,
  Send,
  AlertCircle,
  Info,
  NotebookPen,
  FileCheck,
  ThumbsUp,
  ThumbsDown,
  Plus,
  LineChart,
  History,
  Trash2,
  Pin,
  DollarSign,
  Crosshair,
  Sliders,
  Lightbulb,
  PlayCircle,
  Calculator,
  User,
  LogOut,
  Mail,
  Key
} from 'lucide-react';

const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts";

const SYSTEM_INSTRUCTION = `You are an elite institutional trading mentor specializing in the ICT 2022 YouTube Mentorship program and the Oliver Velez momentum trading methodology.
Your role is to explain time-and-price algorithmic concepts (FVG, MSS, SSL/BSL, PO3/AMD, Silver Bullet, SMT Divergence, OB, CE, IPDA) alongside Oliver Velez visual momentum mechanics (Igniting Elephant Bars, 20 SMA location, 180 Reversals, Novice Traps, Tail Bars).
Always note that Oliver Velez explicitly uses the 20 Simple Moving Average (20 SMA), NOT an EMA.
Always be authoritative, concise, and focused on risk management and discipline. Use abbreviations naturally without re-defining them repeatedly.`;

function getGeminiApiKey() {
  if (typeof window !== 'undefined' && window.GEMINI_API_KEY) return window.GEMINI_API_KEY;
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch(e) {}
  try {
    const saved = localStorage.getItem('ict_ov_custom_gemini_key');
    if (saved) return saved;
  } catch(e) {}
  return "";
}

async function callGeminiText(prompt, customSystem = SYSTEM_INSTRUCTION) {
  const apiKey = getGeminiApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: customSystem }] }
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  let lastError = null;

  for (let attempt = 0; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response received from Gemini API");
      return text;
    } catch (err) {
      lastError = err;
      if (attempt < 5) {
        await new Promise(res => setTimeout(res, delays[attempt]));
      }
    }
  }
  throw lastError || new Error("Failed to connect to Gemini API after multiple retries. Please check your Gemini API key in the Account tab.");
}

async function callGeminiJSON(prompt, schema, customSystem = SYSTEM_INSTRUCTION) {
  const apiKey = getGeminiApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: customSystem }] },
    generationConfig: {
      responseMimeType: "application/json",
      ...(schema ? { responseSchema: schema } : {})
    }
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  let lastError = null;

  for (let attempt = 0; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`);
      }
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty JSON response received from Gemini API");
      return JSON.parse(text);
    } catch (err) {
      lastError = err;
      if (attempt < 5) {
        await new Promise(res => setTimeout(res, delays[attempt]));
      }
    }
  }
  throw lastError || new Error("Failed to generate structured data after retries.");
}

function pcmToWav(pcmData, sampleRate = 24000) {
  const numChannels = 1;
  const sampleBits = 16;
  const blockAlign = numChannels * (sampleBits / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, sampleBits, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const pcmBytes = new Uint8Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
  for (let i = 0; i < dataSize; i++) {
    view.setUint8(44 + i, pcmBytes[i]);
  }

  return buffer;
}

async function callGeminiTTS(textToSpeak) {
  const apiKey = getGeminiApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${apiKey}`;

  const cleanText = textToSpeak
    .replace(/[\*\_ \#\-\`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const prompt = `Say clearly in an authoritative, encouraging trading mentor voice: ${cleanText}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Kore"
          }
        }
      }
    }
  };

  const delays = [1000, 2000, 4000, 8000, 16000];
  let lastError = null;

  for (let attempt = 0; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`TTS API Error: ${response.status}`);
      const result = await response.json();
      const inlineData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!inlineData || !inlineData.data) throw new Error("No audio payload returned");

      let sampleRate = 24000;
      if (inlineData.mimeType && inlineData.mimeType.includes("rate=")) {
        const match = inlineData.mimeType.match(/rate=(\d+)/);
        if (match) sampleRate = parseInt(match[1], 10);
      }

      const binaryString = atob(inlineData.data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const wavBuffer = pcmToWav(bytes, sampleRate);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    } catch (err) {
      lastError = err;
      if (attempt < 5) {
        await new Promise(r => setTimeout(r, delays[attempt]));
      }
    }
  }
  throw lastError || new Error("Failed to generate audio summary.");
}

const GLOSSARY_DATA = [
  { term: 'BSL', fullName: 'Buyside Liquidity', definition: 'Resting Buy Stop orders above key swing highs. Smart money uses BSL as liquidity to sell long positions to breakout buyers.', category: 'Liquidity' },
  { term: 'SSL', fullName: 'Sellside Liquidity', definition: 'Resting Sell Stop orders below key swing lows. Algorithms draw price down here to trigger retail stop losses, allowing smart money to buy.', category: 'Liquidity' },
  { term: 'FVG', fullName: 'Fair Value Gap', definition: 'A 3-candle imbalance where candle 1 wick and candle 3 wick do not touch, leaving an unbalancing gap in candle 2. Price retraces to rebalance.', category: 'Imbalance' },
  { term: 'MSS', fullName: 'Market Structure Shift', definition: 'A forceful break of a recent swing high or low accompanied by energetic displacement following a liquidity sweep.', category: 'Structure' },
  { term: 'OB', fullName: 'Order Block', definition: 'The last down-close candle before a bullish move (or up-close before a bearish move) that caused displacement and created an FVG.', category: 'Structure' },
  { term: 'PO3 / AMD', fullName: 'Power of 3 (Accumulation, Manipulation, Distribution)', definition: 'The 3-stage daily algorithmic cycle: Accumulation (range building), Manipulation (Judas Swing fakeout), and Distribution (main expansion).', category: 'Time Macros' },
  { term: 'MNO', fullName: 'Midnight New York Opening Price', definition: '00:00 EST opening price benchmark: buy below MNO for bullish daily bias, sell above MNO for bearish bias.', category: 'Time Macros' },
  { term: 'CE', fullName: 'Consequent Encroachment', definition: 'The exact 50% midpoint of a Fair Value Gap. Candle bodies must respect CE for high-probability setups.', category: 'Precision' },
  { term: 'ERL', fullName: 'External Range Liquidity', definition: 'Liquidity pools residing outside the current dealing range (swing highs, swing lows, previous daily high/low).', category: 'Liquidity' },
  { term: 'IRL', fullName: 'Internal Range Liquidity', definition: 'Fair Value Gaps and Order Blocks residing inside the current dealing range.', category: 'Liquidity' },
  { term: 'SMT', fullName: 'Smart Money Technique (Divergence)', definition: 'Intermarket crack in correlation between closely tied assets (e.g., ES making a higher low while NQ makes a lower low).', category: 'Intermarket' },
  { term: 'IPDA', fullName: 'Interbank Price Delivery Algorithm', definition: 'The central algorithm delivering price across financial markets to engineer liquidity and rebalance market inefficiencies.', category: 'Theory' },
  { term: 'OTE', fullName: 'Optimal Trade Entry', definition: 'Fibonacci retracement level between 62% and 79% (70.5% sweet spot) within a displacement leg.', category: 'Execution' },
  { term: 'BISI', fullName: 'Buyside Imbalance Sellside Inefficiency', definition: 'A bullish Fair Value Gap created when price surges rapidly upward.', category: 'Imbalance' },
  { term: 'SIBI', fullName: 'Sellside Imbalance Buyside Inefficiency', definition: 'A bearish Fair Value Gap created when price plummets rapidly downward.', category: 'Imbalance' },
  { term: 'Elephant Bar (OV)', fullName: 'Oliver Velez Elephant Bar', definition: 'A visual momentum candle significantly larger than surrounding candles, representing the exact displacement candle creating an FVG.', category: 'Velez Bridge' },
  { term: '180 Reversal (OV)', fullName: 'Oliver Velez 180 Reversal / Change of Guard', definition: 'A visual momentum pattern where a large candle completely engulfs the prior opposing candle, matching an ICT MSS.', category: 'Velez Bridge' }
];

function ChartMarkupDiagram({ setupType }) {
  if (setupType === 'bullish_mss') {
    return (
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
          <span className="flex items-center gap-1.5"><LineChart className="w-4 h-4" /> Illustrative Setup: Bullish SSL Sweep → MSS → FVG Retrace</span>
          <span className="text-[10px] text-slate-500 font-mono">ES 2m Chart</span>
        </div>
        <svg viewBox="0 0 600 240" className="w-full h-auto bg-slate-900/90 rounded-lg border border-slate-800">
          <line x1="50" y1="30" x2="520" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
          <text x="528" y="34" fill="#64748b" fontSize="10" fontFamily="monospace">4150.00</text>
          
          <line x1="50" y1="80" x2="520" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
          <text x="528" y="84" fill="#64748b" fontSize="10" fontFamily="monospace">4135.00</text>

          <line x1="50" y1="130" x2="520" y2="130" stroke="#1e293b" strokeDasharray="3 3" />
          <text x="528" y="134" fill="#64748b" fontSize="10" fontFamily="monospace">4120.00</text>

          <line x1="50" y1="180" x2="520" y2="180" stroke="#1e293b" strokeDasharray="3 3" />
          <text x="528" y="184" fill="#64748b" fontSize="10" fontFamily="monospace">4105.00</text>

          <line x1="520" y1="20" x2="520" y2="200" stroke="#334155" strokeWidth="1.5" />
          <text x="528" y="15" fill="#38bdf8" fontSize="9" fontFamily="sans-serif" fontWeight="bold">PRICE ($)</text>

          <line x1="50" y1="200" x2="520" y2="200" stroke="#334155" strokeWidth="1.5" />
          <text x="15" y="222" fill="#94a3b8" fontSize="9" fontFamily="sans-serif" fontWeight="bold">TIME (EST):</text>
          <text x="80" y="222" fill="#64748b" fontSize="10" fontFamily="monospace">09:28</text>
          <text x="130" y="222" fill="#64748b" fontSize="10" fontFamily="monospace">09:30</text>
          <text x="180" y="222" fill="#64748b" fontSize="10" fontFamily="monospace">09:32</text>
          <text x="230" y="222" fill="#64748b" fontSize="10" fontFamily="monospace">09:34</text>
          <text x="280" y="222" fill="#64748b" fontSize="10" fontFamily="monospace">09:36</text>
          <text x="340" y="222" fill="#64748b" fontSize="10" fontFamily="monospace">09:38</text>
          <text x="420" y="222" fill="#64748b" fontSize="10" fontFamily="monospace">09:40</text>

          <line x1="50" y1="165" x2="220" y2="165" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
          <text x="52" y="160" fill="#f87171" fontSize="10" fontFamily="monospace" fontWeight="bold">SSL Sweep Level (Novice Trap)</text>

          <line x1="80" y1="110" x2="80" y2="160" stroke="#ef4444" strokeWidth="2" />
          <rect x="73" y="120" width="14" height="35" fill="#ef4444" />

          <line x1="130" y1="140" x2="130" y2="185" stroke="#ef4444" strokeWidth="2" />
          <rect x="123" y="145" width="14" height="30" fill="#ef4444" />

          <line x1="70" y1="105" x2="380" y2="105" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="210" y="100" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">MSS Pivot High Broken!</text>

          <line x1="180" y1="80" x2="180" y2="180" stroke="#22c55e" strokeWidth="2" />
          <rect x="171" y="85" width="18" height="90" fill="#22c55e" />
          <text x="195" y="130" fill="#4ade80" fontSize="9" fontFamily="sans-serif">Igniting Elephant Bar</text>

          <rect x="171" y="125" width="159" height="30" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeDasharray="3 3" />
          <text x="220" y="142" fill="#34d399" fontSize="10" fontWeight="bold">BISI FVG Zone</text>
          <line x1="171" y1="140" x2="330" y2="140" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
          <text x="260" y="152" fill="#fbbf24" fontSize="8">50% CE</text>

          <line x1="230" y1="60" x2="230" y2="100" stroke="#22c55e" strokeWidth="2" />
          <rect x="223" y="65" width="14" height="28" fill="#22c55e" />

          <line x1="280" y1="90" x2="280" y2="145" stroke="#ef4444" strokeWidth="2" />
          <rect x="273" y="95" width="14" height="42" fill="#ef4444" />
          <circle cx="280" cy="140" r="4" fill="#38bdf8" />
          <text x="292" y="142" fill="#38bdf8" fontSize="10" fontWeight="bold">BUY ENTRY AT FVG / 20 SMA</text>

          <line x1="340" y1="40" x2="340" y2="100" stroke="#22c55e" strokeWidth="2" />
          <rect x="331" y="45" width="18" height="50" fill="#22c55e" />

          <path d="M 50 150 Q 150 160 230 130 T 360 60" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
          <text x="370" y="65" fill="#60a5fa" fontSize="9" fontWeight="bold">OV 20 SMA</text>
        </svg>
      </div>
    );
  }

  if (setupType === 'po3_amd') {
    return (
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-amber-400">
          <span className="flex items-center gap-1.5"><LineChart className="w-4 h-4" /> Power of 3 (PO3 / AMD) Daily Range Anatomy</span>
          <span className="text-[10px] text-slate-500 font-mono">NY Daily Range</span>
        </div>
        <svg viewBox="0 0 600 220" className="w-full h-auto bg-slate-900/90 rounded-lg border border-slate-800">
          <line x1="520" y1="10" x2="520" y2="180" stroke="#334155" strokeWidth="1.5" />
          <text x="528" y="15" fill="#38bdf8" fontSize="9" fontFamily="sans-serif" fontWeight="bold">PRICE ($)</text>
          <text x="528" y="30" fill="#4ade80" fontSize="9" fontFamily="monospace">4160.00 (BSL High)</text>
          <text x="528" y="100" fill="#cbd5e1" fontSize="9" fontFamily="monospace">4125.00 (MNO)</text>
          <text x="528" y="165" fill="#f87171" fontSize="9" fontFamily="monospace">4090.00 (Judas Low)</text>

          <line x1="20" y1="180" x2="520" y2="180" stroke="#334155" strokeWidth="1.5" />
          <text x="10" y="202" fill="#94a3b8" fontSize="9" fontFamily="sans-serif" fontWeight="bold">TIME (EST):</text>
          <text x="50" y="202" fill="#64748b" fontSize="10" fontFamily="monospace">00:00 MNO</text>
          <text x="150" y="202" fill="#64748b" fontSize="10" fontFamily="monospace">03:00 London</text>
          <text x="250" y="202" fill="#64748b" fontSize="10" fontFamily="monospace">09:30 NY Open</text>
          <text x="380" y="202" fill="#64748b" fontSize="10" fontFamily="monospace">12:00 Lunch</text>
          <text x="470" y="202" fill="#64748b" fontSize="10" fontFamily="monospace">16:00 Close</text>

          <line x1="20" y1="100" x2="520" y2="100" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="5 5" />
          <text x="25" y="92" fill="#cbd5e1" fontSize="10" fontFamily="monospace" fontWeight="bold">Midnight NY Open (MNO)</text>

          <rect x="50" y="80" width="140" height="40" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeDasharray="2 2" />
          <text x="60" y="104" fill="#60a5fa" fontSize="10" fontWeight="bold">1. Accumulation (Asia/London)</text>

          <path d="M 190 100 Q 240 170 280 165" fill="none" stroke="#ef4444" strokeWidth="3" />
          <text x="200" y="175" fill="#f87171" fontSize="10" fontWeight="bold">2. Manipulation (Judas Swing 9:30 AM)</text>

          <path d="M 280 165 Q 380 40 500 30" fill="none" stroke="#22c55e" strokeWidth="3.5" />
          <text x="340" y="50" fill="#4ade80" fontSize="11" fontWeight="bold">3. Distribution (Main Expansion Run)</text>

          <line x1="450" y1="25" x2="510" y2="25" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
          <text x="460" y="20" fill="#38bdf8" fontSize="9" fontWeight="bold">Target BSL</text>
        </svg>
      </div>
    );
  }

  return null;
}

const INITIAL_SIMULATOR_SCENARIOS = [
  {
    id: 'scen-1',
    title: 'Scenario 1: Bullish NY AM Killzone Setup (ES E-Mini 2m)',
    description: 'Price swept Sellside Liquidity (SSL) at 9:30 AM open, followed by a strong displacement break above short-term high (MSS) leaving a BISI FVG on the 2m chart.',
    setupType: 'BULLISH',
    sweepLevel: 4088,
    idealEntry: 4110,
    idealSL: 4086,
    idealTP: 4148,
    candles: [
      { time: '09:28', open: 4110, high: 4112, low: 4102, close: 4104 },
      { time: '09:30', open: 4104, high: 4108, low: 4100, close: 4102 },
      { time: '09:32', open: 4102, high: 4103, low: 4088, close: 4092, note: 'SSL Swept (Novice Trap)' },
      { time: '09:34', open: 4092, high: 4125, low: 4090, close: 4122, note: 'Displacement / Igniting Elephant Bar' },
      { time: '09:36', open: 4122, high: 4138, low: 4120, close: 4135, note: 'MSS Break of High' },
      { time: '09:38', open: 4135, high: 4136, low: 4106, close: 4110, note: 'FVG Retrace / 20 SMA Test' },
      { time: '09:40', open: 4110, high: 4148, low: 4110, close: 4145, note: 'Expansion Run to BSL' },
      { time: '09:42', open: 4145, high: 4155, low: 4142, close: 4152, note: 'Target BSL Liquidity Reached' }
    ]
  },
  {
    id: 'scen-2',
    title: 'Scenario 2: Bearish Judas Swing & SMT Divergence (NQ Futures 2m)',
    description: 'At 9:30 AM NY Open, NQ rallies to sweep Buyside Liquidity (BSL) on the 2m chart while ES fails to make a higher high (SMT Divergence). NQ breaks down violently forming a SIBI FVG.',
    setupType: 'BEARISH',
    sweepLevel: 12545,
    idealEntry: 12505,
    idealSL: 12548,
    idealTP: 12420,
    candles: [
      { time: '09:28', open: 12500, high: 12510, low: 12490, close: 12505 },
      { time: '09:30', open: 12505, high: 12545, low: 12500, close: 12540, note: 'Judas Swing / BSL Sweep' },
      { time: '09:32', open: 12540, high: 12542, low: 12480, close: 12485, note: 'Bearish MSS & 180 Reversal' },
      { time: '09:34', open: 12485, high: 12488, low: 12450, close: 12455, note: 'Displacement Down' },
      { time: '09:36', open: 12455, high: 12510, low: 12452, close: 12505, note: 'Retrace to SIBI FVG' },
      { time: '09:38', open: 12505, high: 12508, low: 12420, close: 12425, note: 'Target SSL Hit' }
    ]
  },
  {
    id: 'scen-3',
    title: 'Scenario 3: ICT 10:00 AM Silver Bullet Window (ES Futures 2m)',
    description: 'Inside the 10:00 - 11:00 AM Silver Bullet window on a 2m chart, ES sweeps 15m session SSL, displaces through structure, and returns to a BISI FVG for execution.',
    setupType: 'BULLISH',
    sweepLevel: 4118,
    idealEntry: 4128,
    idealSL: 4116,
    idealTP: 4156,
    candles: [
      { time: '10:02', open: 4130, high: 4132, low: 4118, close: 4120, note: '15m SSL Swept' },
      { time: '10:04', open: 4120, high: 4142, low: 4119, close: 4140, note: 'Silver Bullet Displacement' },
      { time: '10:06', open: 4140, high: 4141, low: 4126, close: 4128, note: 'Limit Entry in FVG' },
      { time: '10:08', open: 4128, high: 4156, low: 4127, close: 4154, note: '1:2.5 Target Reached' }
    ]
  },
  {
    id: 'scen-4',
    title: 'Scenario 4: PM Session Lunch Sweep & Market On Close (NQ Futures 2m)',
    description: 'During a narrow range day on the 2m chart, price consolidates during NY Lunch (12:00-1:00 PM), sweeps the lunch SSL at 2:15 PM, then expands aggressively into the 3:00 PM MOC profile.',
    setupType: 'BULLISH',
    sweepLevel: 12375,
    idealEntry: 12410,
    idealSL: 12370,
    idealTP: 12480,
    candles: [
      { time: '13:30', open: 12400, high: 12410, low: 12395, close: 12402, note: 'Lunch Consolidation' },
      { time: '14:15', open: 12402, high: 12405, low: 12375, close: 12380, note: 'Lunch Low SSL Swept' },
      { time: '14:18', open: 12380, high: 12435, low: 12378, close: 12430, note: 'PM Displacement / Elephant Bar' },
      { time: '14:22', open: 12430, high: 12432, low: 12405, close: 12410, note: 'MOC Retrace to FVG' },
      { time: '14:26', open: 12410, high: 12480, low: 12410, close: 12475, note: 'MOC Target Expansion' }
    ]
  }
];

const MODULES_DATA = [
  {
    id: 'mod-1',
    title: 'Module 1: Foundational Mechanics & Liquidity Pools',
    episodes: 'Episodes 1-10',
    description: 'Master institutional order flow language, liquidity pools (BSL/SSL), market structure shifts (MSS), Power of 3 (PO3), and economic time macros.',
    color: 'from-blue-600 to-indigo-700',
    badge: 'Foundations',
    topics: [
      {
        ep: 'Ep 1-2',
        title: 'Elements of a Setup & Liquidity Pools (BSL/SSL)',
        setupDiagram: 'bullish_mss',
        coreICT: `In Episodes 1 and 2, ICT lays the fundamental premise of institutional price delivery: financial markets do not move based on retail chart patterns or indicators. Instead, price is governed by IPDA, which moves price between two primary reference points: External Range Liquidity (ERL) and Internal Range Liquidity (IRL).

External Range Liquidity consists of Buyside Liquidity (BSL) resting above old swing highs and Sellside Liquidity (SSL) resting below old swing lows. Before a true directional expansion occurs, IPDA routinely conducts a stop raid or liquidity purge to clear out retail stop losses.

Key Execution Guidelines:
1. Time Window: Focus strictly between 8:30 AM EST (when news embargo lifts) and 11:00 AM EST.
2. Setup Framework: Identify HTF 15m/1h liquidity pools (BSL or SSL). Wait for price to sweep that pool.
3. Lower Timeframe Confirmation: Drop to 1m, 2m, or 3m chart after the sweep to spot displacement.
4. Risk Standard: Never risk more than 1% of equity per trade setup.`,
        velezBridge: `Oliver Velez Visual Correlation:
What ICT identifies as an SSL sweep below an old low, Oliver Velez identifies as a "Novice Breakdown Trap." Amateurs short at the bottom of an extended move far from the 20 SMA. Velez traders wait for these breakdown traps to fail (forming a Bottoming Tail Bar or 180 Reversal) to enter long—the exact point where ICT enters after the SSL sweep!`,
        keyRules: ['Focus strictly on 8:30 AM - 11:00 AM NY EST Killzone', 'Drop to 2m for execution after HTF 15m liquidity sweep', 'Take Low-Hanging Fruit partials at nearest opposing swing high/low']
      },
      {
        ep: 'Ep 3-4',
        title: 'Market Structure Shifts (MSS) & Fair Value Gaps (FVG)',
        setupDiagram: 'bullish_mss',
        coreICT: `Episodes 3 and 4 break down the mechanical trigger of the 2022 Mentorship model: Market Structure Shifts (MSS) and Fair Value Gaps (FVG).

A true MSS occurs when price sweeps a liquidity pool and forcefully breaks a recent swing pivot in the opposite direction. This move MUST exhibit forceful "Displacement"—a rapid 3-candle price expansion.

Displacement creates a Fair Value Gap (FVG):
- Bullish FVG (BISI): Candle 1 High and Candle 3 Low do not overlap, leaving a void in Candle 2.
- Bearish FVG (SIBI): Candle 1 Low and Candle 3 High do not overlap.

Entry Protocol: Place a limit order at the edge of the FVG. Stop loss is placed just beyond the swing high/low that created the displacement leg.`,
        velezBridge: `Oliver Velez Visual Correlation:
The 9:30 AM Judas Swing maps directly to Velez's "Morning Trap." Velez observes retail traders buying morning breakout spikes far from the 20 SMA, only to get trapped when the 180 Reversal candle strikes. Velez trades the Change of Guard; ICT trades the PO3 Distribution phase!`,
        keyRules: ['Avoid trading between 12:00 PM - 1:00 PM NY Lunch (choppy liquidity)', 'Buy below NY Midnight Open (MNO) for bullish days', 'Sell above NY Midnight Open (MNO) for bearish days']
      },
      {
        ep: 'Ep 5-6',
        title: 'Liquidity Sweeps, Turtle Soups & Dealing Ranges',
        setupDiagram: 'bullish_mss',
        coreICT: `Episodes 5 and 6 expand on liquidity raids through the "Turtle Soup" model and establishing the Equilibrium of a Dealing Range.

Turtle Soup Execution:
A Turtle Soup entry occurs when price briefly pierces a key high/low to take stops but fails to close beyond it. Instead of waiting for a full MSS on lower timeframes, advanced traders enter as price rejects the liquidity pool back into the dealing range.

Dealing Range Equilibrium:
Draw a Fibonacci tool from the displacement swing low to swing high.
- Premium (Upper 50%): Area to look for short entries into SIBI FVGs.
- Discount (Lower 50%): Area to look for long entries into BISI FVGs. Never buy in Premium or sell in Discount!`,
        velezBridge: `Oliver Velez Visual Correlation:
Buying in Discount matches Velez's rule of only buying when price is at or near the 20 SMA baseline, never when extended far above it (in Premium).`,
        keyRules: ['Only buy in Discount (< 50% Fibonacci dealing range)', 'Only sell in Premium (> 50% Fibonacci dealing range)', 'Turtle Soups target immediate rebalances to internal FVGs']
      },
      {
        ep: 'Ep 7-10',
        title: 'Daily Bias Blueprint & Economic Calendar Macros',
        setupDiagram: 'po3_amd',
        coreICT: `Episodes 7 through 10 establish how to determine Daily Directional Bias and incorporate Economic Calendar news drivers.

Daily Bias Framework:
- Top-Down Analysis: Begin on the Daily chart. Ask: "Where is IPDA drawn to next? Is it seeking liquidity (ERL) or rebalancing an imbalance (IRL)?"
- High-Impact News Macros: News events (8:30 AM CPI, NFP, PPI, 10:00 AM ISM) act as algorithmic volatility injections. The algorithm uses news catalysts as an excuse to rapidly re-price to predefined technical PD Arrays.
- News Embargo: The 8:30 AM EST embargo lift is your crosshair time to begin looking for setups.`,
        velezBridge: `Oliver Velez Visual Correlation:
Daily Bias aligns with Velez's Daily Chart Location. When price on the Daily chart is far extended above its 20 SMA, Velez anticipates a pullback to location; ICT identifies this as price seeking an internal discount FVG on the higher timeframe.`,
        keyRules: ['Check ForexFactory calendar daily for Red/Orange folder events', 'Do NOT trade directly during the news spike—wait for displacement after the release', 'Trading Medium and High impact news days yields the cleanest setups']
      }
    ]
  },
  {
    id: 'mod-2',
    title: 'Module 2: Order Block Science & Precision Execution',
    episodes: 'Episodes 11-20',
    description: 'Master high-probability Order Blocks, live execution tape reading, multi-market futures/forex killzones, and trade management.',
    color: 'from-emerald-600 to-teal-700',
    badge: 'Execution',
    topics: [
      {
        ep: 'Ep 11-13',
        title: 'Market Structure Science & Advanced Order Blocks',
        setupDiagram: 'bullish_mss',
        coreICT: `Episodes 11 to 13 refine the definition of an Order Block (OB). ICT stresses that NOT every down candle is a bullish order block!

What Makes a Valid High-Probability Order Block?
1. Change in State of Delivery: The candle must represent the final institutional accumulation/distribution before a violent displacement.
2. Must Produce FVG & MSS: The order block MUST spawn an unmitigated FVG and displace through a market structure pivot.
3. Mean Threshold: The 50% midpoint of the OB body is called the Mean Threshold. Candle bodies must hold above the Mean Threshold for a valid bullish OB.

Pyramiding Rule: Scale additions into a winning trade using smaller position sizes (1st entry = 1%, 2nd entry = 0.5%, 3rd entry = 0.25%).`,
        velezBridge: `Oliver Velez Visual Correlation:
An ICT Order Block is equivalent to the base of an Oliver Velez Power Bar / Elephant Bar or a 20 SMA Support Bounce. Velez trades the 20 SMA bounce because institutional orders rest at that moving average; ICT trades the OB because institutional orders were injected at that exact price candle.`,
        keyRules: ['Valid Order Block MUST create an FVG in its displacement leg', 'Bodies must respect the 50% Mean Threshold', 'Pyramid additions with systematically smaller risk']
      },
      {
        ep: 'Ep 14-16',
        title: 'Live Executions & Multiple Intra-Session Setups',
        setupDiagram: 'po3_amd',
        coreICT: `Episodes 14 through 16 walk through live execution tape reading and navigating multiple setups across the NY Morning (8:30-11:00 AM) and NY Afternoon (1:30-4:00 PM) sessions.

Managing the Intra-Day Session:
- 15-Minute Bellwether: The 15m chart is the intermediate bellwether. Use it to establish session narrative.
- Maximum Daily Trades: Limit yourself to a maximum of 4 setups per day (2 in AM session, 2 in PM session).
- Profit Protection: Take partial profits at Low-Hanging Fruit (nearest opposing swing high or low). When price covers 75% of target distance, move SL to Breakeven (BE).`,
        velezBridge: `Oliver Velez Visual Correlation:
Multiple setups in ICT correspond to Velez "Add-on Trades" (20 SMA pullback entries after an initial 20 SMA breakout). Both mentors preach taking partial profits early to guarantee positive expectancy!`,
        keyRules: ['Max 4 trade executions daily', 'Take partials at Low-Hanging Fruit targets', 'Move SL to Breakeven after 75% of target run is achieved']
      },
      {
        ep: 'Ep 17-20',
        title: 'Forex Application & Kill Zone Mechanics',
        setupDiagram: 'po3_amd',
        coreICT: `Episodes 17 to 20 adapt the 2022 Mentorship model to Major Forex pairs (EUR/USD, GBP/USD) using specific time Kill Zones.

Forex Kill Zone Windows:
- London Open Kill Zone: 02:00 AM - 05:00 AM EST (sets the high/low of the day if daily bias is correct).
- New York Open Kill Zone: 07:00 AM - 10:00 AM EST (provides a secondary continuation or reversal setup).

Intermarket Anchor (DXY): Always analyze the US Dollar Index (DXY). Since EUR/USD moves inversely to DXY, a DXY liquidity sweep of a high confirms a EUR/USD long entry.`,
        velezBridge: `Oliver Velez Visual Correlation:
Tape Reading corresponds to Velez Candle-by-Candle psychology. Velez evaluates tail lengths (wick damage) versus solid candle bodies (institutional commitment) relative to the 20 SMA.`,
        keyRules: ['Candle bodies must hold above 50% CE for bullish FVGs', 'Candle close beyond CE = Warning of setup failure', 'Wicks sweeping through levels are normal liquidity raids']
      }
    ]
  },
  {
    id: 'mod-3',
    title: 'Module 3: Tape Reading, Consolidation & Rebalance Theory',
    episodes: 'Episodes 21-30',
    description: 'Deep dive into live market tape reading, handling consolidation vs expansion days, and afternoon PM session liquidity sweeps.',
    color: 'from-purple-600 to-indigo-800',
    badge: 'Tape Reading',
    topics: [
      {
        ep: 'Ep 21-23',
        title: 'Live Tape Reading & Market Behavior Analysis',
        setupDiagram: 'bullish_mss',
        coreICT: `Episodes 21 through 23 deliver real-time live execution commentary on index futures (ES & NQ).

Tape Reading Principles:
1. Do not predict price; read how price reacts as it reaches key PD Arrays (FVGs and Order Blocks).
2. Look for Speed of Delivery: Institutional algorithms move price rapidly through liquidity voids and slowly when accumulating in ranges.
3. Repricing Speed: High speed away from an FVG indicates heavy institutional backlog orders filling.`,
        velezBridge: `Oliver Velez Visual Correlation:
Velez reads tape speed by watching how fast a candle expands relative to its 20 SMA. A rapid explosion away from the 20 SMA indicates an Igniting Elephant Bar that invalidates counter-trend retail traders.`,
        keyRules: ['Observe body closes on 2m timeframes at FVG entry', 'If price lingers inside an FVG too long, exit manually', 'Speed of displacement validates algorithmic interest']
      },
      {
        ep: 'Ep 24-26',
        title: 'High-Probability vs Low-Probability Days',
        setupDiagram: 'po3_amd',
        coreICT: `Episodes 24 to 26 focus on identifying non-trading conditions and avoiding whipsaw consolidation environments.

Low-Probability Conditions:
- High-Impact News Days (e.g. FOMC 2:00 PM days): Morning sessions ahead of FOMC rate decisions are notoriously low-probability, tight ranges.
- Sick Days / Holidays: Low volume days result in algorithm drifting without clean liquidity delivery.
- High-Probability Setup: A clean sweep of Previous Day High/Low during an 8:30 AM news release followed by sharp displacement.`,
        velezBridge: `Oliver Velez Visual Correlation:
Velez refers to low-probability days as "Guerilla/Sideways Markets" where the 20 SMA is completely flat and candles overlap constantly. Velez traders sit on hands until the 20 SMA begins angling up or down!`,
        keyRules: ['Never trade the AM session on FOMC Rate Announcement days', 'Avoid trading when price is trapped in the middle of a prior day range', 'Filter days using Economic Calendar events']
      },
      {
        ep: 'Ep 27-30',
        title: 'Daily Rebalance Theory & Volatility Injections',
        setupDiagram: 'po3_amd',
        coreICT: `Episodes 27 to 30 focus on handling low-probability consolidation days and PM session liquidity sweeps.

PM Session Liquidity Sweep Mechanics:
During consolidation days ahead of news, IPDA typically ranges during NY Lunch (12:00-1:00 PM EST). In the afternoon session (1:30 - 4:00 PM EST), price will routinely sweep the lunch low/high before rebalancing back into the daily range.`,
        velezBridge: `Oliver Velez Visual Correlation:
Top-Down analysis mirrors Velez's Location Strategy: The Daily chart trend relative to the 20 SMA dictates whether you are allowed to take 2-minute Elephant Bar trades in the direction of daily momentum.`,
        keyRules: ['Daily Bias is NOT required every single day—sit on hands when unclear', 'If Daily swept low and closed strong -> Bullish bias next day', '15m chart serves as intermediate bellwether anchor']
      }
    ]
  },
  {
    id: 'mod-4',
    title: 'Module 4: IPDA Algorithmic Theory, Profiles & Risk Mastery',
    episodes: 'Episodes 31-41',
    description: 'Master intraday market profiles, IPDA 3:00 PM Market On Close (MOC) mechanics, position sizing, and psychological risk control.',
    color: 'from-amber-600 to-rose-700',
    badge: 'Mastery',
    topics: [
      {
        ep: 'Ep 31-35',
        title: 'Weekly & Daily Intraday Market Profiles',
        setupDiagram: 'po3_amd',
        coreICT: `Episodes 31 through 35 categorize weekly and daily intraday templates.

Key Intraday Profiles:
1. Classic Expansion Day: Low of the day formed between 8:30 - 10:00 AM EST (bullish), high formed near 3:30 PM.
2. London Close Reversal: Occurs between 10:30 AM - 11:30 AM EST where London traders close positions, creating a temporary retracement or daily reversal.
3. Seeking & Destroying Profile: High volatility chop designed to clear liquidity on both sides before a news event.`,
        velezBridge: `Oliver Velez Visual Correlation:
The London Close Reversal (10:30-11:30 AM) matches Velez's "Topping Tail / Bottoming Tail" exit zone where extended moves far from the 20 SMA snap back to location.`,
        keyRules: ['Watch 10:30 AM - 11:30 AM window for London Close reversals', 'Align lower timeframe entries with weekly template direction', 'Recognize Seek & Destroy profiles to avoid over-trading']
      },
      {
        ep: 'Ep 36-39',
        title: 'IPDA Algorithmic Theory & Market On Close (MOC)',
        setupDiagram: 'po3_amd',
        coreICT: `Episodes 36 through 39 dive deep into IPDA Algorithmic Theory and Market on Close (MOC) profiles.

MOC Mechanics (3:00 PM - 4:00 PM EST):
Between 3:00 PM and 4:00 PM NY local time, institutional orders execute Market on Close rebalancing. IPDA will frequently perform a rapid final sweep of a session high/low before price expands aggressively into the day's close.

Algorithmic Truth: Price is driven purely by Time and Price macros, NOT retail buy/sell pressure or volume!`,
        velezBridge: `Oliver Velez Visual Correlation:
IPDA's mechanical re-pricing mirrors Velez's observation that prices move violently when extended away from moving averages back toward the 20 SMA magnet.`,
        keyRules: ['Smart money closes positions between 3:00 PM - 4:00 PM EST', '3:00 PM MOC sweeps trigger fast expansion into close', 'Blend Time and Price for precision']
      },
      {
        ep: 'Ep 40-41',
        title: 'Risk Management, Pyramiding & Mental Toughness',
        setupDiagram: 'bullish_mss',
        coreICT: `Episodes 40 and 41 complete the mentorship with strict institutional Risk Management rules:

ICT Risk Management Rules:
1. Stop Loss Trimming: When price covers 50% of target distance, trim SL risk to 25% of original size.
2. Breakeven Lock: When price covers 75% of target distance, move SL to Breakeven (BE).
3. Post-Loss Discipline: Following a losing trade, cut position size in half for the next trade to prevent revenge trading.
4. Emotional Detachment: Treat losses as necessary business expenses ("taxes").`,
        velezBridge: `Oliver Velez Visual Correlation:
Velez's "Capital Protection Rule": Never let a winning trade turn into a loser. Both mentors insist that survival in trading depends 100% on risk management, position sizing, and emotional control!`,
        keyRules: ['At 50% target distance: Trim SL risk to 25% original size', 'At 75% target distance: Move SL to Breakeven', 'After a loss: Cut risk size in half for next trade']
      }
    ]
  },
  {
    id: 'mod-silver-bullet',
    title: 'Bonus Module: ICT Silver Bullet & OV Momentum Hybrid',
    episodes: 'Special Topic',
    description: 'The simplified, 1-hour time-based algorithmic strategy combined with Oliver Velez visual confirmation triggers.',
    color: 'from-cyan-600 to-blue-700',
    badge: 'Silver Bullet',
    topics: [
      {
        ep: 'SB Setup',
        title: 'The 1-Hour Silver Bullet Window',
        setupDiagram: 'bullish_mss',
        coreICT: `The ICT Silver Bullet is a simplified, 1-hour time-based algorithmic strategy.

The 3 Silver Bullet Execution Windows:
1. London Open SB: 03:00 AM - 04:00 AM EST
2. NY AM Session SB: 10:00 AM - 11:00 AM EST
3. NY PM Session SB: 02:00 PM - 03:00 PM EST

Silver Bullet Criteria:
1. Wait for a liquidity sweep (SSL or BSL) on a 15m chart.
2. Inside the 60-minute window, drop to a 2m chart and wait for an MSS with displacement creating an FVG.
3. Place a limit order at the FVG edge. Target minimum 1:2 Reward-to-Risk or opposing liquidity pool.`,
        velezBridge: `Oliver Velez Visual Correlation:
Combine the 1-hour Silver Bullet window with an Oliver Velez Igniting Elephant Bar or Bottoming Tail Bar as your instant visual entry trigger inside the 2m FVG!`,
        keyRules: ['Trade strictly within the 60-minute Silver Bullet window', 'Target minimum 1:2 R:R or next liquidity pool', 'Cancel orders if window expires before fill']
      }
    ]
  }
];

const OV_BRIDGE_MATRIX = [
  {
    concept: 'Market Setup / Context',
    ictName: 'Liquidity Purge / Sweep (SSL/BSL)',
    velezName: 'Novice Trap / Location at Extreme',
    explanation: 'ICT views a drop below old lows as sweeping Sell Stop Liquidity (SSL). Oliver Velez views this exact move as a "Novice Trap" where amateur short sellers short at the bottom of a move far from the 20 SMA.'
  },
  {
    concept: 'Shift in Trend Direction',
    ictName: 'Market Structure Shift (MSS)',
    velezName: '180 Reversal / Change of Guard',
    explanation: 'ICT requires an aggressive break above a recent swing high with displacement. Velez identifies a 180 Reversal where an opposing green Elephant Bar completely engulfs the prior red bar.'
  },
  {
    concept: 'Institutional Entry Catalyst',
    ictName: 'Fair Value Gap (FVG / BISI / SIBI)',
    velezName: 'Elephant Bar Invalidation / Void Zone',
    explanation: 'ICT enters on the retracement into the 3-candle imbalance. Velez enters on the first minor pullback into the body of an Igniting Elephant Bar.'
  },
  {
    concept: 'Support / Resistance Level',
    ictName: 'Order Block (OB)',
    velezName: '20 SMA / Elephant Bar Base',
    explanation: 'ICT defines an Order Block as the last up/down candle before a displacement move that created an FVG. Velez trades bounces off the 20 SMA or base of a Power Bar.'
  },
  {
    concept: 'Time & Volatility Macro',
    ictName: 'Judas Swing (9:30 AM NY Open)',
    velezName: 'Morning Trap & Reversal (First 15-30 mins)',
    explanation: 'ICT anticipates a fake movement right at 9:30 AM to engineer liquidity (PO3 Manipulation). Velez labels this the initial morning shakeout before the real direction starts.'
  },
  {
    concept: 'Trade Management & Targets',
    ictName: 'External Range Liquidity (ERL) & Partials',
    velezName: '2-to-1 Reward-to-Risk & Bar-by-Bar Trailing',
    explanation: 'ICT targets opposing old highs/lows and takes partials. Velez targets 2-to-1 or trailing stop under prior candle lows.'
  }
];

const FLASHCARDS_DATA = [
  {
    id: 1,
    term: 'Fair Value Gap (FVG)',
    module: 'Module 1',
    definition: 'A 3-candle pattern where candle 1 wick and candle 3 wick do not overlap, leaving an imbalance in candle 2. Price retraces to rebalance order flow.',
    velezCorrelation: 'Mirrors entering on the pullback into an Igniting Elephant Bar void before momentum resumes.',
    category: 'ICT Core'
  },
  {
    id: 2,
    term: 'Market Structure Shift (MSS)',
    module: 'Module 1',
    definition: 'A break of a significant short-term swing high (bullish) or swing low (bearish) accompanied by forceful displacement following a liquidity sweep.',
    velezCorrelation: 'Matches a Velez 180 Reversal or Change of Guard candle engulfing prior momentum.',
    category: 'ICT Core'
  },
  {
    id: 3,
    term: 'Order Block (OB)',
    module: 'Module 2',
    definition: 'The last down-close candle before an upward move (or up-close before downward move) that caused a displacement AND created a Fair Value Gap.',
    velezCorrelation: 'Functions like a Velez 20 SMA Support Zone or Elephant Bar Base where institutional buyers step in.',
    category: 'ICT Core'
  },
  {
    id: 4,
    term: 'Power of 3 (PO3 / AMD)',
    module: 'Module 1',
    definition: 'The 3-phase daily cycle: Accumulation (range), Manipulation (Judas Swing fakeout), and Distribution (main expansion move).',
    velezCorrelation: 'Corresponds to Velez Morning Trap -> Reversal -> Trend Run to 20 SMA on higher timeframe.',
    category: 'ICT Core'
  },
  {
    id: 5,
    term: 'SMT Divergence',
    module: 'Module 3',
    definition: 'Smart Money Technique: Intermarket crack in correlation. E.g., NQ makes a lower low while ES makes a higher low, signaling underlying strength on ES.',
    velezCorrelation: 'Corresponds to Velez Relative Strength where a leading market index/stock refuses to breakdown with the sector.',
    category: 'Intermarket'
  },
  {
    id: 6,
    term: 'Consequent Encroachment (CE)',
    module: 'Module 3',
    definition: 'The exact 50% midpoint of a Fair Value Gap. Candle bodies should respect CE for high probability setups.',
    velezCorrelation: 'Equivalent to the 50% pullback mark of a Velez Power Bar / Elephant Bar.',
    category: 'Precision'
  },
  {
    id: 7,
    term: 'Sell Side Liquidity (SSL)',
    module: 'Module 1',
    definition: 'Resting sell stop orders below key swing lows or equal lows. Targeted by algorithms before a bullish move.',
    velezCorrelation: 'The "Novice Trap" area where retail traders sell breakdowns right before the market reverses up.',
    category: 'Liquidity'
  },
  {
    id: 8,
    term: 'Silver Bullet Window',
    module: 'Special',
    definition: 'Specific 60-minute time macro (e.g., 10:00-11:00 AM EST) where high probability liquidity runs and FVG re-tests occur.',
    velezCorrelation: 'Aligns with Velez high-probability reversal window after the opening 30-minute volatility settles.',
    category: 'Time Macros'
  }
];

const INITIAL_HOMEWORK_SCENARIOS = [
  {
    id: 'hw-1',
    title: 'Homework 1: Bullish NY AM Killzone Setup (ES E-Mini 2m)',
    timeframe: '2m Chart',
    time: '09:36 AM EST',
    scenarioDescription: 'Price swept yesterday\'s Sell Side Liquidity (SSL) at 9:30 AM, then aggressively surged upward breaking a short-term high on the 2m chart. Identify the FVG, MSS, and Oliver Velez Igniting Elephant Bar.',
    chartData: [
      { candle: 1, open: 4120, high: 4122, low: 4105, close: 4108, time: '09:30' },
      { candle: 2, open: 4108, high: 4109, low: 4095, close: 4098, time: '09:32', note: 'SSL Swept (Novice Trap)' },
      { candle: 3, open: 4098, high: 4128, low: 4096, close: 4125, time: '09:34', note: 'Displacement / Elephant Bar!' },
      { candle: 4, open: 4125, high: 4142, low: 4124, close: 4140, time: '09:36', note: 'MSS Confirmed' },
      { candle: 5, open: 4140, high: 4141, low: 4118, close: 4122, time: '09:38', note: 'Retracement into FVG / 20 SMA' },
      { candle: 6, open: 4122, high: 4155, low: 4121, close: 4152, time: '09:40', note: 'Expansion to Buyside Liquidity' }
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'Where is the primary ICT Buy Entry located in this scenario?',
        options: ['At 4095 (Immediately on the liquidity drop)', 'Inside the FVG retracement between 4109 and 4124', 'Above 4155 after target is reached'],
        correctIndex: 1,
        feedback: 'Correct! The ICT entry is on the retracement into the Fair Value Gap (4109-4124) after displacement confirms the MSS.'
      },
      {
        id: 'q2',
        prompt: 'How would an Oliver Velez practitioner classify Candle 3 (09:34)?',
        options: ['An Exhaustion Bar at resistance', 'An Igniting Elephant Bar starting a new trend off location', 'A Doji indecision bar'],
        correctIndex: 1,
        feedback: 'Spot on! Candle 3 is a giant green Igniting Elephant Bar that engulfs the drop, creating the exact FVG imbalance ICT trades!'
      }
    ]
  }
];

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    module: 'Module 1',
    question: 'What MUST accompany a valid Market Structure Shift (MSS) according to the ICT 2022 Mentorship model?',
    options: [
      'A crossover of the 20 SMA and 200 SMA',
      'Forceful displacement leaving behind an unmitigated Fair Value Gap (FVG)',
      'An RSI reading above 70 or below 30',
      'High volume on the Depth of Market (DOM)'
    ],
    correct: 1,
    explanation: 'ICT stresses that a shift in market structure without displacement and an FVG is usually just a stop hunt (Turtle Soup) or low-probability drift.'
  },
  {
    id: 'q2',
    module: 'Module 1 & Velez Bridge',
    question: 'How does an ICT Fair Value Gap (FVG) correlate to Oliver Velez candle psychology?',
    options: [
      'It represents an overbought Bollinger Band condition',
      'It represents the void/body area of an Igniting Elephant Bar where price moved too fast and needs rebalancing',
      'It is identical to a Velez Doji candle',
      'It is a Moving Average convergence zone'
    ],
    correct: 1,
    explanation: 'An ICT FVG is created by a rapid 3-candle imbalance (displacement). In Velez terminology, this is the body of an Igniting Elephant Bar where price expanded away rapidly.'
  },
  {
    id: 'q3',
    module: 'Module 2',
    question: 'What key requirement elevates a simple up/down candle into a high-probability ICT Order Block?',
    options: [
      'It must be a doji candle',
      'It must occur at 12:00 PM EST',
      'It must precede a displacement move that creates an FVG and breaks structure',
      'It must touch the 200 SMA'
    ],
    correct: 2,
    explanation: 'Not every down candle is a bullish order block! It is only an order block if it led to a change in state of delivery (MSS + FVG).'
  }
];

const GENERATED_SETUP_SCHEMA = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    title: { type: "STRING" },
    timeframe: { type: "STRING" },
    killzoneWindow: { type: "STRING" },
    description: { type: "STRING" },
    setupType: { type: "STRING" },
    sweepLevel: { type: "NUMBER" },
    idealEntry: { type: "NUMBER" },
    idealSL: { type: "NUMBER" },
    idealTP: { type: "NUMBER" },
    narrativeBreakdown: { type: "STRING" },
    ictLogic: { type: "STRING" },
    velez20SmaBridge: { type: "STRING" },
    executionChecklist: { type: "ARRAY", items: { type: "STRING" } },
    candles: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          time: { type: "STRING" },
          open: { type: "NUMBER" },
          high: { type: "NUMBER" },
          low: { type: "NUMBER" },
          close: { type: "NUMBER" },
          note: { type: "STRING" }
        },
        required: ["time", "open", "high", "low", "close"]
      }
    }
  },
  required: ["id", "title", "timeframe", "killzoneWindow", "description", "setupType", "idealEntry", "idealSL", "idealTP", "narrativeBreakdown", "ictLogic", "velez20SmaBridge", "executionChecklist", "candles"]
};

const CASE_STUDY_SCHEMA = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    title: { type: "STRING" },
    timeframe: { type: "STRING" },
    time: { type: "STRING" },
    scenarioDescription: { type: "STRING" },
    chartData: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          candle: { type: "NUMBER" },
          open: { type: "NUMBER" },
          high: { type: "NUMBER" },
          low: { type: "NUMBER" },
          close: { type: "NUMBER" },
          time: { type: "STRING" },
          note: { type: "STRING" }
        },
        required: ["candle", "open", "high", "low", "close", "time"]
      }
    },
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          prompt: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          correctIndex: { type: "NUMBER" },
          feedback: { type: "STRING" }
        },
        required: ["id", "prompt", "options", "correctIndex", "feedback"]
      }
    }
  },
  required: ["id", "title", "timeframe", "time", "scenarioDescription", "chartData", "questions"]
};

const FLASHCARD_SCHEMA = {
  type: "OBJECT",
  properties: {
    id: { type: "NUMBER" },
    term: { type: "STRING" },
    module: { type: "STRING" },
    definition: { type: "STRING" },
    velezCorrelation: { type: "STRING" },
    category: { type: "STRING" }
  },
  required: ["id", "term", "module", "definition", "velezCorrelation", "category"]
};

const QUIZ_QUESTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    module: { type: "STRING" },
    question: { type: "STRING" },
    options: { type: "ARRAY", items: { type: "STRING" } },
    correct: { type: "NUMBER" },
    explanation: { type: "STRING" }
  },
  required: ["id", "module", "question", "options", "correct", "explanation"]
};

const TRADE_AUDIT_SCHEMA = {
  type: "OBJECT",
  properties: {
    grade: { type: "STRING" },
    score: { type: "NUMBER" },
    verdict: { type: "STRING" },
    ruleViolations: { type: "ARRAY", items: { type: "STRING" } },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    ictAnalysis: { type: "STRING" },
    velezAnalysis: { type: "STRING" },
    coachingAdvice: { type: "STRING" }
  },
  required: ["grade", "score", "verdict", "ruleViolations", "strengths", "ictAnalysis", "velezAnalysis", "coachingAdvice"]
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 text-rose-300 border border-rose-800 rounded-xl m-4 space-y-3">
          <h2 className="text-lg font-bold">Something went wrong in the application.</h2>
          <pre className="text-xs font-mono bg-slate-950 p-3 rounded border border-rose-900/50 text-rose-200 overflow-x-auto">
            {this.state.error ? (this.state.error.stack || this.state.error.toString()) : 'Unknown Error'}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-500"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainAppContent() {
  const [activeTab, setActiveTab] = useState('roadmap');
  const [selectedModule, setSelectedModule] = useState('mod-1');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  const [mentorSubTab, setMentorSubTab] = useState('generator');
  const [utilitySubTab, setUtilitySubTab] = useState('calculator');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [glossarySearch, setGlossarySearch] = useState('');

  /* Custom Gemini API Key State */
  const [customApiKeyInput, setCustomApiKeyInput] = useState(() => getGeminiApiKey());
  const [apiKeySavedStatus, setApiKeySavedStatus] = useState(false);

  /* Firebase Authentication State */
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authIsSignUp, setAuthIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    try {
      if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        const firebaseConfig = JSON.parse(__firebase_config);
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        
        const initAuth = async () => {
          try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              await signInWithCustomToken(auth, __initial_auth_token);
            } else if (!auth.currentUser) {
              await signInAnonymously(auth);
            }
          } catch (e) {
            console.warn("Auth initialization error", e);
          }
        };
        initAuth();
        const unsubscribe = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
        return () => unsubscribe();
      }
    } catch (e) {
      console.warn("Firebase not available in this environment", e);
    }
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const app = initializeApp(JSON.parse(__firebase_config));
      const auth = getAuth(app);
      if (authIsSignUp) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const app = initializeApp(JSON.parse(__firebase_config));
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUserSignOut = async () => {
    try {
      if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        const app = initializeApp(JSON.parse(__firebase_config));
        const auth = getAuth(app);
        await signOut(auth);
        await signInAnonymously(auth);
      }
    } catch (e) {
      console.warn("Sign out error", e);
    }
  };

  /* Auto-save User Progress with LocalStorage */
  const [userProgress, setUserProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('ict_ov_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          completedTopics: Array.isArray(parsed?.completedTopics) ? parsed.completedTopics : [],
          quizScores: parsed?.quizScores || {},
          flashcardsMastered: Array.isArray(parsed?.flashcardsMastered) ? parsed.flashcardsMastered : [],
          homeworkCompleted: Array.isArray(parsed?.homeworkCompleted) ? parsed.homeworkCompleted : [],
          tradeJournal: Array.isArray(parsed?.tradeJournal) ? parsed.tradeJournal : [],
          askedQuestions: Array.isArray(parsed?.askedQuestions) ? parsed.askedQuestions : [],
          simStats: parsed?.simStats || { totalTrades: 0, wins: 0, losses: 0, totalR: 0, avgScore: 0 }
        };
      }
    } catch (e) {
      console.warn("Storage read error", e);
    }
    return {
      completedTopics: [],
      quizScores: {},
      flashcardsMastered: [],
      homeworkCompleted: [],
      tradeJournal: [],
      askedQuestions: [],
      simStats: { totalTrades: 0, wins: 0, losses: 0, totalR: 0, avgScore: 0 }
    };
  });

  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('ict_ov_progress', JSON.stringify(userProgress));
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }, [userProgress]);

  const handleResetProgress = () => {
    const defaultProgress = {
      completedTopics: [],
      quizScores: {},
      flashcardsMastered: [],
      homeworkCompleted: [],
      tradeJournal: [],
      askedQuestions: [],
      simStats: { totalTrades: 0, wins: 0, losses: 0, totalR: 0, avgScore: 0 }
    };
    setUserProgress(defaultProgress);
    setSimBalance(10000);
    setSimPosition(null);
    try {
      localStorage.removeItem('ict_ov_progress');
    } catch (e) {
      console.warn("Storage clear error", e);
    }
    setShowResetConfirmModal(false);
  };

  /* Flashcards State */
  const [flashcardDeck, setFlashcardDeck] = useState(FLASHCARDS_DATA);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiFlashcardLoading, setAiFlashcardLoading] = useState(false);

  /* Quiz State */
  const [quizDeck, setQuizDeck] = useState(QUIZ_QUESTIONS);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResultModal, setShowQuizResultModal] = useState(false);
  const [aiQuizLoading, setAiQuizLoading] = useState(false);

  /* Homework State */
  const [homeworkScenarios, setHomeworkScenarios] = useState(INITIAL_HOMEWORK_SCENARIOS);
  const [activeHwId, setActiveHwId] = useState('hw-1');
  const [hwAnswers, setHwAnswers] = useState({});
  const [hwSubmitted, setHwSubmitted] = useState(false);
  const [aiCaseStudyLoading, setAiCaseStudyLoading] = useState(false);

  /* Simulator State */
  const canvasRef = useRef(null);
  const [simulatorScenarios, setSimulatorScenarios] = useState(INITIAL_SIMULATOR_SCENARIOS);
  const [activeScenId, setActiveScenId] = useState('scen-1');
  const [simStep, setSimStep] = useState(0);
  const [showOVOverlay, setShowOVOverlay] = useState(true);
  const [showICTOverlay, setShowICTOverlay] = useState(true);
  const [isPlayingSim, setIsPlayingSim] = useState(false);

  const [simBalance, setSimBalance] = useState(10000);
  const [simPosition, setSimPosition] = useState(null);
  const [customSL, setCustomSL] = useState('');
  const [customTP, setCustomTP] = useState('');
  const [simAuditLoading, setSimAuditLoading] = useState(false);
  const [simAuditAudioUrl, setSimAuditAudioUrl] = useState(null);
  const [simAuditAudioLoading, setSimAuditAudioLoading] = useState(false);
  const [aiChartAnalysis, setAiChartAnalysis] = useState(null);
  const [aiChartLoading, setAiChartLoading] = useState(false);

  /* Roadmap AI & Audio State */
  const [aiTopicAnalysis, setAiTopicAnalysis] = useState(null);
  const [aiTopicLoading, setAiTopicLoading] = useState(false);
  const [aiAudioUrl, setAiAudioUrl] = useState(null);
  const [aiAudioLoading, setAiAudioLoading] = useState(false);
  const [inlineLessonQuestion, setInlineLessonQuestion] = useState('');
  const [inlineLessonAnswer, setInlineLessonAnswer] = useState(null);
  const [inlineLessonLoading, setInlineLessonLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const audioRef = useRef(null);

  /* Journal State */
  const [journalForm, setJournalForm] = useState({
    asset: 'ES E-Mini S&P 500',
    direction: 'Long (Buy)',
    entryTime: '09:35 AM EST',
    timeframe: '2m',
    liquiditySwept: 'Sellside Liquidity (SSL)',
    fvgPresent: 'Yes (BISI / Bullish FVG)',
    riskReward: '1:3.2',
    notes: 'Price swept 9:30 AM low, displaced cleanly through short term high creating a 2m FVG. Entered on 50% CE retest.'
  });
  const [journalAuditResult, setJournalAuditResult] = useState(null);
  const [journalAuditLoading, setJournalAuditLoading] = useState(false);

  /* AI Mentor Hub State */
  const [selectedPresetSetup, setSelectedPresetSetup] = useState('');
  const [setupPromptInput, setSetupPromptInput] = useState('');
  const [setupGenLoading, setSetupGenLoading] = useState(false);
  const [generatedCustomSetup, setGeneratedCustomSetup] = useState(null);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      role: 'assistant',
      text: "Welcome to your AI Institutional Mentor Hub! Ask me any question about ICT 2022 concepts (FVG, MSS, SMT, PO3, Silver Bullet) or Oliver Velez visual momentum principles (Elephant Bars, 20 SMA location, 180 Reversals)."
    }
  ]);
  const [aiChatLoading, setAiChatLoading] = useState(false);

  /* Desk Utilities State */
  const [calcEquity, setCalcEquity] = useState(25000);
  const [calcRiskPct, setCalcRiskPct] = useState(1.0);
  const [calcAsset, setCalcAsset] = useState('ES');
  const [calcEntryPrice, setCalcEntryPrice] = useState(4120.00);
  const [calcStopLossPrice, setCalcStopLossPrice] = useState(4112.00);
  const [calcTargetPrice, setCalcTargetPrice] = useState(4144.00);

  const [biasAnswers, setBiasAnswers] = useState({
    htfTarget: 'BULLISH_BSL',
    dxyTrend: 'BEARISH',
    mnoRelation: 'BELOW_MNO',
    overnightSweep: 'YES_SSL_SWEPT'
  });

  const currentModule = useMemo(() => MODULES_DATA.find(m => m.id === selectedModule) || MODULES_DATA[0], [selectedModule]);
  const currentTopic = useMemo(() => currentModule.topics[selectedTopicIndex] || currentModule.topics[0], [currentModule, selectedTopicIndex]);
  const activeScenario = useMemo(() => simulatorScenarios.find(s => s.id === activeScenId) || simulatorScenarios[0], [simulatorScenarios, activeScenId]);

  const totalTopics = useMemo(() => MODULES_DATA.reduce((acc, m) => acc + m.topics.length, 0), []);
  const completedCount = useMemo(() => (userProgress.completedTopics || []).length, [userProgress.completedTopics]);
  const progressPercent = useMemo(() => Math.round((completedCount / totalTopics) * 100), [completedCount, totalTopics]);

  const calculatedPosition = useMemo(() => {
    const equity = parseFloat(calcEquity) || 25000;
    const riskPct = parseFloat(calcRiskPct) || 1.0;
    const dollarRiskAllowed = equity * (riskPct / 100);

    const entry = parseFloat(calcEntryPrice) || 4120;
    const sl = parseFloat(calcStopLossPrice) || 4112;
    const tp = parseFloat(calcTargetPrice) || 4144;

    const stopDistancePoints = Math.abs(entry - sl);
    const stopDistanceTicks = stopDistancePoints * 4;
    const targetDistancePoints = Math.abs(tp - entry);

    let tickValue = 12.50;
    if (calcAsset === 'MES') tickValue = 1.25;
    else if (calcAsset === 'NQ') tickValue = 5.00;
    else if (calcAsset === 'MNQ') tickValue = 0.50;
    else if (calcAsset === 'EURUSD') tickValue = 10.00;

    const riskPerContract = stopDistanceTicks * tickValue;
    const contracts = riskPerContract > 0 ? Math.floor(dollarRiskAllowed / riskPerContract) || 1 : 1;
    const actualDollarRisk = Math.round(contracts * riskPerContract);
    const potentialProfit = Math.round(contracts * (targetDistancePoints * 4) * tickValue);
    const rrRatio = (targetDistancePoints / (stopDistancePoints || 1)).toFixed(2);

    return {
      dollarRiskAllowed,
      contracts,
      stopDistancePoints,
      stopDistanceTicks,
      actualDollarRisk,
      potentialProfit,
      rrRatio
    };
  }, [calcEquity, calcRiskPct, calcAsset, calcEntryPrice, calcStopLossPrice, calcTargetPrice]);

  const calculatedDailyBias = useMemo(() => {
    let score = 0;
    if (biasAnswers.htfTarget === 'BULLISH_BSL') score += 2;
    else if (biasAnswers.htfTarget === 'BEARISH_SSL') score -= 2;

    if (biasAnswers.dxyTrend === 'BEARISH') score += 1;
    else if (biasAnswers.dxyTrend === 'BULLISH') score -= 1;

    if (biasAnswers.mnoRelation === 'BELOW_MNO') score += 1;
    else score -= 1;

    if (biasAnswers.overnightSweep === 'YES_SSL_SWEPT') score += 2;
    else if (biasAnswers.overnightSweep === 'YES_BSL_SWEPT') score -= 2;

    let verdict = 'NEUTRAL / WAIT FOR LIQUIDITY SWEEP';
    let confidence = '50% - Mixed Market';
    let recommendation = 'Stand aside or wait for 9:30 AM open to sweep a major session high/low before taking trades.';

    if (score >= 3) {
      verdict = 'BULLISH DAILY BIAS (Seek Long Entries in Discount FVGs)';
      confidence = `${Math.min(95, 60 + score * 8)}% High Probability Bullish`;
      recommendation = 'Focus exclusively on buying inside BISI Fair Value Gaps below Midnight NY Open after 8:30/9:30 AM sweeps.';
    } else if (score <= -3) {
      verdict = 'BEARISH DAILY BIAS (Seek Short Entries in Premium FVGs)';
      confidence = `${Math.min(95, 60 + Math.abs(score) * 8)}% High Probability Bearish`;
      recommendation = 'Focus exclusively on selling inside SIBI Fair Value Gaps above Midnight NY Open after 8:30/9:30 AM sweeps.';
    }

    return { score, verdict, confidence, recommendation };
  }, [biasAnswers]);

  const filteredGlossary = useMemo(() => {
    if (!glossarySearch.trim()) return GLOSSARY_DATA;
    const q = glossarySearch.toLowerCase();
    return GLOSSARY_DATA.filter(g =>
      g.term.toLowerCase().includes(q) ||
      g.fullName.toLowerCase().includes(q) ||
      g.definition.toLowerCase().includes(q)
    );
  }, [glossarySearch]);

  const filteredAskedQuestions = useMemo(() => {
    const list = userProgress.askedQuestions || [];
    let items = [...list];
    if (historySearchQuery.trim()) {
      const q = historySearchQuery.toLowerCase();
      items = items.filter(i =>
        i.question.toLowerCase().includes(q) ||
        i.answer.toLowerCase().includes(q) ||
        i.source.toLowerCase().includes(q)
      );
    }
    return items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [userProgress.askedQuestions, historySearchQuery]);

  const handleGenerateSimAuditAudio = async () => {
    if (!simPosition || !simPosition.auditText) return;
    setSimAuditAudioLoading(true);
    setErrorMessage(null);
    try {
      const url = await callGeminiTTS(simPosition.auditText);
      setSimAuditAudioUrl(url);
    } catch (err) {
      setErrorMessage("Could not generate AI Audit Audio: " + err.message);
    } finally {
      setSimAuditAudioLoading(false);
    }
  };

  const handleSimAuditTrade = async () => {
    if (!simPosition) return;
    setSimAuditLoading(true);
    setErrorMessage(null);
    setSimAuditAudioUrl(null);
    try {
      const prompt = `You are evaluating a simulated practice execution on the 2m chart in scenario "${activeScenario.title}".
Trade Position: ${simPosition.type} at ${simPosition.entryPrice} on Bar ${simPosition.entryBar + 1}.
Stop Loss: ${simPosition.sl}, Take Profit: ${simPosition.tp} (R:R Ratio: ${simPosition.rrRatio}:1).
Current Position Status: ${simPosition.status} (Result: ${simPosition.pnl ? '$' + simPosition.pnl : 'Pending'}, R: ${simPosition.rMultiple || 0}R).

Provide a 3-bullet execution grade:
1. Entry Location & FVG Alignment (Did trader buy at discount 2m FVG / 20 SMA pullback?).
2. Risk Management & Stop Placement (Was SL safely placed past sweep low/high?).
3. Final Institutional Coach Verdict & Recommendation for Next Trade.`;

      const resultText = await callGeminiText(prompt);
      setSimPosition(prev => prev ? { ...prev, auditText: resultText } : null);
    } catch (err) {
      setErrorMessage("Could not generate AI Practice Audit: " + err.message);
    } finally {
      setSimAuditLoading(false);
    }
  };

  const handleExecuteSimTrade = (type) => {
    if (!activeScenario) return;
    const currentCandle = activeScenario.candles[simStep] || activeScenario.candles[0];
    const entryPrice = currentCandle.close || currentCandle.c || 4110;
    const sl = parseFloat(customSL) || (type === 'LONG' ? entryPrice - 15 : entryPrice + 15);
    const tp = parseFloat(customTP) || (type === 'LONG' ? entryPrice + 30 : entryPrice - 30);
    const riskPts = Math.abs(entryPrice - sl);
    const rewardPts = Math.abs(tp - entryPrice);
    const rrRatio = (rewardPts / (riskPts || 1)).toFixed(2);

    setSimPosition({
      type,
      entryPrice,
      sl,
      tp,
      rrRatio,
      entryBar: simStep,
      status: 'OPEN',
      pnl: 0,
      rMultiple: 0,
      auditText: null
    });
  };

  const updateSimStats = (isWin, rMultiple) => {
    setUserProgress(prev => {
      const stats = prev.simStats || { totalTrades: 0, wins: 0, losses: 0, totalR: 0, avgScore: 0 };
      const newTotal = stats.totalTrades + 1;
      const newWins = stats.wins + (isWin ? 1 : 0);
      const newLosses = stats.losses + (isWin ? 0 : 1);
      const newTotalR = (stats.totalR || 0) + rMultiple;
      const scoreThisTrade = isWin ? 90 : 40;
      const newAvgScore = Math.round(((stats.avgScore * stats.totalTrades) + scoreThisTrade) / newTotal);
      return {
        ...prev,
        simStats: {
          totalTrades: newTotal,
          wins: newWins,
          losses: newLosses,
          totalR: parseFloat(newTotalR.toFixed(2)),
          avgScore: newAvgScore
        }
      };
    });
  };

  useEffect(() => {
    if (!simPosition || simPosition.status !== 'OPEN' || !activeScenario) return;
    const candle = activeScenario.candles[simStep];
    if (!candle) return;

    const high = candle.high !== undefined ? candle.high : (candle.h || 4110);
    const low = candle.low !== undefined ? candle.low : (candle.l || 4110);

    if (simPosition.type === 'LONG') {
      if (low <= simPosition.sl) {
        const pnl = -250;
        const rMult = -1;
        setSimPosition(prev => ({ ...prev, status: 'CLOSED', hitReason: 'Hit Stop Loss', pnl, rMultiple: rMult }));
        setSimBalance(b => b + pnl);
        updateSimStats(false, rMult);
      } else if (high >= simPosition.tp) {
        const rMult = parseFloat(simPosition.rrRatio);
        const pnl = Math.round(250 * rMult);
        setSimPosition(prev => ({ ...prev, status: 'CLOSED', hitReason: 'Hit Take Profit', pnl, rMultiple: rMult }));
        setSimBalance(b => b + pnl);
        updateSimStats(true, rMult);
      }
    } else if (simPosition.type === 'SHORT') {
      if (high >= simPosition.sl) {
        const pnl = -250;
        const rMult = -1;
        setSimPosition(prev => ({ ...prev, status: 'CLOSED', hitReason: 'Hit Stop Loss', pnl, rMultiple: rMult }));
        setSimBalance(b => b + pnl);
        updateSimStats(false, rMult);
      } else if (low <= simPosition.tp) {
        const rMult = parseFloat(simPosition.rrRatio);
        const pnl = Math.round(250 * rMult);
        setSimPosition(prev => ({ ...prev, status: 'CLOSED', hitReason: 'Hit Take Profit', pnl, rMultiple: rMult }));
        setSimBalance(b => b + pnl);
        updateSimStats(true, rMult);
      }
    }
  }, [simStep, activeScenario, simPosition]);

  const handleGenerateTopicAnalysis = async () => {
    setAiTopicLoading(true);
    setErrorMessage(null);
    try {
      const prompt = `Analyze this specific ICT 2022 Mentorship topic in detail: "${currentTopic.title}" (${currentTopic.ep}).
ICT Core Concept:
${currentTopic.coreICT}

Oliver Velez Bridge:
${currentTopic.velezBridge}

Provide a deep 3-part breakdown:
1. Algorithmic Time & Price Narrative (Why the algorithm moves price at key Killzones).
2. Oliver Velez Visual Confirmation Trigger (How an Elephant Bar, 180 Reversal, or 20 SMA bounce validates the ICT FVG/MSS).
3. Precision Execution & Risk Management Checklist (Exact entry, stop loss placement, and target guidelines).`;

      const response = await callGeminiText(prompt);
      setAiTopicAnalysis(response);
    } catch (err) {
      setErrorMessage("Could not generate AI Analysis: " + err.message);
    } finally {
      setAiTopicLoading(false);
    }
  };

  const saveQuestionToHistory = (source, question, answer) => {
    const newItem = {
      id: 'q-' + Date.now(),
      source,
      question,
      answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pinned: false
    };
    setUserProgress(prev => ({
      ...prev,
      askedQuestions: [newItem, ...(prev.askedQuestions || [])]
    }));
  };

  const handleAskInlineLessonQuestion = async () => {
    if (!inlineLessonQuestion.trim()) return;
    const userQ = inlineLessonQuestion.trim();
    setInlineLessonLoading(true);
    setErrorMessage(null);
    try {
      const prompt = `The student is studying Lesson "${currentTopic.title}" (${currentTopic.ep}) from the ICT 2022 Mentorship.
Lesson Context:
${currentTopic.coreICT}

Student Question: "${userQ}"

Answer the student's question directly, accurately, and authoritatively. Keep it clear and encouraging.`;

      const response = await callGeminiText(prompt);
      setInlineLessonAnswer(response);
      saveQuestionToHistory(`${currentTopic.ep}: ${currentTopic.title}`, userQ, response);
    } catch (err) {
      setErrorMessage("Could not answer lesson question: " + err.message);
    } finally {
      setInlineLessonLoading(false);
    }
  };

  const handleTransferToChatHub = (qText) => {
    const contextPrompt = `I am studying "${currentTopic.title}" (${currentTopic.ep}). ${qText}`;
    setAiChatInput(contextPrompt);
    setActiveTab('aimentor');
    setMentorSubTab('chat');
  };

  const handleGenerateAudioBriefing = async () => {
    setAiAudioLoading(true);
    setErrorMessage(null);
    try {
      const baseText = aiTopicAnalysis || `${currentTopic.title}. ${currentTopic.coreICT}. Oliver Velez Bridge: ${currentTopic.velezBridge}`;
      const url = await callGeminiTTS(baseText);
      setAiAudioUrl(url);
    } catch (err) {
      setErrorMessage("Could not generate AI Audio Briefing: " + err.message);
    } finally {
      setAiAudioLoading(false);
    }
  };

  const handleAnalyzeCurrentChartStep = async () => {
    setAiChartLoading(true);
    setErrorMessage(null);
    try {
      const currentCandle = (activeScenario.candles && activeScenario.candles[simStep]) || activeScenario.candles[0];

      const prompt = `You are observing Bar ${simStep + 1} of ${activeScenario.candles.length} on the 2m chart simulator for "${activeScenario.title}".
Active Candle Details: Time: ${currentCandle.time}, Open: ${currentCandle.open}, High: ${currentCandle.high}, Low: ${currentCandle.low}, Close: ${currentCandle.close}, Phase: ${currentCandle.note || 'Normal delivery'}.

Provide an immediate, 3-bullet institutional tape reading breakdown:
- What is IPDA doing with liquidity right now (BSL or SSL)?
- How does an Oliver Velez practitioner read this 2m candle shape (Elephant Bar, Tail Bar, 20 SMA location)?
- Recommended Trader Action (Wait, Enter Limit, Move SL to Breakeven, Take Partials).`;

      const response = await callGeminiText(prompt);
      setAiChartAnalysis(response);
    } catch (err) {
      setErrorMessage("Could not analyze chart step: " + err.message);
    } finally {
      setAiChartLoading(false);
    }
  };

  const handleGenerateAICaseStudy = async () => {
    setAiCaseStudyLoading(true);
    setErrorMessage(null);
    try {
      const prompt = `Generate a realistic ICT 2022 Mentorship homework scenario on S&P 500 or Nasdaq futures (ES or NQ) on the 2m timeframe.
Include:
- Title, Timeframe (2m), Time of day (Killzone window)
- Detailed scenario description highlighting Sellside/Buyside liquidity sweep (SSL/BSL), displacement, 2m FVG creation, and Oliver Velez momentum correlation.
- Array of 6 sequential candles (Open, High, Low, Close, Time, Note).
- 2 multiple-choice questions testing ICT FVG/MSS identification and Oliver Velez candle psychology with clear feedback.`;

      const newScenario = await callGeminiJSON(prompt, CASE_STUDY_SCHEMA);
      setHomeworkScenarios(prev => [newScenario, ...prev]);
      setActiveHwId(newScenario.id);
      setHwAnswers({});
      setHwSubmitted(false);
    } catch (err) {
      setErrorMessage("Could not generate AI Case Study: " + err.message);
    } finally {
      setAiCaseStudyLoading(false);
    }
  };

  const handleGenerateAIFlashcard = async () => {
    setAiFlashcardLoading(true);
    setErrorMessage(null);
    try {
      const prompt = `Generate an advanced trading flashcard for the ICT 2022 Mentorship & Oliver Velez methodology.
Pick a topic such as Breaker Blocks, Mitigation Blocks, Inverse FVGs, Rejection Blocks, SMT Divergence, or Silver Bullet.
Provide term, module, clear ICT definition, Oliver Velez correlation, and category.`;

      const newCard = await callGeminiJSON(prompt, FLASHCARD_SCHEMA);
      setFlashcardDeck(prev => [newCard, ...prev]);
      setCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      setErrorMessage("Could not generate AI Flashcard: " + err.message);
    } finally {
      setAiFlashcardLoading(false);
    }
  };

  const handleGenerateAIQuiz = async () => {
    setAiQuizLoading(true);
    setErrorMessage(null);
    try {
      const prompt = `Generate an advanced multiple-choice quiz question testing ICT 2022 Mentorship rules or Oliver Velez momentum correlations.
Provide question, 4 clear options, correct option index (0-3), module name, and institutional explanation.`;

      const newQ = await callGeminiJSON(prompt, QUIZ_QUESTION_SCHEMA);
      setQuizDeck(prev => [...prev, newQ]);
      setQuizIndex(quizDeck.length - 1);
      setSelectedOption(null);
      setQuizSubmitted(false);
    } catch (err) {
      setErrorMessage("Could not generate AI Quiz Question: " + err.message);
    } finally {
      setAiQuizLoading(false);
    }
  };

  const handleAuditTradeLog = async () => {
    setJournalAuditLoading(true);
    setErrorMessage(null);
    try {
      const prompt = `Perform an institutional Trade Execution Audit for this trader's logged trade:
Asset: ${journalForm.asset}
Direction: ${journalForm.direction}
Entry Time: ${journalForm.entryTime}
Timeframe: ${journalForm.timeframe}
Liquidity Swept: ${journalForm.liquiditySwept}
Fair Value Gap (FVG) Present?: ${journalForm.fvgPresent}
Reward to Risk: ${journalForm.riskReward}
Trader Notes: "${journalForm.notes}"

Evaluate against strict ICT 2022 Mentorship rules (Killzone time 8:30-11:00 AM EST, Liquidity Sweep first, Displacement with 2m FVG, SL management) and Oliver Velez location rules (20 SMA distance, Elephant bar confirmation).
Provide structured output with grade (A+, A, B, C, F), score (0-100), verdict, rule violations list, strengths, ictAnalysis, velezAnalysis, and coachingAdvice.`;

      const result = await callGeminiJSON(prompt, TRADE_AUDIT_SCHEMA);
      setJournalAuditResult(result);
    } catch (err) {
      setErrorMessage("Could not audit trade log: " + err.message);
    } finally {
      setJournalAuditLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!aiChatInput.trim()) return;

    const userMsg = aiChatInput.trim();
    setAiChatInput('');
    setAiChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiChatLoading(true);
    setErrorMessage(null);

    try {
      const prompt = `Student Question: "${userMsg}"
Provide a clear, high-level institutional explanation bridging ICT 2022 concepts with Oliver Velez visual momentum principles on the 2m execution timeframe. Keep the answer structured with bullet points.`;

      const botReply = await callGeminiText(prompt);
      setAiChatMessages(prev => [...prev, { role: 'assistant', text: botReply }]);
      saveQuestionToHistory('AI Mentor Chat Hub', userMsg, botReply);
    } catch (err) {
      setErrorMessage("Mentor Chat Error: " + err.message);
    } finally {
      setAiChatLoading(false);
    }
  };

  const handleGenerateCustomSetup = async (customPrompt = null) => {
    const promptText = customPrompt || setupPromptInput || "Bullish Order Block with 20 SMA retest on 2m chart";
    setSetupGenLoading(true);
    setErrorMessage(null);
    try {
      const prompt = `Generate a realistic institutional trading setup scenario on the 2m chart for: "${promptText}".
Include:
- Title, Timeframe (2m), Killzone Window
- Description of liquidity sweep, MSS, 2m FVG, and Oliver Velez 20 SMA correlation
- Numerical values for sweep level, ideal entry, ideal SL, ideal TP
- Array of 6 sequential candles (time, open, high, low, close, note)
- Detailed narrative breakdown, ICT logic, Oliver Velez bridge, and execution checklist.`;

      const newSetup = await callGeminiJSON(prompt, GENERATED_SETUP_SCHEMA);
      setGeneratedCustomSetup(newSetup);
    } catch (err) {
      setErrorMessage("Could not generate setup: " + err.message);
    } finally {
      setSetupGenLoading(false);
    }
  };

  const handleExportGeneratedSetupToSimulator = () => {
    if (!generatedCustomSetup) return;
    const exportedScen = {
      id: 'gen-' + Date.now(),
      title: generatedCustomSetup.title,
      description: generatedCustomSetup.description,
      setupType: generatedCustomSetup.setupType || 'BULLISH',
      sweepLevel: generatedCustomSetup.sweepLevel || 4100,
      idealEntry: generatedCustomSetup.idealEntry,
      idealSL: generatedCustomSetup.idealSL,
      idealTP: generatedCustomSetup.idealTP,
      candles: generatedCustomSetup.candles
    };
    setSimulatorScenarios(prev => [exportedScen, ...prev]);
    setActiveScenId(exportedScen.id);
    setSimStep(0);
    setSimPosition(null);
    setActiveTab('simulator');
  };

  const toggleTopicCompletion = (topicKey) => {
    setUserProgress(prev => {
      const list = prev.completedTopics || [];
      const updated = list.includes(topicKey)
        ? list.filter(k => k !== topicKey)
        : [...list, topicKey];
      return { ...prev, completedTopics: updated };
    });
  };

  const handleDeleteHistoryItem = (id) => {
    setUserProgress(prev => ({
      ...prev,
      askedQuestions: (prev.askedQuestions || []).filter(q => q.id !== id)
    }));
  };

  const handleTogglePinItem = (id) => {
    setUserProgress(prev => ({
      ...prev,
      askedQuestions: (prev.askedQuestions || []).map(q => q.id === id ? { ...q, pinned: !q.pinned } : q)
    }));
  };

  const handleClearAllHistory = () => {
    setUserProgress(prev => ({ ...prev, askedQuestions: [] }));
  };

  const handleConvertHistoryToFlashcard = (historyItem) => {
    const newCard = {
      id: Date.now(),
      term: historyItem.question.slice(0, 30) + '...',
      module: 'History Log',
      definition: historyItem.answer,
      velezCorrelation: 'Saved from student Q&A history.',
      category: 'Saved Concept'
    };
    setFlashcardDeck(prev => [newCard, ...prev]);
    setActiveTab('flashcards');
    setCardIndex(0);
  };

  useEffect(() => {
    if (activeTab !== 'simulator' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const chartRightMargin = 70;
    const chartBottomMargin = 30;
    const plotWidth = width - chartRightMargin;
    const plotHeight = height - chartBottomMargin;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (!activeScenario || !activeScenario.candles || activeScenario.candles.length === 0) return;

    const visibleCandles = activeScenario.candles.slice(0, simStep + 1);

    const prices = activeScenario.candles.flatMap(c => [
      c?.open !== undefined ? c.open : c?.o,
      c?.high !== undefined ? c.high : c?.h,
      c?.low !== undefined ? c.low : c?.l,
      c?.close !== undefined ? c.close : c?.c
    ]).filter(p => typeof p === 'number' && !isNaN(p));

    const minP = prices.length ? Math.min(...prices) - 5 : 4080;
    const maxP = prices.length ? Math.max(...prices) + 5 : 4155;
    const priceToY = (p) => plotHeight - ((p - minP) / ((maxP - minP) || 1)) * (plotHeight - 40) - 20;

    const priceStep = Math.max(1, Math.round((maxP - minP) / 5));
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';

    for (let p = Math.ceil(minP); p <= maxP; p += priceStep) {
      const y = priceToY(p);
      if (y >= 0 && y <= plotHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(plotWidth, y);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${p.toFixed(1)}`, plotWidth + 8, y + 3);
      }
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotWidth, 0);
    ctx.lineTo(plotWidth, plotHeight);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('PRICE ($)', plotWidth + 6, 12);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, plotHeight);
    ctx.lineTo(plotWidth, plotHeight);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('TIME (EST - 2m)', 10, height - 8);

    const candleWidth = 32;
    const startX = 40;

    if (showOVOverlay && visibleCandles.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      visibleCandles.forEach((c, i) => {
        const x = startX + i * 65 + candleWidth / 2;
        const cClose = c.close !== undefined ? c.close : (c.c || 4110);
        const smaVal = cClose * 0.4 + (prices[0] || 4110) * 0.6;
        const y = priceToY(smaVal);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.fillStyle = '#60a5fa';
      ctx.font = '11px sans-serif';
      ctx.fillText('OV 20 SMA', plotWidth - 80, 25);
    }

    visibleCandles.forEach((c, i) => {
      const x = startX + i * 65;
      const cOpen = c.open !== undefined ? c.open : (c.o || 4110);
      const cHigh = c.high !== undefined ? c.high : (c.h || 4110);
      const cLow = c.low !== undefined ? c.low : (c.l || 4110);
      const cClose = c.close !== undefined ? c.close : (c.c || 4110);

      const isGreen = cClose >= cOpen;
      const color = isGreen ? '#22c55e' : '#ef4444';

      const openY = priceToY(cOpen);
      const closeY = priceToY(cClose);
      const highY = priceToY(cHigh);
      const lowY = priceToY(cLow);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      ctx.fillStyle = color;
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(Math.abs(closeY - openY), 3);
      ctx.fillRect(x, bodyY, candleWidth, bodyH);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px monospace';
      ctx.fillText(c.time || '', x, height - 8);

      if (c.note) {
        ctx.fillStyle = isGreen ? '#4ade80' : '#f87171';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(c.note, x - 15, isGreen ? highY - 10 : lowY + 18);
      }
    });

    if (simPosition) {
      const { entryPrice, sl, tp } = simPosition;

      const entryY = priceToY(entryPrice);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, entryY);
      ctx.lineTo(plotWidth, entryY);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`ENTRY @ ${entryPrice}`, 10, entryY - 4);

      const slY = priceToY(sl);
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, slY);
      ctx.lineTo(plotWidth, slY);
      ctx.stroke();
      ctx.fillStyle = '#f87171';
      ctx.fillText(`STOP LOSS @ ${sl}`, 10, slY + 12);

      const tpY = priceToY(tp);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, tpY);
      ctx.lineTo(plotWidth, tpY);
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`TAKE PROFIT @ ${tp}`, 10, tpY - 4);

      ctx.setLineDash([]);
    }

  }, [activeTab, activeScenario, simStep, showOVOverlay, showICTOverlay, simPosition]);

  useEffect(() => {
    let timer;
    if (isPlayingSim) {
      timer = setInterval(() => {
        setSimStep(prev => {
          if (prev >= activeScenario.candles.length - 1) {
            setIsPlayingSim(false);
            return activeScenario.candles.length - 1;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlayingSim, activeScenario]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 via-emerald-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-300">
                ICT 2022 Mentorship & Oliver Velez Platform
              </h1>
              <p className="text-xs text-slate-400">Algorithmic Precision x Visual Momentum Academy</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Progress: {progressPercent}%</span>
            </div>
            <div className="w-24 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            <button
              onClick={() => setActiveTab('account')}
              className="flex items-center space-x-1.5 text-xs text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-700 hover:bg-indigo-900 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{firebaseUser ? (firebaseUser.email || 'Anonymous') : 'Sign In'}</span>
            </button>

            <button
              onClick={() => setShowResetConfirmModal(true)}
              className="text-[10px] text-slate-400 hover:text-rose-400 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-rose-800 transition-colors ml-1 flex items-center gap-1"
              title="Reset All Learning Progress"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto scrollbar-none border-t border-slate-800/60">
          {[
            { id: 'roadmap', label: '1. YouTube Curriculum', icon: BookOpen },
            { id: 'bridge', label: '2. Oliver Velez Bridge', icon: Scale },
            { id: 'simulator', label: '3. Practice Trade Simulator', icon: BarChart2 },
            { id: 'homework', label: '4. Homework Assignments', icon: FileText },
            { id: 'flashcards', label: '5. Flashcards Deck', icon: Brain },
            { id: 'quiz', label: '6. Quiz & Assessment', icon: HelpCircle },
            { id: 'journal', label: '7. ✨ AI Trade Auditor', icon: NotebookPen },
            { id: 'glossary', label: '8. Terms & Abbreviations', icon: Bookmark },
            { id: 'aimentor', label: '9. ✨ AI Mentor Hub', icon: Bot },
            { id: 'progress', label: '10. Progress & Analytics', icon: Activity },
            { id: 'utilities', label: '11. ✨ Institutional Desk & Tools', icon: Calculator },
            { id: 'account', label: '12. Account & Profile', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                  active
                    ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 font-bold hover:text-white">Dismiss</button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {activeTab === 'roadmap' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Mentorship Modules
              </h2>
              {MODULES_DATA.map((mod) => {
                const isSelected = mod.id === selectedModule;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setSelectedModule(mod.id);
                      setSelectedTopicIndex(0);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {mod.episodes}
                      </span>
                      <span className="text-xs text-slate-400">{mod.badge}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-100">{mod.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{mod.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className={`p-6 rounded-2xl bg-gradient-to-r ${currentModule.color} text-white shadow-xl`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                    {currentModule.episodes}
                  </span>
                  <span className="text-xs text-white/80">ICT 2022 YouTube Mentorship</span>
                </div>
                <h2 className="text-xl font-extrabold mt-2">{currentModule.title}</h2>
                <p className="text-xs text-white/90 mt-1">{currentModule.description}</p>

                <div className="flex space-x-2 mt-4 overflow-x-auto pb-1">
                  {currentModule.topics.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTopicIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedTopicIndex === idx
                          ? 'bg-white text-slate-900 shadow-md'
                          : 'bg-black/20 text-white/90 hover:bg-white/10'
                      }`}
                    >
                      {t.ep}: {t.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400">{currentTopic.ep}</span>
                    <h3 className="text-lg font-bold text-slate-100">{currentTopic.title}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleGenerateTopicAnalysis}
                      disabled={aiTopicLoading}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-lg hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
                    >
                      {aiTopicLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                      <span>✨ AI Breakdown</span>
                    </button>

                    <button
                      onClick={handleGenerateAudioBriefing}
                      disabled={aiAudioLoading}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl hover:bg-emerald-600/40 disabled:opacity-50"
                    >
                      {aiAudioLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>✨ Listen Audio</span>
                    </button>

                    <button
                      onClick={() => toggleTopicCompletion(`${currentModule.id}-${selectedTopicIndex}`)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        (userProgress.completedTopics || []).includes(`${currentModule.id}-${selectedTopicIndex}`)
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {(userProgress.completedTopics || []).includes(`${currentModule.id}-${selectedTopicIndex}`)
                          ? 'Completed'
                          : 'Mark Done'}
                      </span>
                    </button>
                  </div>
                </div>

                {currentTopic.setupDiagram && (
                  <ChartMarkupDiagram setupType={currentTopic.setupDiagram} />
                )}

                {aiAudioUrl && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-emerald-300 font-semibold">
                      <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Gemini TTS Audio Briefing Ready:</span>
                    </div>
                    <audio ref={audioRef} src={aiAudioUrl} controls autoPlay className="h-8 w-60" />
                  </div>
                )}

                {aiTopicAnalysis && (
                  <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/40 p-5 rounded-xl space-y-3 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-indigo-800/40 pb-2">
                      <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Gemini AI Institutional Deep Dive</span>
                      </div>
                      <button onClick={() => setAiTopicAnalysis(null)} className="text-slate-400 hover:text-white text-xs">Close</button>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-mono bg-slate-950/70 p-4 rounded-lg border border-slate-800">
                      {aiTopicAnalysis}
                    </div>
                  </div>
                )}

                <div className="bg-slate-950/60 p-5 rounded-xl border border-blue-900/40 space-y-3">
                  <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    <span>ICT Algorithmic Core Logic & YouTube Lecture Material</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                    {currentTopic.coreICT}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-xl border border-amber-900/40 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Scale className="w-4 h-4" />
                    <span>Oliver Velez Method Bridge & Correlation</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                    {currentTopic.velezBridge}
                  </div>
                </div>

                <div className="bg-slate-950/90 border border-indigo-500/30 p-5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-indigo-400" /> Ask AI Mentor About This Lesson ({currentTopic.ep}):
                    </span>
                    <button
                      onClick={() => handleTransferToChatHub("Can you elaborate on this lesson?")}
                      className="text-[11px] text-indigo-400 hover:text-indigo-200 underline"
                    >
                      Open in Full Chat Hub →
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inlineLessonQuestion}
                      onChange={(e) => setInlineLessonQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskInlineLessonQuestion()}
                      placeholder={`Ask anything about ${currentTopic.title}...`}
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3.5 py-2 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAskInlineLessonQuestion}
                      disabled={inlineLessonLoading || !inlineLessonQuestion.trim()}
                      className="px-4 py-2 bg-indigo-600 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center space-x-1 shadow hover:bg-indigo-500"
                    >
                      {inlineLessonLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Ask AI</span>
                    </button>
                  </div>

                  {inlineLessonAnswer && (
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2 mt-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-indigo-400">
                        <span>✨ AI Mentor Response (Saved to History Log):</span>
                        <button onClick={() => setInlineLessonAnswer(null)} className="text-slate-500 hover:text-white">Clear</button>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                        {inlineLessonAnswer}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    Strict Rule-Based Checklist
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentTopic.keyRules.map((rule, idx) => (
                      <div key={idx} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 flex items-start space-x-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-300">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bridge' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-900/40 via-slate-900 to-slate-900 border border-amber-500/30 p-6 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">The ICT vs. Oliver Velez Translation Matrix</h2>
                  <p className="text-xs text-slate-400">
                    Bridging ICT's Algorithmic Time & Price "WHY" with Oliver Velez's Visual Momentum & Candlestick "WHAT".
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OV_BRIDGE_MATRIX.map((item, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">{item.concept}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/40">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">ICT Dialect</span>
                      <h4 className="text-xs font-bold text-blue-200 mt-1">{item.ictName}</h4>
                    </div>
                    <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-800/40">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Oliver Velez Dialect</span>
                      <h4 className="text-xs font-bold text-amber-200 mt-1">{item.velezName}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-emerald-400" />
                  Active Practice Trade Simulator & 2m Execution Lab
                </h2>
                <p className="text-xs text-slate-400">
                  Step through 2-minute charts bar-by-bar, place simulated Long/Short orders, set SL/TP parameters, and receive instant performance scoring with audio feedback.
                </p>
              </div>

              <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center space-x-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Sim Equity</span>
                  <div className="text-sm font-extrabold text-emerald-400 font-mono">${simBalance.toLocaleString()}</div>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Sim Win Rate</span>
                  <div className="text-sm font-extrabold text-blue-400 font-mono">
                    {userProgress.simStats?.totalTrades ? Math.round((userProgress.simStats.wins / userProgress.simStats.totalTrades) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {simulatorScenarios.map((scen) => (
                  <button
                    key={scen.id}
                    onClick={() => {
                      setActiveScenId(scen.id);
                      setSimStep(0);
                      setAiChartAnalysis(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeScenId === scen.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {scen.title}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAnalyzeCurrentChartStep}
                  disabled={aiChartLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center space-x-1 shadow hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
                >
                  {aiChartLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  <span>✨ AI Bar Breakdown</span>
                </button>

                <button
                  onClick={() => setShowICTOverlay(!showICTOverlay)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    showICTOverlay ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  ICT Overlays
                </button>

                <button
                  onClick={() => setShowOVOverlay(!showOVOverlay)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    showOVOverlay ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  OV 20 SMA
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {activeScenario.description}
            </p>

            {aiChartAnalysis && (
              <div className="bg-slate-900 border border-indigo-500/40 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-indigo-300 text-xs font-bold uppercase">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-300" /> Gemini AI Tape Reading (Bar {simStep + 1}):</span>
                  <button onClick={() => setAiChartAnalysis(null)} className="text-slate-400 hover:text-white">Close</button>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-line bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {aiChartAnalysis}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={380}
                  className="w-full h-auto rounded-xl bg-slate-950 border border-slate-800"
                />

                <div className="mt-4 flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSimStep(Math.max(0, simStep - 1))}
                    disabled={simStep === 0}
                    className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 text-xs font-semibold rounded-lg flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Bar</span>
                  </button>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono text-emerald-400">
                      2m Candle Bar {simStep + 1} of {activeScenario.candles.length}
                    </span>

                    <button
                      onClick={() => setIsPlayingSim(!isPlayingSim)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 flex items-center space-x-1 shadow hover:bg-emerald-400"
                    >
                      {isPlayingSim ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{isPlayingSim ? 'Pause' : 'Play'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSimStep(Math.min(activeScenario.candles.length - 1, simStep + 1))}
                    disabled={simStep === activeScenario.candles.length - 1}
                    className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 text-xs font-semibold rounded-lg flex items-center space-x-1"
                  >
                    <span>Next Bar</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-blue-400" />
                  Order Execution Controls
                </h3>

                <div className="space-y-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Stop Loss (SL) Price</label>
                    <input
                      type="number"
                      value={customSL}
                      onChange={(e) => setCustomSL(e.target.value)}
                      placeholder="e.g. 4086"
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-rose-300 font-mono px-3 py-1.5 rounded mt-1 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Take Profit (TP) Price</label>
                    <input
                      type="number"
                      value={customTP}
                      onChange={(e) => setCustomTP(e.target.value)}
                      placeholder="e.g. 4148"
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-emerald-300 font-mono px-3 py-1.5 rounded mt-1 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleExecuteSimTrade('LONG')}
                      disabled={simPosition?.status === 'OPEN'}
                      className="py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg hover:bg-emerald-400 disabled:opacity-40 flex items-center justify-center space-x-1"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>BUY (LONG)</span>
                    </button>

                    <button
                      onClick={() => handleExecuteSimTrade('SHORT')}
                      disabled={simPosition?.status === 'OPEN'}
                      className="py-2.5 bg-rose-500 text-white font-bold text-xs rounded-lg shadow-lg hover:bg-rose-400 disabled:opacity-40 flex items-center justify-center space-x-1"
                    >
                      <ArrowDownRight className="w-4 h-4" />
                      <span>SELL (SHORT)</span>
                    </button>
                  </div>
                </div>

                {simPosition && (
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    simPosition.status === 'OPEN'
                      ? 'bg-blue-950/40 border-blue-500/40'
                      : simPosition.pnl > 0
                        ? 'bg-emerald-950/50 border-emerald-500/40'
                        : 'bg-rose-950/50 border-rose-500/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase">
                        {simPosition.type} Position ({simPosition.status})
                      </span>
                      {simPosition.status === 'CLOSED' && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          simPosition.pnl > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {simPosition.hitReason}
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1 font-mono text-slate-300">
                      <div>Entry Price: <span className="text-blue-300">{simPosition.entryPrice}</span></div>
                      <div>Stop Loss: <span className="text-rose-300">{simPosition.sl}</span></div>
                      <div>Take Profit: <span className="text-emerald-300">{simPosition.tp}</span></div>
                      <div>Target R:R: <span className="text-amber-300">{simPosition.rrRatio}:1</span></div>
                      {simPosition.status === 'CLOSED' && (
                        <div className="border-t border-slate-800 pt-1 mt-1 font-bold">
                          Trade Result: <span className={simPosition.pnl > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            ${simPosition.pnl} ({simPosition.rMultiple}R)
                          </span>
                        </div>
                      )}
                    </div>

                    {simPosition.status === 'CLOSED' && (
                      <button
                        onClick={handleSimAuditTrade}
                        disabled={simAuditLoading}
                        className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center space-x-1"
                      >
                        {simAuditLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                        <span>✨ AI Practice Coach Audit</span>
                      </button>
                    )}

                    {simPosition.auditText && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-indigo-800/40 pb-2">
                          <span className="text-[11px] font-bold text-indigo-300 uppercase flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Coach Audit Report:
                          </span>
                          <button
                            onClick={handleGenerateSimAuditAudio}
                            disabled={simAuditAudioLoading}
                            className="px-2.5 py-1 bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold rounded-lg hover:bg-emerald-600/40 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {simAuditAudioLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                            <span>Listen Audio</span>
                          </button>
                        </div>

                        {simAuditAudioUrl && (
                          <div className="bg-emerald-950/40 border border-emerald-500/40 p-2 rounded-lg flex items-center justify-between">
                            <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Audio Audit Ready:
                            </span>
                            <audio src={simAuditAudioUrl} controls autoPlay className="h-7 w-48" />
                          </div>
                        )}

                        <div className="bg-slate-950 p-3 rounded-lg border border-indigo-800/40 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                          {simPosition.auditText}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'homework' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Mentorship Homework & Case Studies
                </h2>
                <p className="text-xs text-slate-400">Identify setups on sequential chart candle tables and answer guided questions.</p>
              </div>

              <button
                onClick={handleGenerateAICaseStudy}
                disabled={aiCaseStudyLoading}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg hover:from-emerald-500 hover:to-teal-500 flex items-center space-x-1.5 disabled:opacity-50"
              >
                {aiCaseStudyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                <span>✨ Generate Case Study</span>
              </button>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-1">
              {homeworkScenarios.map((hw) => (
                <button
                  key={hw.id}
                  onClick={() => {
                    setActiveHwId(hw.id);
                    setHwAnswers({});
                    setHwSubmitted(false);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeHwId === hw.id ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {hw.title}
                </button>
              ))}
            </div>

            {(() => {
              const activeHw = homeworkScenarios.find(h => h.id === activeHwId) || homeworkScenarios[0];
              return (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-400">{activeHw.timeframe} • {activeHw.time}</span>
                      <h3 className="text-base font-bold text-slate-100">{activeHw.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
                    {activeHw.scenarioDescription}
                  </p>

                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Sequential Candle Delivery Data:</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                          <tr>
                            <th className="p-2">Bar #</th>
                            <th className="p-2">Time</th>
                            <th className="p-2">Open</th>
                            <th className="p-2">High</th>
                            <th className="p-2">Low</th>
                            <th className="p-2">Close</th>
                            <th className="p-2">Institutional Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeHw.chartData.map((row, idx) => (
                            <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 font-mono">
                              <td className="p-2 text-slate-500">{row.candle}</td>
                              <td className="p-2 text-slate-400">{row.time}</td>
                              <td className="p-2">{row.open}</td>
                              <td className="p-2 text-emerald-400">{row.high}</td>
                              <td className="p-2 text-rose-400">{row.low}</td>
                              <td className="p-2 font-bold">{row.close}</td>
                              <td className="p-2 text-amber-300 font-sans font-medium">{row.note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {activeHw.questions.map((q, qIdx) => (
                      <div key={q.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <h5 className="text-xs font-bold text-slate-200">{qIdx + 1}. {q.prompt}</h5>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = hwAnswers[q.id] === optIdx;
                            let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                            if (hwSubmitted) {
                              if (optIdx === q.correctIndex) btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                              else if (isSelected) btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                            } else if (isSelected) {
                              btnStyle = 'bg-blue-600/20 border-blue-500 text-blue-200';
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => !hwSubmitted && setHwAnswers({ ...hwAnswers, [q.id]: optIdx })}
                                className={`w-full text-left p-3 rounded-lg text-xs font-medium border transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {hwSubmitted && (
                          <div className="text-xs p-3 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 font-sans">
                            {q.feedback}
                          </div>
                        )}
                      </div>
                    ))}

                    {!hwSubmitted ? (
                      <button
                        onClick={() => setHwSubmitted(true)}
                        disabled={Object.keys(hwAnswers).length < activeHw.questions.length}
                        className="w-full py-3 bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-400"
                      >
                        Submit Homework Answers
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setHwAnswers({});
                          setHwSubmitted(false);
                        }}
                        className="w-full py-3 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                      >
                        Reset Assignment
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Flashcard Mastery Deck
                </h2>
                <p className="text-xs text-slate-400">Master algorithmic definitions & Oliver Velez momentum correlations.</p>
              </div>

              <button
                onClick={handleGenerateAIFlashcard}
                disabled={aiFlashcardLoading}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg hover:from-purple-500 hover:to-indigo-500 flex items-center space-x-1.5 disabled:opacity-50"
              >
                {aiFlashcardLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                <span>✨ AI Flashcard</span>
              </button>
            </div>

            {(() => {
              const currentCard = flashcardDeck[cardIndex] || flashcardDeck[0];
              return (
                <div className="space-y-4">
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-8 rounded-2xl min-h-[260px] flex flex-col justify-between transition-all duration-300 shadow-2xl relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400 px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20">
                        {currentCard.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{currentCard.module}</span>
                    </div>

                    <div className="text-center py-6">
                      {!isFlipped ? (
                        <h3 className="text-2xl font-black text-slate-100">{currentCard.term}</h3>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-200 leading-relaxed font-sans">{currentCard.definition}</p>
                          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 text-xs text-amber-300">
                            <span className="font-bold text-amber-400 uppercase block mb-0.5">Oliver Velez Correlation:</span>
                            {currentCard.velezCorrelation}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 text-center">
                      Card {cardIndex + 1} of {flashcardDeck.length} • Click to {isFlipped ? 'hide' : 'reveal'} answer
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCardIndex((cardIndex - 1 + flashcardDeck.length) % flashcardDeck.length);
                      }}
                      className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-slate-300 hover:bg-slate-700"
                    >
                      Previous Card
                    </button>

                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="px-4 py-2 bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold rounded-xl"
                    >
                      Flip Card
                    </button>

                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCardIndex((cardIndex + 1) % flashcardDeck.length);
                      }}
                      className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-slate-300 hover:bg-slate-700"
                    >
                      Next Card
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-400" />
                  Mentorship Knowledge Assessment
                </h2>
                <p className="text-xs text-slate-400">Test your understanding of ICT 2022 concepts & Oliver Velez correlations.</p>
              </div>

              <button
                onClick={handleGenerateAIQuiz}
                disabled={aiQuizLoading}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg hover:from-emerald-500 hover:to-teal-500 flex items-center space-x-1.5 disabled:opacity-50"
              >
                {aiQuizLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                <span>✨ Generate Question</span>
              </button>
            </div>

            {showQuizResultModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl text-center">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-100">Assessment Complete!</h3>
                  <p className="text-xs text-slate-300">
                    You scored <span className="font-bold text-emerald-400">{quizScore}</span> out of <span className="font-bold text-slate-100">{quizDeck.length}</span> questions correctly.
                  </p>
                  <button
                    onClick={() => {
                      setShowQuizResultModal(false);
                      setQuizIndex(0);
                      setSelectedOption(null);
                      setQuizSubmitted(false);
                    }}
                    className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-emerald-400"
                  >
                    Restart Quiz
                  </button>
                </div>
              </div>
            )}

            {(() => {
              const q = quizDeck[quizIndex] || quizDeck[0];
              return (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-emerald-400">{q.module}</span>
                    <span className="text-xs font-mono text-slate-500">Question {quizIndex + 1} of {quizDeck.length}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 leading-snug">{q.question}</h3>

                  <div className="space-y-3">
                    {q.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

                      if (quizSubmitted) {
                        if (idx === q.correct) btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200';
                        else if (isSelected) btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                      } else if (isSelected) {
                        btnStyle = 'bg-blue-600/20 border-blue-500 text-blue-200';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => !quizSubmitted && setSelectedOption(idx)}
                          className={`w-full text-left p-4 rounded-xl text-xs font-medium border transition-all ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-emerald-400">Explanation:</span>
                      <p className="text-xs text-slate-300">{q.explanation}</p>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    {!quizSubmitted ? (
                      <button
                        onClick={() => {
                          if (selectedOption !== null) {
                            setQuizSubmitted(true);
                            if (selectedOption === q.correct) setQuizScore(prev => prev + 1);
                          }
                        }}
                        disabled={selectedOption === null}
                        className="w-full py-3 bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-400"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (quizIndex < quizDeck.length - 1) {
                            setQuizIndex(prev => prev + 1);
                            setSelectedOption(null);
                            setQuizSubmitted(false);
                          } else {
                            setShowQuizResultModal(true);
                          }
                        }}
                        className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-blue-500"
                      >
                        {quizIndex < quizDeck.length - 1 ? 'Next Question' : 'Complete Quiz'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 border border-blue-500/30 p-6 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                  <NotebookPen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">✨ Gemini AI Institutional Trade Auditor</h2>
                  <p className="text-xs text-slate-400">
                    Log your executed trade and receive an AI audit evaluating compliance with ICT rules & Oliver Velez momentum.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged Trade Execution Details:</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Asset / Symbol</label>
                  <select
                    value={journalForm.asset}
                    onChange={(e) => setJournalForm({ ...journalForm, asset: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                  >
                    <option>ES E-Mini S&P 500</option>
                    <option>NQ E-Mini Nasdaq</option>
                    <option>EUR/USD Forex</option>
                    <option>GBP/USD Forex</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Direction</label>
                  <select
                    value={journalForm.direction}
                    onChange={(e) => setJournalForm({ ...journalForm, direction: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                  >
                    <option>Long (Buy)</option>
                    <option>Short (Sell)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Execution Time (Killzone)</label>
                  <input
                    type="text"
                    value={journalForm.entryTime}
                    onChange={(e) => setJournalForm({ ...journalForm, entryTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Liquidity Swept?</label>
                  <select
                    value={journalForm.liquiditySwept}
                    onChange={(e) => setJournalForm({ ...journalForm, liquiditySwept: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                  >
                    <option>Sellside Liquidity (SSL)</option>
                    <option>Buyside Liquidity (BSL)</option>
                    <option>No Liquidity Swept</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400">FVG / Displacement Present?</label>
                  <select
                    value={journalForm.fvgPresent}
                    onChange={(e) => setJournalForm({ ...journalForm, fvgPresent: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                  >
                    <option>Yes (BISI / Bullish FVG)</option>
                    <option>Yes (SIBI / Bearish FVG)</option>
                    <option>No FVG Present</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Reward-to-Risk Ratio</label>
                  <input
                    type="text"
                    value={journalForm.riskReward}
                    onChange={(e) => setJournalForm({ ...journalForm, riskReward: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400">Trade Setup Notes & Narrative</label>
                <textarea
                  value={journalForm.notes}
                  onChange={(e) => setJournalForm({ ...journalForm, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-3 rounded-lg mt-1 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleAuditTradeLog}
                disabled={journalAuditLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-blue-500 hover:to-purple-500 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {journalAuditLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                <span>✨ Audit Trade Execution with Gemini AI</span>
              </button>
            </div>

            {journalAuditResult && (
              <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`px-4 py-2 rounded-xl text-lg font-black ${
                      (journalAuditResult.grade || '').includes('A') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      Grade: {journalAuditResult.grade || 'N/A'} ({journalAuditResult.score || 0}/100)
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{journalAuditResult.verdict || 'Audit Completed'}</h4>
                      <p className="text-xs text-slate-400">Gemini Institutional Audit Report</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 space-y-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" /> Strengths Identified:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                      {(journalAuditResult.strengths || []).map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/40 space-y-1">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <ThumbsDown className="w-3.5 h-3.5" /> Rule Violations / Warnings:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 pt-1 list-disc list-inside">
                      {(journalAuditResult.ruleViolations || []).map((v, idx) => <li key={idx}>{v}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-blue-400 uppercase">ICT Algorithmic Model Audit</span>
                  <p className="text-xs text-slate-300">{journalAuditResult.ictAnalysis}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase">Oliver Velez Momentum Audit</span>
                  <p className="text-xs text-slate-300">{journalAuditResult.velezAnalysis}</p>
                </div>

                <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-800/40 space-y-1">
                  <span className="text-xs font-bold text-indigo-300 uppercase">Mentor Coaching Advice</span>
                  <p className="text-xs text-indigo-200">{journalAuditResult.coachingAdvice}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">ICT & Oliver Velez Glossary of Abbreviations</h2>
                  <p className="text-xs text-slate-400">Quick reference dictionary defining all proprietary terms used across the mentorship.</p>
                </div>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="Search BSL, SSL, FVG..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGlossary.map((item, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2 hover:border-blue-500/40 transition-all shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-blue-400 font-mono">{item.term}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{item.fullName}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'aimentor' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/60 border border-indigo-500/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    ✨ AI Trading Mentor Hub & Setup Generator
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ask questions, generate visual setup examples (e.g. Order Blocks, SMT), or review your saved history log.
                  </p>
                </div>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setMentorSubTab('generator')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    mentorSubTab === 'generator' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Setup Generator</span>
                </button>

                <button
                  onClick={() => setMentorSubTab('chat')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    mentorSubTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Live Chat</span>
                </button>

                <button
                  onClick={() => setMentorSubTab('history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    mentorSubTab === 'history' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History Log ({userProgress.askedQuestions?.length || 0})</span>
                </button>
              </div>
            </div>

            {mentorSubTab === 'generator' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Ask AI to Show an Example Setup & Deep Explanation
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Pick a preset concept or type any specific setup. Gemini AI will generate a complete synthetic chart model, entry/exit criteria, and institutional explanation.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Preset Setup Examples:</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Bullish Order Block (OB)',
                        'Bearish Order Block (OB)',
                        'Silver Bullet 10 AM Window',
                        'SMT Divergence (NQ vs ES)',
                        'Power of 3 (PO3 / Judas Swing)',
                        'Inverse Fair Value Gap (IFVG)',
                        'Oliver Velez 180 Reversal',
                        'Novice Breakdown Trap Sweep'
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedPresetSetup(preset);
                            handleGenerateCustomSetup(preset);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            selectedPresetSetup === preset
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Or Request Custom Concept Example:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={setupPromptInput}
                        onChange={(e) => setSetupPromptInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateCustomSetup()}
                        placeholder="e.g. Explain Breaker Blocks vs Mitigation Blocks with a step-by-step example..."
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleGenerateCustomSetup()}
                        disabled={setupGenLoading}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 flex items-center space-x-1.5 shrink-0"
                      >
                        {setupGenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-amber-300" />}
                        <span>✨ Generate Setup</span>
                      </button>
                    </div>
                  </div>
                </div>

                {generatedCustomSetup && (
                  <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 space-y-6 shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                      <div>
                        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400">
                          <span>{generatedCustomSetup.timeframe}</span>
                          <span>•</span>
                          <span>{generatedCustomSetup.killzoneWindow}</span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-100">{generatedCustomSetup.title}</h3>
                      </div>

                      <button
                        onClick={handleExportGeneratedSetupToSimulator}
                        className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-400 flex items-center space-x-2 shrink-0"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Load into 2m Practice Simulator →</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      {generatedCustomSetup.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Sweep Level</span>
                        <span className="text-amber-400 font-bold">{generatedCustomSetup.sweepLevel || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Ideal Entry</span>
                        <span className="text-blue-400 font-bold">{generatedCustomSetup.idealEntry}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Stop Loss</span>
                        <span className="text-rose-400 font-bold">{generatedCustomSetup.idealSL}</span>
                      </div>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Take Profit</span>
                        <span className="text-emerald-400 font-bold">{generatedCustomSetup.idealTP}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Step-by-Step Delivery Candles:</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-300">
                          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                            <tr>
                              <th className="p-2">Time</th>
                              <th className="p-2">Open</th>
                              <th className="p-2">High</th>
                              <th className="p-2">Low</th>
                              <th className="p-2">Close</th>
                              <th className="p-2">Institutional Action Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedCustomSetup.candles.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 font-mono">
                                <td className="p-2 text-slate-400">{row.time}</td>
                                <td className="p-2">{row.open}</td>
                                <td className="p-2 text-emerald-400">{row.high}</td>
                                <td className="p-2 text-rose-400">{row.low}</td>
                                <td className="p-2 font-bold">{row.close}</td>
                                <td className="p-2 text-amber-300 font-sans font-medium">{row.note || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-4 h-4" /> Algorithmic Order Flow Narrative
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                          {generatedCustomSetup.narrativeBreakdown}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/40 space-y-1">
                          <span className="text-xs font-bold text-blue-400 uppercase">ICT Core Mechanics</span>
                          <p className="text-xs text-slate-300">{generatedCustomSetup.ictLogic}</p>
                        </div>

                        <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/40 space-y-1">
                          <span className="text-xs font-bold text-amber-400 uppercase">Oliver Velez 20 SMA Bridge</span>
                          <p className="text-xs text-slate-300">{generatedCustomSetup.velez20SmaBridge}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Execution Checklist:</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {generatedCustomSetup.executionChecklist.map((item, idx) => (
                            <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mentorSubTab === 'chat' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-2xl">
                <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-400" /> Interactive Mentor Conversation
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Gemini 2.5 Flash API</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {aiChatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none font-sans whitespace-pre-line'
                      }`}>
                        <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-bold opacity-70">
                          {msg.role === 'user' ? (
                            <span>You</span>
                          ) : (
                            <span className="flex items-center gap-1 text-indigo-300">
                              <Bot className="w-3 h-3" /> AI Mentor
                            </span>
                          )}
                        </div>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-950 border border-slate-800 text-slate-400 p-3 rounded-2xl text-xs flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>AI Mentor is analyzing market order flow...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex space-x-2 overflow-x-auto text-[11px]">
                  {[
                    "Show example of Bullish Order Block on 2m",
                    "Explain Consequent Encroachment (CE) vs Mean Threshold",
                    "Explain SMT Divergence between NQ and ES",
                    "Explain PO3 Judas Swing mechanics"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAiChatInput(chip)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg whitespace-nowrap shrink-0"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="p-3 border-t border-slate-800 bg-slate-950/80 rounded-b-2xl flex items-center space-x-2">
                  <input
                    type="text"
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    placeholder="Ask a question (e.g. How does SMT divergence confirm an FVG entry?)..."
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={aiChatLoading || !aiChatInput.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>✨ Send</span>
                  </button>
                </div>
              </div>
            )}

            {mentorSubTab === 'history' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Search past questions or answers..."
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {userProgress.askedQuestions && userProgress.askedQuestions.length > 0 && (
                    <button
                      onClick={handleClearAllHistory}
                      className="px-3 py-2 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl hover:bg-rose-900 flex items-center justify-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All History</span>
                    </button>
                  )}
                </div>

                {filteredAskedQuestions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <History className="w-8 h-8 mx-auto opacity-40 text-indigo-400" />
                    <p className="text-xs font-semibold">No questions recorded in history yet.</p>
                    <p className="text-[11px] text-slate-600">Ask questions in any YouTube lesson or live chat to automatically save them here.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {filteredAskedQuestions.map((item) => (
                      <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative group">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/50">
                            {item.source}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                            
                            <button
                              onClick={() => handleTogglePinItem(item.id)}
                              className={`p-1 transition-colors ${item.pinned ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'}`}
                              title={item.pinned ? 'Unpin' : 'Pin to top'}
                            >
                              <Pin className="w-3.5 h-3.5 fill-current" />
                            </button>

                            <button
                              onClick={() => handleConvertHistoryToFlashcard(item)}
                              className="text-purple-400 hover:text-purple-300 text-[10px] font-bold px-2 py-0.5 bg-purple-950/60 rounded border border-purple-800/40"
                              title="Add to Flashcard Deck"
                            >
                              + Flashcard
                            </button>

                            <button
                              onClick={() => handleDeleteHistoryItem(item.id)}
                              className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-500">Your Question:</span>
                          <h4 className="text-xs font-bold text-slate-100 mt-0.5">{item.question}</h4>
                        </div>

                        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-indigo-400">AI Mentor Explanation:</span>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Learning Progress & Practice Execution Analytics
                </h2>
                <p className="text-xs text-slate-400">Track completed mentorship topics, simulator execution metrics, and audit history.</p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
                  <CheckCircle className="w-3.5 h-3.5" /> Auto-Saved
                </span>
                <button
                  onClick={() => setShowResetConfirmModal(true)}
                  className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Progress</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl text-center space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Topics Completed</span>
                <div className="text-3xl font-extrabold text-emerald-400">{completedCount} / {totalTopics}</div>
                <p className="text-[10px] text-slate-500">{progressPercent}% of full 2022 Mentorship</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl text-center space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Simulated Win Rate</span>
                <div className="text-3xl font-extrabold text-blue-400">
                  {userProgress.simStats?.totalTrades ? Math.round((userProgress.simStats.wins / userProgress.simStats.totalTrades) * 100) : 0}%
                </div>
                <p className="text-[10px] text-slate-500">{userProgress.simStats?.totalTrades || 0} Total Simulated Trades</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl text-center space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total R-Multiple Earned</span>
                <div className="text-3xl font-extrabold text-amber-400">
                  {userProgress.simStats?.totalR || 0}R
                </div>
                <p className="text-[10px] text-slate-500">Cumulative Risk-to-Reward Profit</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl text-center space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Avg Execution Score</span>
                <div className="text-3xl font-extrabold text-purple-400">
                  {userProgress.simStats?.avgScore || 0} / 100
                </div>
                <p className="text-[10px] text-slate-500">Algorithmic Discipline Grade</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'utilities' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Institutional Execution Desk & Analytical Utilities</h2>
                  <p className="text-xs text-slate-400">Precision calculators, SMT intermarket visualizers, macro schedules, and bias builders.</p>
                </div>
              </div>

              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                {[
                  { id: 'calculator', label: 'Position Calculator', icon: DollarSign },
                  { id: 'smt', label: 'SMT Visualizer', icon: LineChart },
                  { id: 'macros', label: 'Killzone Schedule', icon: Clock },
                  { id: 'bias', label: 'Daily Bias Builder', icon: Compass }
                ].map((item) => {
                  const Icon = item.icon;
                  const active = utilitySubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setUtilitySubTab(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        active ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {utilitySubTab === 'calculator' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-3xl mx-auto">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Futures & Forex Position Sizing Calculator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Never exceed risk limits! Calculate exact contract sizing based on tick values and equity percentage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Account Equity ($)</label>
                      <input
                        type="number"
                        value={calcEquity}
                        onChange={(e) => setCalcEquity(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 px-3 py-2 rounded mt-1 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Risk Percentage Per Trade (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={calcRiskPct}
                        onChange={(e) => setCalcRiskPct(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-emerald-300 px-3 py-2 rounded mt-1 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400">Asset / Contract Instrument</label>
                      <select
                        value={calcAsset}
                        onChange={(e) => setCalcAsset(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 px-3 py-2 rounded mt-1 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ES">ES (E-Mini S&P) - $12.50 / tick</option>
                        <option value="MES">MES (Micro S&P) - $1.25 / tick</option>
                        <option value="NQ">NQ (E-Mini Nasdaq) - $5.00 / tick</option>
                        <option value="MNQ">MNQ (Micro Nasdaq) - $0.50 / tick</option>
                        <option value="EURUSD">EUR/USD Forex - $10.00 / pip</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">Entry Price</label>
                        <input
                          type="number"
                          value={calcEntryPrice}
                          onChange={(e) => setCalcEntryPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-blue-300 px-2 py-1.5 rounded mt-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">Stop Loss</label>
                        <input
                          type="number"
                          value={calcStopLossPrice}
                          onChange={(e) => setCalcStopLossPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-rose-300 px-2 py-1.5 rounded mt-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-400">Target TP</label>
                        <input
                          type="number"
                          value={calcTargetPrice}
                          onChange={(e) => setCalcTargetPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-emerald-300 px-2 py-1.5 rounded mt-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-xl border border-emerald-500/30 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Calculated Position Sizing Output</span>
                      <div className="mt-3 space-y-3 font-mono text-xs">
                        <div className="flex justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-slate-400 font-sans">Max Dollar Risk Allowed:</span>
                          <span className="text-slate-100 font-bold">${calculatedPosition.dollarRiskAllowed.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-slate-400 font-sans">Stop Loss Distance:</span>
                          <span className="text-rose-300 font-bold">{calculatedPosition.stopDistancePoints} pts ({calculatedPosition.stopDistanceTicks} ticks)</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-slate-400 font-sans">Recommended Contracts:</span>
                          <span className="text-emerald-400 font-extrabold text-lg">{calculatedPosition.contracts} Contracts</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-slate-400 font-sans">Actual Dollar Risk:</span>
                          <span className="text-amber-400 font-bold">${calculatedPosition.actualDollarRisk.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-sans">Reward-to-Risk (R:R):</span>
                          <span className="text-blue-400 font-bold">{calculatedPosition.rrRatio} : 1</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                      <span className="font-bold text-emerald-400 block mb-0.5">Execution Rule:</span>
                      Never trade if R:R is below 1:2.0! Adjust stop loss or target to maintain optimal risk parameters.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {utilitySubTab === 'smt' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-purple-400" />
                    SMT Intermarket Divergence Visualizer (ES vs NQ)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Understand how cracks in correlation between ES and NQ reveal institutional accumulation before explosive moves.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/40 space-y-2">
                    <span className="text-xs font-bold text-blue-400 font-mono">ES (S&P 500) - Higher Low (Stronger Asset)</span>
                    <svg viewBox="0 0 300 120" className="w-full h-28 bg-slate-900/80 rounded border border-slate-800">
                      <polyline points="20,80 70,40 120,90 180,30 240,70 280,20" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                      <circle cx="120" cy="90" r="4" fill="#22c55e" />
                      <text x="130" y="95" fill="#4ade80" fontSize="9" fontWeight="bold">Higher Low (Refused to drop!)</text>
                    </svg>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-purple-900/40 space-y-2">
                    <span className="text-xs font-bold text-purple-400 font-mono">NQ (Nasdaq) - Lower Low (Sicker Asset)</span>
                    <svg viewBox="0 0 300 120" className="w-full h-28 bg-slate-900/80 rounded border border-slate-800">
                      <polyline points="20,80 70,40 120,105 180,30 240,70 280,20" fill="none" stroke="#c084fc" strokeWidth="2.5" />
                      <circle cx="120" cy="105" r="4" fill="#ef4444" />
                      <text x="130" y="110" fill="#f87171" fontSize="9" fontWeight="bold">Lower Low (Swept SSL)</text>
                    </svg>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                  <span className="font-bold text-amber-400 block uppercase">Institutional SMT Concept:</span>
                  <p>
                    When NQ sweeps its low (makes a lower low) while ES refuses to sweep its low (makes a higher low), this crack in correlation proves that smart money is heavily accumulating long positions in ES. Buy ES inside its discount BISI FVG!
                  </p>
                </div>
              </div>
            )}

            {utilitySubTab === 'macros' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    ICT Economic Time Macros & Killzone Schedule (NY EST)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">The algorithmic timeline when IPDA injections occur throughout the trading day.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { title: '02:00 - 05:00 AM EST', label: 'London Open KillZone', desc: 'Sets the high or low of the daily range for Forex & Index futures.' },
                    { title: '08:30 AM EST', label: 'News Macro Injection', desc: 'US economic embargo lifts (CPI, NFP, PPI). First volatility spike.' },
                    { title: '09:30 - 11:00 AM EST', label: 'NY Morning AM KillZone', desc: 'Prime execution window! Judas swing sweep followed by 2m MSS displacement.' },
                    { title: '10:00 - 11:00 AM EST', label: 'Silver Bullet Window 1', desc: 'Strict 60m macro window targeting high-probability 15m FVG rebalances.' },
                    { title: '12:00 - 01:00 PM EST', label: 'NY Lunch Chop Zone', desc: 'DANGER: Low volume consolidation. Do NOT enter new positions here!' },
                    { title: '02:00 - 03:00 PM EST', label: 'Silver Bullet Window 2', desc: 'PM session liquidity sweep window after lunch range breaks.' },
                    { title: '03:00 - 04:00 PM EST', label: 'Market On Close (MOC)', desc: 'Institutional rebalancing run into the 4:00 PM pit close.' }
                  ].map((m, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-amber-400 font-mono">{m.title}</span>
                      <h4 className="text-xs font-bold text-slate-200">{m.label}</h4>
                      <p className="text-[11px] text-slate-400">{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {utilitySubTab === 'bias' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl max-w-3xl mx-auto">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-400" />
                    Pre-Market Daily Bias Matrix Builder
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Answer 4 pre-market questions to calculate your daily directional bias score.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-200">1. What is HTF IPDA drawn toward on the Daily/4H chart?</label>
                    <select
                      value={biasAnswers.htfTarget}
                      onChange={(e) => setBiasAnswers({ ...biasAnswers, htfTarget: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="BULLISH_BSL">Buyside Liquidity (BSL) / Old High / Premium FVG above</option>
                      <option value="BEARISH_SSL">Sellside Liquidity (SSL) / Old Low / Discount FVG below</option>
                      <option value="NEUTRAL">Consolidating in middle of range</option>
                    </select>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-200">2. What is the US Dollar Index (DXY) trend?</label>
                    <select
                      value={biasAnswers.dxyTrend}
                      onChange={(e) => setBiasAnswers({ ...biasAnswers, dxyTrend: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="BEARISH">Bearish (DXY dropping = Bullish for Equities/Futures)</option>
                      <option value="BULLISH">Bullish (DXY rising = Bearish for Equities/Futures)</option>
                      <option value="NEUTRAL">Side-ways / Unclear</option>
                    </select>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-200">3. Is price currently above or below NY Midnight Open (MNO)?</label>
                    <select
                      value={biasAnswers.mnoRelation}
                      onChange={(e) => setBiasAnswers({ ...biasAnswers, mnoRelation: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="BELOW_MNO">Below Midnight Open (Discount - Favor Longs)</option>
                      <option value="ABOVE_MNO">Above Midnight Open (Premium - Favor Shorts)</option>
                    </select>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-200">4. Has price swept overnight session liquidity (Asia/London)?</label>
                    <select
                      value={biasAnswers.overnightSweep}
                      onChange={(e) => setBiasAnswers({ ...biasAnswers, overnightSweep: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="YES_SSL_SWEPT">Yes, swept Asia/London Low (SSL Swept → Bullish Reversal)</option>
                      <option value="YES_BSL_SWEPT">Yes, swept Asia/London High (BSL Swept → Bearish Reversal)</option>
                      <option value="NO_SWEEP">No sweep yet</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-5 rounded-xl border border-blue-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 uppercase">Calculated Daily Bias Verdict</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{calculatedDailyBias.confidence}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-100">{calculatedDailyBias.verdict}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                    {calculatedDailyBias.recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Account & Profile Management</h2>
                  <p className="text-xs text-slate-400">Sign in or create a profile to sync your learning progress.</p>
                </div>
              </div>

              {/* Gemini API Key Config */}
              <div className="bg-slate-950 p-5 rounded-xl border border-indigo-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Key className="w-4 h-4 text-amber-300" />
                  <span>Gemini API Key Configuration</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Required for AI Mentor Deep Dives, Audio TTS Briefings, Trade Audits, and Setup Generator.
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="password"
                    value={customApiKeyInput}
                    onChange={(e) => setCustomApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 px-3.5 py-2 rounded-lg font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem('ict_ov_custom_gemini_key', customApiKeyInput.trim());
                        setApiKeySavedStatus(true);
                        setTimeout(() => setApiKeySavedStatus(false), 3000);
                      } catch (e) {
                        alert("Could not save API key");
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow"
                  >
                    Save Key
                  </button>
                </div>
                {apiKeySavedStatus && (
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Gemini API Key successfully saved!
                  </div>
                )}
              </div>

              {firebaseUser && !firebaseUser.isAnonymous ? (
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Signed In As</span>
                    <div className="text-sm font-bold text-emerald-400">{firebaseUser.email || firebaseUser.uid}</div>
                  </div>

                  <button
                    onClick={handleUserSignOut}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        {authIsSignUp ? 'Create a New Account' : 'Sign In to Your Account'}
                      </span>
                      <button
                        onClick={() => setAuthIsSignUp(!authIsSignUp)}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        {authIsSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                      </button>
                    </div>

                    {authError && (
                      <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-lg">
                        {authError}
                      </div>
                    )}

                    <form onSubmit={handleEmailAuth} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400">Email Address</label>
                        <div className="relative mt-1">
                          <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <input
                            type="email"
                            required
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400">Password</label>
                        <div className="relative mt-1">
                          <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <input
                            type="password"
                            required
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2"
                      >
                        {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                        <span>{authIsSignUp ? 'Create Profile & Sign Up' : 'Sign In with Email'}</span>
                      </button>
                    </form>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-slate-800"></div>
                      <span className="flex-shrink mx-4 text-slate-500 text-[10px] uppercase font-semibold">Or</span>
                      <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    <button
                      onClick={handleGoogleLogin}
                      disabled={authLoading}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showResetConfirmModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">Reset All Progress?</h3>
                  <p className="text-xs text-slate-400">This action will clear your saved academy data.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                Resetting will clear all completed YouTube topics ({completedCount}/{totalTopics}), reset simulator balance to $10,000, wipe simulated trading statistics ({userProgress.simStats?.totalTrades || 0} trades), and clear quiz scores.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowResetConfirmModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  Yes, Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainAppContent />
    </ErrorBoundary>
  );
}
