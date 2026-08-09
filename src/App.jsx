import React, { useState, useEffect } from 'react';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  PlayCircle, Cpu, BarChart2, CheckSquare, Layers, HelpCircle, FileText, Book, Bot, Briefcase, User, Lock, Mail, LogOut, Upload, ExternalLink, Sparkles, BookOpen, ChevronRight, ArrowRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  // AI & Checklist states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [auditImage, setAuditImage] = useState(null);
  const [auditImageName, setAuditImageName] = useState('');
  
  const [checklist, setChecklist] = useState({
    liquiditySweep: false,
    mss: false,
    fvgEntry: false,
    nyKillzone: false,
    sma200Check: false
  });

  const [journalNote, setJournalNote] = useState('');
  const [journalSetupType, setJournalSetupType] = useState('ICT 2022 Model + Velez Filter');
  const [savedJournals, setSavedJournals] = useState([]);
  const [savingJournal, setSavingJournal] = useState(false);

  // Flashcards
  const [cardIndex, setCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState([
    { id: 1, term: "Power of 3 (AMD)", definition: "Accumulation, Manipulation, Distribution. The algorithmic daily profile template.", status: "Review" },
    { id: 2, term: "Breaker Block", definition: "A failed order block that was broken with displacement. Used as a high-probability entry point upon return.", status: "Review" },
    { id: 3, term: "OTE (Optimal Trade Entry)", definition: "The 62% to 79% Fibonacci retracement level of a dealing range.", status: "Review" },
    { id: 4, term: "BPR (Balanced Price Range)", definition: "When a single candle's FVG is immediately overlapped by a returning FVG in the opposite direction, creating a balanced zone that price should not re-enter.", status: "Review" },
  ]);

  // Active Lesson State for Tab 1
  const [activeLessonId, setActiveLessonId] = useState("c1");

  useEffect(() => {
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) fetchUserJournals(currentUser.uid);
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
      querySnapshot.forEach((doc) => journals.push({ id: doc.id, ...doc.data() }));
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
        "autosize": true, "symbol": "CME_MINI:ES1!", "interval": "15", "timezone": "Etc/UTC", "theme": "dark", "style": "1", "locale": "en", "allow_symbol_change": true, "calendar": false, "support_host": "https://www.tradingview.com"
      });
      const container = document.getElementById('tradingview-widget-container');
      if (container && !container.hasChildNodes()) container.appendChild(script);
    }
  }, [activeTab]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
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
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setActiveTab(1);
    } catch (err) { setAuthError(err.message); }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setSavedJournals([]); setActiveTab(1);
    } catch (err) { console.error(err); }
  };

  const callGemini = async (promptText) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) { setAiResponse("Error: VITE_GEMINI_API_KEY is not configured."); return; }
    setLoadingAi(true); setAiResponse('');
    try {
      const parts = [{ text: promptText }];
      if (auditImage) parts.push({ inline_data: { mime_type: "image/jpeg", data: auditImage } });
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      });
      const data = await res.json();
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.");
    } catch (err) { setAiResponse("Error calling Gemini API: " + err.message); } finally { setLoadingAi(false); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setAuditImage(reader.result.split(',')[1]); setAuditImageName(file.name); };
      reader.readAsDataURL(file);
    }
  };

  // --- COMPREHENSIVE TEXTBOOK DATA ---
  const courseData = [
    {
      id: "c1",
      title: "Part 1: The Core Elements (Episodes 1-5)",
      episodes: "Eps 1-5",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 1-5 lay the absolute groundwork. ICT explicitly states you must stop looking at patterns and start looking for the <em>Draw on Liquidity</em>. Algorithms move price from an area of consolidation to an area of resting liquidity (stop losses).</p>
          
          <h4 className="text-lg font-bold text-emerald-400 mt-6">Step 1: Identifying the Draw on Liquidity</h4>
          <p>Before doing anything, you must determine where price is likely to reach. Algorithms seek out:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Buy-Side Liquidity (BSL):</strong> Resting buy stops above old relative equal highs, daily highs, or weekly highs.</li>
            <li><strong>Sell-Side Liquidity (SSL):</strong> Resting sell stops below old relative equal lows, daily lows, or weekly lows.</li>
          </ul>
          <p><em>Velez Bridge:</em> If your Velez 200 SMA is sloping up, your Draw on Liquidity is BSL. The algorithm is currently programmed to seek higher prices to clear those buy stops.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Step 2: Displacement and the Market Structure Shift (MSS)</h4>
          <p>Once price reaches the liquidity pool (e.g., sweeps BSL), it must show institutional displacement to confirm a reversal. This is the <strong>Market Structure Shift (MSS)</strong>.</p>
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
            <strong className="text-indigo-400">The Mechanical Rules for a valid MSS:</strong>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Price runs above an old high (sweeps BSL).</li>
              <li>Price immediately aggressively reverses downward.</li>
              <li>Price must break the nearest short-term swing low (the low created just before the sweep).</li>
              <li><strong>Crucial:</strong> The break must happen with energetic, large-bodied candles (Displacement). If it chops its way down, it is not a valid MSS.</li>
            </ol>
          </div>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Step 3: The Fair Value Gap (FVG)</h4>
          <p>Displacement leaves a signature: The FVG. This is a 3-candle sequence where the high of candle 1 and the low of candle 3 do not overlap. The space between them is a price inefficiency. The algorithm will re-price back into this gap. This is your entry point.</p>
        </div>
      )
    },
    {
      id: "c2",
      title: "Part 2: The Daily Profile & AMD (Episodes 6-12)",
      episodes: "Eps 6-12",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 6-12 introduce time macros. ICT teaches that price delivery is highly dependent on the time of day. This section introduces the <strong>Power of 3 (AMD)</strong> and the New York AM Killzone.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">The Power of 3: AMD (Accumulation, Manipulation, Distribution)</h4>
          <p>For a bullish day, the algorithm executes the following sequence:</p>
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-4">
            <p><strong>1. Accumulation (Asia Session 20:00-00:00 EST):</strong> Price consolidates in a tight range. Smart money is quietly accumulating long positions. This creates the Asia High and Asia Low.</p>
            <p><strong>2. Manipulation (London/NY Open):</strong> Price drops below the Asia Low, moving in the <em>opposite</em> direction of the true daily bias. This engineers Sell-Side Liquidity (stops out early buyers and induces retail short sellers). This is the "Judas Swing."</p>
            <p><strong>3. Distribution (NY AM Session):</strong> Price aggressively reverses upward, distributing long positions into the Buy-Side Liquidity resting above the Asia or London highs.</p>
          </div>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Executing the NY AM Killzone (08:30-11:00 EST)</h4>
          <p>You do not trade the Asia range. You wait for the NY AM Killzone. You watch the Manipulation phase occur (the sweep of liquidity). Once the manipulation phase finishes, you look for the MSS and enter on the FVG to participate in the Distribution phase.</p>
          
          <p><em>Velez Bridge:</em> During the Manipulation phase (the Judas Swing down), the Velez 200 SMA on the 15-minute chart will likely still be sloping UP. The Judas Swing is a retracement *against* the 200 SMA. You wait for price to bounce off or near the 200 SMA, print a Green Ignition candle, and execute your long.</p>
        </div>
      )
    },
    {
      id: "c3",
      title: "Part 3: PD Arrays & Breaker Blocks (Episodes 13-17)",
      episodes: "Eps 13-17",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 13-17 expand your entry toolkit. While the FVG is the primary entry mechanic, the algorithm uses a hierarchy of PD Arrays (Premium/Discount Arrays). The most powerful of these, outside of the FVG, is the <strong>Breaker Block</strong>.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">What is an Order Block?</h4>
          <p>An institutional Order Block is the last down-close candle before an impulsive upward displacement (Bullish OB), or the last up-close candle before a downward displacement (Bearish OB). Algorithms return to these blocks to mitigate (break-even on) the positions they used to manipulate the market.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">The High-Probability Breaker Block Setup</h4>
          <p>A Breaker Block is a failed Order Block. It is arguably the highest probability setup taught in the 2022 Mentorship.</p>
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
            <strong className="text-indigo-400">Step-by-Step Bearish Breaker:</strong>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Price makes a High, drops down to make a Low (this low is a Bullish Order Block), and then pushes up to make a Higher High (sweeping BSL).</li>
              <li>Price immediately violently reverses downward, completely smashing through that previous Bullish Order Block Low with displacement.</li>
              <li>Because that Bullish Order Block failed, it is now a <strong>Bearish Breaker Block</strong>.</li>
              <li>When price retraces back up into that Breaker Block (especially if it aligns with an FVG), you execute your short entry.</li>
            </ol>
          </div>
          <p><em>Velez Bridge:</em> A Breaker Block entry is exponentially stronger if the 200 SMA is sloping downward and you get a Red Ignition candle confirming the rejection off the Breaker.</p>
        </div>
      )
    },
    {
      id: "c4",
      title: "Part 4: Premium/Discount & Tape Reading (Episodes 18-24)",
      episodes: "Eps 18-24",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 18-24 introduce the necessity of framing the dealing range. You cannot blindly enter every FVG you see. You must know if you are buying at a Discount or selling at a Premium.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">The Dealing Range & Equilibrium</h4>
          <p>Once a swing high and swing low are established, you draw a Fibonacci retracement tool from the low to the high. The 50% mark is Equilibrium.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Premium:</strong> The area above the 50% line. You ONLY look for shorts (Bearish FVGs, Bearish Breakers) in a Premium.</li>
            <li><strong>Discount:</strong> The area below the 50% line. You ONLY look for longs (Bullish FVGs, Bullish Order Blocks) in a Discount.</li>
          </ul>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Optimal Trade Entry (OTE)</h4>
          <p>Within the Premium or Discount zones, the algorithm prefers to re-price specifically to the 62% to 79% retracement levels. If an FVG aligns with the 70.5% retracement level (the sweet spot of OTE), it is an A+ algorithmic setup.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Tape Reading the PM Session</h4>
          <p>ICT emphasizes watching how candles deliver. If price is grinding slowly through a discount array with overlapping wicks, it is accumulating. The New York PM Session (13:30 - 16:00 EST) is the secondary window. If the AM session manipulated price into a daily discount, the PM session will often provide the violent distribution phase back up into a premium.</p>
        </div>
      )
    },
    {
      id: "c5",
      title: "Part 5: Weekly Profiles & Market Context (Episodes 25-30)",
      episodes: "Eps 25-30",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 25-30 expand your view to the weekly chart. You cannot trade the daily Killzones effectively if you do not understand what the weekly algorithmic profile is doing.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">The Standard Weekly Profile (Tuesday/Wednesday High/Low)</h4>
          <p>Just as the daily profile has AMD (Accumulation, Manipulation, Distribution), the weekly profile does as well.</p>
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Monday:</strong> Sets the initial range. Often a fake move (Manipulation).</li>
              <li><strong>Tuesday/Wednesday:</strong> Statistically, the High of the Week (in a bearish week) or the Low of the Week (in a bullish week) is formed on Tuesday or Wednesday.</li>
              <li><strong>Thursday/Friday:</strong> The expansion/distribution days.</li>
            </ul>
          </div>
          <p>If your macro bias is Bullish, and it is Tuesday morning, you are anticipating price to drop (Manipulation) to form the Low of the Week. This drop into a Daily Discount Array is where you hunt for your NY AM Killzone long setups.</p>
          
          <p><em>Velez Bridge:</em> If the Daily 200 SMA is sloping up, you expect the Weekly Profile to be bullish. Therefore, you expect Tuesday or Wednesday to drop down into a discount, hit the 1-hour or 15-min 200 SMA, print a Green Ignition candle, and form the Low of the Week.</p>
        </div>
      )
    },
    {
      id: "c6",
      title: "Part 6: IPDA Lookbacks & Risk Mastery (Episodes 31-41)",
      episodes: "Eps 31-41",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> The final 11 episodes tie everything together using the Interbank Price Delivery Algorithm (IPDA) lookback periods and establish strict professional risk parameters.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">IPDA Data Ranges (20, 40, 60 Days)</h4>
          <p>The algorithm references past data in specific chunks: 20 days, 40 days, and 60 days. </p>
          <p>When you look at a daily chart, look back 20 days. Where is the most obvious unmitigated Daily FVG or old Daily Low? That is the macro Draw on Liquidity. Your intraday NY AM Killzone setups should align with delivering price to that 20-day or 40-day target.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Professional Risk Management</h4>
          <p>ICT explicitly states that model mechanics mean nothing without risk control. The rule is absolute:</p>
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Never risk more than 1% to 2% of equity per setup.</strong> Ideally 0.5% when learning.</li>
              <li><strong>Minimum 1:2 Risk-to-Reward.</strong> You take partial profits at 1:1 or 1:2 to pay the trader, and leave a runner to hit the ultimate Draw on Liquidity.</li>
              <li><strong>Stop Loss Placement:</strong> Must be placed behind the candle that created the MSS, or above the Liquidity Sweep high. Do not tighten the stop prematurely.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold">ICT</div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">ICT 2022 Mastery Platform</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Step-by-Step Algorithmic Precision</p>
        </div>
        <button onClick={() => setActiveTab(12)} className="bg-indigo-600 px-4 py-2 rounded-lg text-sm">{user ? "Account" : "Sign In"}</button>
      </header>

      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex space-x-2 overflow-x-auto">
        <button onClick={() => setActiveTab(1)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${activeTab === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>1. Step-by-Step Curriculum</button>
        <button onClick={() => setActiveTab(2)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${activeTab === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>2. Oliver Velez Bridge</button>
        <button onClick={() => setActiveTab(3)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${activeTab === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>3. Practice Chart</button>
        <button onClick={() => setActiveTab(4)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${activeTab === 4 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>4. NY Playbook</button>
        <button onClick={() => setActiveTab(5)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${activeTab === 5 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>5. Flashcards</button>
        <button onClick={() => setActiveTab(7)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${activeTab === 7 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>7. AI Auditor</button>
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        {/* TAB 1: THE TEXTBOOK (MASTER/DETAIL VIEW) */}
        {activeTab === 1 && (
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-1/3 flex flex-col space-y-2">
              <h2 className="text-xl font-bold text-white mb-4">Course Chapters</h2>
              {courseData.map((lesson) => (
                <button 
                  key={lesson.id} 
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`text-left p-4 rounded-xl border transition flex justify-between items-center ${activeLessonId === lesson.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500'}`}
                >
                  <div>
                    <div className="text-xs font-bold opacity-70 mb-1">{lesson.episodes}</div>
                    <div className="text-sm font-semibold">{lesson.title}</div>
                  </div>
                  {activeLessonId === lesson.id && <ArrowRight size={16} />}
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="w-full md:w-2/3">
              {courseData.map((lesson) => {
                if (lesson.id !== activeLessonId) return null;
                return (
                  <div key={lesson.id} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
                    <h2 className="text-3xl font-extrabold text-white mb-8">{lesson.title}</h2>
                    {lesson.content}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: VELEZ BRIDGE */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Oliver Velez & 200 SMA Visual Momentum Bridge</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                ICT frameworks tell you <strong>WHERE</strong> to look (Liquidity Pools) and <strong>WHEN</strong> to look (NY Killzone). Oliver Velez momentum rules tell you <strong>HOW</strong> to pull the trigger safely.
              </p>
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-4 text-sm text-slate-300">
                <p><strong className="text-indigo-400 block mb-1">Rule 1 (The Macro Trend Filter):</strong> Never fight the 200 SMA slope. If it tilts down, look exclusively for shorts; if it tilts up, look for longs.</p>
                <p><strong className="text-indigo-400 block mb-1">Rule 2 (The Trigger):</strong> Do not enter the FVG blindly. Wait for a Velez Green/Red ignition candle to print inside the ICT FVG to confirm the algorithm is pushing price away from the gap.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRADINGVIEW */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Practice Trade Simulator & Live Chart</h2>
            <div className="w-full h-[600px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
              <div id="tradingview-widget-container" className="w-full h-full"></div>
            </div>
          </div>
        )}

        {/* TAB 4: PLAYBOOK & FIREBASE */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><CheckSquare className="text-indigo-400"/> NY AM Playbook & Firebase Journal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-indigo-300">Interactive Pre-Flight Checklist</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input type="checkbox" checked={checklist.liquiditySweep} onChange={(e) => setChecklist({...checklist, liquiditySweep: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"/>
                    <span className="text-sm text-slate-200">1. Confirm price swept a BSL or SSL line.</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input type="checkbox" checked={checklist.mss} onChange={(e) => setChecklist({...checklist, mss: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"/>
                    <span className="text-sm text-slate-200">2. Confirm violent Market Structure Shift (MSS) displacement.</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input type="checkbox" checked={checklist.fvgEntry} onChange={(e) => setChecklist({...checklist, fvgEntry: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"/>
                    <span className="text-sm text-slate-200">3. Identify 3-candle Fair Value Gap (FVG) or Breaker Block.</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input type="checkbox" checked={checklist.nyKillzone} onChange={(e) => setChecklist({...checklist, nyKillzone: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"/>
                    <span className="text-sm text-slate-200">4. Confirm time is between 08:30 - 11:00 EST.</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-indigo-500 transition">
                    <input type="checkbox" checked={checklist.sma200Check} onChange={(e) => setChecklist({...checklist, sma200Check: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"/>
                    <span className="text-sm text-slate-200">5. Verify direction aligns with 200 SMA slope.</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-indigo-300">Rule-Based Journaling (Firebase)</h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Trade Notes & Observations</label>
                    <textarea rows={3} value={journalNote} onChange={(e) => setJournalNote(e.target.value)} placeholder="Record session conditions, risk parameters..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"/>
                  </div>
                  <button onClick={handleSaveJournal} disabled={savingJournal} className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-sm font-medium transition">
                    {savingJournal ? 'Saving to Firebase...' : 'Save & Track Journal Entry'}
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 max-h-40 overflow-y-auto space-y-2">
                  <div className="text-xs font-semibold text-slate-400">Saved History ({savedJournals.length}):</div>
                  {savedJournals.map((j) => (
                    <div key={j.id} className="p-2 bg-slate-950 rounded border border-slate-800 text-xs">
                      <span className="text-indigo-400 font-semibold">{j.setupType}:</span> {j.note}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FLASHCARDS */}
        {activeTab === 5 && (
          <div className="space-y-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Layers className="text-indigo-400"/> Spaced-Repetition Flashcards</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center space-y-6">
              <div className="flex justify-between items-center text-xs text-slate-500 uppercase font-semibold">
                <span>Card {cardIndex + 1} of {flashcardDeck.length}</span>
              </div>
              <div onClick={() => setShowDefinition(!showDefinition)} className="min-h-[180px] bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center cursor-pointer transition hover:border-indigo-500">
                {!showDefinition ? (
                  <div>
                    <h3 className="text-xl font-bold text-indigo-300 mb-2">{flashcardDeck[cardIndex].term}</h3>
                    <p className="text-xs text-slate-500">(Click to reveal)</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-200">{flashcardDeck[cardIndex].definition}</p>
                    <p className="text-xs text-slate-500 mt-3">(Click to flip back)</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowDefinition(false); setCardIndex((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0)); }} className="flex-1 bg-red-600/20 text-red-400 py-2 rounded-lg text-xs font-bold">Still Learning</button>
                <button onClick={() => { setShowDefinition(false); setCardIndex((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0)); }} className="flex-1 bg-emerald-600/20 text-emerald-400 py-2 rounded-lg text-xs font-bold">Got It</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: AI AUDITOR */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-indigo-400"/> AI Trade Auditor & Chart Analyzer</h2>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <p className="text-slate-400 text-sm">Upload a screenshot of your chart during the NY Killzone. Describe your BSL/SSL, MSS, and FVG logic for instant AI analysis:</p>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 px-4 py-2.5 rounded-lg cursor-pointer text-xs font-medium text-slate-300 transition">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>{auditImageName ? `Attached: ${auditImageName}` : 'Upload Chart Screenshot'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <textarea rows={4} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. Swept Asia BSL at 09:30 EST, clear MSS, entered in 15m FVG below the 200 SMA..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"/>
              <button onClick={() => callGemini("Audit this ICT 2022 setup based on AMD, MSS, FVG, and Velez 200 SMA logic: " + aiPrompt)} disabled={loadingAi} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                <Sparkles className="w-4 h-4"/> {loadingAi ? 'Analyzing...' : 'Run AI Trade Audit'}
              </button>
              {aiResponse && (
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 mt-4 text-sm text-slate-200 whitespace-pre-wrap">
                  <strong className="text-indigo-400 block mb-1">Audit Analysis:</strong> {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
