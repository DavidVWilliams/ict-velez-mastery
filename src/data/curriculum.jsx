import React from 'react';
import { 
  LiquiditySweepVisual, 
  MSSVisual, 
  FVGVisual, 
  SMAVisual, 
  PO3Visual, 
  MatrixVisual, 
  BreakerVisual, 
  SMTVisual 
} from '../assets/svgs';

const renderVisual = (type) => {
  switch(type) {
    case "Liquidity": return <LiquiditySweepVisual />;
    case "MSS": return <MSSVisual />;
    case "FVG": return <FVGVisual />;
    case "SMA": return <SMAVisual />;
    case "PO3": return <PO3Visual />;
    case "Matrix": return <MatrixVisual />;
    case "Breaker": return <BreakerVisual />;
    case "SMT": return <SMTVisual />;
    default: return <FVGVisual />;
  }
};

export const lessonDatabase = {
  1: { title: "Episode 1: Liquidity & Order Pairing", heading: "The Counter-Party Requirement", p1: "Large banks need a vast pool of willing sellers.", bullets: ["BSL: Above old highs", "SSL: Below old lows"], executionTitle: "How to Map:", executionSteps: ["Mark major peaks/valleys", "Label BSL/SSL"], visualType: "Liquidity", homework: "Mark 3 BSL/SSL levels." },
  2: { title: "Episode 2: Institutional Displacement (MSS)", heading: "Displacement & Market Structure", p1: "We look for a Market Structure Shift breaking an Intermediate-Term High/Low.", bullets: ["Energy > Wicks", "Must close past swing"], executionTitle: "Identify MSS:", executionSteps: ["Wait for sweep", "Look for energetic reversal"], visualType: "MSS", homework: "Locate sweep + MSS." },
  3: { title: "Episode 3: Price Inefficiencies (FVG)", heading: "Imbalance-Rebalance Loop", p1: "A vacuum of unfulfilled orders.", bullets: ["3-candle sequence", "No wick overlap"], executionTitle: "How to Draw:", executionSteps: ["Find displacement", "Box between Candle 1 & 3"], visualType: "FVG", homework: "Find 3 FVGs." },
  4: { title: "Episode 4: The Velez Macro Baseline (200 SMA)", heading: "The Velez Macro Baseline", p1: "200 SMA acts as trend filter. Never use EMA.", bullets: ["Ascending = Longs only", "Descending = Shorts only"], executionTitle: "How to Apply:", executionSteps: ["Add 200 SMA", "Check slope before entry"], visualType: "SMA", homework: "Check SMA slope vs FVG." },
  5: { title: "Episode 5: Time Cycles (AMD & Killzones)", heading: "Power of 3 & Judas Swing", p1: "Algorithms follow Accumulation, Manipulation, Distribution.", bullets: ["Accumulation = Baseline", "Manipulation = Judas Swing", "Distribution = Expansion"], executionTitle: "Track Power of 3:", executionSteps: ["Mark Midnight Open", "Look for Judas Swing sweep"], visualType: "PO3", homework: "Measure Judas Swing distance." },
  6: { title: "Episode 6: Wholesale vs. Retail", heading: "Discount/Premium Matrix", p1: "Bisect price to find wholesale value.", bullets: ["Premium = Selling", "Discount = Buying"], executionTitle: "Use Fibs:", executionSteps: ["Fib high to low", "Only buy in Discount"], visualType: "Matrix", homework: "Mark 50% Equilibrium." },
  7: { title: "Episode 7: Capital Preservation", heading: "Systematic Risk Management", p1: "Survival is defined by the 1% Rule.", bullets: ["1% max risk", "Halve risk after losses"], executionTitle: "Calculate Risk:", executionSteps: ["Balance * 0.01", "Size position for $ loss"], visualType: "PO3", homework: "Calculate position size for 1% risk." },
  8: { title: "Episode 8: Institutional Sponsorship", heading: "HTF Draw on Liquidity", p1: "Identify the macro target.", bullets: ["Weekly target first", "Sponsorship = HTF defense"], executionTitle: "Find Draw:", executionSteps: ["Open Daily", "Mark un-swept highs"], visualType: "Liquidity", homework: "Mark Daily draw on liquidity." },
  9: { title: "Episode 9: Power of 3 Deep Dive", heading: "Opening Range Math", p1: "Relationship between Midnight and 08:30 EST.", bullets: ["Bearish = Sweep above open", "Bullish = Sweep below"], executionTitle: "Project Targets:", executionSteps: ["Measure swing", "Project range"], visualType: "PO3", homework: "Project target." },
  10: { title: "Episode 10: New York AM Killzone", heading: "News Smoke Screen", p1: "08:30-11:00 EST volatility.", bullets: ["Avoid 8:30 spike", "Wait for reversal"], executionTitle: "Trade AM:", executionSteps: ["Wait for news sweep", "Enter FVG reversal"], visualType: "MSS", homework: "Mark news trap." },
  11: { title: "Episode 11: PM Session Killzone", heading: "PM Distribution", p1: "13:30-16:00 EST secondary expansion.", bullets: ["No new positions 12-1pm", "Continue AM trend"], executionTitle: "Trade PM:", executionSteps: ["Wait for 1:30 breakout", "Entry off FVG"], visualType: "PO3", homework: "Mark PM setup." },
  12: { title: "Episode 12: Advanced Structure", heading: "Hierarchy of Swings", p1: "LTH, ITH, STH categorization.", bullets: ["ITH = Higher high flanked by lower highs"], executionTitle: "Find ITH:", executionSteps: ["Identify peaks", "Verify lower neighbors"], visualType: "MSS", homework: "Label ITH." },
  13: { title: "Episode 13: IPDA Lookbacks", heading: "Internal vs External", p1: "Price moves from Internal (FVG) to External (Liquidity).", bullets: ["Sweep external = target internal"], executionTitle: "Trade Internal:", executionSteps: ["Identify range", "Target FVG after sweep"], visualType: "Liquidity", homework: "Track flow." },
  14: { title: "Episode 14: Macro Timeframes", heading: "Parent Timeframe", p1: "Intraday setups are subordinate to Daily.", bullets: ["Define bias first", "Filter against Daily"], executionTitle: "Daily Bias:", executionSteps: ["Check Daily", "Ignore conflicting trades"], visualType: "Liquidity", homework: "Check Daily bias." },
  15: { title: "Episode 15: Interest Rate Yields", heading: "Risk-On/Off", p1: "TNX correlation.", bullets: ["TNX up = Equities down"], executionTitle: "Confirm Bias:", executionSteps: ["Check TNX slope", "Align with equities"], visualType: "SMT", homework: "Chart TNX vs ES." },
  16: { title: "Episode 16: Intermarket Analysis", heading: "SMT Divergence", p1: "Cracked correlation confirmation.", bullets: ["ES vs NQ divergence"], executionTitle: "Spot SMT:", executionSteps: ["Check lows of ES/NQ", "Buy stronger asset"], visualType: "SMT", homework: "Mark SMT divergence." },
  17: { title: "Episode 17: Top Down Analysis", heading: "Execution Pipeline", p1: "HTF array -> LTF entry.", bullets: ["Weekly/Daily Draw", "1H PD Array", "1m Entry"], executionTitle: "Build Pipeline:", executionSteps: ["Map levels", "Wait for price to reach"], visualType: "FVG", homework: "Create top-down map." },
  18: { title: "Episode 18: Weekly Profile", heading: "Friday MOC", p1: "Position squaring before weekend.", bullets: ["15:50-16:00 EST", "Retrace trend"], executionTitle: "Trade MOC:", executionSteps: ["Observe weekly bias", "Scalp counter-trend"], visualType: "PO3", homework: "Review Friday close." },
  19: { title: "Episode 19: Daily Profile", heading: "Consolidation Hurdles", p1: "Filter continuous expansion.", bullets: ["Inside yesterday range = Chop"], executionTitle: "Trade Consolidation:", executionSteps: ["Mark prev day", "Target mid-range"], visualType: "Matrix", homework: "Find chop day." },
  20: { title: "Episode 20: London Open", heading: "London Killzone", p1: "Forms the daily extreme.", bullets: ["02:00-05:00 EST"], executionTitle: "Trade NY based on London:", executionSteps: ["Check London extreme", "Trade continuation"], visualType: "PO3", homework: "Find London extreme." },
  21: { title: "Episode 21: Tape Reading", heading: "Institutional Flow", p1: "Observe reaction to arrays.", bullets: ["Slice through = Strong", "Respect/Reverse = Weak"], executionTitle: "Tape Read:", executionSteps: ["Monitor FVG encounter", "Close if weak"], visualType: "FVG", homework: "Log array reaction." },
  22: { title: "Episode 22: Identifying Traps", heading: "Retail Trap", p1: "News spike = Liquidity trap.", bullets: ["Trendline break = Bait"], executionTitle: "Avoid Breakouts:", executionSteps: ["Wait for trap spike", "Fade the move"], visualType: "Liquidity", homework: "Mark trap." },
  23: { title: "Episode 23: Reversals vs Retracements", heading: "Validating Shift", p1: "One-sided delivery vs wick.", bullets: ["Wick = Stop run", "Body = Reversal"], executionTitle: "Check Candle:", executionSteps: ["Verify close", "Check FVG"], visualType: "MSS", homework: "Label shift." },
  24: { title: "Episode 24: Breaker Blocks", heading: "Failed Arrays", p1: "Failed OB becomes Breaker.", bullets: ["High, LL, HH pattern"], executionTitle: "Trade Breaker:", executionSteps: ["Mark up-close candle", "Retest"], visualType: "Breaker", homework: "Mark Breaker." },
  25: { title: "Episode 25: Mitigation Blocks", heading: "Failure Swings", p1: "Mitigation lacks stop run.", bullets: ["Failure to sweep"], executionTitle: "Trade Mitigation:", executionSteps: ["Mark down-close candle", "Retest"], visualType: "Breaker", homework: "Mark Mitigation." },
  26: { title: "Episode 26: Rejection Blocks", heading: "Wick Extremes", p1: "Accumulation inside wicks.", bullets: ["Body before wick"], executionTitle: "Trade Rejection:", executionSteps: ["Mark body line", "Wait for tap"], visualType: "Liquidity", homework: "Mark rejection block." },
  27: { title: "Episode 27: Vacuum Blocks", heading: "Opening Gaps", p1: "Absence of trading.", bullets: ["Sunday Open", "Magnetic fill"], executionTitle: "Trade Vacuum:", executionSteps: ["Fill gap box", "Target for profit"], visualType: "FVG", homework: "Mark Sunday gap." },
  28: { title: "Episode 28: Order Block Theory", heading: "Validating OBs", p1: "Must have FVG and MSS.", bullets: ["HTF draw aligned"], executionTitle: "Validate OB:", executionSteps: ["Check FVG/MSS", "Box OB"], visualType: "MSS", homework: "Mark valid OB." },
  29: { title: "Episode 29: Fair Value Gaps Deep Dive", heading: "Re-delivery Sequence", p1: "Closing inefficiency.", bullets: ["BISI/SIBI", "CE = 50%"], executionTitle: "Trade FVG:", executionSteps: ["Draw box", "Limit order at 50%"], visualType: "FVG", homework: "Mark 50% CE." },
  30: { title: "Episode 30: Liquidity Voids", heading: "Macro Inefficiencies", p1: "Multi-candle displacement.", bullets: ["No structural support"], executionTitle: "Trade Void:", executionSteps: ["Waterfall anticipation", "Wait for OB"], visualType: "FVG", homework: "Mark void." },
  31: { title: "Episode 31: Liquidity Pools", heading: "Engineering Pools", p1: "Weaponized support/resistance.", bullets: ["Equal Highs/Lows"], executionTitle: "Target Pools:", executionSteps: ["Spot retail pattern", "Set target"], visualType: "Liquidity", homework: "Mark double top." },
  32: { title: "Episode 32: Stop Runs", heading: "Manipulation Phase", p1: "Mechanical execution.", bullets: ["Wick through level"], executionTitle: "Identify Run:", executionSteps: ["Mark Asian extreme", "Fade run"], visualType: "Liquidity", homework: "Mark stop run." },
  33: { title: "Episode 33: Equilibrium & Discount", heading: "50% Rule", p1: "Boundary enforcement.", bullets: ["Only buy in discount", "Only sell in premium"], executionTitle: "Enforce Rule:", executionSteps: ["Fib range", "Check zone"], visualType: "Matrix", homework: "Mark discount." },
  34: { title: "Episode 34: Premium Arrays", heading: "Premium Selling", p1: "Inverted logic.", bullets: ["Sell in premium"], executionTitle: "Enforce Premium:", executionSteps: ["Fib high to low", "Short only above 50%"], visualType: "Matrix", homework: "Mark premium." },
  35: { title: "Episode 35: Risk Management", heading: "50/75 Protocol", p1: "Stop management.", bullets: ["Reduce risk at 50%", "Break-even at 75%"], executionTitle: "Move Stops:", executionSteps: ["Calculate targets", "Adjust stop"], visualType: "PO3", homework: "Practice stop moves." },
  36: { title: "Episode 36: Psychology", heading: "Professional Loser", p1: "Drawdown management.", bullets: ["Business tax", "Halve risk"], executionTitle: "Halve Risk:", executionSteps: ["Lose 1% -> Risk 0.5%", "Don't increase"], visualType: "PO3", homework: "Post-it note rules." },
  37: { title: "Episode 37: Journaling", heading: "Technical Self-Talk", p1: "Data collection.", bullets: ["Chart annotations", "No emotional venting"], executionTitle: "Annotate:", executionSteps: ["Screenshot", "Technical text box"], visualType: "FVG", homework: "Screenshot 3 trade logs." },
  38: { title: "Episode 38: Prop Firm Funding", heading: "The 12-Month Path", p1: "Capital preservation.", bullets: ["Backtest", "Paper trade", "Live"], executionTitle: "Plan Evaluation:", executionSteps: ["Daily loss limit", "Base hits"], visualType: "PO3", homework: "Write evaluation rules." },
  39: { title: "Episode 39: Building Your Model", heading: "Master Execution Algorithm", p1: "Synthesize protocol.", bullets: ["Bias", "Time", "Trigger", "Safety"], executionTitle: "4-Step Model:", executionSteps: ["Check bias", "Wait 8:30", "MSS", "SMA"], visualType: "SMA", homework: "Create checklist." },
  40: { title: "Episode 40: Execution & Consistency", heading: "Absolute Neutrality", p1: "Stand down in chop.", bullets: ["60s decision rule"], executionTitle: "Practice Neutrality:", executionSteps: ["If unclear -> Close", "Walk away"], visualType: "PO3", homework: "Close chop chart." },
  41: { title: "Episode 41: The Final Review", heading: "2022 Model Synthesis", p1: "Predictable expansion.", bullets: ["Respect PO3", "Wait for Killzone", "Demand FVG", "Manage Risk"], executionTitle: "Finalize:", executionSteps: ["Review Plan", "Demo 6mo"], visualType: "Matrix", homework: "Complete Blueprint." }
};

