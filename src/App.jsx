import React, { useState, useEffect } from 'react';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  PlayCircle, Cpu, BarChart2, CheckSquare, Layers, HelpCircle, FileText, Book, Bot, User, Lock, Mail, LogOut, Upload, ExternalLink, Sparkles, ArrowLeft, BookMarked
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [activeModuleDetail, setActiveModuleDetail] = useState(null);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  const [completedModules, setCompletedModules] = useState({ m1: false, m2: false, m3: false, m4: false, bonus: false });
  const toggleModuleCompletion = (key) => setCompletedModules(prev => ({ ...prev, [key]: !prev[key] }));
  const progress = Math.round((Object.values(completedModules).filter(Boolean).length / 5) * 100);

  // AI & Database states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [auditImage, setAuditImage] = useState(null);
  const [auditImageName, setAuditImageName] = useState('');
  const [checklist, setChecklist] = useState({ asiaRange: false, londonSweep: false, nyKillzone: false, sma200Slope: false, ignitionTrigger: false });
  const [journalNote, setJournalNote] = useState('');
  const [journalSetupType, setJournalSetupType] = useState('NY AM Killzone + FVG');
  const [savedJournals, setSavedJournals] = useState([]);
  const [savingJournal, setSavingJournal] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState([
    { id: 1, term: "NY AM Killzone", definition: "08:30 AM – 11:00 AM EST. The primary institutional execution window for the ICT 2022 Model.", status: "Review" },
    { id: 2, term: "Market Structure Shift (MSS)", definition: "A violent displacement of price that breaks a significant swing high/low, signaling a change in institutional order flow.", status: "Review" }
  ]);

  // Auth & Firestore Handlers
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchUserJournals(currentUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserJournals = async (uid) => {
    const db = getFirestore();
    const q = query(collection(db, 'users', uid, 'journals'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const journals = [];
    querySnapshot.forEach((doc) => journals.push({ id: doc.id, ...doc.data() }));
    setSavedJournals(journals);
  };

  const handleSaveJournal = async () => {
    if (!user) { alert("Please sign in."); setActiveTab(12); return; }
    setSavingJournal(true);
    const db = getFirestore();
    await addDoc(collection(db, 'users', user.uid, 'journals'), { setupType: journalSetupType, note: journalNote, createdAt: serverTimestamp() });
    setJournalNote(''); fetchUserJournals(user.uid); setSavingJournal(false);
  };

  // TradingView Integration
  useEffect(() => {
    if (activeTab === 3) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true, "symbol": "CME_MINI:ES1!", "interval": "15", "theme": "dark", "style": "1"
      });
      const container = document.getElementById('tradingview-widget-container');
      if (container && !container.hasChildNodes()) container.appendChild(script);
    }
  }, [activeTab]);

  const renderDeepDive = (moduleId) => {
    const content = {
      1: {
        title: "Module 1: New York AM Killzone & The 2022 Algorithm Model",
        intro: "The core of the 2022 Mentorship. This study guide focuses on the 08:30-11:00 EST Killzone and the institutional logic governing daily price delivery.",
        sections: [
          { subtitle: "The New York AM Killzone (08:30-11:00 EST)", text: "This is the primary window for institutional order execution. The algorithm is not searching for trades all day; it is programmed to deliver price to liquidity targets during this specific 150-minute macro. Outside of this time, price delivery is frequently noisy and low-probability." },
          { subtitle: "Liquidity Sweeps (The 'Fuel')", text: "Before an institutional reversal occurs, the algorithm must 'clear the books.' This means running above previous session highs or below previous session lows (often Asia or London highs/lows) to induce retail stop-losses. This is not a 'breakout' to be traded; it is a stop-run used to fill large institutional buy/sell orders." },
          { subtitle: "Identifying the Market Structure Shift (MSS)", text: "After the liquidity sweep, price must demonstrate displacement—a violent, impulsive move that breaks the most recent significant swing low (if bearish) or high (if bullish). This MSS is the algorithmic fingerprint verifying that the Smart Money has engaged." }
        ]
      }
    };
    const m = content[moduleId];
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveModuleDetail(null)} className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300"><ArrowLeft size={16}/> Back to Curriculum</button>
        <h2 className="text-3xl font-bold">{m.title}</h2>
        <p className="text-slate-400">{m.intro}</p>
        {m.sections.map((s, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h4 className="font-bold text-indigo-300">{s.subtitle}</h4>
            <p className="text-sm mt-2 text-slate-300">{s.text}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold">ICT</div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">ICT 2022 & Oliver Velez Mastery Platform</h1>
          </div>
        </div>
        <button onClick={() => setActiveTab(12)} className="bg-indigo-600 px-4 py-2 rounded-lg text-sm">{user ? "Account" : "Sign In"}</button>
      </header>

      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {[1,2,3,4,5,6,7,8,9,10,11].map((id) => (
            <button key={id} onClick={() => { setActiveTab(id); setActiveModuleDetail(null); }} className={`px-3 py-2 rounded-lg text-xs ${activeTab === id ? 'bg-indigo-600' : 'bg-slate-800'}`}>Tab {id}</button>
          ))}
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 1 && activeModuleDetail === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 'bonus'].map((id) => (
              <div key={id} className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="font-bold">Module {id}</h3>
                <button onClick={() => setActiveModuleDetail(id)} className="bg-indigo-600 mt-4 px-4 py-2 rounded">Study Deep Dive</button>
              </div>
            ))}
          </div>
        )}
        {activeTab === 1 && activeModuleDetail !== null && renderDeepDive(activeModuleDetail)}
        
        {/* ... Other Tabs 2-12 ... */}
        {activeTab === 2 && (<div>Oliver Velez & 200 SMA Bridge Content...</div>)}
        {activeTab === 3 && (<div id="tradingview-widget-container" className="h-[600px] w-full" />)}
        {activeTab === 4 && (<div>Checklist and Journal Content...</div>)}
        {activeTab === 5 && (<div>Flashcards...</div>)}
      </main>
    </div>
  );
}
