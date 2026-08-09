import React, { useEffect, useState } from 'react';
import { 
  PlayCircle, Book, Bot, CheckSquare, Layers, HelpCircle, FileText, 
  CheckCircle, Menu, X, Send, Search, Sparkles, Shield, Lock 
} from 'lucide-react';
import { useCourseStore } from './store/useCourseStore';
import { courseData } from './data/curriculum';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const store = useCourseStore() || {};
  const { 
    activeTab = 'curriculum', 
    setActiveTab = () => {}, 
    activeLessonId = 'ep1', 
    setActiveLessonId = () => {}, 
    toggleModuleCompletion = () => {}, 
    completedModules = [] 
  } = store;

  const [user, setUser] = useState(null);
  const [teacherQuery, setTeacherQuery] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'teacher', text: 'Hello! I am your AI Masterclass mentor. Ask me anything about ICT or Velez methodologies.' }
  ]);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase auth init error:", err);
    }
  }, []);

  // Safe fallback lookup supporting both string ("ep1") and numeric IDs
  const currentLesson = courseData.find(l => l.id === activeLessonId || l.id === `ep${activeLessonId}`) || courseData[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!teacherQuery.trim()) return;
    const newMsg = { sender: 'user', text: teacherQuery };
    setChatMessages(prev => [...prev, newMsg]);
    const queryText = teacherQuery;
    setTeacherQuery('');
    
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { sender: 'teacher', text: `Regarding "${queryText}": Keep your risk locked at 1% and ensure your execution aligns strictly with the higher timeframe draw on liquidity and the 200 SMA slope.` }
      ]);
    }, 600);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Column 1: Navigation / Sidebar */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-10">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            <h1 className="font-bold text-lg tracking-wide text-white">ICT & Velez Mastery</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Curriculum Modules</div>
          {courseData.map((lesson) => {
            const isSelected = lesson.id === activeLessonId || lesson.id === `ep${activeLessonId}`;
            const isCompleted = Array.isArray(completedModules) && completedModules.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-sm transition-all ${
                  isSelected 
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 font-medium' 
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span className="truncate pr-2">{lesson.title}</span>
                {isCompleted && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Column 2: Main Lesson Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white truncate">{currentLesson?.title}</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => toggleModuleCompletion(currentLesson?.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              Mark Complete
            </button>
          </div>
        </header>

        <div className="max-w-4xl w-full mx-auto p-8 space-y-8">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/40">
                <PlayCircle className="w-16 h-16 text-indigo-500 animate-pulse cursor-pointer hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-300">Watch Masterclass Breakdown</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-2xl font-bold text-white border-b border-slate-800 pb-4">Lesson Core Concepts</h3>
            <div className="text-slate-300 leading-relaxed space-y-4">
              {currentLesson?.content}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <h4 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Actionable Homework Assignment
            </h4>
            <p className="text-slate-300 text-base leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {currentLesson?.homework}
            </p>
          </div>
        </div>
      </main>

      {/* Column 3: Ask the Teacher / AI Assistant Panel */}
      <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-10">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/90">
          <Bot className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-sm">Ask the Teacher</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input 
            type="text" 
            value={teacherQuery}
            onChange={(e) => setTeacherQuery(e.target.value)}
            placeholder="Ask the teacher anything about this lesson..." 
            className="flex-1 bg-slate-800 text-white px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
          />
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </aside>
    </div>
  );
}
