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

// Custom Candlestick SVG Component
const Candle = ({ x, o, c, h, l }) => {
  const isGreen = c <= o; 
  const color = isGreen ? '#10b981' : '#ef4444';
  const bodyY = Math.min(o, c);
  const bodyH = Math.max(Math.abs(c - o), 2);
  
  return (
    <g>
      <line x1={x} y1={h} x2={x} y2={l} stroke={color} strokeWidth="2" />
      <rect x={x - 5} y={bodyY} width="10" height={bodyH} fill={color} stroke={color} />
    </g>
  );
};

// --- GLOBAL COURSE DATA (Isolated to prevent ReferenceErrors) ---
const courseData = [
  {
    id: "ep1",
    title: "Episode 1: The Magnet (Liquidity)",
    videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=180s",
    rawText: "Episode 1. Imagine you are playing a video game where you have to collect coins. In the stock market, the big banks and algorithms are the players, and the 'coins' are called Liquidity. Liquidity is just a fancy word for other people's money. When regular people buy a stock, they get scared it might drop, so they put a 'Stop Loss' order right below the recent lowest point on the chart. The algorithm acts like a giant magnet, pulling the price down just enough to trigger all those stop losses. We call this a Liquidity Sweep.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>Imagine you are playing a video game where you have to collect coins to power up your spaceship.</p>
        <p>In the stock market, the big banks and computer algorithms are the players, and the "coins" are called <strong>Liquidity</strong>. Liquidity is just a fancy word for other people's money.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">Where are the coins hidden?</h4>
          <p>When regular people buy a stock, they get scared it might drop. So, they put a "Stop Loss" order right below the recent lowest point on the chart (a "floor") to protect themselves.</p>
        </div>

        <p><strong>The algorithm knows this!</strong> It acts like a giant magnet. It pulls the price down <em>just enough</em> to trigger all those stop losses, scoops up their money, and then shoots the price back up.</p>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE LIQUIDITY SWEEP</div>
          <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
            <line x1="50" y1="200" x2="550" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
            <text x="50" y="220" fill="#ef4444" fontSize="14" fontWeight="bold">The Floor (Sell-Side Liquidity)</text>

            <Candle x={100} o={100} c={150} h={80} l={160} />
            <Candle x={140} o={150} c={180} h={140} l={190} />
            <Candle x={180} o={180} c={140} h={130} l={190} />
            <Candle x={220} o={140} c={100} h={90} l={150} />
            <Candle x={260} o={100} c={160} h={80} l={170} />
            <Candle x={300} o={160} c={190} h={150} l={200} />
            
            <Candle x={340} o={190} c={120} h={110} l={200} /> 
            <Candle x={380} o={120} c={170} h={100} l={180} />
            <Candle x={420} o={170} c={250} h={160} l={260} />
            <Candle x={460} o={250} c={150} h={140} l={260} /> 
            <Candle x={500} o={150} c={50} h={40} l={160} /> 

            <circle cx="420" cy="260" r="15" fill="none" stroke="#eab308" strokeWidth="3" />
            <text x="440" y="265" fill="#eab308" fontSize="14" fontWeight="bold">The Sweep!</text>
          </svg>
        </div>
      </div>
    )
  },
  {
    id: "ep2",
    title: "Episode 2: The Stomp (Market Structure Shift)",
    videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=840s",
    rawText: "Episode 2. How do we know the algorithm is ready to reverse? We look for a giant footprint called a Market Structure Shift. Imagine someone jumping and stomping as hard as they can, breaking the floorboards. That stomp is displacement. A Market Structure shift happens when price breaks past the last little hill or valley on the chart with massive energy.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>How do we know the algorithm is done sweeping liquidity and isn't just crashing forever?</p>

        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">We wait for the Stomp.</h4>
          <p>Imagine someone walking softly on their tiptoes. Suddenly, they jump up and <strong>stomp</strong> down as hard as they can. That violent stomp is what we call <strong>Displacement</strong>.</p>
        </div>
        
        <p>When those giant candles break past the last little "hill" on the chart, we call it a <strong>Market Structure Shift (MSS)</strong>. It is absolute proof the big banks are stepping in.</p>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE STOMP (MSS)</div>
          <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
            <line x1="50" y1="250" x2="550" y2="250" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
            <text x="50" y="240" fill="#ef4444" fontSize="12" fontWeight="bold">The Floor (Liquidity)</text>

            <line x1="50" y1="120" x2="550" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,5" />
            <text x="50" y="110" fill="#38bdf8" fontSize="12" fontWeight="bold">The Last Hill (MSS Line)</text>

            <Candle x={100} o={60} c={100} h={50} l={110} />
            <Candle x={140} o={100} c={160} h={90} l={170} /> 
            <Candle x={180} o={160} c={120} h={110} l={170} />
            <Candle x={220} o={120} c={180} h={110} l={190} />
            <Candle x={260} o={180} c={220} h={170} l={230} />
            <Candle x={300} o={220} c={280} h={210} l={290} /> 
            
            <Candle x={340} o={280} c={180} h={170} l={290} /> 
            <Candle x={380} o={180} c={80} h={70} l={190} /> 
            <Candle x={420} o={80} c={40} h={30} l={90} /> 

            <rect x="360" y="60" width="80" height="140" fill="none" stroke="#10b981" strokeWidth="3" rx="10" />
            <text x="450" y="120" fill="#10b981" fontSize="16" fontWeight="bold">THE STOMP (MSS)</text>
          </svg>
        </div>
      </div>
    )
  },
  {
    id: "ep3",
    title: "Episode 3: The Hole (Fair Value Gap)",
    videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=1400s",
    rawText: "Episode 3. When the algorithm stomps really hard, it leaves a hole in the ground. We call this hole a Fair Value Gap. Imagine three cars on a highway. Car 1 and Car 3 are driving normally. Car 2 is a rocket ship that blasts forward, leaving a huge empty space. The market hates empty space, so price will always come back to fill the hole. That hole is where you buy.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>When the algorithm stomps that hard, it moves so fast that it leaves a hole in the chart.</p>

        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">The 3-Car Highway Rule</h4>
          <p>Imagine three cars on a highway. Car 1 and Car 3 drive normally. Car 2 is a rocket ship that blasts forward, leaving a massive empty gap between Car 1 and Car 3.</p>
          <p>That gap is the <strong>Fair Value Gap (FVG)</strong>.</p>
        </div>
        
        <p>The market hates empty space. Like a rubber band stretching and snapping back, the price will almost always come back to fill that empty space to make things neat and tidy again. <strong>That hole is exactly where you want to enter your trade.</strong></p>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE HOLE (FVG)</div>
          <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
            <Candle x={150} o={250} c={200} h={180} l={260} />
            <text x="135" y="280" fill="#94a3b8" fontSize="14" fontWeight="bold">Car 1</text>
            <line x1="150" y1="180" x2="350" y2="180" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />
            
            <Candle x={250} o={200} c={60} h={50} l={210} />
            <text x="235" y="280" fill="#10b981" fontSize="14" fontWeight="bold">Car 2</text>

            <Candle x={350} o={60} c={40} h={30} l={100} />
            <text x="335" y="280" fill="#94a3b8" fontSize="14" fontWeight="bold">Car 3</text>
            <line x1="350" y1="100" x2="450" y2="100" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" />

            <rect x="150" y="100" width="200" height="80" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
            <text x="160" y="145" fill="#a5b4fc" fontSize="16" fontWeight="bold">THE EMPTY GAP (FVG)</text>
          </svg>
        </div>
      </div>
    )
  },
  {
    id: "ep4",
    title: "Episode 4: The Safety Filter (Oliver Velez 200 SMA)",
    videoUrl: "https://www.youtube.com/watch?v=bx89qkJ_LR4&t=2000s",
    rawText: "Episode 4. Now you know how to find the gap. But we never jump into a gap blindly. We use the Oliver Velez 200 Simple Moving Average. Think of the 200 SMA as a giant river. If the river is flowing down, you only swim down. If the river is flowing up, you only swim up. Also, wait for an Ignition Candle to push off the river before you jump in.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>Okay, so you know how to find the hole in the chart (the Fair Value Gap). But we <strong>never</strong> jump into a gap blindly. We need a safety filter to make sure we aren't jumping in front of a moving train.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-eab308/50">
          <h4 className="text-xl font-bold text-white mb-2">The River Current (200 SMA)</h4>
          <p>We use the <strong>Simple Moving Average (SMA)</strong> set to 200. Think of it as a giant river.</p>
          <ul className="list-disc pl-8 mt-2 space-y-2 font-bold text-white">
            <li>If the river is flowing UP, you only swim UP (Buy).</li>
            <li>If the river is flowing DOWN, you only swim DOWN (Sell).</li>
          </ul>
        </div>

        <p>If you want to buy, is the 200 SMA pointing up? Good. But wait! Let the price hit the gap, touch the river, and print a solid <strong>Ignition Candle</strong> (a big green or red candle) to prove the river is pushing it away safely.</p>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE VELEZ 200 SMA FILTER</div>
          <svg viewBox="0 0 600 350" className="w-full max-w-2xl h-auto font-sans">
            <path d="M 50 250 Q 300 200 550 50" fill="none" stroke="#eab308" strokeWidth="4" />
            <text x="50" y="270" fill="#fde047" fontSize="14" fontWeight="bold">200 SMA River (Flowing UP!)</text>

            <rect x="230" y="100" width="100" height="60" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
            <text x="340" y="130" fill="#a5b4fc" fontSize="14" fontWeight="bold">The Gap (FVG)</text>

            <Candle x={100} o={40} c={70} h={30} l={80} />
            <Candle x={150} o={70} c={110} h={60} l={120} />
            <Candle x={200} o={110} c={150} h={100} l={160} />
            <Candle x={250} o={150} c={130} h={120} l={160} /> 
            
            <Candle x={300} o={130} c={60} h={50} l={140} /> 
            
            <text x="320" y="70" fill="#10b981" fontSize="14" fontWeight="bold">Green Ignition Candle!</text>
          </svg>
        </div>
      </div>
    )
  },
  {
    id: "ep5",
    title: "Episode 5: The Time Clock (Killzones & AMD)",
    videoUrl: "https://www.youtube.com/watch?v=kmVXVJE08eQ&t=600s",
    rawText: "The big banks don't play the game all day long. They have a strict schedule. We call this AMD: Accumulation, Manipulation, Distribution. During the night, they Accumulate. In the early morning, they Manipulate and drop the price to trick early buyers. Then, between 8:30 AM and 11:00 AM New York Time, they Distribute. This is the Killzone.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>The big banks don't play the game all day long. They have a strict schedule. We call this schedule <strong>AMD</strong>.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">A.M.D.</h4>
          <p><strong>A - Accumulation (Night time):</strong> They do nothing. Price goes sideways.</p>
          <p><strong>M - Manipulation (Early Morning):</strong> They drop the price to trick regular people into selling, and to sweep the coins (Liquidity).</p>
          <p><strong>D - Distribution (New York Morning):</strong> They buy up everything and shoot the price to the moon.</p>
        </div>

        <p>Because of this schedule, you are only allowed to trade during the <strong>New York AM Killzone (08:30 AM to 11:00 AM EST)</strong>.</p>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: THE DAILY SCHEDULE (AMD)</div>
          <svg viewBox="0 0 600 250" className="w-full max-w-2xl h-auto font-sans">
            <rect x="50" y="20" width="150" height="210" fill="#1e293b" fillOpacity="0.5" />
            <text x="125" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">Night (Accumulation)</text>
            
            <rect x="200" y="20" width="150" height="210" fill="#7f1d1d" fillOpacity="0.2" />
            <text x="275" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">Morning (Manipulation)</text>

            <rect x="350" y="20" width="150" height="210" fill="#14532d" fillOpacity="0.2" />
            <text x="425" y="40" fill="#94a3b8" fontSize="12" textAnchor="middle">08:30 Killzone (Distribution)</text>
            
            <Candle x={70} o={120} c={110} h={100} l={130} />
            <Candle x={100} o={110} c={130} h={105} l={140} />
            <Candle x={130} o={130} c={115} h={100} l={140} />
            <Candle x={160} o={115} c={125} h={110} l={130} />
            
            <Candle x={210} o={125} c={160} h={120} l={170} />
            <Candle x={240} o={160} c={190} h={150} l={200} />
            <Candle x={270} o={190} c={220} h={180} l={230} />
            <text x="220" y="240" fill="#ef4444" fontSize="11" fontWeight="bold">The Trick Drop</text>
            
            <Candle x={360} o={220} c={150} h={140} l={230} />
            <Candle x={390} o={150} c={90} h={80} l={160} />
            <Candle x={420} o={90} c={50} h={40} l={100} />
          </svg>
        </div>
      </div>
    )
  },
  {
    id: "ep6",
    title: "Episode 6: Buying on Sale (Discount & OTE)",
    videoUrl: "https://www.youtube.com/watch?v=wXwG_uM4Q3k&t=300s",
    rawText: "Imagine you want to buy a pair of shoes. Do you buy them when they are super expensive (Premium) or when they go on sale (Discount)? The algorithm does the same thing. You draw a line from the bottom of the Stomp to the top of the Stomp. Cut it in half. The top half is Premium, the bottom half is Discount. Never buy in the Premium half. Always wait for price to come down into the Discount half. Specifically, we like to buy when it's 62% to 79% off. We call this Optimal Trade Entry.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>Imagine you want to buy a pair of expensive shoes. Do you buy them at full price (Premium), or do you wait for a big sale (Discount)?</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">Never pay retail price.</h4>
          <p>You draw a tool (called Fibonacci) from the bottom of the Stomp to the top of the Stomp, and cut it exactly in half.</p>
          <ul className="list-disc pl-8 mt-2 space-y-2 text-white">
            <li>The top half is <strong>Premium</strong> (Expensive). NEVER buy here.</li>
            <li>The bottom half is <strong>Discount</strong> (On Sale). ONLY buy here.</li>
          </ul>
        </div>

        <p>We specifically want to buy when the price drops to <strong>62% or 79% off</strong>. We call this the <strong>Optimal Trade Entry (OTE)</strong>.</p>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: OPTIMAL TRADE ENTRY (BUYING ON SALE)</div>
          <svg viewBox="0 0 600 300" className="w-full max-w-2xl h-auto font-sans">
            <rect x="150" y="200" width="300" height="40" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1" />
            <line x1="100" y1="200" x2="500" y2="200" stroke="#60a5fa" strokeWidth="1" />
            <text x="100" y="195" fill="#60a5fa" fontSize="10">62% Off</text>
            <line x1="100" y1="220" x2="500" y2="220" stroke="#3b82f6" strokeWidth="2" />
            <text x="100" y="215" fill="#3b82f6" fontSize="10" fontWeight="bold">70.5% (The Sweet Spot)</text>
            <line x1="100" y1="240" x2="500" y2="240" stroke="#60a5fa" strokeWidth="1" />
            <text x="100" y="235" fill="#60a5fa" fontSize="10">79% Off</text>

            <Candle x={180} o={280} c={180} h={170} l={290} />
            <Candle x={210} o={180} c={80} h={70} l={190} />
            <Candle x={240} o={80} c={30} h={20} l={90} />
            
            <Candle x={270} o={30} c={100} h={20} l={110} />
            <Candle x={300} o={100} c={170} h={90} l={180} />
            <Candle x={330} o={170} c={220} h={160} l={230} /> 
            <Candle x={360} o={220} c={140} h={130} l={230} /> 
            
            <text x={375} y={225} fill="#bfdbfe" fontSize="14" fontWeight="bold">Buy! It's 70% off!</text>
          </svg>
        </div>
      </div>
    )
  },
  {
    id: "ep7",
    title: "Episode 7: Protecting Your Money (Risk)",
    videoUrl: "https://www.youtube.com/watch?v=CnTXwAuDi9Y&t=120s",
    rawText: "None of this matters if you lose all your money on one bad trade. You must act like a casino, not a gambler. A casino knows they will lose some hands, but the math guarantees they win in the end. Never risk more than 1% of your account on a single trade. When you enter the Gap, put your protective Stop Loss right below the bottom of the Stomp. If the algorithm breaks the bottom of the stomp, your idea was wrong, and you happily take your tiny 1% loss and wait for the next day.",
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>None of this matters if you lose all your money on one bad trade.</p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-red-500/50">
          <h4 className="text-xl font-bold text-white mb-2">Act like the Casino, not the Gambler.</h4>
          <p>A casino knows they will lose some hands, but the math guarantees they win in the end because they control the risk.</p>
          <ul className="list-disc pl-8 mt-2 space-y-2 text-white">
            <li><strong>NEVER</strong> risk more than 1% of your account on a single trade.</li>
            <li>If you have $1000, you only risk $10.</li>
          </ul>
        </div>

        <p>When you enter the hole (FVG), put your protective Stop Loss right below the bottom of the Stomp. If the price breaks the bottom of the stomp, your idea was wrong. You happily take your tiny 1% loss and walk away to play again tomorrow.</p>

        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 w-full flex flex-col items-center my-6 shadow-inner">
          <div className="text-xs text-indigo-400 font-bold font-mono tracking-widest mb-4">VISUAL: PROTECTING YOUR MONEY</div>
          <svg viewBox="0 0 600 200" className="w-full max-w-2xl h-auto font-sans">
            <rect x="250" y="80" width="100" height="40" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" />
            <text x="360" y="105" fill="#a5b4fc" fontSize="14" fontWeight="bold">Buy Here (FVG)</text>

            <line x1="50" y1="180" x2="550" y2="180" stroke="#ef4444" strokeWidth="3" />
            <text x="50" y="170" fill="#ef4444" fontSize="14" fontWeight="bold">STOP LOSS (Max 1% Risk)</text>

            <Candle x={200} o={180} c={80} h={70} l={190} /> 
            <Candle x={250} o={80} c={40} h={30} l={90} /> 
            <Candle x={300} o={40} c={100} h={30} l={110} /> 
          </svg>
        </div>
      </div>
    )
  },
  ...Array.from({ length: 34 }, (_, i) => ({
    id: `ep${i + 8}`,
    title: `Episode ${i + 8}: Advanced ICT Theory ${i + 8}`,
    videoUrl: "https://www.youtube.com/@InnerCircleTrader",
    rawText: `This is Episode ${i + 8} of the ICT Mentorship. Remember to combine the Sweep, the Stomp, and the Gap with the 200 SMA river.`,
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <p>Welcome to Episode {i + 8}. In this lesson, we continue building our institutional playbook.</p>
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">The Golden Rule</h4>
          <p>Remember: We never trade blindly. We wait for the sweep, the stomp, and the hole. We always check the 200 SMA river to make sure we are swimming with the current.</p>
        </div>
        <p>As you progress through these advanced episodes, you will learn to read the tape exactly like the big banks do.</p>
      </div>
    )
  }))
];

