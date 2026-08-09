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
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
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
  Upload,
  CheckCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  // Fixed Progress Tracking state
  const [completedModules, setCompletedModules] = useState({
    m1: false,
    m2: false,
    m3: false,
    m4: false,
    bonus: false
  });

  const toggleModuleCompletion = (key) => {
    setCompletedModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const progress = Math.round(
    (Object.values(completedModules).filter(Boolean).length / 5) * 100
  );

  // AI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [auditImage, setAuditImage] = useState(null);
  const [auditImageName, setAuditImageName] = useState('');

  // Flashcard spaced-repetition state
  const [cardIndex, setCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState([
    { id: 1, term: "Fair Value Gap (FVG)", definition: "A 3-candle imbalance zone where price leaves an unmitigated footprint acting as a magnetic draw.", status: "Review" },
    { id: 2, term: "200 Simple Moving Average (SMA)", definition: "The core Oliver Velez baseline trend filter. Price above = bullish bias, price below = bearish bias, slope dictates momentum.", status: "Review" },
    { id: 3, term: "Asia Session Range", definition: "The initial overnight consolidation box (Tokyo open) often defining the daily high/low template or accumulation phase.", status: "Review" },
    { id: 4, term: "Ignition Candle", definition: "An oversized momentum candle breaking key resistance or support backed by high relative volume and green/red pulse.", status: "Review" },
    { id: 5, term: "Turtle Soup", definition: "A false breakout above/below session highs/lows (Asia/London) designed to trap retail breakout traders.", status: "Review" }
  ]);

  // Pre-market interactive multi-session checklist state
  const [checklist, setChecklist] = useState({
    asiaRange: false,
    londonSweep: false,
    nyKillzone: false,
    sma200Slope: false,
    ignitionTrigger: false
  });

  // Journaling database state
  const [journalNote, setJournalNote] = useState('');
  const [journalSetupType, setJournalSetupType] = useState('Asia Sweep + FVG');
  const [savedJournals, setSavedJournals] = useState([]);
  const [savingJournal, setSavingJournal] = useState(false);

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
    { id: 1, name: 'YouTube Curriculum & Video', icon: PlayCircle },
    { id: 2, name: 'Oliver Velez & SMA Bridge', icon: Cpu },
    { id: 3, name: 'Practice Trade Simulator & Chart', icon: BarChart2 },
    { id: 4, name: 'Pre-Market Playbook & Database', icon: CheckSquare },
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
        {/* Tab 1: Fully Restored Robust Curriculum Content */}
        {activeTab === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><PlayCircle className="text-indigo-400"/> Mentorship Modules & Robust Core Curriculum</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Module 1 */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs text-indigo-400 font-semibold uppercase">Episodes 1-10 Foundations</span>
                <h3 className="text-xl font-bold">Module 1: Foundational Mechanics & Liquidity</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Master the foundational language of institutional order flow. This module establishes how interbank price delivery algorithms dictate the daily trading range by targeting resting liquidity pools (Buy-Side and Sell-Side Liquidity) and framing overnight consolidation boxes during the Tokyo Asia session.
                </p>
                <div className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <strong className="text-indigo-300 block mb-1 font-semibold">Comprehensive Core Objectives:</strong>
                  <div>• Identifying internal range liquidity (FVGs, old highs/lows) vs external range liquidity (daily/weekly highs & lows).</div>
                  <div>• Marking Tokyo Asia session high and low boundaries to anticipate overnight accumulation boxes.</div>
                  <div>• Recognizing Market Structure Shifts (MSS) on lower timeframes as confirmation of institutional intent.</div>
                </div>
                
                <a 
                  href="https://www.youtube.com/watch?v=bx89qkJ_LR4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-600/20 text-red-400 rounded-lg group-hover:bg-red-600/30">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Watch Module 1 Lecture on YouTube</div>
                      <div className="text-xs text-slate-400">ICT 2022 Mentorship Series</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                </a>

                <button 
                  onClick={() => toggleModuleCompletion('m1')}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold transition ${
                    completedModules.m1 ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {completedModules.m1 ? '✓ Module 1 Completed' : 'Mark Module 1 Complete'}
                </button>
              </div>

              {/* Module 2 */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs text-indigo-400 font-semibold uppercase">Episodes 11-20 Execution</span>
                <h3 className="text-xl font-bold">Module 2: Order Block Science & Killzones</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bridge theory to live execution by mastering high-probability Order Blocks and Fair Value Gaps. Learn how institutional algorithms re-deliver price into discount or premium arrays specifically inside timed London and New York Killzone windows.
                </p>
                <div className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <strong className="text-indigo-300 block mb-1 font-semibold">Comprehensive Core Objectives:</strong>
                  <div>• Defining valid order blocks using strict mitigation and displacement criteria.</div>
                  <div>• Timing London open sweeps of Asia extremes to catch high-reward reversal expansions.</div>
                  <div>• Executing precise entries off 15-minute and 5-minute Fair Value Gaps (FVGs) with tight risk parameters.</div>
                </div>

                <a 
                  href="https://www.youtube.com/watch?v=bx89qkJ_LR4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-600/20 text-red-400 rounded-lg group-hover:bg-red-600/30">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Watch Module 2 Lecture on YouTube</div>
                      <div className="text-xs text-slate-400">ICT 2022 Mentorship Series</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                </a>

                <button 
                  onClick={() => toggleModuleCompletion('m2')}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold transition ${
                    completedModules.m2 ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {completedModules.m2 ? '✓ Module 2 Completed' : 'Mark Module 2 Complete'}
                </button>
              </div>

              {/* Module 3 */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs text-indigo-400 font-semibold uppercase">Episodes 21-30 Tape Reading</span>
                <h3 className="text-xl font-bold">Module 3: Tape Reading & Rebalance Theory</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Develop advanced tape-reading skills to interpret live market momentum. Understand how to differentiate true institutional expansion days from tedious consolidation profiles, and navigate afternoon PM session liquidity windows with confidence.
                </p>
                <div className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <strong className="text-indigo-300 block mb-1 font-semibold">Comprehensive Core Objectives:</strong>
                  <div>• Recognizing subtle institutional distribution signatures on lower timeframes.</div>
                  <div>• Managing afternoon PM session liquidity sweeps and market-on-close (MOC) imbalances.</div>
                  <div>• Avoiding low-probability midday chop zones by respecting institutional time templates.</div>
                </div>

                <a 
                  href="https://www.youtube.com/watch?v=kmVXVJE08eQ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-600/20 text-red-400 rounded-lg group-hover:bg-red-600/30">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Watch Module 3 Lecture on YouTube</div>
                      <div className="text-xs text-slate-400">ICT 2022 Mentorship Series</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                </a>

                <button 
                  onClick={() => toggleModuleCompletion('m3')}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold transition ${
                    completedModules.m3 ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {completedModules.m3 ? '✓ Module 3 Completed' : 'Mark Module 3 Complete'}
                </button>
              </div>

              {/* Module 4 */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                <span className="text-xs text-indigo-400 font-semibold uppercase">Episodes 31-41 Mastery</span>
                <h3 className="text-xl font-bold">Module 4: IPDA Algorithmic Theory & Risk Control</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Synthesize the complete Interbank Price Delivery Algorithm (IPDA). This module covers multi-day historical lookback profiles, robust position sizing protocols, and psychological armor required to sustain long-term consistency.
                </p>
                <div className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <strong className="text-indigo-300 block mb-1 font-semibold">Comprehensive Core Objectives:</strong>
                  <div>• Calculating 20, 40, and 60-day IPDA lookback reference points.</div>
                  <div>• Implementing strict fixed-fractional risk management rules to survive consecutive loss streaks.</div>
                  <div>• Maintaining peak psychological discipline and avoiding revenge trading during market drawdowns.</div>
                </div>

                <a 
                  href="https://www.youtube.com/watch?v=CnTXwAuDi9Y" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-600/20 text-red-400 rounded-lg group-hover:bg-red-600/30">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Watch Module 4 Lecture on YouTube</div>
                      <div className="text-xs text-slate-400">ICT 2022 Mentorship Series</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                </a>

                <button 
                  onClick={() => toggleModuleCompletion('m4')}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold transition ${
                    completedModules.m4 ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {completedModules.m4 ? '✓ Module 4 Completed' : 'Mark Module 4 Complete'}
                </button>
              </div>

            </div>

            {/* Bonus Module */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <span className="text-xs text-indigo-400 font-semibold uppercase">Special Topic Silver Bullet</span>
              <h3 className="text-xl font-bold">Bonus Module: ICT Silver Bullet & OV Momentum Hybrid</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A streamlined, high-probability execution model combining 1-hour time-based algorithmic windows with Oliver Velez visual momentum confirmation triggers and 200 Simple Moving Average (SMA) slope alignment.
              </p>
              <div className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <strong className="text-indigo-300 block mb-1 font-semibold">Comprehensive Core Objectives:</strong>
                <div>• Exploiting the London and New York 1-hour Silver Bullet liquidity delivery windows.</div>
                <div>• Marrying ICT Fair Value Gap magnets with Oliver Velez Green/Red ignition candles.</div>
              </div>
              <button 
                onClick={() => toggleModuleCompletion('bonus')}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold transition ${
                  completedModules.bonus ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {completedModules.bonus ? '✓ Bonus Module Completed' : 'Mark Bonus Module Complete'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Oliver Velez & SMA Bridge */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Cpu className="text-indigo-400"/> Oliver Velez & 200 SMA Visual Momentum Bridge</h2>
            
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-indigo-300">Platform Intent & Explanation</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                ICT frameworks provide the <strong>institutional map</strong> (where algorithms target liquidity across Asia, London, and New York), while Oliver Velez momentum rules provide the <strong>visual trigger</strong> (using the 200 SMA slope and ignition candles to enter safely). Tab 2 bridges these two systems so you never enter a liquidity trap blindly.
              </p>
              
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 space-y-2">
                <div><strong>Rule 1 (The Macro Trend Filter):</strong> Never fight the 200 SMA slope. If it tilts down, look exclusively for shorts; if it tilts up, look for longs.</div>
                <div><strong>Rule 2 (Session Framing):</strong> Asia establishes the overnight consolidation box. Watch for London or New York to run (sweep) those extremes.</div>
                <div><strong>Rule 3 (The Trigger):</strong> Combine Killzone timing with Velez Green/Red ignition candles pulsing off the 200 SMA baseline.</div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-emerald-400">Real-World Execution Example: London Session Short Setup</h3>
              
              <div className="space-y-3 text-sm text-slate-300">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block mb-1">Step 1: Macro Check (Oliver Velez)</strong>
                  You open your NQ or ES chart during the London open. The 200 Simple Moving Average (SMA) is clearly sloping downward on the 15-minute timeframe, confirming a bearish institutional bias.
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block mb-1">Step 2: Session Liquidity (ICT)</strong>
                  Price pushes upward during the early London window and sweeps slightly above the overnight Asia Session High, taking out retail buy-side liquidity (a classic Turtle Soup setup).
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block mb-1">Step 3: The Ignition Trigger (Hybrid)</strong>
                  Right after sweeping the Asia high, price rejects back downward, creating a 15-minute Fair Value Gap (FVG) and printing a strong <strong>Red ignition candle</strong> closing near its low right beneath the falling 200 SMA line.
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <strong className="text-indigo-300 block mb-1">Step 4: Execution & Management</strong>
                  You enter short inside the FVG with your stop loss above the sweep high, targeting the opposite session low or internal range liquidity.
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
              <p className="text-slate-400 text-sm">Analyze live CME futures price action, mark Fair Value Gaps, and observe 200 SMA boundaries directly on the chart below across Asia, London, and New York sessions.</p>
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
                <h3 className="text-lg font-bold text-indigo-300">Interactive Pre-Flight Checklist (Asia, London, NY)</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checklist.asiaRange}
                      onChange={(e) => setChecklist({...checklist, asiaRange: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm text-slate-200">1. Mark Asia Session high/low range box (Tokyo accumulation).</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checklist.londonSweep}
                      onChange={(e) => setChecklist({...checklist, londonSweep: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm text-slate-200">2. Track London Open sweep of Asia range extremes (Turtle Soup).</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checklist.nyKillzone}
                      onChange={(e) => setChecklist({...checklist, nyKillzone: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm text-slate-200">3. Target New York Killzone window (AM open / PM session macros).</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={checklist.sma200Slope}
                      onChange={(e) => setChecklist({...checklist, sma200Slope: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
                    />
                    <span className="text-sm text-slate-200">4. Verify 200 SMA slope and directional momentum bias.</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
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
                      <option value="Asia Sweep + FVG">Asia Sweep + FVG Reversal</option>
                      <option value="London Open 200 SMA Bounce">London Open 200 SMA Bounce</option>
                      <option value="NY Killzone Turtle Soup">NY Killzone Turtle Soup</option>
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
              <p className="text-slate-300 mb-4">Test your mastery of multi-session liquidity frameworks and 200 SMA visual momentum filters.</p>
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
              <p className="text-slate-400 text-sm">Upload a screenshot of your NinjaTrader or Webull chart and enter your journal breakdown for instant AI multimodal auditing:</p>
              
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
                placeholder="e.g. London session sweep of Asia high, price rejected off 200 SMA downward slope on NQ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={() => callGemini("Audit this trade and chart screenshot based on ICT multi-session models and Oliver Velez 200 SMA momentum rules: " + aiPrompt)}
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
