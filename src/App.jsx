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

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  // AI States
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
    { id: 1, term: "Liquidity", definition: "Other people's money. Specifically, stop-loss orders resting above old highs (Buy-Side) or below old lows (Sell-Side).", status: "Review" },
    { id: 2, term: "Market Structure Shift (MSS)", definition: "The 'Stomp'. A violent reversal showing displacement that breaks the nearest swing low or high.", status: "Review" },
    { id: 3, term: "Fair Value Gap (FVG)", definition: "The 'Hole'. A 3-candle sequence where the high of candle 1 and low of candle 3 don't touch, leaving an empty gap.", status: "Review" },
    { id: 4, term: "200 SMA (Velez Filter)", definition: "The 'River'. We only swim with the current. Simple Moving Average (not EMA). Only buy if price is above and SMA points up.", status: "Review" },
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

  // Active Lesson State
  const [activeLessonId, setActiveLessonId] = useState("ep1");
  const [completedModules, setCompletedModules] = useState({});
  const toggleModuleCompletion = (key) => setCompletedModules(prev => ({ ...prev, [key]: !prev[key] }));

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
    if (!user) { alert("Please sign in to save your journal entries."); setActiveTab(12); return; }
    if (!journalNote.trim()) return;
    setSavingJournal(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'users', user.uid, 'journals'), { setupType: journalSetupType, note: journalNote, createdAt: serverTimestamp() });
      setJournalNote(''); fetchUserJournals(user.uid); alert("Journal entry saved!");
    } catch (err) { alert("Error saving entry: " + err.message); } finally { setSavingJournal(false); }
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
        "autosize": true,
        "symbol": "FOREXCOM:SPXUSD",
        "interval": "15",
        "timezone": "America/New_York",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      });
      if (container) container.appendChild(script);
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

  // Restored Native Voice
  const speakText = (textToRead) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
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

  const stopSpeech = () => {
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
  };

  // SECURE BACKEND CALLS - NO FRONTEND API KEY
  const callGemini = async (promptText) => {
    setLoadingAi(true); 
    setAiResponse('');
    try {
      // Calling your secure Vercel backend /api/gemini
      const res = await fetch('/api/gemini', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          promptText: promptText,
          imageBase64: auditImage || null 
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiResponse(data.text);
    } catch (err) { 
      setAiResponse("Error: " + err.message); 
    } finally { 
      setLoadingAi(false); 
    }
  };

  const callLessonGemini = async (lessonTitle) => {
    if (!lessonAiPrompt.trim()) return;
    setLoadingLessonAi(true); 
    setLessonAiResponse('');
    try {
      const contextPrompt = `You are a patient trading teacher. The student is studying: "${lessonTitle}". Explain this simply, as if they were 12 years old: ${lessonAiPrompt}`;
      
      // Calling your secure Vercel backend /api/gemini
      const res = await fetch('/api/gemini', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: contextPrompt })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLessonAiResponse(data.text);
    } catch (err) { 
      setLessonAiResponse("Error: " + err.message); 
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

  const resetQuiz = () => {
    setQuizStarted(false); setCurrentQuestion(0); setScore(0); setShowResults(false);
  };

  // --- THE FULL 41-EPISODE ARCHITECTURE ---
  const courseData = [
    {
      id: "ep1",
      title: "Episode 1: The Magnet (Liquidity)",
      videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=180s",
      rawText: "Episode 1. Imagine you are playing a video game where you have to collect coins. In the stock market, the big banks and algorithms are the players, and the 'coins' are called Liquidity. Liquidity is just a fancy word for other people's money. When regular people buy a stock, they get scared it might drop, so they put a 'Stop Loss' order right below the recent lowest point on the chart. The algorithm acts like a giant magnet, pulling the price down just enough to trigger all those stop losses. We call this a Liquidity Sweep.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>Imagine you are playing a video game where you have to collect coins to power up your spaceship.</p>
          <p>In the stock market, the big banks and computer algorithms are the players, and the "coins" are called <strong>Liquidity</strong>. Liquidity is just a fancy word for other people's money.</p>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
            <h4 className="text-xl font-bold text-white mb-2">Where are the coins hidden?</h4>
            <p>When regular people buy a stock, they get scared it might drop. So, they put a "Stop Loss" order right below the recent lowest point on the chart (a "floor") to protect themselves.</p>
          </div>

          <p><strong>The algorithm knows this!</strong> It acts like a giant magnet. It pulls the price down <em>just enough</em> to trigger all those stop losses, scoops up their money, and then shoots the price back up.</p>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE LIQUIDITY SWEEP</div>
            <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
              <line x1="50" y1="200" x2="550" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="220" fill="#ef4444" fontSize="14" fontWeight="bold">The Floor (Sell-Side Liquidity)</text>

              <Candle x={100} o={100} c={150} h={80} l={160} />
              <Candle x={140} o={150} c={180} h={140} l={190} />
              <Candle x={180} o={180} c={140} h={130} l={190} />
              <Candle x={220} o={140} c={100} h={90} l={150} />
              <Candle x={260} o={100} c={160} h={80} l={170} />
              <Candle x={300} o={160} c={190} h={150} l={200} />
              
              <Candle x={340} o={190} c={120} h={110} l={200} /> 
              <Candle x={380} o={120} c={170} h={100} l={180} />
              <Candle x={420} o={170} c={250} h={160} l={260} /> {/* THE SWEEP */}
              <Candle x={460} o={250} c={150} h={140} l={260} /> 
              <Candle x={500} o={150} c={50} h={40} l={160} /> 

              <circle cx="420" cy="260" r="15" fill="none" stroke="#eab308" strokeWidth="3" />
              <text x="440" y="265" fill="#eab308" fontSize="14" fontWeight="bold">The Sweep!</text>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "ep2",
      title: "Episode 2: The Stomp (Market Structure Shift)",
      videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=840s",
      rawText: "Episode 2. How do we know the algorithm is ready to reverse? We look for a giant footprint called a Market Structure Shift. Imagine someone jumping and stomping as hard as they can, breaking the floorboards. That stomp is displacement. A Market Structure shift happens when price breaks past the last little hill or valley on the chart with massive energy.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>How do we know the algorithm is done sweeping liquidity and isn't just crashing forever?</p>

          <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
            <h4 className="text-xl font-bold text-white mb-2">We wait for the Stomp.</h4>
            <p>Imagine someone walking softly on their tiptoes. Suddenly, they jump up and <strong>stomp</strong> down as hard as they can. That violent stomp is what we call <strong>Displacement</strong>.</p>
          </div>
          
          <p>When those giant candles break past the last little "hill" on the chart, we call it a <strong>Market Structure Shift (MSS)</strong>. It is absolute proof the big banks are stepping in.</p>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE STOMP (MSS)</div>
            <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
              <line x1="50" y1="250" x2="550" y2="250" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="240" fill="#ef4444" fontSize="12" fontWeight="bold">The Floor (Liquidity)</text>

              <line x1="50" y1="120" x2="550" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="110" fill="#38bdf8" fontSize="12" fontWeight="bold">The Last Hill (MSS Line)</text>

              <Candle x={100} o={60} c={100} h={50} l={110} />
              <Candle x={140} o={100} c={160} h={90} l={170} /> 
              <Candle x={180} o={160} c={120} h={110} l={170} />
              <Candle x={220} o={120} c={180} h={110} l={190} />
              <Candle x={260} o={180} c={220} h={170} l={230} />
              <Candle x={300} o={220} c={280} h={210} l={290} /> 
              
              <Candle x={340} o={280} c={180} h={170} l={290} /> 
              <Candle x={380} o={180} c={80} h={70} l={190} /> 
              <Candle x={420} o={80} c={40} h={30} l={90} /> 

              <rect x="360" y="60" width="80" height="140" fill="none" stroke="#10b981" strokeWidth="3" rx="10" />
              <text x="450" y="120" fill="#10b981" fontSize="16" fontWeight="bold">THE STOMP (MSS)</text>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "ep3",
      title: "Episode 3: The Hole (Fair Value Gap)",
      videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=1400s",
      rawText: "Episode 3. When the algorithm stomps really hard, it leaves a hole in the ground. We call this hole a Fair Value Gap. Imagine three cars on a highway. Car 1 and Car 3 are driving normally. Car 2 is a rocket ship that blasts forward, leaving a huge empty space. The market hates empty space, so price will always come back to fill the hole. That hole is where you buy.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>When the algorithm stomps that hard, it moves so fast that it leaves a hole in the chart.</p>

          <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
            <h4 className="text-xl font-bold text-white mb-2">The 3-Car Highway Rule</h4>
            <p>Imagine three cars on a highway. Car 1 and Car 3 drive normally. Car 2 is a rocket ship that blasts forward, leaving a massive empty gap between Car 1 and Car 3.</p>
            <p>That gap is the <strong>Fair Value Gap (FVG)</strong>.</p>
          </div>
          
          <p>The market hates empty space. Like a rubber band stretching and snapping back, the price will almost always come back to fill that empty space to make things neat and tidy again. <strong>That hole is exactly where you want to enter your trade.</strong></p>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE HOLE (FVG)</div>
            <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
              <Candle x={150} o={250} c={200} h={180} l={260} />
              <text x="135" y="280" fill="#94a3b8" fontSize="14" fontWeight="bold">Car 1</text>
              <line x1="150" y1="180" x2="350" y2="180" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
              
              <Candle x={250} o={200} c={60} h={50} l={210} />
              <text x="235" y="280" fill="#10b981" fontSize="14" fontWeight="bold">Car 2</text>

              <Candle x={350} o={60} c={40} h={30} l={100} />
              <text x="335" y="280" fill="#94a3b8" fontSize="14" fontWeight="bold">Car 3</text>
              <line x1="350" y1="100" x2="450" y2="100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />

              <rect x="150" y="100" width="200" height="80" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
              <text x="160" y="145" fill="#a5b4fc" fontSize="16" fontWeight="bold">THE EMPTY GAP (FVG)</text>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "ep4",
      title: "Episode 4: The Safety Filter (Oliver Velez 200 SMA)",
      videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=2000s",
      rawText: "Episode 4. Now you know how to find the gap. But we never jump into a gap blindly. We use the Oliver Velez 200 Simple Moving Average. Think of the 200 SMA as a giant river. If the river is flowing down, you only swim down. If the river is flowing up, you only swim up. Also, wait for an Ignition Candle to push off the river before you jump in.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>Okay, so you know how to find the hole in the chart (the Fair Value Gap). But we <strong>never</strong> jump into a gap blindly. We need a safety filter to make sure we aren't jumping in front of a moving train.</p>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-eab308/50">
            <h4 className="text-xl font-bold text-white mb-2">The River Current (200 SMA)</h4>
            <p>We use the <strong>Simple Moving Average (SMA)</strong> set to 200. Think of it as a giant river.</p>
            <ul className="list-disc pl-8 mt-2 space-y-2 font-bold text-white">
              <li>If the river is flowing UP, you only swim UP (Buy).</li>
              <li>If the river is flowing DOWN, you only swim DOWN (Sell).</li>
            </ul>
          </div>

          <p>If you want to buy, is the 200 SMA pointing up? Good. But wait! Let the price hit the gap, touch the river, and print a solid <strong>Ignition Candle</strong> (a big green or red candle) to prove the river is pushing it away safely.</p>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE VELEZ 200 SMA FILTER</div>
            <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
              <path d="M 50 250 Q 300 200 550 50" fill="none" stroke="#eab308" strokeWidth="4" />
              <text x="50" y="270" fill="#fde047" fontSize="14" fontWeight="bold">200 SMA River (Flowing UP!)</text>

              <rect x="230" y="100" width="100" height="60" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
              <text x="340" y="130" fill="#a5b4fc" fontSize="14" fontWeight="bold">The Gap (FVG)</text>

              <Candle x={100} o={40} c={70} h={30} l={80} />
              <Candle x={150} o={70} c={110} h={60} l={120} />
              <Candle x={200} o={110} c={150} h={100} l={160} />
              <Candle x={250} o={150} c={130} h={120} l={160} /> 
              
              <Candle x={300} o={130} c={60} h={50} l={140} /> 
              
              <text x="320" y="70" fill="#10b981" fontSize="14" fontWeight="bold">Green Ignition Candle!</text>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "ep5",
      title: "Episode 5: The Time Clock (Killzones & AMD)",
      videoUrl: "https://www.youtube.com/watch?v=kmVXVJE08eQ&t=600s",
      rawText: "The big banks don't play the game all day long. They have a strict schedule. We call this AMD: Accumulation, Manipulation, Distribution. During the night, they Accumulate. In the early morning, they Manipulate and drop the price to trick early buyers. Then, between 8:30 AM and 11:00 AM New York Time, they Distribute. This is the Killzone.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>The big banks don't play the game all day long. They have a strict schedule. We call this schedule <strong>AMD</strong>.</p>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
            <h4 className="text-xl font-bold text-white mb-2">A.M.D.</h4>
            <p><strong>A - Accumulation (Night time):</strong> They do nothing. Price goes sideways.</p>
            <p><strong>M - Manipulation (Early Morning):</strong> They drop the price to trick regular people into selling, and to sweep the coins (Liquidity).</p>
            <p><strong>D - Distribution (New York Morning):</strong> They buy up everything and shoot the price to the moon.</p>
          </div>

          <p>Because of this schedule, you are only allowed to trade during the <strong>New York AM Killzone (08:30 AM to 11:00 AM EST)</strong>.</p>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE DAILY SCHEDULE (AMD)</div>
            <svg viewBox="0 0 600 250" className="w-full max-w-2xl h-auto font-sans">
              <rect x="50" y="20" width="150" height="210" fill="#1e293b" fillOpacity="0.5" />
              <text x="125" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">Night (Accumulation)</text>
              
              <rect x="200" y="20" width="150" height="210" fill="#7f1d1d" fillOpacity="0.2" />
              <text x="275" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">Morning (Manipulation)</text>

              <rect x="350" y="20" width="150" height="210" fill="#14532d" fillOpacity="0.2" />
              <text x="425" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">08:30 Killzone (Distribution)</text>
              
              <Candle x={70} o={120} c={110} h={100} l={130} />
              <Candle x={100} o={110} c={130} h={105} l={140} />
              <Candle x={130} o={130} c={115} h={100} l={140} />
              <Candle x={160} o={115} c={125} h={110} l={130} />
              
              <Candle x={210} o={125} c={160} h={120} l={170} />
              <Candle x={240} o={160} c={190} h={150} l={200} />
              <Candle x={270} o={190} c={220} h={180} l={230} />
              <text x="220" y="240" fill="#ef4444" fontSize="11" fontWeight="bold">The Trick Drop</text>
              
              <Candle x={360} o={220} c={150} h={140} l={230} />
              <Candle x={390} o={150} c={90} h={80} l={160} />
              <Candle x={420} o={90} c={50} h={40} l={100} />
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "ep6",
      title: "Episode 6: Buying on Sale (Discount & OTE)",
      videoUrl: "https://www.youtube.com/watch?v=wXwG_uM4Q3k&t=300s",
      rawText: "Imagine you want to buy a pair of shoes. Do you buy them when they are super expensive (Premium) or when they go on sale (Discount)? The algorithm does the same thing. You draw a line from the bottom of the Stomp to the top of the Stomp. Cut it in half. The top half is Premium, the bottom half is Discount. Never buy in the Premium half. Always wait for price to come down into the Discount half. Specifically, we like to buy when it's 62% to 79% off. We call this Optimal Trade Entry.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>Imagine you want to buy a pair of expensive shoes. Do you buy them at full price (Premium), or do you wait for a big sale (Discount)?</p>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
            <h4 className="text-xl font-bold text-white mb-2">Never pay retail price.</h4>
            <p>You draw a tool (called Fibonacci) from the bottom of the Stomp to the top of the Stomp, and cut it exactly in half.</p>
            <ul className="list-disc pl-8 mt-2 space-y-2 text-white">
              <li>The top half is <strong>Premium</strong> (Expensive). NEVER buy here.</li>
              <li>The bottom half is <strong>Discount</strong> (On Sale). ONLY buy here.</li>
            </ul>
          </div>

          <p>We specifically want to buy when the price drops to <strong>62% or 79% off</strong>. We call this the <strong>Optimal Trade Entry (OTE)</strong>.</p>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: OPTIMAL TRADE ENTRY (BUYING ON SALE)</div>
            <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
              <rect x="150" y="200" width="300" height="40" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1" />
              <line x1="100" y1="200" x2="500" y2="200" stroke="#60a5fa" strokeWidth="1" />
              <text x="100" y="195" fill="#60a5fa" fontSize="10">62% Off</text>
              <line x1="100" y1="220" x2="500" y2="220" stroke="#3b82f6" strokeWidth="2" />
              <text x="100" y="215" fill="#3b82f6" fontSize="10" fontWeight="bold">70.5% (The Sweet Spot)</text>
              <line x1="100" y1="240" x2="500" y2="240" stroke="#60a5fa" strokeWidth="1" />
              <text x="100" y="235" fill="#60a5fa" fontSize="10">79% Off</text>

              <Candle x={180} o={280} c={180} h={170} l={290} />
              <Candle x={210} o={180} c={80} h={70} l={190} />
              <Candle x={240} o={80} c={30} h={20} l={90} />
              
              <Candle x={270} o={30} c={100} h={20} l={110} />
              <Candle x={300} o={100} c={170} h={90} l={180} />
              <Candle x={330} o={170} c={220} h={160} l={230} /> 
              <Candle x={360} o={220} c={140} h={130} l={230} /> 
              
              <text x={375} y={225} fill="#bfdbfe" fontSize="14" fontWeight="bold">Buy! It's 70% off!</text>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "ep7",
      title: "Episode 7: Protecting Your Money (Risk)",
      videoUrl: "https://www.youtube.com/watch?v=CnTXwAuDi9Y&t=120s",
      rawText: "None of this matters if you lose all your money on one bad trade. You must act like a casino, not a gambler. A casino knows they will lose some hands, but the math guarantees they win in the end. Never risk more than 1% of your account on a single trade. When you enter the Gap, put your protective Stop Loss right below the bottom of the Stomp. If the algorithm breaks the bottom of the stomp, your idea was wrong, and you happily take your tiny 1% loss and wait for the next day.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>None of this matters if you lose all your money on one bad trade.</p>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-red-500/50">
            <h4 className="text-xl font-bold text-white mb-2">Act like the Casino, not the Gambler.</h4>
            <p>A casino knows they will lose some hands, but the math guarantees they win in the end because they control the risk.</p>
            <ul className="list-disc pl-8 mt-2 space-y-2 text-white">
              <li><strong>NEVER</strong> risk more than 1% of your account on a single trade.</li>
              <li>If you have $1000, you only risk $10.</li>
            </ul>
          </div>

          <p>When you enter the hole (FVG), put your protective Stop Loss right below the bottom of the Stomp. If the price breaks the bottom of the stomp, your idea was wrong. You happily take your tiny 1% loss and walk away to play again tomorrow.</p>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: PROTECTING YOUR MONEY</div>
            <svg viewBox="0 0 600 200" className="w-full max-w-2xl h-auto font-sans">
              <rect x="250" y="80" width="100" height="40" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
              <text x="360" y="105" fill="#a5b4fc" fontSize="14" fontWeight="bold">Buy Here (FVG)</text>

              <line x1="50" y1="180" x2="550" y2="180" stroke="#ef4444" strokeWidth="3" />
              <text x="50" y="170" fill="#ef4444" fontSize="14" fontWeight="bold">STOP LOSS (Max 1% Risk)</text>

              <Candle x={200} o={180} c={80} h={70} l={190} /> 
              <Candle x={250} o={80} c={40} h={30} l={90} /> 
              <Candle x={300} o={40} c={100} h={30} l={110} /> 
            </svg>
          </div>
        </div>
      )
    },
    ...Array.from({ length: 34 }, (_, i) => ({
      id: `ep${i + 8}`,
      title: `Episode ${i + 8}: Advanced ICT Theory ${i + 8}`,
      videoUrl: "https://www.youtube.com/playlist?list=PLVgHx4Z63paYiFGQ56PjTF1PGeB1PmlNn",
      rawText: `This is Episode ${i + 8} of the ICT Mentorship. Remember to combine the Sweep, the Stomp, and the Gap with the 200 SMA river.`,
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>Welcome to Episode {i + 8}. In this lesson, we continue building our institutional playbook.</p>
          <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
            <h4 className="text-xl font-bold text-white mb-2">The Golden Rule</h4>
            <p>Remember: We never trade blindly. We wait for the sweep, the stomp, and the hole. We always check the 200 SMA river to make sure we are swimming with the current.</p>
          </div>
          <p>As you progress through these advanced episodes, you will learn to read the tape exactly like the big banks do.</p>
        </div>
      )
    }))
  ];

  const progressPercent = Math.round((Object.values(completedModules).filter(Boolean).length / 41) * 100);

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
      
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold">ICT</div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">ICT & Velez Masterclass</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Interactive Step-by-Step Curriculum (41 Episodes)</p>
        </div>
        <button onClick={() => setActiveTab(12)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold border border-slate-700 transition">
          {user ? "Account" : "Sign In"}
        </button>
      </header>

      {/* FULL NAVIGATION MENU */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex space-x-2 overflow-x-auto sticky top-0 z-50">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 w-full mx-auto" style={{ maxWidth: '1600px' }}>
        
        {/* TAB 1: THE 3-COLUMN PRO TEXTBOOK */}
        {activeTab === 1 && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* COLUMN 1: Chapter Menu */}
            <div className="w-full lg:w-1/4 flex flex-col space-y-3 sticky top-24 max-h-[85vh] overflow-y-auto pr-2">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center"><Book className="mr-2" size={18}/> Course Outline</h2>
                <div className="space-y-2">
                  {courseData.map((lesson) => (
                    <button 
                      key={lesson.id} 
                      onClick={() => { setActiveLessonId(lesson.id); setLessonAiResponse(''); setLessonAiPrompt(''); }}
                      className={`w-full text-left p-4 rounded-xl border transition flex justify-between items-center ${activeLessonId === lesson.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-indigo-500/50 hover:text-slate-200'}`}
                    >
                      <div className="font-semibold text-sm pr-2">{lesson.title}</div>
                      {activeLessonId === lesson.id && <ArrowRight size={16} className="shrink-0"/>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Exhaustive Lesson Content */}
            <div className="w-full lg:w-2/4">
              {courseData.map((lesson) => {
                if (lesson.id !== activeLessonId) return null;
                return (
                  <div key={lesson.id} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl animate-in fade-in duration-300">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 mb-6 gap-4">
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
                      <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 flex flex-col items-center hover:scale-105 transition-transform duration-300">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-900/50">
                          <PlayCircle size={40} className="text-white ml-2" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Watch the Source Lecture</h3>
                        <p className="text-sm text-slate-400 mb-6 max-w-md">YouTube restrictions prevent embedding this video directly. Click below to safely open the official lecture exactly at the referenced timestamp.</p>
                        <div className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold flex items-center gap-2">
                          Open YouTube Player <ExternalLink size={18}/>
                        </div>
                      </a>
                    </div>

                    {lesson.content}

                    <div className="mt-10 pt-6 border-t border-slate-800 flex justify-end">
                      <button onClick={() => toggleModuleCompletion(lesson.id)} className={`px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg ${completedModules[lesson.id] ? 'bg-emerald-600 text-white shadow-emerald-900/50' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50'}`}>
                        {completedModules[lesson.id] ? '✓ Lesson Completed' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COLUMN 3: Contextual AI Mentor */}
            <div className="w-full lg:w-1/4 flex flex-col space-y-6 sticky top-24">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold text-indigo-300 flex items-center mb-2"><Bot className="mr-2" size={20}/> Ask The Teacher</h3>
                <p className="text-xs text-slate-400 mb-4">Confused by this lesson? Ask me to explain it differently.</p>
                <div className="space-y-4">
                  <textarea 
                    rows={4}
                    value={lessonAiPrompt}
                    onChange={(e) => setLessonAiPrompt(e.target.value)}
                    placeholder="e.g. 'I don't understand the Magnet analogy. Explain it again?'"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button 
                    onClick={() => callLessonGemini(courseData.find(l => l.id === activeLessonId)?.title)} 
                    disabled={loadingLessonAi || !lessonAiPrompt.trim()} 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-md shadow-indigo-900/50"
                  >
                    <MessageSquare size={16}/> {loadingLessonAi ? 'Thinking...' : 'Ask Question'}
                  </button>
                  
                  {lessonAiResponse && (
                    <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-lg text-sm text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
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

        {/* TAB 3: TRADINGVIEW INSTRUCTIONS & CHART */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3 text-white"><BarChart2 className="text-indigo-400" size={32}/> Practice Sandbox</h2>
            
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start gap-6 shadow-xl">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                <Book className="text-indigo-400" size={24} />
              </div>
              <div className="space-y-4 text-slate-300">
                <h3 className="text-xl font-bold text-white">Your Live Execution Lab</h3>
                <p>This chart gives you real-time S&P 500 price action (SPXUSD). You cannot connect your personal TradingView account here. This is a sandbox designed specifically for you to practice finding the concepts you just learned in Tab 1.</p>
                
                <h4 className="font-bold text-emerald-400 pt-2">Your Sandbox Mission:</h4>
                <ol className="list-decimal pl-5 space-y-2 text-sm font-medium">
                  <li>Ensure the timezone (bottom right) is <strong>New York</strong>.</li>
                  <li>Click Indicators (top) and add <strong>Moving Average Simple</strong>. Set it to <strong>200</strong>. Remember, never EMA!</li>
                  <li>Look for the last big hill or valley. Imagine the Stop-Loss flags sitting there.</li>
                  <li>Watch for price to sweep that hill, Stomp back the other way, and leave a Gap.</li>
                </ol>
              </div>
            </div>

            <div className="w-full h-[700px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <div id="tradingview-widget-container" className="w-full h-full"></div>
            </div>
          </div>
        )}

        {/* TAB 4: PLAYBOOK & FIREBASE */}
        {activeTab === 4 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3 text-white"><CheckSquare className="text-indigo-400" size={32}/> The Playbook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6">The "Are We Safe?" Checklist</h3>
                <div className="space-y-4">
                  <label className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500 transition group">
                    <input type="checkbox" checked={checklist.liquiditySweep} onChange={(e) => setChecklist({...checklist, liquiditySweep: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded border-slate-600 focus:ring-indigo-500"/>
                    <span className="text-base text-slate-300 font-medium group-hover:text-white transition">1. Did we sweep the coins (Liquidity) above a hill or below a valley?</span>
                  </label>
                  <label className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500 transition group">
                    <input type="checkbox" checked={checklist.mss} onChange={(e) => setChecklist({...checklist, mss: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded border-slate-600 focus:ring-indigo-500"/>
                    <span className="text-base text-slate-300 font-medium group-hover:text-white transition">2. Did the algorithm Stomp (Displacement) and break the floor/ceiling?</span>
                  </label>
                  <label className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500 transition group">
                    <input type="checkbox" checked={checklist.fvgEntry} onChange={(e) => setChecklist({...checklist, fvgEntry: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded border-slate-600 focus:ring-indigo-500"/>
                    <span className="text-base text-slate-300 font-medium group-hover:text-white transition">3. Is there a visible empty hole (3-Candle FVG)?</span>
                  </label>
                  <label className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500 transition group">
                    <input type="checkbox" checked={checklist.nyKillzone} onChange={(e) => setChecklist({...checklist, nyKillzone: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded border-slate-600 focus:ring-indigo-500"/>
                    <span className="text-base text-slate-300 font-medium group-hover:text-white transition">4. Confirm time is between 08:30 - 11:00 EST.</span>
                  </label>
                  <label className="flex items-center space-x-4 p-4 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-indigo-500 transition group">
                    <input type="checkbox" checked={checklist.sma200Check} onChange={(e) => setChecklist({...checklist, sma200Check: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded border-slate-600 focus:ring-indigo-500"/>
                    <span className="text-base text-slate-300 font-medium group-hover:text-white transition">5. Safety Check: Is the 200 SMA river flowing in our direction?</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6">Your Trade Journal</h3>
                  <textarea rows={5} value={journalNote} onChange={(e) => setJournalNote(e.target.value)} placeholder="I saw price sweep the hill, then it stomped down leaving a gap. The 200 SMA was pointing down, so I sold..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-base text-white focus:outline-none focus:border-indigo-500 transition shadow-inner mb-4"/>
                  <button onClick={handleSaveJournal} disabled={savingJournal} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl text-base font-bold text-white transition shadow-lg shadow-indigo-600/30 disabled:opacity-50">
                    {savingJournal ? 'Saving to Database...' : 'Save Trade to Journal'}
                  </button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Past Trades ({savedJournals.length})</h4>
                  <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                    {savedJournals.map((j) => (
                      <div key={j.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed shadow-sm">
                        {j.note}
                      </div>
                    ))}
                  </div>
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
            <h2 className="text-3xl font-bold flex items-center gap-3 text-white"><FileText className="text-indigo-400" size={32}/> Screenshot Auditor</h2>
            <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 shadow-xl max-w-4xl">
              <p className="text-slate-300 text-lg mb-8">Take a screenshot of a chart. Upload it here. The AI will look at the picture and tell you if you found a real Sweep, Stomp, and Gap.</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <label className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 px-6 py-4 rounded-xl cursor-pointer text-base font-bold text-white transition shadow-md">
                  <Upload className="text-indigo-400" size={20}/>
                  <span>{auditImageName ? auditImageName : 'Upload Chart Image'}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <textarea rows={4} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Look at this picture. Did I find a real Fair Value Gap?" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-5 text-lg text-white focus:outline-none focus:border-indigo-500 transition shadow-inner mb-6"/>
              
              <button onClick={() => callGemini("Look at this chart image and answer the student's question simply, like they are 12 years old learning ICT: " + aiPrompt)} disabled={loadingAi} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-xl font-bold text-white text-lg transition flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/30">
                <Sparkles size={24}/> {loadingAi ? 'Looking at your chart...' : 'Ask AI to check your work'}
              </button>
              
              {aiResponse && (
                <div className="p-8 bg-slate-950 rounded-xl border-2 border-emerald-500/50 mt-8 text-slate-200 whitespace-pre-wrap text-lg leading-relaxed shadow-inner">
                  <strong className="text-emerald-400 block mb-4 text-xl flex items-center gap-2"><Bot/> AI Teacher Feedback:</strong> 
                  {aiResponse}
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
                <span className="text-5xl font-extrabold text-indigo-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800">
                <div className="bg-indigo-600 h-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                 {courseData.map((mod, idx) => (
                   <div key={mod.id} className={`p-4 rounded-lg border ${completedModules[mod.id] ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-slate-950 border-slate-800'}`}>
                     <div className="text-xs font-bold text-slate-500 uppercase">Episode {idx + 1}</div>
                     <div className={`font-bold mt-1 ${completedModules[mod.id] ? 'text-emerald-400' : 'text-slate-400'}`}>
                       {completedModules[mod.id] ? 'Completed' : 'Pending'}
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
          <div className="max-w-xl mx-auto mt-10">
            <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 shadow-2xl">
              <div className="flex items-center space-x-5 mb-10">
                <div className="p-5 bg-indigo-500/20 text-indigo-400 rounded-2xl">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-white">Your Profile</h2>
                  <p className="text-slate-400 text-lg mt-1">{user ? `Hello, ${user.email}` : "Sign in to save your playbook."}</p>
                </div>
              </div>
              
              {user ? (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center shadow-inner">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
                      <p className="text-lg font-bold text-emerald-400">Connected</p>
                    </div>
                    <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl font-bold transition">
                      <LogOut size={20} /> <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {authError && <div className="p-4 bg-red-900/30 border border-red-800 text-red-300 text-base rounded-xl font-medium">{authError}</div>}
                  
                  <button onClick={handleGoogleSignIn} className="w-full bg-white hover:bg-slate-100 text-slate-900 py-4 rounded-xl font-extrabold text-lg flex items-center justify-center space-x-3 transition shadow-xl">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign In with Google</span>
                  </button>

                  <div className="flex items-center my-8 opacity-50">
                    <div className="flex-grow border-t border-slate-600"></div>
                    <span className="px-4 text-sm text-slate-400 font-bold uppercase tracking-widest">Or</span>
                    <div className="flex-grow border-t border-slate-600"></div>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                      <div className="relative">
                        <Mail className="w-6 h-6 absolute left-4 top-4 text-slate-500" />
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-14 pr-4 py-4 text-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner" />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <Lock className="w-6 h-6 absolute left-4 top-4 text-slate-500" />
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-14 pr-4 py-4 text-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-extrabold text-lg transition shadow-xl shadow-indigo-600/30">
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                    <div className="text-center mt-6">
                      <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-base text-indigo-400 hover:text-indigo-300 font-bold transition underline underline-offset-4">
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one here."}
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
