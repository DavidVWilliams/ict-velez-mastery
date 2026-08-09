import React, { useState, useEffect } from 'react';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged 
} from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  PlayCircle, Cpu, BarChart2, CheckSquare, Layers, HelpCircle, FileText, Book, Bot, User, Lock, Mail, LogOut, Upload, ExternalLink, Sparkles, ArrowLeft, BookMarked, Target, TrendingUp, Anchor
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [activeModuleDetail, setActiveModuleDetail] = useState(null); // Tracks which module deep-dive is open
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
  const [journalSetupType, setJournalSetupType] = useState('Asia Sweep + FVG');
  const [savedJournals, setSavedJournals] = useState([]);
  const [savingJournal, setSavingJournal] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState([
    { id: 1, term: "Fair Value Gap (FVG)", definition: "A 3-candle imbalance zone where price leaves an unmitigated footprint acting as a magnetic draw.", status: "Review" },
    { id: 2, term: "200 Simple Moving Average (SMA)", definition: "The core Oliver Velez baseline trend filter. Price above = bullish bias, price below = bearish bias, slope dictates momentum.", status: "Review" }
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

  // Render Component for Module Deep Dives
  const renderDeepDive = (moduleId) => {
    const content = {
      1: {
        title: "Module 1: Liquidity & Market Structure (Eps 1-10)",
        intro: "The foundation of all algorithmic delivery is liquidity. This module explores how price is driven to areas of high stop-loss density.",
        sections: [
          { subtitle: "Liquidity Mapping", text: "We identify BSL (Buy-Side Liquidity) above relative equal highs and SSL (Sell-Side Liquidity) below equal lows. These are not just 'support/resistance' levels; they are algorithmic magnets." },
          { subtitle: "The Asia Consolidation Box", text: "The Tokyo session (20:00-00:00 EST) constructs the overnight range. This is the institutional accumulation phase." }
        ],
        graphic: (
          <div className="bg-slate-950 p-6 rounded-lg border border-indigo-900/50 flex flex-col items-center gap-4">
            <div className="text-xs text-indigo-400 font-bold mb-2">SCHEMATIC: ASIA ACCUMULATION & LIQUIDITY RUN</div>
            <div className="flex items-end h-24 gap-2">
              <div className="w-12 bg-slate-800 border-t-2 border-slate-600"></div>
              <div className="w-12 bg-slate-700 h-16 border-t-2 border-slate-500"></div>
              <div className="w-12 bg-slate-800 h-12 border-t-2 border-slate-600 relative">
                <div className="absolute -top-6 text-[8px] text-emerald-400 w-24">ASIA HIGH (BSL)</div>
                <div className="absolute -top-3 w-full border-t border-dashed border-emerald-500"></div>
              </div>
            </div>
          </div>
        )
      }
      // ... (This pattern continues for other modules)
    };
    
    const m = content[moduleId];
    return (
      <div className="space-y-6">
        <button onClick={() => setActiveModuleDetail(null)} className="flex items-center space-x-2 text-indigo-400"><ArrowLeft size={16}/> Back</button>
        <h2 className="text-3xl font-bold">{m.title}</h2>
        <p>{m.intro}</p>
        {m.graphic}
        {m.sections.map((s, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h4 className="font-bold text-indigo-300">{s.subtitle}</h4>
            <p className="text-sm mt-2">{s.text}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ... Header and Nav remain the same ... */}
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
        {/* ... Other Tabs remain the same ... */}
      </main>
    </div>
  );
}
