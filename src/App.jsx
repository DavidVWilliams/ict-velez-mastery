import React, { useState, useEffect } from 'react';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  PlayCircle, Cpu, BarChart2, CheckSquare, Layers, HelpCircle, FileText, Book, Bot, Briefcase, User, Lock, Mail, LogOut, Upload, ExternalLink, Sparkles, BookOpen
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  // Progress Tracking state
  const [completedModules, setCompletedModules] = useState({
    m1: false, m2: false, m3: false, m4: false, bonus: false
  });

  const toggleModuleCompletion = (key) => {
    setCompletedModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const progress = Math.round((Object.values(completedModules).filter(Boolean).length / 5) * 100);

  // AI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [auditImage, setAuditImage] = useState(null);
  const [auditImageName, setAuditImageName] = useState('');

  // Fixed the syntax error here (sma200Check instead of 200smaCheck)
  const [checklist, setChecklist] = useState({
    liquiditySweep: false,
    mss: false,
    nyKillzone: false,
    sma200Check: false,
    fvgEntry: false
  });

  // Journaling database state
  const [journalNote, setJournalNote] = useState('');
  const [journalSetupType, setJournalSetupType] = useState('NY AM Killzone + FVG');
  const [savedJournals, setSavedJournals] = useState([]);
  const [savingJournal, setSavingJournal] = useState(false);

  // Flashcard spaced-repetition state
  const [cardIndex, setCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState([
    { id: 1, term: "New York AM Killzone", definition: "08:30 AM – 11:00 AM EST. The primary institutional execution window for the ICT 2022 Model.", status: "Review" },
    { id: 2, term: "200 Simple Moving Average (SMA)", definition: "The core Oliver Velez baseline trend filter. Price above = bullish bias, price below = bearish bias, slope dictates momentum.", status: "Review" },
    { id: 3, term: "Market Structure Shift (MSS)", definition: "A violent displacement of price that breaks a significant swing high/low, signaling a change in institutional order flow.", status: "Review" },
    { id: 4, term: "Fair Value Gap (FVG)", definition: "A 3-candle imbalance zone where price leaves an unmitigated footprint acting as a magnetic draw.", status: "Review" },
    { id: 5, term: "Turtle Soup", definition: "A false breakout above/below session highs/lows designed to trap retail breakout traders.", status: "Review" }
  ]);

  useEffect(() => {
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          fetchUserJournals(currentUser.uid);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Auth not initialized:", e);
    }
  }, []);

  const fetchUserJournals = async (uid) => {
    try {
      const db = getFirestore();
      const q = query(collection(db, 'users', uid, 'journals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const journals = [];
      querySnapshot.forEach((doc) => {
        journals.push({ id: doc.id, ...doc.data() });
      });
      setSavedJournals(journals);
    } catch (err) {
      console.warn("Firestore fetch warning:", err);
    }
  };

  const handleSaveJournal = async () => {
    if (!user) {
      alert("Please sign in to save your journal entries to Firebase.");
      setActiveTab(12);
      return;
    }
    if (!journalNote.trim()) return;

    setSavingJournal(true);
    try {
      const db = getFirestore();
      const newEntry = {
        setupType: journalSetupType,
        note: journalNote,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'users', user.uid, 'journals'), newEntry);
      setJournalNote('');
      fetchUserJournals(user.uid);
      alert("Journal entry saved and tracked in Firebase!");
    } catch (err) {
      console.error("Error saving journal:", err);
      alert("Error saving entry: " + err.message);
    } finally {
      setSavingJournal(false);
    }
  };

  useEffect(() => {
    if (activeTab === 3) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": "CME_MINI:ES1!",
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      });
      
      const container = document.getElementById('tradingview-widget-container');
      if (container && !container.hasChildNodes()) {
        container.appendChild(script);
      }
    }
  }, [activeTab]);

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
      setSavedJournals([]);
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
      const parts = [{ text: promptText }];
      if (auditImage) {
        parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: auditImage
          }
        });
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAuditImage(reader.result.split(',')[1]);
        setAuditImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const baseTabs = [
    { id: 1, name: 'ICT Masterclass Curriculum', icon: BookOpen },
    { id: 2, name: 'Oliver Velez & SMA Bridge', icon: Cpu },
    { id: 3, name: 'Practice Trade Simulator', icon: BarChart2 },
    { id: 4, name: 'Pre-Market Playbook', icon: CheckSquare },
    { id: 5, name: 'Flashcard Engine', icon: Layers },
    { id: 6, name: 'Mastery Quiz', icon: HelpCircle },
    { id: 7, name: 'AI Trade Auditor', icon: FileText },
    { id: 8, name: 'Terms & Abbreviations', icon: Book },
    { id: 9, name: 'AI Mentor Hub', icon: Bot },
    { id: 10, name: 'Progress Analytics', icon: BarChart2 },
    { id: 11, name: 'Institutional Desk', icon: Briefcase },
  ];

  const tabs = user ? [...baseTabs, { id: 12, name: 'Account & Profile', icon: User }] : baseTabs;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold">ICT</div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">ICT 2022 & Oliver Velez Mastery Platform</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Algorithmic Precision x Visual Momentum (New York AM Killzone & SMA Focus)</p>
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
        
        {/* Tab 1: Comprehensive Masterclass Dashboard */}
        {activeTab === 1 && (
          <div className="space-y-12">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <BookOpen className="text-indigo-400" /> ICT 2022 Mentorship: Immersive Masterclass
              </h2>
              <p className="text-sm text-slate-300">
                This is a fully standalone, textbook-grade algorithmic study environment. The curriculum strictly centers on the <strong>New York AM Killzone (08:30 – 11:00 EST)</strong> as the primary execution engine, treating Asia and London sessions purely as the liquidity fuel for NY expansion.
              </p>
            </div>

            {/* Module 1 */}
            <section className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Episodes 1-10 Foundations</span>
                  <h2 className="text-3xl font-bold text-white mt-1">Module 1: The New York AM Killzone & Liquidity Architecture</h2>
                </div>
                <button 
                  onClick={() => toggleModuleCompletion('m1')}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${completedModules.m1 ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                  {completedModules.m1 ? '✓ Module 1 Completed' : 'Mark Module Complete'}
                </button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-emerald-400">Institutional Time Macros: The Killzone</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  The foundational premise of the ICT 2022 model is that institutional price delivery is algorithmic and bound to specific time macros. The algorithm is not searching for high-probability setups 24 hours a day. The primary execution window is the <strong>New York AM Killzone, precisely operating between 08:30 AM and 11:00 AM EST</strong>. Trading outside of this window dramatically reduces probability, as you are operating without the backing of the daily algorithmic expansion.
                </p>

                <h4 className="font-bold text-lg text-emerald-400 mt-6">Liquidity Pools: The Fuel for NY Expansion</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Before the New York algorithm engages in a true directional expansion, it must "clear the books." To acquire the massive liquidity required to move the market, the algorithm targets resting stop-loss orders from retail traders. These are found above previous highs (Buy-Side Liquidity / BSL) and below previous lows (Sell-Side Liquidity / SSL).
                </p>
                <p className="text-slate-300 leading-relaxed text-sm">
                  This is why we map the <strong>Asia Session</strong> and <strong>London Session</strong> highs and lows. We do not trade them as breakouts. Instead, we wait for the New York AM Killzone to violently sweep these overnight levels. This sweep induces breakout traders into bad positions and hits the stop-losses of early trend traders, providing the algorithmic fuel for the true daily reversal.
                </p>
              </div>

              <div className="bg-slate-950 p-6 rounded-lg border border-indigo-900/50 flex flex-col items-center gap-4 my-6">
                <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest">SCHEMATIC: THE LIQUIDITY SWEEP (TURTLE SOUP)</div>
                <div className="flex items-end h-28 gap-2 relative mt-4">
                  <div className="w-16 bg-slate-800 h-16 border-t-2 border-slate-600 flex items-center justify-center text-[10px] text-slate-400">Asia High</div>
                  <div className="w-16 bg-slate-700 h-20 border-t-2 border-slate-500 flex items-center justify-center text-[10px] text-slate-400">London High</div>
                  
                  {/* The NY Sweep */}
                  <div className="w-20 bg-slate-800 h-16 border-t-2 border-slate-600 relative flex justify-center">
                    {/* The Spike */}
                    <div className="absolute bottom-16 w-4 bg-emerald-500 h-12"></div>
                    {/* Rejection */}
                    <div className="absolute bottom-16 w-4 bg-red-500 h-8 left-10"></div>
                    <div className="absolute -top-14 text-[10px] text-emerald-400 text-center font-bold">NY AM 08:30<br/>LIQUIDITY SWEEP</div>
                    <div className="absolute top-2 text-[10px] text-slate-400">NY Open</div>
                  </div>
                </div>
              </div>

              <a href="https://www.youtube.com/watch?v=bx89qkJ_LR4&t=840s" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
                <PlayCircle className="mr-2" size={18}/> Access Full Source Lecture (Ep 3 @ 14:00) <ExternalLink className="ml-1" size={14}/>
              </a>
            </section>

            {/* Module 2 */}
            <section className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Episodes 11-20 Execution</span>
                  <h2 className="text-3xl font-bold text-white mt-1">Module 2: Market Structure Shifts (MSS) & FVG Mechanics</h2>
                </div>
                <button 
                  onClick={() => toggleModuleCompletion('m2')}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${completedModules.m2 ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                  {completedModules.m2 ? '✓ Module 2 Completed' : 'Mark Module Complete'}
                </button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-emerald-400">The Market Structure Shift (MSS)</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  A liquidity sweep alone is not enough to enter a trade; you must wait for algorithmic confirmation. This comes in the form of a <strong>Market Structure Shift (MSS)</strong>. An MSS is defined as a violent, impulsive displacement in price that aggressively breaks the most recent significant swing low (for a short setup) or swing high (for a long setup).
                </p>
                <p className="text-slate-300 leading-relaxed text-sm">
                  If the New York open sweeps the London high, we do not short immediately at the top. We wait for price to violently crack downward, breaking the nearest structural low. This displacement is the algorithmic footprint confirming that Smart Money has successfully utilized the liquidity pool to reverse the market.
                </p>

                <h4 className="font-bold text-lg text-emerald-400 mt-6">Fair Value Gaps (FVG): The Entry Magnet</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  When the MSS displacement occurs, price moves so fast that it creates an inefficiency in the order book. This leaves a 3-candle imbalance known as a <strong>Fair Value Gap (FVG)</strong>. Because the algorithm must balance price delivery, the FVG acts as a magnetic draw.
                </p>
                <p className="text-slate-300 leading-relaxed text-sm">
                  The execution model is complete when price retraces back into this Fair Value Gap. This is your precise entry point. Your stop loss is placed above the initial liquidity sweep high, offering a high-probability, high-R/R institutional setup.
                </p>
              </div>

              <div className="bg-slate-950 p-6 rounded-lg border border-indigo-900/50 flex flex-col items-center gap-4 my-6">
                <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest">SCHEMATIC: THE FVG IMBALANCE (BEARISH)</div>
                <div className="flex h-40 items-center justify-center gap-4 relative mt-4">
                  {/* Candle 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-1 bg-slate-500 h-6"></div>
                    <div className="w-6 bg-slate-700 h-10 border border-slate-500"></div>
                    <div className="w-1 bg-slate-500 h-4"></div>
                    <div className="mt-2 text-[10px] text-slate-500">C1</div>
                  </div>
                  {/* Candle 2 (Displacement) */}
                  <div className="flex flex-col items-center mt-12 relative">
                    <div className="w-1 bg-red-500 h-2"></div>
                    <div className="w-6 bg-red-600 h-24 border border-red-500"></div>
                    <div className="w-1 bg-red-500 h-2"></div>
                    <div className="mt-2 text-[10px] text-slate-500">C2 (MSS)</div>
                    
                    {/* The FVG Highlight Box */}
                    <div className="absolute -left-12 top-6 w-32 h-8 bg-indigo-500/20 border border-indigo-500/50 z-10 flex items-center justify-center text-[10px] text-indigo-300 font-bold">FVG IMBALANCE</div>
                  </div>
                  {/* Candle 3 */}
                  <div className="flex flex-col items-center mt-32">
                    <div className="w-1 bg-slate-500 h-8"></div>
                    <div className="w-6 bg-slate-700 h-8 border border-slate-500"></div>
                    <div className="w-1 bg-slate-500 h-2"></div>
                    <div className="mt-2 text-[10px] text-slate-500">C3</div>
                  </div>
                </div>
              </div>

              <a href="https://www.youtube.com/watch?v=bx89qkJ_LR4&t=1800s" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
                <PlayCircle className="mr-2" size={18}/> Access Full Source Lecture (Ep 14 @ 30:00) <ExternalLink className="ml-1" size={14}/>
              </a>
            </section>

            {/* Module 3 */}
            <section className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Episodes 21-30 Tape Reading</span>
                  <h2 className="text-3xl font-bold text-white mt-1">Module 3: Tape Reading & PM Session Macros</h2>
                </div>
                <button 
                  onClick={() => toggleModuleCompletion('m3')}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${completedModules.m3 ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                  {completedModules.m3 ? '✓ Module 3 Completed' : 'Mark Module Complete'}
                </button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-emerald-400">Institutional Delivery Rhythm</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Tape reading requires interpreting the velocity and cadence of price delivery. True algorithmic expansion days exhibit clean, sustained displacement with minimal overlap between consecutive candle bodies. Consolidation days show heavy overlapping wicks, hesitation at internal arrays, and sluggish momentum. Recognizing these delivery rhythms early in the New York AM session allows you to adjust targets—scaling out aggressively on choppy days while holding runners on clean expansion days.
                </p>

                <h4 className="font-bold text-lg text-emerald-400 mt-6">The New York PM Session (13:30 - 16:00 EST)</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  While the AM Killzone is the primary engine, the PM Session provides a secondary high-probability window. Often, the algorithm will use the 13:30 EST macro to sweep the liquidity generated during the sluggish midday lunch hour (12:00-13:00 EST). Furthermore, the final 30 minutes into the Market on Close (MOC) often feature rapid, directional clearing of internal imbalances. The same sequence applies: wait for the PM Killzone window, identify the midday liquidity sweep, confirm the MSS, and enter the FVG.
                </p>
              </div>

              <a href="https://www.youtube.com/watch?v=kmVXVJE08eQ" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
                <PlayCircle className="mr-2" size={18}/> Access Full Source Lecture (Ep 21) <ExternalLink className="ml-1" size={14}/>
              </a>
            </section>

            {/* Module 4 */}
            <section className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Episodes 31-41 Mastery</span>
                  <h2 className="text-3xl font-bold text-white mt-1">Module 4: IPDA Lookbacks & Risk Mathematics</h2>
                </div>
                <button 
                  onClick={() => toggleModuleCompletion('m4')}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${completedModules.m4 ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                  {completedModules.m4 ? '✓ Module 4 Completed' : 'Mark Module Complete'}
                </button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-emerald-400">Interbank Price Delivery Algorithm (IPDA) Lookbacks</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  To understand where intraday NY Killzone price is heading, you must anchor your analysis to IPDA’s historical lookback windows: 20-day, 40-day, and 60-day cycles. These represent institutional quarterly and monthly shifting ranges. When an intraday New York AM Fair Value Gap aligns perfectly with a higher-timeframe 40-day IPDA discount array, the probability of a successful, massive algorithmic reaction multiplies exponentially.
                </p>

                <h4 className="font-bold text-lg text-emerald-400 mt-6">Fixed-Fractional Risk Control</h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Mastery of the NY Killzone is worthless without strict risk mathematics. The professional institutional standard mandates a fixed-fractional risk model where no single trade exceeds 0.5% to 1.0% of total account equity. You must calculate mathematical expectancy, factoring in your win-rate and demanding a minimum 1:2 Risk-to-Reward ratio. This ensures that a streak of 4 or 5 losing setups never compromises your trading capital or triggers emotional revenge trading.
                </p>
              </div>

              <a href="https://www.youtube.com/watch?v=CnTXwAuDi9Y" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
                <PlayCircle className="mr-2" size={18}/> Access Full Source Lecture (Ep 31) <ExternalLink className="ml-1" size={14}/>
              </a>
            </section>

            {/* Bonus Module */}
            <section className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start flex-wrap gap-4">
                <div>
                  <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Special Topic Silver Bullet</span>
                  <h2 className="text-3xl font-bold text-white mt-1">Bonus: Silver Bullet & Oliver Velez Hybrid Strategy</h2>
                </div>
                <button 
                  onClick={() => toggleModuleCompletion('bonus')}
                  className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${completedModules.bonus ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                  {completedModules.bonus ? '✓ Bonus Completed' : 'Mark Module Complete'}
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed text-sm">
                  This hybrid model bridges the exact precision of ICT algorithmic timing with the visual momentum triggers of the Oliver Velez system. By narrowing your focus to the <strong>NY Silver Bullet window (10:00 AM - 11:00 AM EST)</strong>, you are trading when the algorithm is guaranteed to seek an external liquidity draw.
                </p>
                <p className="text-slate-300 leading-relaxed text-sm">
                  <strong>The Hybrid Execution Rule:</strong> We wait for the standard ICT sequence (Sweep ➔ MSS ➔ FVG) during the 10:00-11:00 window. However, we DO NOT enter blindly on the FVG touch. We filter the entry using the <strong>Oliver Velez 200 Simple Moving Average (SMA)</strong>. If the 200 SMA is sloping downward, we only take short FVGs. Furthermore, we wait for a crisp <strong>Red Ignition Candle</strong> to print and close inside the FVG before pulling the trigger, verifying real-time momentum aligns with the structural shift.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* Tab 2: Oliver Velez & SMA Bridge */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Cpu className="text-indigo-400"/> Oliver Velez & 200 SMA Visual Momentum Bridge</h2>
            
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-indigo-300">Platform Intent & Explanation</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                ICT frameworks provide the <strong>institutional map</strong> (where algorithms target liquidity during the New York AM Killzone), while Oliver Velez momentum rules provide the <strong>visual trigger</strong> (using the 200 SMA slope and ignition candles to enter safely). Tab 2 bridges these two systems so you never enter a liquidity trap blindly.
              </p>
              
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 space-y-2">
                <div><strong>Rule 1 (The Macro Trend Filter):</strong> Never fight the 200 SMA slope. If it tilts down, look exclusively for shorts; if it tilts up, look for longs.</div>
                <div><strong>Rule 2 (Session Framing):</strong> Asia and London establish liquidity pools. Watch for the New York AM Killzone to run those extremes.</div>
                <div><strong>Rule 3 (The Trigger):</strong> Combine Killzone timing with Velez Green/Red ignition candles pulsing inside the ICT FVG.</div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-emerald-400">Real-World Execution Example: New York AM Short Setup</h3>
              
              <div className="space-y-3 text-sm text-slate-300">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block mb-1">Step 1: Macro Check (Oliver Velez)</strong>
                  You open your NQ or ES chart leading into the New York session. The 200 Simple Moving Average (SMA) is clearly sloping downward on the 15-minute timeframe, confirming a bearish institutional bias.
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block mb-1">Step 2: Session Liquidity (ICT)</strong>
                  During the 08:30-10:00 EST window, price pushes upward and sweeps slightly above the overnight London or Asia high, taking out retail buy-side liquidity (Turtle Soup setup).
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block mb-1">Step 3: The Ignition Trigger (Hybrid)</strong>
                  Right after sweeping liquidity during the NY AM Killzone, price rejects downward, creating a Fair Value Gap and printing a strong <strong>Red ignition candle</strong> closing near its low right beneath the falling 200 SMA line.
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block mb-1">Step 4: Execution & Management</strong>
                  You enter short inside the FVG with your stop loss above the sweep high, targeting internal range liquidity or session lows.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Practice Trade Simulator with Live TradingView Chart */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="text-indigo-400"/> Practice Trade Simulator & Live Chart</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-400 text-sm">Analyze live CME futures price action, mark Fair Value Gaps, and observe 200 SMA boundaries directly on the chart below during the New York AM Killzone.</p>
              <div className="w-full h-[600px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
                <div id="tradingview-widget-container" className="w-full h-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Pre-Market Playbook & Firebase Journaling Database */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><CheckSquare className="text-indigo-400"/> Pre-Market Playbook & Firebase Journaling Database</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-indigo-300">Interactive Pre-Flight Checklist (NY AM Focus)</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input 
                      type="checkbox" 
                      checked={checklist.liquiditySweep}
                      onChange={(e) => setChecklist({...checklist, liquiditySweep: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm text-slate-200">1. Confirm NY Killzone sweep of overnight Asia/London BSL/SSL pools.</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input 
                      type="checkbox" 
                      checked={checklist.mss}
                      onChange={(e) => setChecklist({...checklist, mss: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm text-slate-200">2. Identify violent structural displacement causing a Market Structure Shift (MSS).</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input 
                      type="checkbox" 
                      checked={checklist.nyKillzone}
                      onChange={(e) => setChecklist({...checklist, nyKillzone: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm text-slate-200">3. Confirm setup falls strictly within the active NY AM Killzone (08:30 - 11:00 EST).</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input 
                      type="checkbox" 
                      checked={checklist.sma200Check}
                      onChange={(e) => setChecklist({...checklist, sma200Check: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm text-slate-200">4. Verify setup direction matches the slope of the Velez 200 SMA.</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input 
                      type="checkbox" 
                      checked={checklist.fvgEntry}
                      onChange={(e) => setChecklist({...checklist, fvgEntry: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm text-slate-200">5. Wait for Velez Green/Red ignition candle print inside the MSS FVG to enter.</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-indigo-300">Rule-Based Journaling Database (Firebase)</h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Setup Type Category</label>
                    <select 
                      value={journalSetupType}
                      onChange={(e) => setJournalSetupType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="NY AM Killzone + FVG">NY AM Killzone + FVG Reversal</option>
                      <option value="NY Open 200 SMA Bounce">NY Open 200 SMA Bounce</option>
                      <option value="NY Silver Bullet Turtle Soup">NY Silver Bullet Turtle Soup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Trade Notes & Observations</label>
                    <textarea 
                      rows={3}
                      value={journalNote}
                      onChange={(e) => setJournalNote(e.target.value)}
                      placeholder="Record session conditions, risk parameters, and execution outcome..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button 
                    onClick={handleSaveJournal}
                    disabled={savingJournal}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                  >
                    {savingJournal ? 'Saving to Firebase...' : 'Save & Track Journal Entry'}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 max-h-40 overflow-y-auto space-y-2">
                  <div className="text-xs font-semibold text-slate-400">Saved History ({savedJournals.length}):</div>
                  {savedJournals.length === 0 ? (
                    <div className="text-xs text-slate-600">No entries saved yet. Sign in and submit your first setup.</div>
                  ) : (
                    savedJournals.map((j) => (
                      <div key={j.id} className="p-2 bg-slate-950 rounded border border-slate-800 text-xs">
                        <span className="text-indigo-400 font-semibold">{j.setupType}:</span> {j.note}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Spaced-Repetition Active Recall Flashcards */}
        {activeTab === 5 && (
          <div className="space-y-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Layers className="text-indigo-400"/> Spaced-Repetition Flashcards</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center space-y-6">
              <div className="flex justify-between items-center text-xs text-slate-500 uppercase font-semibold">
                <span>Card {cardIndex + 1} of {flashcardDeck.length}</span>
                <span className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded">Status: {flashcardDeck[cardIndex].status}</span>
              </div>
              <div 
                onClick={() => setShowDefinition(!showDefinition)}
                className="min-h-[180px] bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center cursor-pointer transition hover:border-indigo-500"
              >
                {!showDefinition ? (
                  <div>
                    <h3 className="text-xl font-bold text-indigo-300 mb-2">{flashcardDeck[cardIndex].term}</h3>
                    <p className="text-xs text-slate-500">(Click card to reveal active recall definition)</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-200">{flashcardDeck[cardIndex].definition}</p>
                    <p className="text-xs text-slate-500 mt-3">(Click to flip back)</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    const updated = [...flashcardDeck];
                    updated[cardIndex].status = "Needs Practice";
                    setFlashcardDeck(updated);
                    setShowDefinition(false);
                    setCardIndex((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0));
                  }}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 py-2 rounded-lg text-xs font-semibold transition"
                >
                  Still Learning (Hard)
                </button>
                <button 
                  onClick={() => {
                    const updated = [...flashcardDeck];
                    updated[cardIndex].status = "Mastered";
                    setFlashcardDeck(updated);
                    setShowDefinition(false);
                    setCardIndex((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0));
                  }}
                  className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-xs font-semibold transition"
                >
                  Got It (Easy)
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
              <p className="text-slate-300 mb-4">Test your mastery of the New York AM Killzone liquidity frameworks and 200 SMA visual momentum filters.</p>
              <button className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition">
                Start Mastery Assessment
              </button>
            </div>
          </div>
        )}

        {/* Tab 7: AI Trade Auditor with Screenshot Upload */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-indigo-400"/> AI Trade Auditor & Chart Analyzer</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-400 text-sm">Upload a screenshot of your NinjaTrader chart during the NY AM Killzone and enter your journal breakdown for instant AI multimodal auditing:</p>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 px-4 py-2.5 rounded-lg cursor-pointer text-xs font-medium text-slate-300 transition">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>{auditImageName ? `Attached: ${auditImageName}` : 'Upload Chart Screenshot'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {auditImageName && (
                  <button 
                    onClick={() => { setAuditImage(null); setAuditImageName(''); }} 
                    className="text-xs text-red-400 hover:underline"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              <textarea 
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. NY AM sweep of London high, price rejected off 200 SMA downward slope, red ignition printed inside FVG..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={() => callGemini("Audit this trade and chart screenshot based on ICT New York AM Killzone models and Oliver Velez 200 SMA momentum rules: " + aiPrompt)}
                disabled={loadingAi}
                className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4"/>
                {loadingAi ? 'Analyzing Chart & Setup...' : 'Run AI Trade Audit'}
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
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800"><strong className="text-indigo-400">NY AM Killzone:</strong> 08:30 - 11:00 EST institutional execution window</div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800"><strong className="text-indigo-400">OTE:</strong> Optimal Trade Entry (62% - 79% Fibonacci retracement)</div>
            </div>
          </div>
        )}

        {/* Tab 9: AI Mentor Hub */}
        {activeTab === 9 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Bot className="text-indigo-400"/> AI Mentor Hub</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-400 text-sm">Ask your AI Mentor any trading question regarding the New York AM Killzone, liquidity, or 200 SMA momentum rules:</p>
              <input 
                type="text"
                placeholder="e.g. How do I trade the liquidity sweep during the New York AM open?"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') callGemini("Answer as an expert ICT & Oliver Velez trading mentor focusing on New York AM Killzone setups and 200 SMA discipline: " + e.target.value);
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
            <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="text-indigo-400"/> Progress Analytics</h2>
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
                <p className="text-sm text-slate-400 mb-4">Custom 200 SMA and High Minus Low range indicators for automated NY Killzone tracking.</p>
                <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded">Connected</span>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold mb-2">CME Market Data Feed</h3>
                <p className="text-sm text-slate-400 mb-4">Active subscription for top-of-book futures pricing during New York morning sessions.</p>
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
