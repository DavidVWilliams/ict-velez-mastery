import React, { useEffect } from 'react';
import { 
  PlayCircle, Book, Bot, CheckSquare, Layers, HelpCircle, FileText, BarChart2, Briefcase, User, Volume2, StopCircle, ArrowRight, Upload, Sparkles, MessageSquare
} from 'lucide-react';
import { useCourseStore } from './store/useCourseStore';
import { courseData } from './data/curriculum';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const { 
    activeTab, setActiveTab, activeLessonId, setActiveLessonId, 
    toggleModuleCompletion, completedModules 
  } = useCourseStore();

  const [user, setUser] = React.useState(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => {
      unsubscribe();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold">ICT</div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">ICT & Velez Masterclass</h1>
        </div>
        <button onClick={() => setActiveTab(12)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold border border-slate-700 transition">
          {user ? "Account" : "Sign In"}
        </button>
      </header>

      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex space-x-2 overflow-x-auto sticky top-0 z-50">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {tab.name}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 w-full mx-auto max-w-[1600px]">
        {activeTab === 1 && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Outline Col */}
            <div className="w-full lg:w-1/4 flex flex-col space-y-3 sticky top-24 max-h-[85vh] overflow-y-auto pr-2">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center"><Book className="mr-2" size={18}/> Course Outline</h2>
                <div className="space-y-2">
                  {courseData.map((lesson) => (
                    <button key={lesson.id} onClick={() => setActiveLessonId(lesson.id)}
                      className={`w-full text-left p-4 rounded-xl border transition ${activeLessonId === lesson.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}>
                      <div className="font-semibold text-sm truncate">{lesson.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Col */}
            <div className="w-full lg:w-2/4">
              {courseData.map((lesson) => {
                if (lesson.id !== activeLessonId) return null;
                return (
                  <div key={lesson.id} className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-6">
                      <h2 className="text-3xl font-extrabold text-white">{lesson.title}</h2>
                    </div>
                    {lesson.content}
                    {lesson.homework && (
                      <div className="mt-8 bg-slate-950 border-l-4 border-indigo-500 p-6 rounded-r-xl">
                        <h4 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2"><CheckSquare size={18} /> Official Episode Homework</h4>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{lesson.homework}</p>
                      </div>
                    )}
                    <button onClick={() => toggleModuleCompletion(lesson.id)} className={`mt-8 px-6 py-3 rounded-xl font-bold transition ${completedModules[lesson.id] ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                      {completedModules[lesson.id] ? '✓ Lesson Completed' : 'Mark as Completed'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* AI Teacher Col */}
            <div className="w-full lg:w-1/4 flex flex-col space-y-6 sticky top-24">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold text-indigo-300 flex items-center mb-4"><Bot className="mr-2" size={20}/> Ask The Teacher</h3>
                <p className="text-xs text-slate-400 mb-4">Upload or paste chart setup for AI grading.</p>
                {/* AI logic components here */}
                <div className="text-sm text-slate-500 p-4 border border-slate-800 rounded-lg">AI Interface Initialized</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Placeholder for other tabs logic... */}
        {activeTab !== 1 && <div className="text-center p-20 text-slate-500">Feature for Tab {activeTab} loading...</div>}
      </main>
    </div>
  );
}