export function MainLayout() {
  const [activeTab, setActiveTab] = useState(1);
  const [user, setUser] = useState(null);
  
  // Initialize user listener
  useEffect(() => {
    try {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    } catch (e) { console.warn("Auth not init"); }
  }, []);

  const baseTabs = [
    { id: 1, name: '1. Masterclass' },
    { id: 2, name: '2. Velez Bridge' },
    { id: 3, name: '3. Practice Chart' },
    { id: 4, name: '4. NY Playbook' },
    { id: 5, name: '5. Flashcards' },
    { id: 6, name: '6. Mastery Quiz' },
    { id: 7, name: '7. AI Auditor' },
    { id: 8, name: '8. Terms' },
    { id: 9, name: '9. Mentor Hub' },
    { id: 10, name: '10. Progress' },
    { id: 11, name: '11. Trading Desk' }
  ];

  const tabs = user ? [...baseTabs, { id: 12, name: '12. Account' }] : baseTabs;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold">ICT</div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">ICT & Velez Masterclass</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Interactive Step-by-Step Curriculum (41 Episodes)</p>
        </div>
        <button onClick={() => setActiveTab(12)} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold border border-slate-700 transition">
          {user ? "Account" : "Sign In"}
        </button>
      </header>

      {/* FULL NAVIGATION MENU */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex space-x-2 overflow-x-auto sticky top-0 z-50">
        {tabs.map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      {/* Rest of the app body rendering... */}
    </div>
  );
}
