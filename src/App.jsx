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
    { sender: 'teacher', text: 'Hello! I am your AI Masterclass mentor. Paste or attach a screenshot, ask your technical question, and I will give you a rigorous ICT & Velez structural breakdown.' }
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
      const q = userQuestion.toLowerCase();
      const prefix = hasImage ? "Analyzing your chart screenshot in the context of " : "Regarding ";

      if (q.includes('fvg') || q.includes('gap') || q.includes('imbalance') || q.includes('fair value')) {
        expertReply = `${prefix}**${currentLesson?.title}**: To validate this Fair Value Gap (FVG), check the 3-candle sequence. Candle 1 and 3 wicks must not overlap. Look specifically at the 50% Consequent Encroachment (CE) midpoint. If price has retraced directly to that 50% level and shown a high-momentum displacement rejection, it confirms institutional re-delivery before trend expansion.`;
      } else if (q.includes('mss') || q.includes('shift') || q.includes('structure') || q.includes('break')) {
        expertReply = `${prefix}**${currentLesson?.title}**: For a valid Market Structure Shift (MSS), confirm that the structural pivot was broken with a decisive candle body close rather than a micro-wick. True institutional displacement always expands significantly past the dealing range high/low.`;
      } else if (q.includes('liquidity') || q.includes('sweep') || q.includes('stop') || q.includes('high') || q.includes('low')) {
        expertReply = `${prefix}**${currentLesson?.title}**: When evaluating liquidity pools (BSL/SSL), ensure you are tracking clean Equal Highs (EQH) or Lows (EQL). If price has swept this external pool, do not chase it—wait for the subsequent MSS displacement candle to confirm institutional trapping before entry.`;
      } else if (q.includes('risk') || q.includes('sizing') || q.includes('loss')) {
        expertReply = `For risk management in **${currentLesson?.title}**: Never risk more than 1% of your account equity. Ensure your stop loss is tucked safely behind the structural pivot (ITH/LTH) and apply the 50/75 protocol for partial profit-taking.`;
      } else {
        expertReply = `${prefix}**${currentLesson?.title}**: ${currentLesson?.heading}. To master this setup, review the core execution steps: map your higher-timeframe draw on liquidity, wait for the killzone session window, and enforce strict 200 SMA slope alignment before executing.`;
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

      <main className="flex-1 min-w-0 h-full flex flex-col bg-slate-950 overflow-y-auto">
        <header className="bg-slate-900/80 border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
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
                {msg.image && <div className="mt-2 rounded-lg overflow-hidden border border-slate-700"><img src={msg.image} alt="Ref" className="w-full h-auto" /></div>}
              </div>
            </div>
          ))}
        </div>
        
        {pendingAttachment && (
          <div className="px-4 pb-2">
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
            placeholder="Ask question about screenshot/lesson..." 
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
