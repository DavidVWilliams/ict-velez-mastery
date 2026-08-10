import React, { useEffect, useState } from 'react';
import { 
  PlayCircle, Bot, CheckSquare, Shield, Send, Paperclip 
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
  const [chatMessages, setChatMessages] = useState([
    { sender: 'teacher', text: 'Hello! I am your AI Masterclass mentor. You can type, paste logs, or upload files using the attachment button.' }
  ]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {});
  }, []);

  const currentLesson = courseData.find(l => l.id === activeLessonId || l.id === `ep${activeLessonId}`) || courseData[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!teacherQuery.trim()) return;

    const userQuestion = teacherQuery;
    setChatMessages(prev => [...prev, { sender: 'user', text: userQuestion }]);
    setTeacherQuery('');
    
    setTimeout(() => {
      let contextualReply = `Regarding your question on "${currentLesson?.title}": Always prioritize higher-timeframe liquidity draws and maintain your 1% risk rule.`;
      
      const q = userQuestion.toLowerCase();
      if (q.includes('risk') || q.includes('stop')) {
        contextualReply = `For risk management on "${currentLesson?.title}": Keep your stop loss safely behind the structural pivot (ITH/LTH) and never risk more than 1% of your account equity.`;
      } else if (q.includes('fvg') || q.includes('gap')) {
        contextualReply = `Regarding Fair Value Gaps in "${currentLesson?.title}": Always look for price to retrace into the 50% Consequent Encroachment (CE) midpoint before entering.`;
      } else if (q.includes('entry') || q.includes('trigger')) {
        contextualReply = `To execute cleanly on "${currentLesson?.title}": Wait for the session killzone window, confirm your liquidity sweep, and verify the Market Structure Shift (MSS) displacement candle.`;
      }

      setChatMessages(prev => [...prev, { sender: 'teacher', text: contextualReply }]);
    }, 600);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setChatMessages(prev => [...prev, { sender: 'user', text: `[Uploaded File: ${file.name}]`, attachment: 'Data loaded successfully.' }]);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'teacher', text: `I have received and parsed your file "${file.name}". Analyzing it now against our masterclass criteria...` }]);
      }, 600);
    };
    reader.readAsText(file);
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setTeacherQuery(pastedText);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Column 1: Sidebar (Fixed width, non-shrinking) */}
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
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="truncate block">{lesson.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Column 2: Main Content Area (Flexible width, handles text wrapping & scrolling) */}
      <main className="flex-1 min-w-0 h-full flex flex-col bg-slate-950 overflow-y-auto">
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <h2 className="text-xl font-bold text-white truncate pr-4">{currentLesson?.title}</h2>
          <button 
            onClick={() => toggleModuleCompletion(currentLesson?.id)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          >
            Mark Complete
          </button>
        </header>

        <div className="max-w-4xl w-full mx-auto p-8 space-y-8 box-border">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
              <PlayCircle className="w-16 h-16 text-indigo-500 animate-pulse cursor-pointer hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 space-y-6">
            <div className="text-slate-300 leading-relaxed space-y-4 break-words">{currentLesson?.content}</div>
          </div>
        </div>
      </main>

      {/* Column 3: Ask the Teacher Panel (Fixed width, non-shrinking) */}
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
                {msg.attachment && <div className="mt-2 text-xs font-mono bg-slate-950 p-2 rounded truncate">{msg.attachment}</div>}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2 flex-shrink-0">
          <label className="cursor-pointer text-slate-400 hover:text-indigo-400 transition-colors p-2 flex-shrink-0" title="Attach file">
            <Paperclip className="w-5 h-5" />
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
          <input 
            type="text" 
            value={teacherQuery}
            onChange={(e) => setTeacherQuery(e.target.value)}
            onPaste={handlePaste}
            placeholder="Paste logs, ask questions..." 
            className="flex-1 min-w-0 bg-slate-800 text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors flex-shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </aside>
    </div>
  );
}
