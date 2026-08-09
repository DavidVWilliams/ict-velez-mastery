import React, { useState, useEffect } from 'react';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  PlayCircle, Cpu, BarChart2, CheckSquare, Layers, HelpCircle, FileText, Book, Bot, Briefcase, User, Lock, Mail, LogOut, Upload, ExternalLink, Sparkles, ArrowRight, Volume2, StopCircle, MessageSquare
} from 'lucide-react';

const Candle = ({ x, o, c, h, l }) => {
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

// --- UTILITY: CLEAN MARKDOWN SYMBOLS FOR PLAIN TEXT UI ---
const stripMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s?/g, '') 
    .replace(/\*\*/g, '')      
    .replace(/\*/g, '')        
    .replace(/---/g, '')       
    .replace(/- /g, '• ');     
};

// --- GLOBAL COURSE DATA ARCHITECTURE ---
const episodeTitles = [
  "Episode 1: Liquidity & Order Pairing", "Episode 2: Institutional Displacement (MSS)", "Episode 3: Price Inefficiencies (FVG)", 
  "Episode 4: The Velez Macro Baseline (200 SMA)", "Episode 5: Time Cycles (AMD & Killzones)", "Episode 6: Wholesale vs. Retail (Premium/Discount)", 
  "Episode 7: Capital Preservation & Risk", "Episode 8: Institutional Sponsorship", "Episode 9: Power of 3 Deep Dive", 
  "Episode 10: New York AM Killzone", "Episode 11: PM Session Killzone", "Episode 12: Advanced Price Action Theory", 
  "Episode 13: Data Ranges & IPDA", "Episode 14: Macro Timeframes", "Episode 15: Interest Rate Yields", 
  "Episode 16: Intermarket Analysis", "Episode 17: Top Down Analysis", "Episode 18: Trading The Weekly Profile", 
  "Episode 19: Trading The Daily Profile", "Episode 20: The London Open", "Episode 21: Tape Reading", 
  "Episode 22: Identifying Traps", "Episode 23: Reversals vs Retracements", "Episode 24: Breaker Blocks", 
  "Episode 25: Mitigation Blocks", "Episode 26: Rejection Blocks", "Episode 27: Vacuum Blocks", 
  "Episode 28: Order Block Theory", "Episode 29: Fair Value Gaps Deep Dive", "Episode 30: Liquidity Voids", 
  "Episode 31: Liquidity Pools", "Episode 32: Stop Runs", "Episode 33: Equilibrium & Discount", 
  "Episode 34: Premium Arrays", "Episode 35: Risk Management", "Episode 36: Trading Psychology", 
  "Episode 37: Journaling & Tracking", "Episode 38: Prop Firm Funding", "Episode 39: Building Your Model", 
  "Episode 40: Execution & Consistency", "Episode 41: The Final Review"
];

