import React, { useEffect, useState } from 'react';
import { 
  PlayCircle, Bot, CheckSquare, Shield, Send, Paperclip, X as XIcon 
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

  const [teacherQuery, setTeacherQuery] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'teacher', text: 'Hello! Ask me any technical trading question, or paste/attach a chart screenshot for structural analysis.' }
  ]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {});
  }, []);

  const currentLesson = courseData.find(l => l.id === activeLessonId || l.id === `ep${activeLessonId}`) || courseData[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!teacherQuery.trim() && !pendingAttachment) return;

    const userQuestion = teacherQuery;
    const hasImage = !!pendingAttachment;
    const newMsg = { 
      sender: 'user', 
      text: userQuestion || '[Attached Screenshot]', 
      image: pendingAttachment?.data 
    };
    
    setChatMessages(prev => [...prev, newMsg]);
    setTeacherQuery('');
    setPendingAttachment(null);
    
    setTimeout(() => {
      let expertReply = "";
      const q = userQuestion.toLowerCase().trim();

      // Identity & General Greetings
      if (q.includes('who are you') || q.includes('who is this') || q.includes('what are you')) {
        expertReply = "I am your AI Masterclass Mentor, specialized in Inner Circle Trader (ICT) institutional concepts and Oliver Velez price action methodologies. Ask me anything about market structure, liquidity, or trade execution.";
      } else if (q === 'hello' || q === 'hi' || q === 'hey') {
        expertReply = "Hello! Ask me any question about technical setups, price action mechanics, or attach a chart screenshot to review.";
      } 
      // Consequent Encroachment (CE)
      else if (q === 'ce' || q.includes('explain ce') || q.includes('consequent encroachment') || q.includes('midpoint')) {
        expertReply = "**Consequent Encroachment (CE)** is the exact 50% midpoint of a Fair Value Gap (FVG) or Volume Imbalance. Interbank algorithms view CE as the true equilibrium of the gap. A sharp reaction or rejection at the 50% CE level confirms institutional defense and structural re-delivery.";
      }
      // Fair Value Gap (FVG) / Imbalance
      else if (q.includes('fvg') || q.includes('gap') || q.includes('imbalance') || q.includes('fair value')) {
        expertReply = "A **Fair Value Gap (FVG)** is a 3-candle displacement pattern where Candle 1's high and Candle 3's low do not overlap (or vice-versa for bearish gaps). It reflects market inefficiency. Look for entries when price retraces to the gap open or the **50% Consequent Encroachment (CE)** midpoint.";
      } 
      // Order Block (OB)
      else if (q.includes('ob') || q.includes('order block') || q.includes('orderblock')) {
        expertReply = "An **Order Block (OB)** is the last down-close candle before a bullish displacement (or last up-close candle before a bearish displacement) that sweeps liquidity or breaks structure. High-probability entries target the OB open or its 50% Mean Threshold.";
      }
      // Market Structure Shift (MSS)
      else if (q.includes('mss') || q.includes('shift') || q.includes('structure') || q.includes('break')) {
        expertReply = "A **Market Structure Shift (MSS)** occurs when price breaks a key structural swing high or low with strong displacement (decisive candle body close + FVG), signaling a shift in institutional order flow direction.";
      } 
      // Liquidity Pools & Sweeps
      else if (q.includes('liquidity') || q.includes('sweep') || q.includes('bsl') || q.includes('ssl') || q.includes('high') || q.includes('low')) {
        expertReply = "**Buy-Side Liquidity (BSL)** rests above swing highs, and **Sell-Side Liquidity (SSL)** rests below swing lows. When institutions sweep these pools, do not chase the breakout—wait for the sweep to complete and look for a reversal MSS in the opposite direction.";
      } 
      // Risk Management
      else if (q.includes('risk') || q.includes('sizing') || q.includes('stop loss') || q.includes('stop')) {
        expertReply = "Never risk more than 1% of total account equity per execution. Set stop losses strictly beyond the key invalidation swing high/low (ITH/LTH) or structural pivot.";
      }
      // 200 SMA / Trend Alignment
      else if (q.includes('200 sma') || q.includes('sma') || q.includes('moving average') || q.includes('velez')) {
        expertReply = "The **200 SMA** serves as the macro baseline filter. When the 200 SMA slope is angled upward, focus exclusively on long setups; when angled downward, focus exclusively on short setups.";
      }
      // Standalone Screenshot / Image Analysis
      else if (hasImage && !userQuestion) {
        expertReply = "Analyzing your attached chart: Check for (1) higher timeframe draw on liquidity, (2) recent BSL/SSL sweeps, (3) MSS displacement candle body closes, and (4) an FVG or OB retracement zone for entry.";
      }
      // Direct General Query Fallback
      else {
        expertReply = `To evaluate "${userQuestion}": Ensure alignment across your higher-timeframe liquidity draw, wait for the session killzone window (London/NY AM), confirm structural displacement, and strictly manage position risk to 1%.`;
      }

      setChatMessages(prev => [...prev, { sender: 'teacher', text: expertReply }]);
    }, 600);
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
            setPendingAttachment({ name: 'chart-screenshot.png', data: event.target.result });
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Column 1: Navigation Sidebar */}
      <aside className="w-80 flex-shrink-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-10">
        <div className="p-5 border-b border-slate-800 flex items-center gap-2 flex-shrink-0">
          <Shield className="w-6 h-6 text-indigo-500" />
          <h1 className="font-bold text-lg text-white truncate">ICT & Velez Mastery</h1>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
          {courseData.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setActiveLessonId(lesson.id)}
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
      <main className="flex-1 min-w-0 h-full flex flex-col bg-slate-950 overflow-y-auto">
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <h2 className="text-xl font-bold text-white truncate pr-4">{currentLesson?.title}</h2>
          <button onClick={() => toggleModuleCompletion(currentLesson?.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0">Mark Complete</button>
        </header>
        <div className="max-w-4xl w-full mx-auto p-8 space-y-8 box-border">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
              <PlayCircle className="w-16 h-16 text-indigo-500" />
            </div>
          </div>
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 space-y-6">
            <div className="text-slate-300 leading-relaxed space-y-4 break-words">{currentLesson?.content}</div>
          </div>
        </div>
      </main>

      {/* Column 3: Ask the Teacher Panel */}
      <aside className="w-96 flex-shrink-0 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-10">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/90 flex-shrink-0">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-sm">Ask the Teacher</h3>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm break-words ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                {msg.text}
                {msg.image && <div className="mt-2 rounded-lg overflow-hidden border border-slate-700"><img src={msg.image} alt="Attached screenshot" className="w-full h-auto" /></div>}
              </div>
            </div>
          ))}
        </div>
        
        {/* Attachment Preview Box */}
        {pendingAttachment && (
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 flex items-center gap-2">
              <img src={pendingAttachment.data} alt="Preview" className="w-10 h-10 object-cover rounded" />
              <span className="text-xs text-slate-300 truncate flex-1">{pendingAttachment.name}</span>
              <button onClick={() => setPendingAttachment(null)} className="text-slate-400 hover:text-white"><XIcon className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2 flex-shrink-0">
          <label className="cursor-pointer text-slate-400 hover:text-indigo-400 transition-colors p-2 shrink-0">
            <Paperclip className="w-5 h-5" />
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          <input 
            type="text" 
            value={teacherQuery}
            onChange={(e) => setTeacherQuery(e.target.value)}
            onPaste={handlePaste}
            placeholder="Ask any question or paste screenshot..." 
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
