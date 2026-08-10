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
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'teacher', text: 'Hello! I am your AI assistant. Ask me anything, or paste/attach a screenshot for analysis.' }
  ]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {});
  }, []);

  const currentLesson = courseData.find(l => l.id === activeLessonId || l.id === `ep${activeLessonId}`) || courseData[0];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!teacherQuery.trim() && !pendingAttachment) || isLoading) return;

    const userQuestion = teacherQuery;
    const attachment = pendingAttachment;
    
    // 1. Immediately render user message with preview if available
    const newMsg = { 
      sender: 'user', 
      text: userQuestion || '[Attached File/Screenshot]', 
      image: attachment?.data 
    };
    
    setChatMessages(prev => [...prev, newMsg]);
    setTeacherQuery('');
    setPendingAttachment(null);
    setIsLoading(true);

    try {
      // 2. Attempt to call your backend LLM API endpoint (e.g. Vercel Serverless Function or Express server)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userQuestion,
          image: attachment?.data || null,
          lessonContext: currentLesson?.title || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { sender: 'teacher', text: data.reply }]);
      } else {
        // Fallback if no backend route is deployed yet
        throw new Error('API route not connected');
      }
    } catch (err) {
      // 3. Dynamic Unconstrained Local Fallback (No forced framing or rigid keyword matching)
      setTimeout(() => {
        let responseText = "";
        
        if (attachment) {
          responseText = userQuestion 
            ? `I've received your image along with your question: "${userQuestion}". (To get live multi-modal AI vision responses, connect your API key to /api/chat).` 
            : `I've received your attached image. What specific details would you like me to analyze on this chart?`;
        } else if (userQuestion) {
          responseText = `You asked: "${userQuestion}". I am ready to help with this or any other topic you want to discuss.`;
        } else {
          responseText = "How can I help you today?";
        }

        setChatMessages(prev => [...prev, { sender: 'teacher', text: responseText }]);
      }, 500);
    } finally {
      setIsLoading(false);
    }
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

      {/* Column 2: Main Content Area */}
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
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl px-4 py-3 text-sm animate-pulse">
                Thinking...
              </div>
            </div>
          )}
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
          <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors shrink-0 disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </aside>
    </div>
  );
}