const courseData = episodeTitles.map((title, index) => {
  const epNum = index + 1;
  const officialPlaylist = "https://www.youtube.com/playlist?list=PLVgHx4Z63paYiFGQ56PjTF1PGePL3r69s";
  
  if (epNum === 1) return {
    id: `ep${epNum}`, title, videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=180s",
    rawText: "Liquidity acts as the ultimate fuel for institutional algorithms. Large banks cannot simply press a button to buy massive block orders without drastically shifting the price against themselves. They require a counter-party. To buy heavily, they need a vast pool of willing sellers. Where do they find them? Right below established support levels, where retail traders place their protective sell-stop orders. The algorithm deliberately drives price into these stop-loss clusters to absorb that liquidity, pairing their massive buy orders with the triggered retail sell orders.",
    homework: "Open a Daily or 4-Hour chart. Identify and draw horizontal lines across at least 5 major Swing Highs and 5 major Swing Lows. Label the highs as 'Buy-Side Liquidity' (BSL) and the lows as 'Sell-Side Liquidity' (SSL).",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>Liquidity acts as the ultimate fuel for the Interbank Price Delivery Algorithm (IPDA). To understand market movement, you must first understand how large institutions execute block orders.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">The Counter-Party Requirement</h4>
          <p>Large banks cannot simply buy massive quantities of an asset without drastically shifting the price against themselves. They require a counter-party. To buy heavily, they need a vast pool of willing sellers.</p>
          <p className="mt-3">Where do they find them? Right below established support levels (old lows), where retail traders place their protective sell-stop orders. The algorithm deliberately drives price into these clusters to absorb that liquidity, pairing their massive institutional buy orders with the triggered retail sell orders.</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: SELL-SIDE LIQUIDITY SWEEP</div>
          <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
            <line x1="50" y1="200" x2="550" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
            <text x="50" y="220" fill="#ef4444" fontSize="14" fontWeight="bold">Retail Support (Resting Sell-Stops)</text>
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
        </div>
      </div>
    )
  };

  if (epNum === 2) return {
    id: `ep${epNum}`, title, videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=840s",
    rawText: "How do we confirm the algorithm has finished sweeping liquidity and is initiating a true reversal? We look for institutional displacement, categorized as a Market Structure Shift. This is characterized by highly energetic, large-range candles that decisively break through the nearest opposing swing high or swing low. It is the visible footprint of institutional money entering the market with urgency.",
    homework: "Drop down to a 15-minute chart. Find 3 distinct examples where price swept liquidity, then immediately reversed to break a previous swing point. Highlight the energetic displacement candles that caused the break.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>A liquidity sweep alone is not a valid trade signal. The market can easily sweep a level and continue trending in that direction. We need confirmation of an institutional reversal.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">Institutional Displacement</h4>
          <p>We look for a <strong>Market Structure Shift (MSS)</strong>. This occurs when price violently reverses away from the swept liquidity pool, printing large-bodied, highly energetic candles that decisively break the nearest opposing swing high (or low). This energetic break is called <strong>Displacement</strong>, and it represents the heavy, undeniable footprint of smart money stepping in.</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: DISPLACEMENT & MARKET STRUCTURE SHIFT</div>
          <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
            <line x1="50" y1="250" x2="550" y2="250" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="50" y1="120" x2="550" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,5" />
            <text x="50" y="110" fill="#38bdf8" fontSize="12" fontWeight="bold">Recent Swing High (MSS Trigger)</text>
            <Candle x={180} o={160} c={120} h={110} l={170} />
            <Candle x={300} o={220} c={280} h={210} l={290} /> 
            <Candle x={340} o={280} c={180} h={170} l={290} /> 
            <Candle x={380} o={180} c={80} h={70} l={190} /> 
            <rect x="360" y="60" width="80" height="140" fill="none" stroke="#10b981" strokeWidth="3" rx="10" />
            <text x="450" y="120" fill="#10b981" fontSize="16" fontWeight="bold">Displacement Wave (MSS)</text>
          </svg>
        </div>
      </div>
    )
  };

  if (epNum === 3) return {
    id: `ep${epNum}`, title, videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=1400s",
    rawText: "When institutional displacement occurs, the speed of the price action frequently leaves behind a pricing inefficiency known as a Fair Value Gap. This is a three-candle sequence where the wicks of the first and third candles fail to overlap, creating a vacuum of unfulfilled orders. The algorithm seeks equilibrium, meaning price will naturally gravitate back to this inefficiency to properly offer both buy and sell liquidity at those price levels.",
    homework: "Find 3 distinct Fair Value Gaps (FVGs) on a 15-minute or 5-minute chart. Draw a box extending from the high of Candle 1 to the low of Candle 3. Observe whether price eventually returned to fill this inefficiency.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>When heavy displacement occurs, the resulting price action is often so rapid that it causes a breakdown in the normal bid-ask delivery process.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">Identifying the Inefficiency</h4>
          <p>This rapid repricing leaves behind a <strong>Fair Value Gap (FVG)</strong>. Mechanically, it is a three-candle sequence where the wicks of Candle 1 and Candle 3 fail to overlap. This leaves an explicit gap—a vacuum of unfulfilled orders.</p>
          <p className="mt-3">The market algorithm fundamentally seeks equilibrium. Therefore, price will naturally gravitate back toward this gap to efficiently offer both buy and sell liquidity at those previously skipped price levels. The FVG becomes our high-probability entry zone.</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE FAIR VALUE GAP (FVG)</div>
          <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
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
        </div>
      </div>
    )
  };

  if (epNum === 4) return {
    id: `ep${epNum}`, title, videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=2000s",
    rawText: "To enhance the execution safety of the ICT model, we bridge it with Oliver Velez methodology by applying a 200 Simple Moving Average (SMA). The 200 SMA acts as a definitive macro trend baseline. We never initiate positions contrary to the slope of this average. Furthermore, execution requires an ignition candle—a solid continuation bar forming off the SMA within the bounds of our Fair Value Gap.",
    homework: "Apply the 200 SMA to your chart. Find 3 examples where price retraced into an FVG while respecting the slope of the 200 SMA. Identify the specific Velez Ignition Candle that confirmed the entry.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>Locating an inefficiency is only half the battle. We must implement rigid filters to prevent executing into adverse momentum.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-eab308/50">
          <h4 className="text-xl font-bold text-white mb-2">The Velez Macro Baseline</h4>
          <p>We integrate the <strong>200 Simple Moving Average (SMA)</strong> as our primary trend filter. Note the strict reliance on Simple, not Exponential, moving averages. </p>
          <ul className="list-disc pl-8 mt-3 space-y-2 font-medium text-white">
            <li>If the 200 SMA slope is ascending, we only authorize long executions.</li>
            <li>If the 200 SMA slope is declining, we only authorize short executions.</li>
          </ul>
          <p className="mt-3">Upon price retracing into our designated FVG, we mandate the formation of a <strong>Velez Ignition Candle</strong> (a definitive continuation bar) pushing away from the SMA as final entry confirmation.</p>
        </div>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE 200 SMA & IGNITION CONFIRMATION</div>
          <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
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
        </div>
      </div>
    )
  };

  if (epNum === 5) return {
    id: `ep${epNum}`, title, videoUrl: "https://www.youtube.com/watch?v=kmVXVJE08eQ&t=600s",
    rawText: "Institutional volume is strictly bound to time. The foundational framework for daily algorithmic delivery is Accumulation, Manipulation, and Distribution (AMD). During illiquid hours, algorithms accumulate positions within a consolidation range. Approaching high-volume opens, they manipulate price counter to the true daily bias to capture stop liquidity. Following this sweep, they aggressively distribute positions toward the true target during predefined Killzones.",
    homework: "Draw vertical lines on your chart marking Midnight EST, 08:30 EST, and 11:00 EST. Observe the price action. Can you spot the Accumulation (overnight), Manipulation (trick drop/pump), and Distribution (Killzone expansion)?",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>Order flow is irrelevant if executed outside of proper timing parameters. Algorithmic volatility adheres to predictable daily cycles known as the <strong>Power of 3 (AMD)</strong>.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">Accumulation, Manipulation, Distribution</h4>
          <p><strong>Accumulation:</strong> Occurs during low-volume overnight sessions. Price consolidates tightly as algorithms passively establish baseline positioning.</p>
          <p><strong>Manipulation:</strong> The false move. Typically occurring near the London Open or initial NY sequence, price breaks aggressively opposite to the true daily bias to trigger breakout traders and purge resting stops.</p>
          <p><strong>Distribution:</strong> The true directional expansion. Having secured necessary liquidity, price displaces rapidly toward primary targets. This expansion defines our targeted execution window, specifically the <strong>New York AM Killzone (08:30 – 11:00 EST)</strong>.</p>
        </div>
      </div>
    )
  };

  if (epNum === 6) return {
    id: `ep${epNum}`, title, videoUrl: "https://www.youtube.com/watch?v=wXwG_uM4Q3k&t=300s",
    rawText: "Institutions operate entirely on wholesale pricing models; they fundamentally refuse to accumulate inventory at premium valuations. Using standard Fibonacci retracement parameters mapped across the displacement range, we bisect price into Premium and Discount territories. Executions are strictly limited to the Discount matrix for long positions, with the Optimal Trade Entry (OTE) calibrated between the 62% and 79% retracement levels.",
    homework: "Pull a Fibonacci retracement from a recent institutional displacement wave (Swing Low to Swing High). Mark the 50% line (Equilibrium) and identify the Discount territory. Where did price retrace to before continuing?",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>Retail participants frequently buy assets after an extended uptrend, purchasing at retail or "Premium" prices. Institutions operate on a strictly wholesale basis.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">Discount & Premium Arrays</h4>
          <p>By mapping a Fibonacci tool from the origin of the displacement swing to its extreme, we can calculate equitable pricing zones. We mathematically bisect this range:</p>
          <ul className="list-disc pl-8 mt-2 space-y-2 text-white">
            <li><strong>Premium:</strong> The upper 50%. Institutional selling zone. Never initiate longs here.</li>
            <li><strong>Discount:</strong> The lower 50%. Institutional accumulation zone.</li>
          </ul>
        </div>

        <p>Precision execution requires targeting the <strong>Optimal Trade Entry (OTE)</strong>, which resides specifically between the <strong>62% and 79%</strong> retracement levels deep within the Discount matrix.</p>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: OPTIMAL TRADE ENTRY MATRIX</div>
          <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
            <rect x="150" y="200" width="300" height="40" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1" />
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
            
            <text x={375} y={225} fill="#bfdbfe" fontSize="14" fontWeight="bold">Execution Zone</text>
          </svg>
        </div>
      </div>
    )
  };

  if (epNum === 7) return {
    id: `ep${epNum}`, title, videoUrl: "https://www.youtube.com/watch?v=CnTXwAuDi9Y&t=120s",
    rawText: "The technical framework is irrelevant without stringent capital preservation protocols. Variance guarantees that flawless setups will routinely result in losses. Professional execution requires divorcing emotion from individual outcomes through strict mathematical limitations. Exposure is universally capped at a maximum of 1% total account equity per configuration, with invalidation stops rigidly placed beneath the structural origin of the displacement wave.",
    homework: "Calculate exactly what 1% of your current (or simulated) account balance is. Write down your maximum dollar risk per trade and tape it to your monitor.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>The highest probability setup guarantees nothing on a trade-by-trade basis. Survival and profitability in algorithmic trading hinge entirely on rigid capital preservation.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-red-500/50">
          <h4 className="text-xl font-bold text-white mb-2">The Absolute Limit of Exposure</h4>
          <p>Professional operators function on statistical edges across a broad sample size, anticipating failure in a percentage of executions. Consequently, maximum risk exposure per trade is aggressively restricted.</p>
          <ul className="list-disc pl-8 mt-2 space-y-2 text-white">
            <li><strong>The 1% Rule:</strong> Under no circumstances does equity exposure exceed 1% of the total account balance per setup.</li>
            <li><strong>Hard Invalidation:</strong> Protective stops are mechanically placed beyond the structural extreme of the displacement wave. If price violates this level, the foundational premise of the setup is invalidated, and the nominal loss is accepted without hesitation.</li>
          </ul>
        </div>
      </div>
    )
  };

  return {
    id: `ep${epNum}`,
    title,
    videoUrl: officialPlaylist,
    rawText: `${title}. In this episode, we build upon the foundation of liquidity, displacement, and the 200 SMA filter. Focus on how time and price align within the specific Killzones.`,
    homework: "Review the concepts introduced in this episode on your live charts. Take a screenshot of an applicable setup and submit it to the AI Auditor for grading.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>Welcome to <strong>{title}</strong>. As we advance through the curriculum, the concepts combine to form a complete, mechanical trading model.</p>
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">Core Lesson Focus</h4>
          <p>Always anchor your learning back to the primary sequence: sweep, stomp, hole, and the 200 SMA trend filter. Every advanced topic simply refines your precision within this framework.</p>
        </div>
      </div>
    )
  };
});

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [lessonAiPrompt, setLessonAiPrompt] = useState('');
  const [lessonAiResponse, setLessonAiResponse] = useState('');
  const [loadingLessonAi, setLoadingLessonAi] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [auditImage, setAuditImage] = useState(null);
  const [auditImageName, setAuditImageName] = useState('');
  const [checklist, setChecklist] = useState({ liquiditySweep: false, mss: false, fvgEntry: false, nyKillzone: false, sma200Check: false });

  const [journalNote, setJournalNote] = useState('');
  const [journalSetupType, setJournalSetupType] = useState('ICT 2022 Model + Velez Filter');
  const [savedJournals, setSavedJournals] = useState([]);
  const [savingJournal, setSavingJournal] = useState(false);

  const [cardIndex, setCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState([
    { id: 1, term: "Liquidity", definition: "Other people's money. Resting stop-losses." },
    { id: 2, term: "MSS", definition: "Market Structure Shift. Violent displacement breaking a swing point." },
    { id: 3, term: "FVG", definition: "Fair Value Gap. 3-candle sequence inefficiency." },
    { id: 4, term: "200 SMA", definition: "The Trend River. Only execute with the SMA slope." }
  ]);

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    { q: "What is the primary execution window for the ICT 2022 Model?", options: ["Asia", "London", "NY AM Killzone (08:30-11:00 EST)", "PM Session"], a: 2 },
    { q: "What defines a valid MSS?", options: ["Slow grind", "Violent displacement", "Doji formation", "Moving above 200 SMA"], a: 1 },
    { q: "What is the rule for the Velez 200 SMA filter?", options: ["Fight the trend", "Only take longs below", "Never fight the SMA slope", "Ignore SMAs"], a: 2 }
  ];

  const [activeLessonId, setActiveLessonId] = useState("ep1");
  const [completedModules, setCompletedModules] = useState({});
  const toggleModuleCompletion = (key) => setCompletedModules(prev => ({ ...prev, [key]: !prev[key] }));

  const [lessonImage, setLessonImage] = useState(null);
  const [lessonImageName, setLessonImageName] = useState('');

  const handlePasteImage = (e, setImageState, setNameState) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageState(reader.result.split(',')[1]);
            setNameState(`Pasted_Image_${new Date().toLocaleTimeString().replace(/:/g, '')}.png`);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleLessonImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { 
        setLessonImage(reader.result.split(',')[1]); 
        setLessonImageName(file.name); 
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) fetchUserJournals(currentUser.uid);
      });
      return () => { unsubscribe(); if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
    } catch (e) { console.warn("Auth not initialized"); }
  }, []);

  const fetchUserJournals = async (uid) => {
    try {
      const db = getFirestore();
      const q = query(collection(db, 'users', uid, 'journals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const journals = [];
      querySnapshot.forEach((doc) => journals.push({ id: doc.id, ...doc.data() }));
      setSavedJournals(journals);
    } catch (err) { console.warn("Firestore fetch error"); }
  };

  const handleSaveJournal = async () => {
    if (!user) { setActiveTab(12); return; }
    if (!journalNote.trim()) return;
    setSavingJournal(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'users', user.uid, 'journals'), { setupType: journalSetupType, note: journalNote, createdAt: serverTimestamp() });
      setJournalNote(''); fetchUserJournals(user.uid); alert("Journal entry saved!");
    } catch (err) { alert("Error saving: " + err.message); } finally { setSavingJournal(false); }
  };

  useEffect(() => {
    if (activeTab === 3) {
      const container = document.getElementById('tradingview-widget-container');
      if (container) container.innerHTML = ''; 
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true, "symbol": "FOREXCOM:SPXUSD", "interval": "15", "timezone": "America/New_York",
        "theme": "dark", "style": "1", "locale": "en", "allow_symbol_change": true, "calendar": false,
        "support_host": "https://www.tradingview.com"
      });
      if (container) container.appendChild(script);
    }
  }, [activeTab]);

  const handleAuth = async (e) => {
    e.preventDefault(); setAuthError('');
    try {
      const auth = getAuth();
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      setEmail(''); setPassword(''); setActiveTab(1);
    } catch (err) { setAuthError(err.message); }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const auth = getAuth(); const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider); setActiveTab(1);
    } catch (err) { setAuthError(err.message); }
  };

  const handleLogout = async () => {
    try { await signOut(getAuth()); setSavedJournals([]); setActiveTab(1); } catch (err) { console.error(err); }
  };

  const speakText = (textToRead) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(textToRead);
      const voices = window.speechSynthesis.getVoices();
      const bestVoice = voices.find(v => v.name.includes('Online') || v.name.includes('Neural') || v.name.includes('Google US English'));
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = 0.95; 
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };
  const stopSpeech = () => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); } };

  // SECURE API ROUTING WITH PLAIN TEXT CLEANING
  const callGemini = async (promptText) => {
    setLoadingAi(true); setAiResponse('Connecting to AI Server...');
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText, imageBase64: auditImage || null })
      });
      
      let data;
      const rawText = await res.text();
      try {
        data = JSON.parse(rawText);
      } catch(e) {
        throw new Error(`Server route missing or down. Did not receive JSON. Raw error: ${rawText.substring(0, 60)}`);
      }

      if (!res.ok) throw new Error(data.error || `Server Status ${res.status}`);
      if (data.error) throw new Error(data.error);
      
      setAiResponse(stripMarkdown(data.text));
    } catch (err) { 
      setAiResponse(`Connection Failed: ${err.message}`); 
    } finally { 
      setLoadingAi(false); 
    }
  };

  const callLessonGemini = async (lessonTitle) => {
    if (!lessonAiPrompt.trim() && !lessonImage) return;
    setLoadingLessonAi(true); setLessonAiResponse('Connecting to AI Server...');
    try {
      const contextPrompt = `You are a professional trading mentor. The student is studying: "${lessonTitle}". Explain this comprehensively and thoroughly, step-by-step. Use highly readable, easy-to-understand language with practical examples, but strictly avoid childish analogies. Format with clear plain text paragraphs and bullet points without heavy markdown syntax: ${lessonAiPrompt || "Please review this chart for this lesson."}`;
      const res = await fetch('/api/gemini', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: contextPrompt, imageBase64: lessonImage || null })
      });
      
      let data;
      const rawText = await res.text();
      try {
        data = JSON.parse(rawText);
      } catch(e) {
        throw new Error(`Server route missing or down. Did not receive JSON. Raw error: ${rawText.substring(0, 60)}`);
      }

      if (!res.ok) throw new Error(data.error || `Server Status ${res.status}`);
      if (data.error) throw new Error(data.error);

      setLessonAiResponse(stripMarkdown(data.text));
    } catch (err) { 
      setLessonAiResponse(`Connection Failed: ${err.message}`); 
    } finally { 
      setLoadingLessonAi(false); 
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setAuditImage(reader.result.split(',')[1]); setAuditImageName(file.name); };
      reader.readAsDataURL(file);
    }
  };

  const handleQuizAnswer = (selectedIndex) => {
    if (selectedIndex === quizQuestions[currentQuestion].a) setScore(score + 1);
    if (currentQuestion + 1 < quizQuestions.length) setCurrentQuestion(currentQuestion + 1);
    else setShowResults(true);
  };
  const resetQuiz = () => { setQuizStarted(false); setCurrentQuestion(0); setScore(0); setShowResults(false); };

  const progressPercent = Math.round((Object.values(completedModules).filter(Boolean).length / courseData.length) * 100);

  const tabs = [
    { id: 1, name: '1. Masterclass' }, { id: 2, name: '2. Velez Bridge' }, { id: 3, name: '3. Practice Chart' },
    { id: 4, name: '4. NY Playbook' }, { id: 5, name: '5. Flashcards' }, { id: 6, name: '6. Mastery Quiz' },
    { id: 7, name: '7. AI Auditor' }, { id: 8, name: '8. Terms' }, { id: 9, name: '9. Mentor Hub' },
    { id: 10, name: '10. Progress' }, { id: 11, name: '11. Trading Desk' },
    ...(user ? [{ id: 12, name: '12. Account' }] : [{ id: 12, name: 'Sign In' }])
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold">ICT</div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">ICT & Velez Masterclass</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Interactive Curriculum ({courseData.length} Episodes)</p>
        </div>
        <button onClick={() => setActiveTab(12)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold border border-slate-700 transition">
          {user ? "Account" : "Sign In"}
        </button>
      </header>

      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex space-x-2 overflow-x-auto sticky top-0 z-50">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {tab.name}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 w-full mx-auto max-w-[1600px]">
        {/* TAB 1: Masterclass (3 Column Pro Layout) */}
        {activeTab === 1 && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Col 1: Outline */}
            <div className="w-full lg:w-1/4 flex flex-col space-y-3 sticky top-24 max-h-[85vh] overflow-y-auto pr-2">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center"><Book className="mr-2" size={18}/> Course Outline</h2>
                <div className="space-y-2">
                  {courseData.map((lesson) => (
                    <button key={lesson.id} onClick={() => { setActiveLessonId(lesson.id); setLessonAiResponse(''); setLessonAiPrompt(''); }}
                      className={`w-full text-left p-4 rounded-xl border transition flex justify-between items-center ${activeLessonId === lesson.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-indigo-500/50 hover:text-slate-200'}`}>
                      <div className="font-semibold text-sm pr-2">{lesson.title}</div>
                      {activeLessonId === lesson.id && <ArrowRight size={16} className="shrink-0"/>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 2: Content */}
            <div className="w-full lg:w-2/4">
              {courseData.map((lesson) => {
                if (lesson.id !== activeLessonId) return null;
                return (
                  <div key={lesson.id} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-6 gap-4">
                      <h2 className="text-3xl font-extrabold text-white leading-tight">{lesson.title}</h2>
                      <div className="flex gap-2 shrink-0">
                        {!isSpeaking ? (
                          <button onClick={() => speakText(lesson.rawText)} className="flex items-center space-x-2 bg-slate-800 hover:bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold transition">
                            <Volume2 size={16} /> <span>Read Aloud</span>
                          </button>
                        ) : (
                          <button onClick={stopSpeech} className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition">
                            <StopCircle size={16} /> <span>Stop Audio</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-900 to-black rounded-xl border border-slate-700 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group shadow-2xl mb-8">
                      <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 flex flex-col items-center cursor-pointer">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-900/50 group-hover:scale-110 transition-transform duration-300">
                          <PlayCircle size={40} className="text-white ml-1" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Watch Official Video Lesson</h3>
                        <p className="text-sm text-slate-400 mb-6 max-w-md">Click here to open the full lecture securely on The Inner Circle Trader's YouTube channel.</p>
                      </a>
                    </div>
                    
                    {lesson.content}

                    {/* NEW: Homework Assignment Block */}
                    {lesson.homework && (
                      <div className="mt-8 bg-slate-950 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-lg">
                        <h4 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
                          <CheckSquare size={18} /> Official Episode Homework
                        </h4>
                        <p className="text-slate-300 leading-relaxed mb-6">{lesson.homework}</p>
                        <button 
                          onClick={() => {
                            setActiveTab(7);
                            setAiPrompt(`Here is my homework for ${lesson.title}. Did I identify the concepts correctly?`);
                          }}
                          className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-300 px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2"
                        >
                          <Sparkles size={16} /> Submit to AI Auditor
                        </button>
                      </div>
                    )}

                    <div className="mt-10 pt-6 border-t border-slate-800 flex justify-end">
                      <button onClick={() => toggleModuleCompletion(lesson.id)} className={`px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg ${completedModules[lesson.id] ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                        {completedModules[lesson.id] ? '✓ Lesson Completed' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Col 3: Contextual AI with Direct Screenshot Attachment */}
            <div className="w-full lg:w-1/4 flex flex-col space-y-6 sticky top-24">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold text-indigo-300 flex items-center mb-2"><Bot className="mr-2" size={20}/> Ask The Teacher</h3>
                <p className="text-xs text-slate-400 mb-4">Confused by this lesson? Ask a question or attach a chart screenshot.</p>
                <div className="space-y-4">
                  <textarea 
                    rows={4} 
                    value={lessonAiPrompt} 
                    onChange={(e) => setLessonAiPrompt(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        callLessonGemini(courseData.find(l => l.id === activeLessonId)?.title);
                      }
                    }}
                    onPaste={(e) => handlePasteImage(e, setLessonImage, setLessonImageName)}
                    placeholder="Ask a question, paste an image (Ctrl+V), or press Enter..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500" 
                  />

                  {/* Screenshot Attachment Bar */}
                  <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-400 hover:text-indigo-400 transition">
                      <Upload size={14} />
                      <span className="truncate max-w-[150px]">{lessonImageName ? lessonImageName : 'Attach Chart Screenshot'}</span>
                      <input type="file" accept="image/*" onChange={handleLessonImageUpload} className="hidden" />
                    </label>
                    {lessonImage && (
                      <button onClick={() => { setLessonImage(null); setLessonImageName(''); }} className="text-red-400 hover:text-red-300 font-bold">Remove</button>
                    )}
                  </div>

                  <button onClick={() => callLessonGemini(courseData.find(l => l.id === activeLessonId)?.title)} disabled={loadingLessonAi || (!lessonAiPrompt.trim() && !lessonImage)} className="w-full bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md">
                    <MessageSquare size={16}/> {loadingLessonAi ? 'Thinking...' : 'Ask Question'}
                  </button>
                  {lessonAiResponse && <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-lg text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">{lessonAiResponse}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Oliver Velez & 200 SMA Visual Momentum Bridge</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-300 text-sm">ICT frameworks tell you WHERE and WHEN. Oliver Velez rules tell you HOW to pull the trigger.</p>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-4 text-sm text-slate-300">
                <p><strong className="text-indigo-400">Rule 1:</strong> Never fight the 200 SMA slope. Simple Moving Average, never EMA.</p>
                <p><strong className="text-indigo-400">Rule 2:</strong> Wait for a Green/Red ignition candle inside the FVG.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3"><BarChart2 className="text-indigo-400"/> Practice Sandbox</h2>
            <div className="w-full h-[700px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <div id="tradingview-widget-container" className="w-full h-full"></div>
            </div>
          </div>
        )}

        {/* TAB 4 */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3"><CheckSquare className="text-indigo-400"/> The Playbook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6">"Are We Safe?" Checklist</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500">
                    <input type="checkbox" checked={checklist.liquiditySweep} onChange={(e) => setChecklist({...checklist, liquiditySweep: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded bg-slate-900 border-slate-700"/>
                    <span className="text-slate-300">1. Swept coins (Liquidity)?</span>
                  </label>
                  <label className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500">
                    <input type="checkbox" checked={checklist.mss} onChange={(e) => setChecklist({...checklist, mss: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded bg-slate-900 border-slate-700"/>
                    <span className="text-slate-300">2. Stomp (Displacement/MSS)?</span>
                  </label>
                  <label className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500">
                    <input type="checkbox" checked={checklist.fvgEntry} onChange={(e) => setChecklist({...checklist, fvgEntry: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded bg-slate-900 border-slate-700"/>
                    <span className="text-slate-300">3. Visible hole (3-Candle FVG)?</span>
                  </label>
                  <label className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500">
                    <input type="checkbox" checked={checklist.sma200Check} onChange={(e) => setChecklist({...checklist, sma200Check: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded bg-slate-900 border-slate-700"/>
                    <span className="text-slate-300">4. 200 SMA river flowing in our direction?</span>
                  </label>
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6">Trade Journal</h3>
                  <textarea rows={5} value={journalNote} onChange={(e) => setJournalNote(e.target.value)} placeholder="Log trade..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500 mb-4"/>
                  <button onClick={handleSaveJournal} disabled={savingJournal} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl text-base font-bold text-white disabled:opacity-50">
                    {savingJournal ? 'Saving...' : 'Save to Journal'}
                  </button>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Past Trades ({savedJournals.length})</h4>
                  <div className="max-h-48 overflow-y-auto space-y-3">
                    {savedJournals.map((j) => (
                      <div key={j.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300">{j.note}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5 */}
        {activeTab === 5 && (
          <div className="space-y-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Layers className="text-indigo-400"/> Flashcards</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center space-y-6">
              <div className="flex justify-between text-xs text-slate-500 font-semibold"><span>Card {cardIndex + 1} of {flashcardDeck.length}</span></div>
              <div onClick={() => setShowDefinition(!showDefinition)} className="min-h-[180px] bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center cursor-pointer">
                {!showDefinition ? (
                  <div><h3 className="text-2xl font-bold text-indigo-300 mb-2">{flashcardDeck[cardIndex].term}</h3><p className="text-xs text-slate-500">(Click to reveal)</p></div>
                ) : (
                  <div><p className="text-lg text-slate-200">{flashcardDeck[cardIndex].definition}</p></div>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setShowDefinition(false); setCardIndex((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0)); }} className="flex-1 bg-emerald-600/20 text-emerald-400 py-3 rounded-xl font-bold">Next Card</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6 */}
        {activeTab === 6 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="text-indigo-400"/> Mastery Quiz</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl">
              {!quizStarted ? (
                <div className="text-center space-y-4">
                  <button onClick={() => setQuizStarted(true)} className="bg-indigo-600 px-8 py-3 rounded-lg font-bold text-white">Start Quiz</button>
                </div>
              ) : showResults ? (
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-bold text-emerald-400">Score: {score} / {quizQuestions.length}</h3>
                  <button onClick={resetQuiz} className="bg-indigo-600 px-6 py-3 rounded-lg font-bold text-white mt-4">Retake</button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
                    <span>Q {currentQuestion + 1} of {quizQuestions.length}</span><span className="text-indigo-400">Score: {score}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{quizQuestions[currentQuestion].q}</h3>
                  <div className="space-y-3">
                    {quizQuestions[currentQuestion].options.map((opt, idx) => (
                      <button key={idx} onClick={() => handleQuizAnswer(idx)} className="w-full text-left p-5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-lg hover:border-indigo-500">{opt}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7 */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3 text-white"><FileText className="text-indigo-400" size={32}/> Screenshot Auditor</h2>
            <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 max-w-4xl">
              <div className="flex items-center gap-4 mb-8">
                <label className="flex items-center justify-center space-x-3 bg-slate-800 px-6 py-4 rounded-xl cursor-pointer font-bold text-white">
                  <Upload className="text-indigo-400" size={20}/>
                  <span>{auditImageName ? auditImageName : 'Upload Chart Image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <textarea 
                rows={4} 
                value={aiPrompt} 
                onChange={(e) => setAiPrompt(e.target.value)} 
                onPaste={(e) => handlePasteImage(e, setAuditImage, setAuditImageName)}
                placeholder="Did I find a real FVG? (You can paste an image here with Ctrl+V)" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-5 text-white mb-6 focus:border-indigo-500"
              />
              <button onClick={() => callGemini("Audit this chart: " + aiPrompt)} disabled={loadingAi} className="w-full bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-xl font-bold text-white flex justify-center gap-3">
                <Sparkles size={24}/> {loadingAi ? 'Looking...' : 'Ask AI'}
              </button>
              {aiResponse && <div className="p-8 bg-slate-950 rounded-xl border-2 border-emerald-500/50 mt-8 text-slate-200 whitespace-pre-wrap">{aiResponse}</div>}
            </div>
          </div>
        )}

        {/* TAB 8 */}
        {activeTab === 8 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Book className="text-indigo-400"/> Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><strong className="text-indigo-400 block mb-2 text-lg">BSL / SSL</strong> Buy Side Liquidity / Sell Side</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><strong className="text-indigo-400 block mb-2 text-lg">200 SMA</strong> Moving Average filter</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><strong className="text-indigo-400 block mb-2 text-lg">NY AM Killzone</strong> 08:30 - 11:00 EST</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><strong className="text-indigo-400 block mb-2 text-lg">FVG</strong> Fair Value Gap</div>
            </div>
          </div>
        )}

        {/* TAB 9 */}
        {activeTab === 9 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Bot className="text-indigo-400"/> AI Mentor Hub</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-4">
              <textarea rows={3} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="General trading questions..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:border-indigo-500"/>
              <button onClick={() => callGemini("Answer as trading mentor: " + aiPrompt)} className="bg-indigo-600 px-6 py-3 rounded-lg font-bold text-white">Ask Mentor</button>
              {aiResponse && <div className="p-6 bg-slate-950 rounded-xl border border-indigo-900/50 mt-6 text-slate-200 whitespace-pre-wrap">{aiResponse}</div>}
            </div>
          </div>
        )}

        {/* TAB 10 */}
        {activeTab === 10 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="text-indigo-400"/> Progress</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-6">
              <div className="flex justify-between items-end">
                <div><h3 className="text-xl font-bold text-white">Curriculum Mastery</h3></div>
                <span className="text-5xl font-extrabold text-indigo-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-indigo-600 h-full" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 11 */}
        {activeTab === 11 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="text-indigo-400"/> Trading Desk</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-8 rounded-xl border border-slate-800"><h3 className="text-xl font-bold text-white mb-2">NinjaTrader Integration</h3><p className="text-slate-400 mb-6">Status: Connected.</p></div>
              <div className="bg-slate-900 p-8 rounded-xl border border-slate-800"><h3 className="text-xl font-bold text-white mb-2">CME Data Feed</h3><p className="text-slate-400 mb-6">Status: Active.</p></div>
            </div>
          </div>
        )}

        {/* TAB 12 */}
        {activeTab === 12 && (
          <div className="max-w-xl mx-auto mt-10 p-10 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
            <div className="flex items-center space-x-5 mb-10"><User size={32} className="text-indigo-400"/><div><h2 className="text-3xl font-extrabold text-white">Profile</h2></div></div>
            {user ? (
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div><p className="text-lg font-bold text-emerald-400">{user.email}</p></div>
                <button onClick={handleLogout} className="bg-red-500/10 text-red-400 px-6 py-3 rounded-xl font-bold">Sign Out</button>
              </div>
            ) : (
              <div className="space-y-8">
                {authError && <div className="p-4 bg-red-900/30 text-red-300 rounded-xl">{authError}</div>}
                <button onClick={handleGoogleSignIn} className="w-full bg-white text-slate-900 py-4 rounded-xl font-extrabold">Sign In with Google</button>
                <form onSubmit={handleAuth} className="space-y-6">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white" />
                  <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-extrabold">{isSignUp ? 'Create Account' : 'Sign In'}</button>
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-indigo-400 w-full text-center">{isSignUp ? 'Already have an account? Sign In' : "Create one here."}</button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
