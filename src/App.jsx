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

// Custom Candlestick SVG Component
const Candle = ({ x, o, c, h, l }) => {
  const isGreen = c <= o; // SVG Y-axis is inverted (0 is top)
  const color = isGreen ? '#10b981' : '#ef4444'; // Emerald for up, Red for down
  const bodyY = Math.min(o, c);
  const bodyH = Math.max(Math.abs(c - o), 2); // Minimum 2px for doji
  
  return (
    <g>
      {/* Wick */}
      <line x1={x} y1={h} x2={x} y2={l} stroke={color} strokeWidth="1.5" />
      {/* Body */}
      <rect x={x - 4} y={bodyY} width="8" height={bodyH} fill={color} stroke={color} />
    </g>
  );
};

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
  
  const [lessonAiPrompt, setLessonAiPrompt] = useState('');
  const [lessonAiResponse, setLessonAiResponse] = useState('');
  const [loadingLessonAi, setLoadingLessonAi] = useState(false);

  // Text-to-Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [auditImage, setAuditImage] = useState(null);
  const [auditImageName, setAuditImageName] = useState('');
  
  const [checklist, setChecklist] = useState({
    liquiditySweep: false, mss: false, fvgEntry: false, nyKillzone: false, sma200Check: false
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

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    { q: "What is the primary execution window for the ICT 2022 Model?", options: ["Asia Session", "London Open", "NY AM Killzone (08:30-11:00 EST)", "PM Session"], a: 2 },
    { q: "What defines a valid Market Structure Shift (MSS)?", options: ["A slow grind past an old high", "Violent displacement breaking a swing point", "A doji candle formation", "Moving above the 200 SMA"], a: 1 },
    { q: "What is the rule for the Velez 200 SMA filter?", options: ["Always fight the trend", "Only take longs if price is below it", "Never fight the 200 SMA slope", "Ignore moving averages completely"], a: 2 },
    { q: "What acts as the 'Fuel' for algorithmic expansion?", options: ["RSI Divergence", "Buy-Side and Sell-Side Liquidity (Stop Losses)", "MACD Crossovers", "Volume Spikes"], a: 1 },
    { q: "A Fair Value Gap (FVG) is a gap between which candles?", options: ["Candles 1 and 2", "Candles 2 and 3", "Candles 1 and 3", "Candles 1 and 4"], a: 2 }
  ];

  // Active Lesson State for Tab 1
  const [activeLessonId, setActiveLessonId] = useState("c1");
  const [completedModules, setCompletedModules] = useState({ c1: false, c2: false, c3: false, c4: false, c5: false, c6: false });
  const toggleModuleCompletion = (key) => setCompletedModules(prev => ({ ...prev, [key]: !prev[key] }));
  const progress = Math.round((Object.values(completedModules).filter(Boolean).length / 6) * 100);

  useEffect(() => {
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) fetchUserJournals(currentUser.uid);
      });
      return () => {
        unsubscribe();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      };
    } catch (e) { console.warn("Auth not initialized:", e); }
  }, []);

  const fetchUserJournals = async (uid) => {
    try {
      const db = getFirestore();
      const q = query(collection(db, 'users', uid, 'journals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const journals = [];
      querySnapshot.forEach((doc) => journals.push({ id: doc.id, ...doc.data() }));
      setSavedJournals(journals);
    } catch (err) { console.warn("Firestore fetch warning:", err); }
  };

  const handleSaveJournal = async () => {
    if (!user) { alert("Please sign in to save your journal entries to Firebase."); setActiveTab(12); return; }
    if (!journalNote.trim()) return;
    setSavingJournal(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'users', user.uid, 'journals'), { setupType: journalSetupType, note: journalNote, createdAt: serverTimestamp() });
      setJournalNote(''); fetchUserJournals(user.uid); alert("Journal entry saved and tracked in Firebase!");
    } catch (err) { alert("Error saving entry: " + err.message); } finally { setSavingJournal(false); }
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
      await signOut(getAuth());
      setSavedJournals([]); setActiveTab(1);
    } catch (err) { console.error(err); }
  };

  // Text-to-Speech (Reverted to original clean implementation)
  const speakText = (textToRead) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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

  const callLessonGemini = async (lessonTitle) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) { setLessonAiResponse("Error: VITE_GEMINI_API_KEY is not configured."); return; }
    if (!lessonAiPrompt.trim()) return;
    
    setLoadingLessonAi(true); setLessonAiResponse('');
    try {
      const contextPrompt = `You are an expert trading mentor teaching the ICT 2022 Mentorship and Oliver Velez Simple Moving Average strategies. The student is studying the chapter: "${lessonTitle}". Answer their question directly. Question: ${lessonAiPrompt}`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: contextPrompt }] }] })
      });
      const data = await res.json();
      setLessonAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.");
    } catch (err) { setLessonAiResponse("Error calling Gemini API: " + err.message); } finally { setLoadingLessonAi(false); }
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

  const resetQuiz = () => {
    setQuizStarted(false); setCurrentQuestion(0); setScore(0); setShowResults(false);
  };

  // --- COMPREHENSIVE TEXTBOOK WITH CANDLESTICK SVGS ---
  const courseData = [
    {
      id: "c1",
      title: "Part 1: The Core Elements (Episodes 1-5)",
      episodes: "Eps 1-5",
      rawText: "Part 1: The Core Elements. Step 1: Identifying the Draw on Liquidity. Algorithms seek out Buy-Side Liquidity, which are resting buy stops above old highs, and Sell-Side Liquidity, below old lows. Step 2: Displacement and the Market Structure Shift. Once price reaches the liquidity pool, it must show institutional displacement to confirm a reversal. This is the Market Structure Shift. Price runs above an old high to sweep liquidity, aggressively reverses downward, and breaks the nearest short-term swing low with energetic candles. Step 3: The Fair Value Gap. Displacement leaves a 3-candle sequence where the high of candle 1 and the low of candle 3 do not overlap. The algorithm will re-price back into this gap. This is your entry point.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 1-5 lay the groundwork. Algorithms move price from an area of consolidation to an area of resting liquidity (stop losses). Once liquidity is taken, the algorithm reverses, leaving a <strong>Market Structure Shift (MSS)</strong> and a <strong>Fair Value Gap (FVG)</strong>.</p>
          
          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 1: Liquidity Pools (BSL & SSL)</h4>
          <p>Retail traders see support and resistance. Algorithms see stop-loss orders. You must identify where the largest clusters of stops reside (equal highs and lows).</p>
          
          {/* CANDLESTICK SVG 1: BSL / SSL */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 1: BSL / SSL (RELATIVE EQUAL HIGHS/LOWS)</div>
            <svg viewBox="0 0 600 250" className="w-full max-w-2xl h-auto font-sans">
              {/* BSL Line */}
              <line x1="50" y1="60" x2="550" y2="60" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="50" fill="#10b981" fontSize="12" fontWeight="bold">Buy-Side Liquidity (BSL) - Resting Buy Stops</text>
              
              {/* SSL Line */}
              <line x1="50" y1="200" x2="550" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="215" fill="#ef4444" fontSize="12" fontWeight="bold">Sell-Side Liquidity (SSL) - Resting Sell Stops</text>

              {/* Candles */}
              <Candle x={100} o={150} c={120} h={100} l={160} />
              <Candle x={130} o={120} c={90} h={70} l={130} />
              <Candle x={160} o={90} c={70} h={60} l={100} /> {/* Hits BSL */}
              <Candle x={190} o={70} c={110} h={65} l={120} />
              <Candle x={220} o={110} c={150} h={100} l={160} />
              <Candle x={250} o={150} c={180} h={140} l={190} />
              <Candle x={280} o={180} c={195} h={170} l={200} /> {/* Hits SSL */}
              <Candle x={310} o={195} c={160} h={150} l={200} />
              <Candle x={340} o={160} c={110} h={100} l={170} />
              <Candle x={370} o={110} c={80} h={60} l={120} /> {/* Hits BSL Again (Equal Highs) */}
              <Candle x={400} o={80} c={130} h={70} l={140} />
            </svg>
          </div>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 2: The Market Structure Shift (MSS)</h4>
          <p>A sweep of liquidity is not enough. You must wait for the algorithm to show its hand through violent <strong>displacement</strong> breaking a recent swing low.</p>

          {/* CANDLESTICK SVG 2: MSS & Displacement */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 2: MARKET STRUCTURE SHIFT (MSS)</div>
            <svg viewBox="0 0 600 250" className="w-full max-w-2xl h-auto font-sans">
              <line x1="50" y1="80" x2="550" y2="80" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="70" fill="#10b981" fontSize="12" fontWeight="bold">Old High (BSL)</text>
              
              <line x1="50" y1="160" x2="550" y2="160" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="175" fill="#ef4444" fontSize="12" fontWeight="bold">Swing Low Broken = MSS</text>

              <Candle x={100} o={160} c={130} h={120} l={170} />
              <Candle x={130} o={130} c={100} h={90} l={140} />
              <Candle x={160} o={100} c={150} h={90} l={160} /> {/* The Swing Low */}
              <Candle x={190} o={150} c={110} h={100} l={160} />
              <Candle x={220} o={110} c={60} h={50} l={120} /> {/* Sweeps High */}
              
              {/* Displacement Candles */}
              <Candle x={250} o={60} c={120} h={55} l={130} />
              <Candle x={280} o={120} c={190} h={110} l={200} /> {/* Breaks MSS */}
              <Candle x={310} o={190} c={230} h={180} l={240} />
              
              <text x="320" y="210" fill="#fca5a5" fontSize="12" fontWeight="bold">Violent Red Displacement</text>
            </svg>
          </div>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 3: The Fair Value Gap (FVG)</h4>
          <p>Displacement leaves an inefficiency. A 3-candle sequence where the high of Candle 1 and the low of Candle 3 do not overlap.</p>

          {/* CANDLESTICK SVG 3: FVG */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 3: THE FAIR VALUE GAP (BEARISH)</div>
            <svg viewBox="0 0 600 250" className="w-full max-w-2xl h-auto font-sans">
              {/* FVG Box */}
              <rect x="230" y="110" width="140" height="40" fill="#6366f1" fillOpacity="0.2" stroke="#6366f1" strokeWidth="1" strokeDasharray="2,2" />
              <text x="380" y="135" fill="#a5b4fc" fontSize="12" fontWeight="bold">THE GAP (Inefficiency)</text>

              {/* Candles */}
              <Candle x={250} o={40} c={90} h={30} l={110} /> {/* C1 */}
              <text x="240" y="25" fill="#94a3b8" fontSize="11">C1</text>
              <line x1="250" y1="110" x2="380" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2"/>
              <text x="180" y="115" fill="#cbd5e1" fontSize="10">C1 Low</text>

              <Candle x={300} o={95} c={180} h={90} l={190} /> {/* C2 (Displacement) */}
              <text x="290" y="25" fill="#94a3b8" fontSize="11">C2</text>

              <Candle x={350} o={182} c={220} h={150} l={230} /> {/* C3 */}
              <text x="340" y="25" fill="#94a3b8" fontSize="11">C3</text>
              <line x1="350" y1="150" x2="380" y2="150" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2"/>
              <text x="180" y="155" fill="#cbd5e1" fontSize="10">C3 High</text>
            </svg>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-6 flex flex-col sm:flex-row gap-4">
            <a href="https://www.youtube.com/watch?v=bx89qkJ_LR4&t=840s" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-900/30 px-4 py-2 rounded-lg">
              <PlayCircle className="mr-2" size={18}/> Watch Ep 3 (14:00): MSS & FVG <ExternalLink className="ml-2" size={14}/>
            </a>
          </div>
        </div>
      )
    },
    {
      id: "c2",
      title: "Part 2: The Daily Profile & AMD (Episodes 6-12)",
      episodes: "Eps 6-12",
      rawText: "Part 2: The Daily Profile and AMD. Episodes 6 through 12 introduce time macros. The Power of 3 (AMD) stands for Accumulation, Manipulation, Distribution. 1. Accumulation: The Asia Session consolidates in a tight range. 2. Manipulation: The London or NY Open drops below the Asia Low (Judas Swing) to engineer liquidity. 3. Distribution: The NY AM Session aggressively reverses upward into Buy-Side Liquidity. Executing the NY AM Killzone: You wait for the Manipulation phase, look for the MSS, and enter on the FVG.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 6-12 introduce time macros. ICT teaches that price delivery is highly dependent on the time of day. The core concept is the <strong>Power of 3 (AMD)</strong> and the New York AM Killzone.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 4: AMD (Accumulation, Manipulation, Distribution)</h4>
          <p>The algorithm groups price delivery into three distinct daily phases.</p>
          
          {/* CANDLESTICK SVG 4: AMD Profile */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 4: THE POWER OF 3 (AMD)</div>
            <svg viewBox="0 0 600 250" className="w-full max-w-2xl h-auto font-sans">
              <rect x="50" y="20" width="150" height="210" fill="#1e293b" fillOpacity="0.5" />
              <text x="125" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">Accumulation</text>
              
              <rect x="200" y="20" width="150" height="210" fill="#7f1d1d" fillOpacity="0.2" />
              <text x="275" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">Manipulation</text>

              <rect x="350" y="20" width="150" height="210" fill="#14532d" fillOpacity="0.2" />
              <text x="425" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">Distribution</text>

              <line x1="50" y1="120" x2="550" y2="120" stroke="#f8fafc" strokeWidth="1" strokeDasharray="3,3" />
              
              {/* Asia (Accum) */}
              <Candle x={70} o={120} c={110} h={100} l={130} />
              <Candle x={100} o={110} c={130} h={105} l={140} />
              <Candle x={130} o={130} c={115} h={100} l={140} />
              <Candle x={160} o={115} c={125} h={110} l={130} />
              
              {/* London/NY Open (Manip) */}
              <Candle x={210} o={125} c={160} h={120} l={170} />
              <Candle x={240} o={160} c={190} h={150} l={200} />
              <Candle x={270} o={190} c={220} h={180} l={230} />
              <text x="220" y="240" fill="#ef4444" fontSize="11" fontWeight="bold">Judas Swing</text>
              
              {/* NY AM (Dist) */}
              <Candle x={360} o={220} c={150} h={140} l={230} />
              <Candle x={390} o={150} c={90} h={80} l={160} />
              <Candle x={420} o={90} c={50} h={40} l={100} />
            </svg>
          </div>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 5: The NY AM Killzone Window</h4>
          <p>You do not trade 24/7. You stalk the setup specifically between 08:30 and 11:00 EST.</p>

          {/* CANDLESTICK SVG 5: Killzone */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 5: THE NY AM KILLZONE</div>
            <svg viewBox="0 0 600 150" className="w-full max-w-2xl h-auto font-sans">
              <rect x="250" y="20" width="150" height="100" fill="#6366f1" fillOpacity="0.2" stroke="#6366f1" strokeWidth="2" />
              
              <text x="50" y="140" fill="#94a3b8" fontSize="12">Midnight EST</text>
              <text x="250" y="140" fill="#a5b4fc" fontSize="12" fontWeight="bold">08:30 EST</text>
              <text x="400" y="140" fill="#a5b4fc" fontSize="12" fontWeight="bold">11:00 EST</text>
              
              {/* Candles entering and expanding in Killzone */}
              <Candle x={100} o={80} c={90} h={70} l={100} />
              <Candle x={150} o={90} c={85} h={70} l={100} />
              <Candle x={200} o={85} c={110} h={80} l={120} />
              
              <Candle x={270} o={110} c={130} h={100} l={140} /> {/* Sweep */}
              <Candle x={310} o={130} c={60} h={50} l={140} /> {/* MSS inside Killzone */}
              <Candle x={350} o={60} c={30} h={20} l={70} /> 
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "c3",
      title: "Part 3: PD Arrays & Breaker Blocks (Episodes 13-17)",
      episodes: "Eps 13-17",
      rawText: "Part 3: PD Arrays and Breaker Blocks. A Breaker Block is a failed Order Block. Step-by-Step Bearish Breaker: 1. Price makes a High, drops down to make a Low (which is a Bullish Order Block), and then pushes up to make a Higher High, sweeping Liquidity. 2. Price immediately violently reverses downward, completely smashing through that previous Bullish Order Block Low with displacement. 3. Because that Bullish Order Block failed, it is now a Bearish Breaker Block. 4. When price retraces back up into that Breaker Block, you execute your short entry.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 13-17 expand your entry toolkit. The most powerful Premium/Discount arrays outside of the FVG are Order Blocks and Breaker Blocks.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 6: The Institutional Order Block (OB)</h4>
          <p>The last down-candle before a violent up-move is a Bullish Order Block. Algorithms return here to mitigate.</p>

          {/* CANDLESTICK SVG 6: Order Block */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 6: BULLISH ORDER BLOCK (OB)</div>
            <svg viewBox="0 0 600 200" className="w-full max-w-2xl h-auto font-sans">
              {/* OB Zone */}
              <rect x="185" y="120" width="200" height="50" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeDasharray="3,3" />
              <text x="400" y="150" fill="#34d399" fontSize="12" fontWeight="bold">Mitigation Return (Entry)</text>

              {/* Candles */}
              <Candle x={100} o={80} c={110} h={70} l={120} />
              <Candle x={150} o={110} c={130} h={100} l={140} />
              <Candle x={200} o={130} c={170} h={120} l={180} /> {/* The OB (Last down candle) */}
              
              <Candle x={250} o={170} c={90} h={80} l={180} /> {/* Displacement Up */}
              <Candle x={300} o={90} c={40} h={30} l={100} />
              
              <Candle x={350} o={40} c={120} h={30} l={130} /> {/* Return */}
              <Candle x={400} o={120} c={150} h={110} l={160} /> {/* Hits OB */}
              <Candle x={450} o={150} c={80} h={70} l={160} /> {/* Bounce */}
              
              <text x="180" y="195" fill="#cbd5e1" fontSize="11">Last Down Candle = Bullish OB</text>
            </svg>
          </div>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 7: The Breaker Block</h4>
          <p>A Breaker is simply an Order Block that failed. When price smashes through a support block, that block becomes heavy algorithmic resistance.</p>

          {/* CANDLESTICK SVG 7: Breaker Block */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 7: THE BEARISH BREAKER BLOCK</div>
            <svg viewBox="0 0 600 250" className="w-full max-w-2xl h-auto font-sans">
              <line x1="50" y1="80" x2="550" y2="80" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="70" fill="#10b981" fontSize="12" fontWeight="bold">Old High (BSL)</text>
              
              <rect x="50" y="160" width="500" height="30" fill="#6366f1" fillOpacity="0.2" stroke="#6366f1" strokeWidth="1" strokeDasharray="2,2" />
              <text x="50" y="155" fill="#a5b4fc" fontSize="12" fontWeight="bold">Failed Bullish OB = Bearish Breaker</text>

              {/* High */}
              <Candle x={100} o={140} c={100} h={90} l={150} />
              
              {/* Drop to OB */}
              <Candle x={150} o={100} c={160} h={90} l={170} />
              <Candle x={200} o={160} c={190} h={150} l={200} /> {/* The Bullish OB */}
              
              {/* Higher High (Sweep) */}
              <Candle x={250} o={190} c={120} h={110} l={200} />
              <Candle x={300} o={120} c={60} h={50} l={130} /> {/* Sweeps BSL */}
              
              {/* Violent Break */}
              <Candle x={350} o={60} c={140} h={50} l={150} />
              <Candle x={400} o={140} c={220} h={130} l={230} /> {/* Smashes OB */}
              
              {/* Return to Breaker */}
              <Candle x={450} o={220} c={170} h={160} l={230} /> {/* Hits Breaker */}
              <text x="460" y="175" fill="#a5b4fc" fontSize="12" fontWeight="bold">Entry</text>

              {/* Drop */}
              <Candle x={500} o={170} c={240} h={160} l={250} />
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "c4",
      title: "Part 4: Premium/Discount & OTE (Episodes 18-24)",
      episodes: "Eps 18-24",
      rawText: "Part 4: Premium and Discount. You cannot blindly enter every FVG you see. You must know if you are buying at a Discount or selling at a Premium. The Dealing Range: Once a swing high and low are established, draw a Fibonacci retracement tool from the low to the high. The 50 percent mark is Equilibrium. The area above 50 is Premium. You ONLY look for shorts in a Premium. The area below 50 is Discount. You ONLY look for longs in a Discount. Optimal Trade Entry (OTE): Within these zones, the algorithm prefers to re-price specifically to the 62 percent to 79 percent retracement levels. If an FVG aligns with the 70.5 percent retracement level, it is an A+ setup.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 18-24 introduce the dealing range. You cannot blindly enter every FVG. You must know if you are buying at a Discount or selling at a Premium.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 8: Premium vs. Discount</h4>
          <p>Algorithms buy in discount and sell in premium. Measure the dealing range and split it at 50%.</p>

          {/* CANDLESTICK SVG 8: Dealing Range */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 8: DEALING RANGE</div>
            <svg viewBox="0 0 600 200" className="w-full max-w-2xl h-auto font-sans">
              <rect x="150" y="20" width="300" height="80" fill="#ef4444" fillOpacity="0.2" />
              <rect x="150" y="100" width="300" height="80" fill="#10b981" fillOpacity="0.2" />
              
              <line x1="100" y1="100" x2="500" y2="100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4,4" />
              <text x="100" y="95" fill="#cbd5e1" fontSize="12" fontWeight="bold">50% Equilibrium</text>

              <text x="460" y="60" fill="#ef4444" fontSize="14" fontWeight="bold">PREMIUM (SELL)</text>
              <text x="460" y="150" fill="#10b981" fontSize="14" fontWeight="bold">DISCOUNT (BUY)</text>

              {/* Candles making the range */}
              <Candle x={200} o={180} c={140} h={130} l={190} />
              <Candle x={230} o={140} c={90} h={80} l={150} />
              <Candle x={260} o={90} c={40} h={30} l={100} /> {/* High */}
              
              {/* Retracement */}
              <Candle x={290} o={40} c={70} h={30} l={80} />
              <Candle x={320} o={70} c={110} h={60} l={120} />
              <Candle x={350} o={110} c={140} h={100} l={150} /> {/* Enters Discount */}
            </svg>
          </div>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 9: Optimal Trade Entry (OTE)</h4>
          <p>The algorithmic "sweet spot" is the 62% to 79% Fibonacci retracement of a displacement leg.</p>

          {/* CANDLESTICK SVG 9: OTE */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 9: OPTIMAL TRADE ENTRY (OTE)</div>
            <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
              <line x1="100" y1="20" x2="500" y2="20" stroke="#cbd5e1" strokeWidth="1" />
              <text x="100" y="15" fill="#cbd5e1" fontSize="10">100%</text>
              <line x1="100" y1="280" x2="500" y2="280" stroke="#cbd5e1" strokeWidth="1" />
              <text x="100" y="275" fill="#cbd5e1" fontSize="10">0%</text>

              <rect x="150" y="200" width="300" height="40" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1" />
              <line x1="100" y1="200" x2="500" y2="200" stroke="#60a5fa" strokeWidth="1" />
              <text x="100" y="195" fill="#60a5fa" fontSize="10">62%</text>
              <line x1="100" y1="220" x2="500" y2="220" stroke="#3b82f6" strokeWidth="2" />
              <text x="100" y="215" fill="#3b82f6" fontSize="10" fontWeight="bold">70.5% (OTE Sweet Spot)</text>
              <line x1="100" y1="240" x2="500" y2="240" stroke="#60a5fa" strokeWidth="1" />
              <text x="100" y="235" fill="#60a5fa" fontSize="10">79%</text>

              {/* Candles */}
              <Candle x={180} o={280} c={180} h={170} l={290} />
              <Candle x={210} o={180} c={80} h={70} l={190} />
              <Candle x={240} o={80} c={30} h={20} l={90} /> {/* High */}
              
              <Candle x={270} o={30} c={100} h={20} l={110} />
              <Candle x={300} o={100} c={170} h={90} l={180} />
              <Candle x={330} o={170} c={220} h={160} l={230} /> {/* Hits OTE */}
              <Candle x={360} o={220} c={140} h={130} l={230} /> {/* Bounces */}
              
              <text x="375" y="225" fill="#bfdbfe" fontSize="12" fontWeight="bold">Buy inside FVG + OTE</text>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "c5",
      title: "Part 5: Weekly Profiles (Episodes 25-30)",
      episodes: "Eps 25-30",
      rawText: "Part 5: Weekly Profiles and Market Context. Episodes 25 through 30 expand your view to the weekly chart. The Standard Weekly Profile: Just as the daily profile has AMD, the weekly profile does as well. Monday sets the initial range, often a fake move. Tuesday or Wednesday, statistically, form the High of the Week in a bearish week, or the Low of the Week in a bullish week. Thursday and Friday are the expansion and distribution days. If your macro bias is Bullish, and it is Tuesday morning, you are anticipating price to drop to form the Low of the Week. This drop into a Daily Discount Array is where you hunt for your NY AM Killzone long setups.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Episodes 25-30 expand your view to the weekly chart. You cannot trade the daily Killzones effectively if you do not understand what the weekly algorithmic profile is doing.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 10: The Bullish Weekly Profile</h4>
          <p>Statistically, the High or Low of the week forms on Tuesday or Wednesday. This is macro AMD.</p>

          {/* CANDLESTICK SVG 10: Weekly Profile */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 10: THE WEEKLY PROFILE (DAILY CANDLES)</div>
            <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
              <rect x="50" y="20" width="100" height="260" fill="#1e293b" fillOpacity="0.3" />
              <text x="100" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">MON (Accum)</text>

              <rect x="150" y="20" width="100" height="260" fill="#ef4444" fillOpacity="0.1" />
              <text x="200" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">TUE (Manip)</text>

              <rect x="250" y="20" width="100" height="260" fill="#10b981" fillOpacity="0.1" />
              <text x="300" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">WED (Dist)</text>

              <rect x="350" y="20" width="100" height="260" fill="#10b981" fillOpacity="0.2" />
              <text x="400" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">THU (Dist)</text>

              <rect x="450" y="20" width="100" height="260" fill="#1e293b" fillOpacity="0.3" />
              <text x="500" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">FRI</text>

              {/* 5 Daily Candles */}
              {/* Mon */}
              <Candle x={100} o={140} c={160} h={130} l={170} />
              {/* Tue */}
              <Candle x={200} o={160} c={240} h={150} l={260} />
              <text x="215" y="250" fill="#34d399" fontSize="11" fontWeight="bold">Low of the Week</text>
              {/* Wed */}
              <Candle x={300} o={240} c={120} h={110} l={250} />
              {/* Thu */}
              <Candle x={400} o={120} c={60} h={50} l={130} />
              {/* Fri */}
              <Candle x={500} o={60} c={70} h={40} l={90} />
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "c6",
      title: "Part 6: IPDA Lookbacks & Risk (Episodes 31-41)",
      episodes: "Eps 31-41",
      rawText: "Part 6: IPDA Lookbacks and Risk Mastery. The final 11 episodes tie everything together using the Interbank Price Delivery Algorithm lookback periods and establish strict professional risk parameters. IPDA Data Ranges: The algorithm references past data in specific chunks: 20 days, 40 days, and 60 days. Professional Risk Management: ICT explicitly states that model mechanics mean nothing without risk control. The rule is absolute: Never risk more than 1 to 2 percent of equity per setup. Minimum 1 to 2 Risk to Reward. Stop Loss Placement must be placed behind the candle that created the MSS, or above the Liquidity Sweep high.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> The final 11 episodes tie everything together using the Interbank Price Delivery Algorithm (IPDA) lookback periods and establish strict professional risk parameters.</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 11: IPDA Data Ranges</h4>
          <p>The algorithm references past data in chunks: 20, 40, and 60 days. This gives you your macro Draw on Liquidity.</p>

          {/* SVG 11: IPDA */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 11: IPDA LOOKBACK CYCLES</div>
            <svg viewBox="0 0 600 200" className="w-full max-w-2xl h-auto font-sans">
              <line x1="50" y1="150" x2="550" y2="150" stroke="#64748b" strokeWidth="2" />
              <text x="500" y="170" fill="#f8fafc" fontSize="12" fontWeight="bold">Today</text>
              
              <line x1="350" y1="140" x2="350" y2="160" stroke="#f8fafc" strokeWidth="2" />
              <text x="330" y="170" fill="#94a3b8" fontSize="12">-20 Days</text>

              <line x1="200" y1="140" x2="200" y2="160" stroke="#f8fafc" strokeWidth="2" />
              <text x="180" y="170" fill="#94a3b8" fontSize="12">-40 Days</text>

              <line x1="50" y1="140" x2="50" y2="160" stroke="#f8fafc" strokeWidth="2" />
              <text x="30" y="170" fill="#94a3b8" fontSize="12">-60 Days</text>

              <rect x="180" y="50" width="40" height="20" fill="#10b981" fillOpacity="0.3" stroke="#10b981" />
              <path d="M 200 70 L 200 130 L 490 130 L 490 140" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" />
              <text x="170" y="40" fill="#34d399" fontSize="11" fontWeight="bold">40-Day Unmitigated FVG</text>
            </svg>
          </div>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Professional Risk Management</h4>
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-lg space-y-2">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Never risk more than 1% to 2% of equity per setup.</strong> Ideally 0.5% when learning.</li>
              <li><strong>Minimum 1:2 Risk-to-Reward.</strong> You take partial profits at 1:1 or 1:2, and leave a runner to hit the ultimate Draw on Liquidity.</li>
              <li><strong>Stop Loss Placement:</strong> Must be placed behind the candle that created the MSS. Do not tighten the stop prematurely.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "c7",
      title: "Bonus: The Velez SMA Hybrid Filter",
      episodes: "Silver Bullet Focus",
      rawText: "This hybrid model bridges the exact precision of ICT algorithmic timing with the visual momentum triggers of the Oliver Velez system. By focusing your execution on the NY Killzone, you are trading when the algorithm is guaranteed to seek liquidity. The Hybrid Execution Rule: We wait for the standard ICT sequence during the NY Killzone. However, we DO NOT enter blindly on the FVG touch. We filter the entry using the Oliver Velez 200 Simple Moving Average. If the 200 SMA is sloping downward, we only take short FVGs. Furthermore, we wait for a crisp Red Ignition Candle to print inside the FVG before pulling the trigger.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-sm">
          <p><strong>Overview:</strong> Bridging the institutional map (ICT) with the visual execution trigger (Velez).</p>

          <h4 className="text-lg font-bold text-emerald-400 mt-6">Concept 12: Velez 200 SMA + Ignition Filter</h4>
          <p>Do not enter the FVG blindly. Ensure the 200 SMA slope agrees, and wait for an ignition candle.</p>

          {/* CANDLESTICK SVG 12: Velez Bridge */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center justify-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">FIGURE 12: VELEZ 200 SMA HYBRID ENTRY</div>
            <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
              {/* FVG Box */}
              <rect x="230" y="110" width="100" height="40" fill="#6366f1" fillOpacity="0.2" stroke="#6366f1" strokeWidth="1" strokeDasharray="2,2" />
              <text x="340" y="135" fill="#a5b4fc" fontSize="12" fontWeight="bold">ICT Bearish FVG</text>

              {/* 200 SMA Line */}
              <path d="M 50 50 Q 200 60 550 160" fill="none" stroke="#eab308" strokeWidth="3" />
              <text x="50" y="40" fill="#eab308" fontSize="12" fontWeight="bold">Velez 200 SMA (Sloping Down)</text>

              {/* Candles */}
              <Candle x={100} o={250} c={190} h={180} l={260} />
              <Candle x={140} o={190} c={140} h={130} l={200} />
              <Candle x={180} o={140} c={100} h={90} l={150} /> {/* Pushes toward FVG/SMA */}
              <Candle x={220} o={100} c={120} h={90} l={130} /> 
              
              {/* The Velez Ignition Candle inside FVG */}
              <Candle x={260} o={120} c={190} h={115} l={200} />
              
              <text x="280" y="180" fill="#ef4444" fontSize="12" fontWeight="bold">Velez Red Ignition Candle</text>
              <text x="280" y="195" fill="#cbd5e1" fontSize="11">Execution confirmed inside FVG</text>
            </svg>
          </div>
        </div>
      )
    }
  ];

  const baseTabs = [
    { id: 1, name: '1. Masterclass' },
    { id: 2, name: '2. Velez Bridge' },
    { id: 3, name: '3. Practice Chart' },
    { id: 4, name: '4. NY Playbook' },
    { id: 5, name: '5. Flashcards' },
    { id: 6, name: '6. Mastery Quiz' },
    { id: 7, name: '7. AI Auditor' },
    { id: 8, name: '8. Terms' },
    { id: 9, name: '9. Mentor Hub' },
    { id: 10, name: '10. Progress' },
    { id: 11, name: '11. Trading Desk' }
  ];

  const tabs = user ? [...baseTabs, { id: 12, name: '12. Account' }] : baseTabs;

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
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {tab.name}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 w-full mx-auto" style={{ maxWidth: '1600px' }}>
        
        {/* TAB 1: THE TEXTBOOK (3 COLUMN PRO LAYOUT) */}
        {activeTab === 1 && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Column 1: Navigation Menu */}
            <div className="w-full lg:w-1/4 flex flex-col space-y-3 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-2">Course Chapters</h2>
              {courseData.map((lesson) => (
                <button 
                  key={lesson.id} 
                  onClick={() => { setActiveLessonId(lesson.id); setLessonAiResponse(''); setLessonAiPrompt(''); }}
                  className={`text-left p-4 rounded-xl border transition flex justify-between items-center shadow-lg ${activeLessonId === lesson.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-900/50' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500'}`}
                >
                  <div>
                    <div className="text-xs font-bold opacity-70 mb-1">{lesson.episodes}</div>
                    <div className="text-sm font-semibold">{lesson.title}</div>
                  </div>
                  {activeLessonId === lesson.id && <ArrowRight size={16} />}
                </button>
              ))}
            </div>

            {/* Column 2: Main Educational Content */}
            <div className="w-full lg:w-2/4">
              {courseData.map((lesson) => {
                if (lesson.id !== activeLessonId) return null;
                return (
                  <div key={lesson.id} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-6 mb-6 gap-4">
                      <h2 className="text-3xl font-extrabold text-white">{lesson.title}</h2>
                      <div className="flex gap-2">
                        {!isSpeaking ? (
                          <button onClick={() => speakText(lesson.rawText)} className="flex items-center space-x-2 bg-slate-800 hover:bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold transition">
                            <Volume2 size={16} /> <span>Read Aloud</span>
                          </button>
                        ) : (
                          <button onClick={stopSpeech} className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 px-4 py-2 rounded-lg text-xs font-bold transition">
                            <StopCircle size={16} /> <span>Stop Audio</span>
                          </button>
                        )}
                        <button onClick={() => toggleModuleCompletion(lesson.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${completedModules[lesson.id] ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}>
                          {completedModules[lesson.id] ? '✓ Done' : 'Mark Done'}
                        </button>
                      </div>
                    </div>
                    {lesson.content}
                  </div>
                );
              })}
            </div>

            {/* Column 3: Contextual AI Mentor */}
            <div className="w-full lg:w-1/4 sticky top-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold text-indigo-300 flex items-center mb-4"><Bot className="mr-2" size={20}/> Chapter AI Mentor</h3>
                <p className="text-xs text-slate-400 mb-4">
                  This AI knows you are studying <strong>{courseData.find(l => l.id === activeLessonId)?.title}</strong>. Ask for clarification on this specific topic.
                </p>
                <div className="space-y-4">
                  <textarea 
                    rows={4}
                    value={lessonAiPrompt}
                    onChange={(e) => setLessonAiPrompt(e.target.value)}
                    placeholder="e.g. 'Can you explain the difference between a normal order block and a breaker block?'"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={() => callLessonGemini(courseData.find(l => l.id === activeLessonId)?.title)} 
                    disabled={loadingLessonAi || !lessonAiPrompt.trim()} 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    <MessageSquare size={16}/> {loadingLessonAi ? 'Thinking...' : 'Ask Mentor'}
                  </button>
                  
                  {lessonAiResponse && (
                    <div className="p-4 bg-slate-950 border border-indigo-900/50 rounded-lg text-sm text-slate-300 whitespace-pre-wrap">
                      {lessonAiResponse}
                    </div>
                  )}
                </div>
              </div>
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
              <div onClick={() => setShowDefinition(!showDefinition)} className="min-h-[180px] bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center cursor-pointer transition hover:border-indigo-500 shadow-xl">
                {!showDefinition ? (
                  <div>
                    <h3 className="text-2xl font-bold text-indigo-300 mb-2">{flashcardDeck[cardIndex].term}</h3>
                    <p className="text-xs text-slate-500">(Click to reveal)</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg text-slate-200 leading-relaxed">{flashcardDeck[cardIndex].definition}</p>
                    <p className="text-xs text-slate-500 mt-6">(Click to flip back)</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setShowDefinition(false); setCardIndex((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0)); }} className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-3 rounded-xl text-sm font-bold transition">Still Learning (Hard)</button>
                <button onClick={() => { setShowDefinition(false); setCardIndex((prev) => (prev < flashcardDeck.length - 1 ? prev + 1 : 0)); }} className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 py-3 rounded-xl text-sm font-bold transition">Got It (Easy)</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MASTERY QUIZ */}
        {activeTab === 6 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="text-indigo-400"/> Algorithmic Mastery Quiz</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl">
              {!quizStarted ? (
                <div className="text-center space-y-4">
                  <p className="text-slate-300">Test your knowledge of the ICT 2022 Mentorship and Oliver Velez concepts.</p>
                  <button onClick={() => setQuizStarted(true)} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-lg font-bold text-white transition shadow-lg shadow-indigo-600/30">Start Quiz</button>
                </div>
              ) : showResults ? (
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-bold text-emerald-400">Quiz Complete!</h3>
                  <p className="text-xl text-white">Your Score: {score} / {quizQuestions.length}</p>
                  <button onClick={resetQuiz} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg font-bold text-white transition mt-4">Retake Quiz</button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between text-xs text-slate-500 font-bold uppercase">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span className="text-indigo-400">Score: {score}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-relaxed">{quizQuestions[currentQuestion].q}</h3>
                  <div className="space-y-3">
                    {quizQuestions[currentQuestion].options.map((opt, idx) => (
                      <button key={idx} onClick={() => handleQuizAnswer(idx)} className="w-full text-left p-5 bg-slate-950 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-500 rounded-xl text-slate-300 transition text-lg">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: AI AUDITOR */}
        {activeTab === 7 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-indigo-400"/> AI Trade Auditor & Chart Analyzer</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-6 shadow-xl">
              <p className="text-slate-400 text-sm">Upload a screenshot of your chart during the NY Killzone. Describe your BSL/SSL, MSS, and FVG logic for instant AI analysis:</p>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 px-6 py-3 rounded-xl cursor-pointer text-sm font-medium text-slate-300 transition shadow-lg">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  <span>{auditImageName ? `Attached: ${auditImageName}` : 'Upload Chart Screenshot'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <textarea rows={5} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. Swept Asia BSL at 09:30 EST, clear MSS, entered in 15m FVG below the 200 SMA..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-indigo-500 text-lg"/>
              
              <button onClick={() => callGemini("Audit this ICT 2022 setup based on AMD, MSS, FVG, and Velez 200 SMA logic: " + aiPrompt)} disabled={loadingAi} className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30">
                <Sparkles className="w-5 h-5"/> {loadingAi ? 'Analyzing...' : 'Run AI Trade Audit'}
              </button>
              
              {aiResponse && (
                <div className="p-6 bg-slate-950 rounded-xl border border-emerald-500/30 mt-6 text-slate-200 whitespace-pre-wrap leading-relaxed">
                  <strong className="text-emerald-400 block mb-2 text-lg">Audit Analysis:</strong> {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: TERMS */}
        {activeTab === 8 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Book className="text-indigo-400"/> Terms & Abbreviations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg"><strong className="text-indigo-400 block mb-2 text-lg">BSL / SSL</strong> Buy Side Liquidity / Sell Side Liquidity (Resting Stop Losses)</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg"><strong className="text-indigo-400 block mb-2 text-lg">200 SMA</strong> Oliver Velez Simple Moving Average trend baseline</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg"><strong className="text-indigo-400 block mb-2 text-lg">NY AM Killzone</strong> 08:30 - 11:00 EST institutional execution window</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg"><strong className="text-indigo-400 block mb-2 text-lg">OTE</strong> Optimal Trade Entry (62% - 79% Fibonacci retracement)</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg"><strong className="text-indigo-400 block mb-2 text-lg">IPDA</strong> Interbank Price Delivery Algorithm</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg"><strong className="text-indigo-400 block mb-2 text-lg">AMD</strong> Accumulation, Manipulation, Distribution (Power of 3)</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg"><strong className="text-indigo-400 block mb-2 text-lg">MSS</strong> Market Structure Shift (Institutional Displacement)</div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg"><strong className="text-indigo-400 block mb-2 text-lg">FVG</strong> Fair Value Gap (3-candle imbalance)</div>
            </div>
          </div>
        )}

        {/* TAB 9: AI MENTOR HUB */}
        {activeTab === 9 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Bot className="text-indigo-400"/> AI Mentor Hub</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-4 shadow-xl">
              <p className="text-slate-400">Ask your global AI Mentor any general trading question regarding the New York AM Killzone, liquidity, or 200 SMA momentum rules:</p>
              <textarea rows={3} placeholder="e.g. How do I trade the liquidity sweep during the New York AM open?" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-indigo-500 text-lg" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') callGemini("Answer as an expert ICT & Oliver Velez trading mentor focusing on New York AM Killzone setups and 200 SMA discipline: " + e.target.value); }} />
              <button onClick={() => callGemini("Answer as an expert ICT & Oliver Velez trading mentor focusing on New York AM Killzone setups and 200 SMA discipline: " + aiPrompt)} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg font-bold text-white transition">Ask Mentor</button>
              {aiResponse && (
                <div className="p-6 bg-slate-950 rounded-xl border border-indigo-900/50 mt-6 text-slate-200 whitespace-pre-wrap leading-relaxed">
                  <strong className="text-indigo-400 block mb-2 text-lg">Mentor Response:</strong> {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: PROGRESS */}
        {activeTab === 10 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="text-indigo-400"/> Progress Analytics</h2>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-6 shadow-xl">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-white">Overall Curriculum Mastery</h3>
                  <p className="text-sm text-slate-400 mt-1">Based on completed Masterclass modules.</p>
                </div>
                <span className="text-5xl font-extrabold text-indigo-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-indigo-600 h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                 {['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((mod, idx) => (
                   <div key={mod} className={`p-4 rounded-lg border ${completedModules[mod] ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-950 border-slate-800'}`}>
                     <div className="text-xs font-bold text-slate-500 uppercase">Module {idx + 1}</div>
                     <div className={`font-bold mt-1 ${completedModules[mod] ? 'text-emerald-400' : 'text-slate-400'}`}>
                       {completedModules[mod] ? 'Completed' : 'Pending'}
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: DESK */}
        {activeTab === 11 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="text-indigo-400"/> Institutional Desk & Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl">
                <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Cpu className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">NinjaTrader Integration</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">Custom 200 SMA and High Minus Low range indicators for automated NY Killzone tracking.</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></div> Status: Connected
                </div>
              </div>
              
              <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl">
                <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                  <BarChart2 className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">CME Market Data Feed</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">Active subscription for top-of-book futures pricing during New York morning sessions.</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></div> Status: Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 12: ACCOUNT */}
        {activeTab === 12 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Account & Profile</h2>
                  <p className="text-slate-400">{user ? `Signed in as ${user.email}` : "Sign in to sync your progress."}</p>
                </div>
              </div>
              
              {user ? (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">Database Connection</p>
                      <p className="font-semibold text-emerald-400">Authenticated via Firebase</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl font-bold transition">
                      <LogOut className="w-5 h-5" /> <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {authError && <div className="p-4 bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-xl">{authError}</div>}
                  
                  <button onClick={handleGoogleSignIn} className="w-full bg-white hover:bg-slate-100 text-slate-900 py-3.5 rounded-xl font-bold flex items-center justify-center space-x-3 transition shadow-lg">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign In with Google</span>
                  </button>

                  <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="px-4 text-xs text-slate-500 font-bold uppercase">Or use email</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-indigo-600/30">
                      {isSignUp ? 'Create Account' : 'Sign In to Platform'}
                    </button>
                    <div className="text-center mt-4">
                      <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition">
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
