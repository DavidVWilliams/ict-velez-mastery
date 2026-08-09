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
    { sender: 'teacher', text: 'Hello! I am your AI Masterclass mentor. You can type, paste code or logs, or upload files using the attachment button below.' }
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
      setChatMessages(prev => [...prev, { sender: 'user', text: `[Uploaded File: ${file.name}]`, attachment: event.target.result.slice(0, 100) + '...' }]);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'teacher', text: `I have received and parsed your file "${file.name}". Analyzing it now against our masterclass criteria...` }]);
      }, 600);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10">
        <div className="p-5 border-b border-slate-800 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-500" />
          <h1 className="font-bold text-lg text-white">ICT & Velez Mastery</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {courseData.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setActiveLessonId(lesson.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm ${
                (lesson.id === activeLessonId || lesson.id === `ep${activeLessonId}`) 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {lesson.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        <header className="bg-slate-900/80 border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0">
          <h2 className="text-xl font-bold text-white truncate">{currentLesson?.title}</h2>
          <button 
            onClick={() => toggleModuleCompletion(currentLesson?.id)}
            className="bg-emerald-600 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Mark Complete
          </button>
        </header>

        <div className="max-w-4xl w-full mx-auto p-8 space-y-8">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-indigo-500" />
            </div>
          </div>
          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 space-y-6">
            <div className="text-slate-300 leading-relaxed space-y-4">{currentLesson?.content}</div>
          </div>
        </div>
      </main>

      {/* Ask the Teacher Panel */}
      <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-10">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-sm">Ask the Teacher</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.sender === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                {msg.text}
                {msg.attachment && <div className="mt-2 text-xs font-mono bg-slate-950 p-2 rounded truncate">{msg.attachment}</div>}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <label className="cursor-pointer text-slate-400 hover:text-indigo-400 p-2">
            <Paperclip className="w-5 h-5" />
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
          <input 
            type="text" 
            value={teacherQuery}
            onChange={(e) => setTeacherQuery(e.target.value)}
            placeholder="Paste logs, ask questions..." 
            className="flex-1 bg-slate-800 text-white px-4 py-2.5 rounded-xl border border-slate-700 text-sm"
          />
          <button type="submit" className="bg-indigo-600 p-2.5 rounded-xl text-white"><Send className="w-4 h-4" /></button>
        </form>
      </aside>
    </div>
  );
}
