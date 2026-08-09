import React, { useState, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  BookOpen, 
  Cpu, 
  PlayCircle, 
  CheckSquare, 
  Layers, 
  HelpCircle, 
  FileText, 
  Book, 
  Bot, 
  BarChart2, 
  Briefcase, 
  User,
  Lock,
  Mail,
  LogOut,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  RotateCw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [progress, setProgress] = useState(0);

  // AI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Pre-market interactive checklist state (Including Asia, London, New York)
  const [checklist, setChecklist] = useState({
    asiaRange: false,
    liquidityPools: false,
    sma200Slope: false,
    killzoneTiming: false,
    ignitionTrigger: false
  });

  useEffect(() => {
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Auth not initialized:", e);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const auth = getAuth();
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
      setActiveTab(1);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setActiveTab(1);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setActiveTab(1);
    } catch (err) {
      console.error(err);
    }
  };

  const callGemini = async (promptText) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setAiResponse("Error: VITE_GEMINI_API_KEY is not configured in Vercel environment variables.");
      return;
    }
    setLoadingAi(true);
    setAiResponse('');
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      setAiResponse(text);
    } catch (err) {
      setAiResponse("Error calling Gemini API: " + err.message);
    } finally {
      setLoadingAi(false);
    }
  };

  // Flashcards deck data
  const flashcards = [
    { term: "Fair Value Gap (FVG)", definition: "A 3-candle imbalance zone where price leaves an unmitigated footprint acting as a magnetic draw." },
    { term: "200 Simple Moving Average (SMA)", definition: "The core Oliver Velez baseline trend filter. Price above = bullish bias, price below = bearish bias, slope dictates momentum." },
    { term: "Asia Session Range", definition: "The initial overnight consolidation box (Tokyo open) often defining the daily high/low template or accumulation phase." },
    { term: "Ignition Candle", definition: "An oversized momentum candle breaking key resistance or support backed by high relative volume and green/red pulse." },
    { term: "Turtle Soup", definition: "A false breakout above/below session highs/lows (Asia/London) designed to trap retail breakout traders." }
  ];

  const baseTabs = [
    { id: 1, name: 'YouTube Curriculum & Video', icon: PlayCircle },
    { id: 2, name: 'Oliver Velez & SMA Bridge', icon: Cpu },
    { id: 3, name: 'Practice Trade Simulator', icon: BarChart2 },
    { id: 4, name: 'Pre-Market & Session Playbook', icon: CheckSquare },
    { id: 5, name: 'Spaced-Repetition Flashcards', icon: Layers },
    { id: 6, name: 'Quiz & Assessment', icon: HelpCircle },
    { id: 7, name: 'AI Trade Auditor', icon: FileText },
    { id: 8, name: 'Terms & Abbreviations', icon: Book },
    { id: 9, name: 'AI Mentor Hub', icon: Bot },
    { id: 10, name: 'Progress & Analytics', icon: BarChart2 },
    { id: 11, name: 'Institutional Desk & Tools', icon: Briefcase },
  ];

  const tabs = user 
    ? [...baseTabs, { id: 12, name: 'Account & Profile', icon: User }]
    : baseTabs;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold">ICT</div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">ICT 2022 & Oliver Velez Mastery Platform</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Algorithmic Precision x Visual Momentum (SMA & Multi-Session Focus)</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            Progress: <span className="font-bold text-indigo-400">{progress}%</span>
          </div>
          <button 
            onClick={() => setActiveTab(12)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              user ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{user ? (user.displayName || user.email.split('@')[0]) : 'Sign In'}</span>
          </button>
        </div>
      </header>

      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.id}. {tab.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {/* Tab 1: Curriculum & Video Modules */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><PlayCircle className="text-indigo-400"/> Mentorship Modules & Curated Video Timestamps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <span className="text-xs text-indigo-400 font-semibold uppercase">Episodes 1-10 Foundations</span>
                <h3 className="text-xl font-bold mt-1 mb-2">Module 1: Foundational Mechanics & Liquidity</h3>
                <p className="text-slate-400 text-sm mb-4">Master institutional order flow language, liquidity pools (BSL/SSL), and Asia session high/low framing.</p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 mb-4 space-y-1">
                  <div className="font-semibold text-indigo-300">Key Video Reference Timestamps:</div>
                  <div>• Ep 3: Marking Asia Session Highs & Lows (00:14:20)</div>
                  <div>• Ep 7: Market Structure Shifts & Order Flow (00:32:10)</div>
                </div>
                <button 
                  onClick={() => setProgress(prev => Math.min(100, prev + 20))}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs font-medium transition"
                >
                  Mark Module Complete (+20%)
                </button>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <span className="text-xs text-indigo-400 font-semibold uppercase">Episodes 11-20 Execution</span>
                <h3 className="text-xl font-bold mt-1 mb-2">Module 2: Order Block Science & Killzones</h3>
                <p className="text-slate-400 text-sm mb-4">Master high-probability Order Blocks across Asia, London, and New York killzones.</p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 mb-4 space-y-1">
                  <div className="font-semibold text-indigo-300">Key Video Reference Timestamps:</div>
                  <div>• Ep 14: London Open Sweep of Asia Range (00:18:45)</div>
                  <div>• Ep 19: High Probability FVG Entries (00:41:10)</div>
                </div>
                <button 
                  onClick={() => setProgress(prev => Math.min(100, prev + 20))}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs font-medium transition"
                >
                  Mark Module Complete (+20%)
                </button>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <span className="text-xs text-indigo-400 font-semibold uppercase">Episodes 21-30 Tape Reading</span>
                <h3 className="text-xl font-bold mt-1 mb-2">Module 3: Tape Reading & Rebalance Theory</h3>
                <p className="text-slate-400 text-sm mb-4">Deep dive into live market tape reading, handling consolidation vs expansion days, and afternoon PM session sweeps.</p>
                <button 
                  onClick={() => setProgress(prev => Math.min(100, prev + 20))}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs font-medium transition"
                >
                  Mark Module Complete (+20%)
                </button>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <span className="text-xs text-indigo-400 font-semibold uppercase">Episodes 31-41 Mastery</span>
                <h3 className="text-xl font-bold mt-1 mb-2">Module 4: IPDA Algorithmic Theory & Risk Control</h3>
                <p className="text-slate-400 text-sm mb-4">Master intraday market profiles, IPDA 3:00 PM Market On Close (MOC) mechanics, and risk parameters.</p>
                <button 
                  onClick={() => setProgress(prev => Math.min(100, prev + 20))}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs font-medium transition"
                >
                  Mark Module Complete (+20%)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Oliver Velez & SMA Bridge */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Cpu className="text-indigo-400"/> Oliver Velez & 200 SMA Visual Momentum Bridge</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-300">Integrating institutional ICT time/price frameworks across multiple trading sessions (Asia, London, New York) with the Oliver Velez **200 Simple Moving Average (SMA)** momentum rules.</p>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm text-indigo-300 space-y-2">
                <div>Rule 1: Never fight the 200 SMA slope. Trade strictly in the direction of the medium/long-term SMA tilt.</div>
                <div>Rule 2: Asia session boundaries establish the initial high/low box; look for London/NY sweeps of Asia extremes.</div>
                <div>Rule 3: Align ICT Killzone timing with Velez Green/Red ignition candle pulses off the 200 SMA support/resistance.</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Trade Simulator */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="text-indigo-400"/> Practice Trade Simulator</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <p className="text-slate-400 text-sm mb-4">Simulate futures executions across Asia, London, and New York sessions using NinjaTrader playback mechanics.</p>
              <div className="bg-slate-950 p-8 rounded-lg text-center border border-slate-800 space-y-2">
                <span className="text-emerald-400 font-mono text-lg font-bold">MULTI-SESSION SIMULATION ENGINE ACTIVE</span>
                <p className="text-xs text-slate-500">CME Top market data feed linked with 200 SMA visual indicators.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Pre-Market & Session Playbook */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><CheckSquare className="text-indigo-400"/> Interactive Pre-Market & Session Playbook</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-400 text-sm">Complete this pre-flight checklist across Asia, London, and New York windows before executing any live trade setup:</p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={checklist.asiaRange}
                    onChange={(e) => setChecklist({...checklist, asiaRange: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="text-sm text-slate-200">1. Mark Asia Session high/low range box (Tokyo accumulation window).</span>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={checklist.liquidityPools}
                    onChange={(e) => setChecklist({...checklist, liquidityPools: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="text-sm text-slate-200">2. Identify Buy Side Liquidity (BSL) & Sell Side Liquidity (SSL) targets.</span>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={checklist.sma200Slope}
                    onChange={(e) => setChecklist({...checklist, sma200Slope: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="text-sm text-slate-200">3. Verify 200 Simple Moving Average (SMA) slope and bias direction.</span>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={checklist.killzoneTiming}
                    onChange={(e) => setChecklist({...checklist, killzoneTiming: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="text-sm text-slate-200">4. Confirm active Killzone window (Asia open, London open, or New York open).</span>
                </label>

                <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={checklist.ignitionTrigger}
                    onChange={(e) => setChecklist({...checklist, ignitionTrigger: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                  />
                  <span className="text-sm text-slate-200">5. Wait for Velez ignition candle trigger and FVG alignment.</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Spaced-Repetition Flashcards */}
        {activeTab === 5 && (
          <div className="space-y-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Layers className="text-indigo-400"/> Spaced-Repetition Flashcards</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center space-y-6">
              <span className="text-xs text-slate-500 uppercase font-semibold">Card {currentCardIndex + 1} of {flashcards.length}</span>
              <div 
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="min-h-[160px] bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center cursor-pointer transition hover:border-indigo-500"
              >
                {!isCardFlipped ? (
                  <div>
                    <h3 className="text-lg font-bold text-indigo-300 mb-2">{flashcards[currentCardIndex].term}</h3>
                    <p className="text-xs text-slate-500">(Click card to reveal definition)</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-200">{flashcards[currentCardIndex].definition}</p>
                    <p className="text-xs text-slate-500 mt-2">(Click to flip back)</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <button 
                  onClick={() => {
                    setIsCardFlipped(false);
                    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                  }}
                  className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-medium transition"
                >
                  Previous Card
                </button>
                <button 
                  onClick={() => {
                    setIsCardFlipped(false);
                    setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-xs font-medium transition"
                >
                  Next Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Quiz & Assessment */}
        {activeTab === 6 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="text-indigo-400"/> Quiz & Assessment</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <p className="text-slate-300 mb-4">Test your mastery of multi-session liquidity frameworks and 200 SMA visual momentum filters.</p>
              <button className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition">
                Start Mastery Assessment
              </button>
            </div>
          </div>
        )}

        {/* Tab 7: AI Trade Auditor with Image/Text Support */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-indigo-400"/> AI Trade Auditor</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-400 text-sm">Paste your trade breakdown or journal entry detailing session context (Asia/London/NY), 200 SMA slope, and execution setup:</p>
              <textarea 
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. London session sweep of Asia high, price rejected off 200 SMA downward slope on NQ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={() => callGemini("Audit this trade based on ICT multi-session models and Oliver Velez 200 SMA momentum rules: " + aiPrompt)}
                disabled={loadingAi}
                className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {loadingAi ? 'Auditing Setup...' : 'Run AI Trade Audit'}
              </button>
              {aiResponse && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 mt-4 text-sm text-slate-200 whitespace-pre-wrap">
                  <strong className="text-indigo-400 block mb-1">Audit Analysis:</strong>
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 8: Terms & Abbreviations */}
        {activeTab === 8 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Book className="text-indigo-400"/> Terms & Abbreviations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800"><strong className="text-indigo-400">BSL / SSL:</strong> Buy Side Liquidity / Sell Side Liquidity</div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800"><strong className="text-indigo-400">200 SMA:</strong> Oliver Velez Simple Moving Average trend baseline</div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800"><strong className="text-indigo-400">Asia Session Range:</strong> Tokyo accumulation and overnight high/low boundary</div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800"><strong className="text-indigo-400">OTE:</strong> Optimal Trade Entry (62% - 79% Fibonacci retracement)</div>
            </div>
          </div>
        )}

        {/* Tab 9: AI Mentor Hub */}
        {activeTab === 9 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Bot className="text-indigo-400"/> AI Mentor Hub</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-400 text-sm">Ask your AI Mentor any trading question regarding Asia/London/NY sessions, liquidity, or 200 SMA momentum rules:</p>
              <input 
                type="text"
                placeholder="e.g. How do I trade the overlap between Asia range expansion and London open?"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') callGemini("Answer as an expert ICT & Oliver Velez trading mentor focusing on multi-session setups and 200 SMA discipline: " + e.target.value);
                }}
              />
              <p className="text-xs text-slate-500">Press Enter to submit query.</p>
              {aiResponse && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 mt-4 text-sm text-slate-200 whitespace-pre-wrap">
                  <strong className="text-indigo-400 block mb-1">Mentor Response:</strong>
                  {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 10: Progress & Analytics */}
        {activeTab === 10 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="text-indigo-400"/> Progress & Analytics</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span>Overall Mastery Progress</span>
                <span className="font-bold text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 11: Institutional Desk & Tools */}
        {activeTab === 11 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="text-indigo-400"/> Institutional Desk & Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold mb-2">NinjaTrader Integration</h3>
                <p className="text-sm text-slate-400 mb-4">Custom 200 SMA and High Minus Low range indicators for automated multi-session tracking.</p>
                <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded">Connected</span>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold mb-2">CME Market Data Feed</h3>
                <p className="text-sm text-slate-400 mb-4">Active subscription for top-of-book futures pricing across Asia, London, and NY feeds.</p>
                <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded">Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 12: Account & Profile */}
        {activeTab === 12 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Account & Profile Management</h2>
                  <p className="text-slate-400 text-sm">
                    {user ? `Signed in as ${user.email}` : "Sign in or create an account to sync your progress."}
                  </p>
                </div>
              </div>

              {user ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-500">Account Status</p>
                      <p className="text-sm font-semibold text-emerald-400">Authenticated via Firebase</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {authError && (
                    <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-xs rounded-lg">
                      {authError}
                    </div>
                  )}

                  <button 
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white hover:bg-slate-100 text-slate-900 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign In with Google</span>
                  </button>

                  <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="px-3 text-xs text-slate-500 uppercase">Or email</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium transition"
                    >
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                    <div className="text-center">
                      <button 
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
