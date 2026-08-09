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

  const callLessonGemini = async (lessonTitle) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) { setLessonAiResponse("Error: API Key missing."); return; }
    if (!lessonAiPrompt.trim()) return;
    
    setLoadingLessonAi(true); setLessonAiResponse('');
    try {
      const contextPrompt = `You are a friendly, patient teacher explaining trading concepts to a beginner. The student is studying: "${lessonTitle}". Explain the following question simply, as if they were 12 years old: ${lessonAiPrompt}`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: contextPrompt }] }] })
      });
      const data = await res.json();
      setLessonAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.");
    } catch (err) { setLessonAiResponse("Error: " + err.message); } finally { setLoadingLessonAi(false); }
  };

  // --- EXHAUSTIVE "LIKE I'M 12" COURSE DATA ---
  const courseData = [
    {
      id: "ep1",
      title: "Episode 1: The Magnet in the Market (Liquidity)",
      videoSrc: "https://www.youtube.com/embed/bx89qkJ_LR4?start=180",
      rawText: "Imagine you are playing a video game where you have to collect coins. In the stock market, the big banks and algorithms are the players, and the 'coins' are called Liquidity. Liquidity is just a fancy word for other people's money. When regular people buy a stock, they get scared it might drop, so they put a 'Stop Loss' order right below the recent lowest point on the chart to protect themselves. The algorithm knows this! It looks at the chart and says, 'Aha! There is a giant pile of stop-loss orders sitting right below that floor.' The algorithm acts like a giant magnet, pulling the price down just enough to trigger all those stop losses. Once it grabs all that money, it uses it as fuel to shoot the price back up in the direction it actually wanted to go. We call this a 'Liquidity Sweep' or 'Turtle Soup'.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>Imagine you are playing a video game where you have to collect coins to power up your spaceship.</p>
          <p>In the stock market, the big banks and computer algorithms are the players, and the "coins" are called <strong>Liquidity</strong>. Liquidity is just a fancy word for other people's money.</p>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
            <h4 className="text-xl font-bold text-white mb-2">Where are the coins hidden?</h4>
            <p>When regular people buy a stock, they get scared it might drop. So, they put a "Stop Loss" order right below the recent lowest point on the chart (a "floor") to protect themselves. If they sell short, they put their safety net above the recent highest point (a "ceiling").</p>
          </div>

          <p><strong>The algorithm knows this!</strong> It looks at the chart and says, "Aha! There is a giant pile of stop-loss orders sitting right below that floor."</p>
          
          <p>The algorithm acts like a giant magnet. It pulls the price down <em>just enough</em> to trigger all those stop losses. It kicks regular traders out of their trades and scoops up their money. Once it grabs all that money, it uses it as "fuel" to shoot the price back up in the direction it actually wanted to go all along.</p>

          <p className="font-bold text-emerald-400">We call this trick a "Liquidity Sweep." Let's look at what it looks like on a chart:</p>

          {/* Candlestick Graphic: The Sweep */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE LIQUIDITY SWEEP MAGNET</div>
            <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
              {/* The "Floor" */}
              <line x1="50" y1="200" x2="550" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="220" fill="#ef4444" fontSize="14" fontWeight="bold">The Floor (Sell-Side Liquidity)</text>
              <text x="50" y="240" fill="#fca5a5" fontSize="12">Retail traders put their stop-losses here.</text>

              {/* Price Action bouncing on the floor */}
              <Candle x={100} o={100} c={150} h={80} l={160} />
              <Candle x={140} o={150} c={180} h={140} l={190} />
              <Candle x={180} o={180} c={140} h={130} l={190} /> {/* Bounce 1 */}
              
              <Candle x={220} o={140} c={100} h={90} l={150} />
              <Candle x={260} o={100} c={160} h={80} l={170} />
              <Candle x={300} o={160} c={190} h={150} l={200} /> {/* Bounce 2 - Floor established */}
              
              {/* The Sweep */}
              <Candle x={340} o={190} c={120} h={110} l={200} /> 
              <Candle x={380} o={120} c={170} h={100} l={180} />
              <Candle x={420} o={170} c={250} h={160} l={260} /> {/* THE SWEEP */}
              
              {/* Reversal */}
              <Candle x={460} o={250} c={150} h={140} l={260} /> 
              <Candle x={500} o={150} c={50} h={40} l={160} /> 

              {/* Annotations */}
              <circle cx="420" cy="260" r="15" fill="none" stroke="#eab308" strokeWidth="3" />
              <text x="440" y="265" fill="#eab308" fontSize="14" fontWeight="bold">The Sweep!</text>
              <path d="M 420 275 Q 420 290 350 290" fill="none" stroke="#eab308" strokeWidth="2" />
              <text x="50" y="295" fill="#fde047" fontSize="12">Algorithm drops price just enough to break the floor and steal the coins, then blasts off.</text>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "ep2",
      title: "Episode 2: The Footprint (Market Structure Shift)",
      videoSrc: "https://www.youtube.com/embed/bx89qkJ_LR4?start=840",
      rawText: "How do we know the algorithm is done sweeping liquidity and is ready to reverse? We look for a giant footprint called a Market Structure Shift. Imagine someone walking softly on their tiptoes. That is normal price action. Suddenly, they jump and stomp as hard as they can, breaking the floorboards. That stomp is displacement. A Market Structure Shift happens when price sweeps liquidity, and then immediately stomps in the other direction so hard that it breaks past the last little hill or valley on the chart. If the candles are huge and fast, the big banks are involved. If the candles are small and slow, it's a trap.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>Okay, so we know the algorithm likes to trick people by breaking the floor (sweeping liquidity) and then running the other way.</p>
          <p>But how do we know for sure it's a trick? What if the floor is just actually breaking and the price is going to keep crashing forever?</p>

          <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
            <h4 className="text-xl font-bold text-white mb-2">We wait for the Stomp.</h4>
            <p>Imagine someone walking softly on their tiptoes. That is normal, everyday price action. Suddenly, they jump up and <strong>stomp</strong> down as hard as they can, completely breaking the floorboards.</p>
            <p>That violent stomp is what we call <strong>Displacement</strong>.</p>
          </div>

          <p>When the algorithm is done collecting its coins below the floor, it doesn't walk away slowly. It hits the gas pedal. It creates massive, giant candles in the opposite direction.</p>
          
          <p>When those giant candles break past the last little "hill" on the chart, we call it a <strong>Market Structure Shift (MSS)</strong>. It is the absolute proof that the big banks are moving the market.</p>

          {/* Candlestick Graphic: The MSS */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE MARKET STRUCTURE SHIFT (MSS)</div>
            <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
              
              {/* Liquidity Line */}
              <line x1="50" y1="250" x2="550" y2="250" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="240" fill="#ef4444" fontSize="12" fontWeight="bold">The Floor (Liquidity)</text>

              {/* The Last Hill (Swing High) */}
              <line x1="50" y1="120" x2="550" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,5" />
              <text x="50" y="110" fill="#38bdf8" fontSize="12" fontWeight="bold">The Last Hill (Swing High)</text>

              {/* Price Action */}
              <Candle x={100} o={60} c={100} h={50} l={110} />
              <Candle x={140} o={100} c={160} h={90} l={170} /> 
              
              <Candle x={180} o={160} c={120} h={110} l={170} /> {/* The Hill is formed here */}
              
              <Candle x={220} o={120} c={180} h={110} l={190} />
              <Candle x={260} o={180} c={220} h={170} l={230} />
              <Candle x={300} o={220} c={280} h={210} l={290} /> {/* The Sweep */}
              
              {/* The Stomp (Displacement) */}
              <Candle x={340} o={280} c={180} h={170} l={290} /> 
              <Candle x={380} o={180} c={80} h={70} l={190} /> {/* The Break */}
              <Candle x={420} o={80} c={40} h={30} l={90} /> 

              {/* Annotations */}
              <rect x="360" y="60" width="80" height="140" fill="none" stroke="#10b981" strokeWidth="3" rx="10" />
              <text x="450" y="120" fill="#10b981" fontSize="16" fontWeight="bold">THE STOMP!</text>
              <text x="450" y="140" fill="#34d399" fontSize="12">(Displacement)</text>
              
              <text x="390" y="40" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">Notice how the green candles smash right through the blue line? That is the MSS.</text>
            </svg>
          </div>
        </div>
      )
    },
    {
      id: "ep3",
      title: "Episode 3: The Gap (Fair Value Gap)",
      videoSrc: "https://www.youtube.com/embed/bx89qkJ_LR4?start=1400",
      rawText: "When the algorithm stomps really hard, it leaves a hole in the ground. We call this hole a Fair Value Gap. It happens when one candle is so incredibly big and fast that the candle before it and the candle after it don't touch each other. Imagine three cars on a highway. Car 1 and Car 3 are driving normally, but Car 2 is a rocket ship that blasts forward, leaving a huge empty space between the other two. The market hates empty space. Like a rubber band stretching and snapping back, the price will almost always come back down to fill that empty space before continuing. This empty space is exactly where you buy.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>When the algorithm stomps really hard (Displacement), it moves so fast that it literally leaves a hole in the chart.</p>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
            <h4 className="text-xl font-bold text-white mb-2">The 3-Car Highway Rule</h4>
            <p>Imagine three cars driving on a highway in a row. Car 1 and Car 3 are driving normally. But Car 2 is a rocket ship. It blasts forward so fast that it leaves a massive empty gap between Car 1 and Car 3.</p>
            <p>That gap is the <strong>Fair Value Gap (FVG)</strong>.</p>
          </div>

          <p>The market is a neat freak. It <em>hates</em> empty space. Like a rubber band stretching and snapping back, the price will almost always come back to fill that empty space to make things neat and tidy again.</p>

          <p className="font-bold text-emerald-400">This empty space is your secret weapon. This is exactly where you want to enter your trade.</p>

          {/* Candlestick Graphic: The FVG */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE FAIR VALUE GAP (FVG)</div>
            <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
              
              {/* Car 1 */}
              <Candle x={150} o={250} c={200} h={180} l={260} />
              <text x="135" y="280" fill="#94a3b8" fontSize="14" fontWeight="bold">Car 1</text>
              <line x1="150" y1="180" x2="350" y2="180" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
              <text x="40" y="185" fill="#cbd5e1" fontSize="12">Top of Car 1</text>

              {/* Car 2 (The Rocket) */}
              <Candle x={250} o={200} c={60} h={50} l={210} />
              <text x="235" y="280" fill="#10b981" fontSize="14" fontWeight="bold">Car 2</text>

              {/* Car 3 */}
              <Candle x={350} o={60} c={40} h={30} l={100} />
              <text x="335" y="280" fill="#94a3b8" fontSize="14" fontWeight="bold">Car 3</text>
              <line x1="350" y1="100" x2="450" y2="100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
              <text x="460" y="105" fill="#cbd5e1" fontSize="12">Bottom of Car 3</text>

              {/* The Gap Highlight */}
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
      videoSrc: "https://www.youtube.com/embed/bx89qkJ_LR4?start=2000",
      rawText: "Now you know how to find the gap. But we never jump into a gap blindly. We need a safety filter to make sure we aren't jumping in front of a moving train. We use the Oliver Velez 200 Simple Moving Average. Think of the 200 SMA as a giant river. If the river is flowing down, you only swim down. If the river is flowing up, you only swim up. When price sweeps liquidity, stomps to make an MSS, and leaves a gap... you stop and look at the river. Is the 200 SMA pointing up? Good, you can buy the gap. Is it pointing down? Stop! Do not buy. It's a trap.",
      content: (
        <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
          <p>Okay, so you know how to find the hole in the chart (the Fair Value Gap). But we <strong>never</strong> jump into a gap blindly. We need a safety filter to make sure we aren't jumping in front of a moving train.</p>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-eab308/50">
            <h4 className="text-xl font-bold text-white mb-2">The River Current (200 SMA)</h4>
            <p>We use the <strong>Simple Moving Average (SMA)</strong> set to the number 200. We specifically use the SMA, not the EMA, because it gives us a smoother, more reliable picture of the trend.</p>
            <p>Think of the 200 SMA as a giant river.</p>
            <ul className="list-disc pl-8 mt-2 space-y-2 font-bold text-white">
              <li>If the river is flowing UP, you only swim UP (Buy).</li>
              <li>If the river is flowing DOWN, you only swim DOWN (Sell).</li>
            </ul>
          </div>

          <p>When price sweeps liquidity, stomps to make an MSS, and leaves a gap... you stop and look at the river.</p>
          <p>If you want to buy, is the 200 SMA pointing up? Good, you can buy the gap. Is it pointing down? <strong>Stop!</strong> Do not buy. It is a trap.</p>

          {/* Candlestick Graphic: SMA Bridge */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6">
            <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE VELEZ 200 SMA FILTER</div>
            <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
              
              {/* SMA Line */}
              <path d="M 50 250 Q 300 200 550 50" fill="none" stroke="#eab308" strokeWidth="4" />
              <text x="50" y="270" fill="#fde047" fontSize="14" fontWeight="bold">200 SMA River (Flowing UP!)</text>

              {/* FVG */}
              <rect x="230" y="100" width="100" height="60" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
              <text x="340" y="130" fill="#a5b4fc" fontSize="14" fontWeight="bold">The Gap (FVG)</text>

              {/* Candles coming down into gap */}
              <Candle x={100} o={40} c={70} h={30} l={80} />
              <Candle x={150} o={70} c={110} h={60} l={120} />
              <Candle x={200} o={110} c={150} h={100} l={160} />
              <Candle x={250} o={150} c={130} h={120} l={160} /> {/* Touches gap */}
              
              {/* Ignition Candle bouncing off SMA inside Gap */}
              <Candle x={300} o={130} c={60} h={50} l={140} /> 
              
              <text x="320" y="70" fill="#10b981" fontSize="14" fontWeight="bold">Green Ignition Candle!</text>
              <text x="320" y="90" fill="#f8fafc" fontSize="12">Price hits the gap AND the river.</text>
              <text x="320" y="105" fill="#f8fafc" fontSize="12">This is the perfect, safe entry.</text>

            </svg>
          </div>
        </div>
      )
    }
  ];

  const baseTabs = [
    { id: 1, name: '1. Masterclass' },
    { id: 3, name: '2. Practice Chart' },
    { id: 4, name: '3. NY Playbook' },
    { id: 7, name: '4. AI Auditor' },
  ];

  const tabs = user ? [...baseTabs, { id: 12, name: 'Account' }] : baseTabs;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold">ICT</div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">ICT & Velez Masterclass</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Interactive Step-by-Step Curriculum</p>
        </div>
        <button onClick={() => setActiveTab(12)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold border border-slate-700 transition">
          {user ? "Account" : "Sign In"}
        </button>
      </header>

      {/* NAVIGATION */}
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
            <div className="w-full lg:w-1/4 flex flex-col space-y-3 sticky top-24">
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
                    
                    {/* Header & Tools */}
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

                    {/* Embedded Video */}
                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 mb-8 shadow-inner">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={lesson.videoSrc} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>

                    {/* Lesson Text & Graphics */}
                    {lesson.content}

                    {/* Completion Button */}
                    <div className="mt-10 pt-6 border-t border-slate-800 flex justify-end">
                      <button onClick={() => toggleModuleCompletion(lesson.id)} className={`px-6 py-3 rounded-xl text-sm font-bold transition shadow-lg ${completedModules[lesson.id] ? 'bg-emerald-600 text-white shadow-emerald-900/50' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50'}`}>
                        {completedModules[lesson.id] ? '✓ Lesson Completed' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COLUMN 3: AI Mentor & Quick Quiz */}
            <div className="w-full lg:w-1/4 flex flex-col space-y-6 sticky top-24">
              
              {/* Contextual AI */}
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
                    <input type="checkbox" checked={checklist.sma200Check} onChange={(e) => setChecklist({...checklist, sma200Check: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded border-slate-600 focus:ring-indigo-500"/>
                    <span className="text-base text-slate-300 font-medium group-hover:text-white transition">4. Safety Check: Is the 200 SMA river flowing in our direction?</span>
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
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
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
