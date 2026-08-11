import React, { useEffect, useState } from 'react';
import { 
  PlayCircle, Bot, CheckSquare, Shield, Send, Paperclip, X as XIcon, Menu, MessageSquare 
} from 'lucide-react';
import { useCourseStore } from './store/useCourseStore';
import { courseData } from './data/curriculum';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const store = useCourseStore() || {};
  const { 
    activeLessonId = 'ep1', 
    setActiveLessonId = () => {}, 
    toggleModuleCompletion = () => {}, 
    completedModules = [] 
  } = store;

  // Responsive state handlers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [teacherQuery, setTeacherQuery] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'teacher', text: 'Hello! I am your Masterclass mentor. Type any question, paste a screenshot, or upload a chart for a structural breakdown.' }
  ]);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, () => {});
      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase auth listener error:", err);
    }
  }, []);

  const currentLesson = courseData.find(l => l.id === activeLessonId || l.id === `ep${activeLessonId}`) || courseData[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!teacherQuery.trim() && !pendingAttachment) return;

    const userText = teacherQuery.trim();
    const attachment = pendingAttachment;

    const userMessage = { 
      sender: 'user', 
      text: userText || '[Attached Screenshot]', 
      image: attachment?.data || null 
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setTeacherQuery('');
    setPendingAttachment(null);

    setTimeout(() => {
      const reply = generateResponse(userText, !!attachment);
      setChatMessages(prev => [...prev, { sender: 'teacher', text: reply }]);
    }, 500);
  };

  const generateResponse = (queryText, hasImage) => {
    const q = queryText.toLowerCase();
    const cleanQ = q.replace(/[^\w\s]/gi, '').trim(); 

    if (cleanQ === 'whats up' || cleanQ === 'sup' || q.includes('how are you')) {
      return "Not much, ready to work. What charts or concepts are you looking at right now?";
    }
    if (cleanQ === 'hello' || cleanQ === 'hi' || cleanQ === 'hey') {
      return "Hey there! Ready when you are—ask away or paste a screenshot.";
    }
    if (q.includes('who are you') || q.includes('who is this') || q.includes('what are you')) {
      return "I am your ICT & Oliver Velez Masterclass mentor. I'm here to analyze setups, evaluate market structure, break down liquidity mechanics, and answer any technical or general questions.";
    }
    if (q.includes('thank') || cleanQ === 'cool' || cleanQ === 'got it' || cleanQ === 'ok') {
      return "You got it! Let me know what else you want to break down.";
    }

    if (cleanQ === 'ce' || q.includes('what is ce') || q.includes('explain ce') || q.includes('consequent encroachment') || q.includes('midpoint')) {
      return "**Consequent Encroachment (CE)** is the exact 50% midpoint of a Fair Value Gap (FVG) or Volume Imbalance. Algorithms treat CE as true equilibrium. Look for price to retrace directly to CE; a high-momentum rejection at the 50% level confirms institutional re-delivery.";
    }
    if (q.includes('fvg') || q.includes('fair value') || q.includes('gap') || q.includes('imbalance')) {
      return "A **Fair Value Gap (FVG)** is a 3-candle displacement sequence where Candle 1's high and Candle 3's low do not overlap (or vice versa for shorts). It represents inefficient price delivery. High-probability entries occur when price retraces to the gap boundary or its **50% Consequent Encroachment (CE)** midpoint.";
    }
    if (q.includes('ob') || q.includes('order block') || q.includes('orderblock')) {
      return "An **Order Block (OB)** is the last down-close candle before a bullish displacement (or last up-close candle before a bearish displacement) that sweeps liquidity or breaks structure. Key entry targets are the OB open and its 50% Mean Threshold.";
    }
    if (q.includes('mss') || q.includes('shift') || q.includes('structure')) {
      return "A **Market Structure Shift (MSS)** occurs when price aggressively breaks a key structural swing high or low with strong displacement (decisive candle body close + FVG), signaling an institutional order flow reversal.";
    }
    if (q.includes('liquidity') || q.includes('sweep') || q.includes('bsl') || q.includes('ssl')) {
      return "**Buy-Side Liquidity (BSL)** rests above key swing highs, and **Sell-Side Liquidity (SSL)** rests below swing lows. When institutions sweep these pools, wait for the sweep to complete and confirm an MSS before entering in the opposite direction.";
    }
    if (q.includes('risk') || q.includes('stop loss') || q.includes('sizing')) {
      return "Always cap risk at **1% per trade**. Place stop losses strictly behind invalidation structural pivots (ITH/LTH) and enforce strict 200 SMA trend alignment.";
    }
    if (q.includes('200 sma') || q.includes('sma') || q.includes('moving average')) {
      return "The **200 SMA** acts as your macro baseline. When its slope is angled upward, take long setups only; when angled downward, focus exclusively on short setups.";
    }

    if (hasImage) {
      if (!queryText) {
        return "I've received your chart screenshot. Check for: (1) Higher Timeframe Draw on Liquidity, (2) Clean BSL/SSL Sweep, (3) MSS displacement candle, and (4) Retracement into an FVG or Order Block.";
      }
      return `Analyzing your chart regarding "${queryText}": Evaluate the 3-candle displacement, confirm if the body closes past structural pivots, and ensure your entry aligns with the 50% CE level or key Order Block threshold.`;
    }

    return `To evaluate "${queryText}": Ensure alignment with higher-timeframe liquidity draws, execute strictly during session killzones (London/NY AM), confirm structural displacement, and keep risk capped at 1%.`;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPendingAttachment({ name: file.name, data: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            setPendingAttachment({ name: 'pasted-screenshot.png', data: event.target.result });
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans relative">
      
      {/* Mobile Overlays */}
      {(isSidebarOpen || isChatOpen) && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => { setIsSidebarOpen(false); setIsChatOpen(false); }} 
        />
      )}

      {/* Column 1: Navigation Sidebar (Drawer on mobile, fixed on desktop) */}
      <aside className={`absolute lg:relative z-40 h-full w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            <h1 className="font-bold text-lg text-white truncate">ICT & Velez Mastery</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {courseData.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => {
                setActiveLessonId(lesson.id);
                setIsSidebarOpen(false); // Auto-close drawer on mobile selection
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                (lesson.id === activeLessonId || lesson.id === `ep${activeLessonId}`) 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 font-medium' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="truncate block">{lesson.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Column 2: Main Lesson Area */}
      <main className="flex-1 min-w-0 h-full flex flex-col bg-slate-950 overflow-y-auto relative z-10 w-full">
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white shrink-0">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-bold text-white truncate pr-4">{currentLesson?.title}</h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => toggleModuleCompletion(currentLesson?.id)} 
              className="hidden sm:block bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Mark Complete
            </button>
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="lg:hidden bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        <div className="max-w-4xl w-full mx-auto p-4 lg:p-8 space-y-6 lg:space-y-8 box-border">
          <div className="bg-slate-900 p-4 lg:p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
              <PlayCircle className="w-12 h-12 lg:w-16 lg:h-16 text-indigo-500 hover:scale-110 transition-transform cursor-pointer" />
            </div>
          </div>
          <div className="bg-slate-900/60 p-6 lg:p-8 rounded-2xl border border-slate-800 space-y-6">
            <div className="text-slate-300 leading-relaxed space-y-4 break-words text-sm lg:text-base">{currentLesson?.content}</div>
          </div>
        </div>
      </main>

      {/* Column 3: Ask the Teacher Panel (Drawer on mobile, fixed right on desktop) */}
      <aside className={`absolute right-0 lg:relative z-40 h-full w-full sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">Ask the Teacher</h3>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm break-words ${
                msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}>
                {msg.text}
                {msg.image && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={msg.image} alt="Uploaded attachment" className="w-full h-auto max-h-48 object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {pendingAttachment && (
          <div className="px-4 pb-2 shrink-0">
            <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 flex items-center gap-2">
              <img src={pendingAttachment.data} alt="Preview" className="w-10 h-10 object-cover rounded shrink-0" />
              <span className="text-xs text-slate-300 truncate flex-1">{pendingAttachment.name}</span>
              <button onClick={() => setPendingAttachment(null)} className="text-slate-400 hover:text-white shrink-0">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0 pb-safe">
          <label className="cursor-pointer text-slate-400 hover:text-indigo-400 transition-colors p-2 shrink-0" title="Attach file or screenshot">
            <Paperclip className="w-5 h-5" />
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          <input 
            type="text" 
            value={teacherQuery}
            onChange={(e) => setTeacherQuery(e.target.value)}
            onPaste={handlePaste}
            placeholder="Type question or paste image..." 
            className="flex-1 min-w-0 bg-slate-800 text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </aside>
    </div>
  );
}