export const courseData = Object.keys(lessonDatabase).map((key) => {
  const epNum = parseInt(key);
  const data = lessonDatabase[key];
  return {
    id: `ep${epNum}`,
    title: data.title,
    videoUrl: "https://www.youtube.com/playlist?list=PLVgHx4Z63paYiFGQ56PjTF1PGePL3r69s",
    homework: data.homework,
    content: (
      <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
        <div className="bg-slate-800 p-6 rounded-xl border border-indigo-500/50">
          <h4 className="text-xl font-bold text-white mb-2">{data.heading}</h4>
          <p>{data.p1}</p>
          <ul className="list-disc pl-8 mt-3 space-y-2 font-medium text-white">
            {data.bullets.map((bullet, i) => (<li key={i}>{bullet}</li>))}
          </ul>
        </div>
        {renderVisual(data.visualType)}
        <div className="bg-slate-900 p-6 rounded-xl border border-emerald-500/30">
          <h4 className="text-lg font-bold text-emerald-400 mb-3">{data.executionTitle}</h4>
          <ol className="list-decimal pl-6 space-y-3 text-slate-300 text-base">
            {data.executionSteps.map((step, idx) => (<li key={idx} className="pl-2">{step}</li>))}
          </ol>
        </div>
      </div>
    )
  };
});
