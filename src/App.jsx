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
import { courseData } from './data/curriculum';

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
  const [journalSetupType, setJournalSetupType] = useState('ICT 2022 Model + Velez SMA Filter');
  const [savedJournals, setSavedJournals] = useState([]);
  const [savingJournal, setSavingJournal] = useState(false);

  const [cardIndex, setCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState([
    { id: 1, term: "Liquidity", definition: "Other people's money. Resting stop-losses (BSL/SSL)." },
    { id: 2, term: "MSS", definition: "Market Structure Shift. Violent displacement breaking an intermediate-term high or low." },
    { id: 3, term: "FVG", definition: "Fair Value Gap. 3-candle sequence price inefficiency vacuum." },
    { id: 4, term: "200 SMA", definition: "The Trend River. Simple Moving Average baseline. Never EMA." }
  ]);

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const quizQuestions = [
    { q: "What is the primary execution window for the ICT 2022 Model?", options: ["Asia", "London", "NY AM Killzone (08:30-11:00 EST)", "PM Session"], a: 2 },
    { q: "What defines a valid Market Structure Shift (MSS)?", options: ["Slow grind", "Violent displacement closing past a swing point", "Doji formation", "Moving above 200 SMA"], a: 1 },
    { q: "What is the rule for the Velez trend baseline filter?", options: ["Fight the trend", "Only take longs below", "Never fight the 200 SMA Simple Moving Average slope", "Ignore moving averages"], a: 2 }
  ];

  const [activeLessonId, setActiveLessonId] = useState("ep1");
  const [completedModules, setCompletedModules] = useState({});
  const toggleModuleCompletion = (key) => setCompletedModules(prev => ({ ...prev, [key]: !prev[key] }));

  // Lesson image upload & paste states
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

  // SECURE API ROUTING TO VERCEL SERVERLESS FUNCTION (/api/gemini)
  const callGemini = async (promptText) => {
    setLoadingAi(true); setAiResponse('Connecting to AI Server...');
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText, imageBase64: auditImage || null })
      });
      
      const data = await res.json();
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
      
      const data = await res.json();
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
                      <div className="font-semibold text-sm pr-2 truncate">{lesson.title}</div>
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
                          <button onClick={() => speakText(lesson.content)} className="flex items-center space-x-2 bg-slate-800 hover:bg-indigo-600 px-4 py-2 rounded-lg text-xs font-bold transition">
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

                    {/* Homework Assignment Block */}
                    {lesson.homework && (
                      <div className="mt-8 bg-slate-950 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-lg">
                        <h4 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
                          <CheckSquare size={18} /> Official Episode Homework
                        </h4>
                        <div className="text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">{lesson.homework}</div>
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
                    <span className="text-slate-300">4. 200 SMA Simple Moving Average river flowing in our direction?</span>
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
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800"><strong className="text-indigo-400 block mb-2 text-lg">200 SMA</strong> Simple Moving Average filter (Never EMA)</div>
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
