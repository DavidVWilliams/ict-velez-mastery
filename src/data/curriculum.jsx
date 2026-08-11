import React from 'react';

export const courseData = [
  {
    id: 'ep1',
    title: 'Episode 1: Liquidity & Order Pairing Mechanics',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Algorithmic Delivery & Stop-Loss Harvest</h3>
          <p className="text-slate-300">Interbank algorithms (IPDA) do not search for retail chart patterns. They are programmed to seek massive pools of resting liquidity to execute block orders without slippage. Institutional sponsors require retail traders to act as involuntary counterparties by clustering stop-losses at predictable boundaries.</p>
        </div>
        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700">
          <h4 className="text-lg font-bold text-indigo-400 mb-4">Institutional Mapping Protocol</h4>
          <ul className="space-y-4 text-slate-300">
            <li><strong className="text-white">Buy Side Liquidity (BSL):</strong> Clustered buy-stop orders sitting above Equal Highs (EQH), session highs, and structural peaks. Used by smart money to offload long positions or accumulate shorts.</li>
            <li><strong className="text-white">Sell Side Liquidity (SSL):</strong> Clustered sell-stop orders sitting below Equal Lows (EQL), session lows, and structural floors. Used to offload shorts or accumulate longs.</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xl font-bold text-white mb-3">The Retail Trap</h4>
          <p className="text-slate-300">When price aggressively taps BSL, retail assumes a breakout. IPDA leverages this momentum to absorb those buy orders with institutional shorts, immediately triggering a reversal.</p>
        </div>
      </div>
    ),
    homework: [
      "Open a Daily chart and manually box 5 instances of untouched Equal Highs (BSL) and Equal Lows (SSL).",
      "Drop to the 15M timeframe. Locate 3 historical sweeps of liquidity that resulted in an immediate reversal.",
      "Log these examples in your journal, noting the exact Killzone time."
    ]
  },
  {
    id: 'ep2',
    title: 'Episode 2: Institutional Displacement & MSS',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">True Displacement vs. False Breaks</h3>
          <p className="text-slate-300">A Market Structure Shift (MSS) is only valid if backed by institutional displacement. A wick breaking a structural pivot is a liquidity sweep, not a shift. True displacement requires high-momentum, large-bodied candles that close definitively past the pivot, leaving a Fair Value Gap.</p>
        </div>
        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700">
          <h4 className="text-lg font-bold text-indigo-400 mb-4">The MSS Execution Checklist</h4>
          <ul className="space-y-4 text-slate-300">
            <li><strong className="text-white">Prerequisite:</strong> Price must have just swept a major BSL or SSL pool.</li>
            <li><strong className="text-white">The Pivot:</strong> Identify the immediate internal swing high/low that led to the sweep.</li>
            <li><strong className="text-white">The Break:</strong> The displacement candle must close its BODY beyond the pivot.</li>
          </ul>
        </div>
      </div>
    ),
    homework: [
      "Identify 5 clean Market Structure Shifts on a 5-minute chart that left a valid FVG.",
      "Identify 3 false breaks (wicks only) that trapped retail breakout traders.",
      "Overlay the Velez 200 SMA and confirm if the true MSS aligned with the slope."
    ]
  },
  {
    id: 'ep3',
    title: 'Episode 3: Fair Value Gaps (FVG) & Imbalance Re-delivery',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Anatomy of an Imbalance</h3>
          <p className="text-slate-300">An FVG is a 3-candle sequence where rapid algorithmic pricing leaves a gap between the wick of Candle 1 and the wick of Candle 3. This represents a vacuum of liquidity that the algorithm must eventually revisit to balance the books.</p>
        </div>
        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700">
          <h4 className="text-lg font-bold text-indigo-400 mb-4">Consequent Encroachment (CE)</h4>
          <p className="text-slate-300">CE is the exact 50% midpoint of the FVG. While aggressive entries can be taken at the gap's open, the highest probability entry for institutional re-delivery is exactly at the 50% CE level.</p>
        </div>
      </div>
    ),
    homework: [
      "Find 10 bullish FVGs and 10 bearish FVGs on a 15M chart.",
      "Draw a Fibonacci retracement tool from the top to the bottom of the gap to mark the 50% CE.",
      "Document how many times price rejected exactly off the CE versus closing completely through it."
    ]
  },
  {
    id: 'ep4',
    title: 'Episode 4: The Oliver Velez Macro Baseline (200 SMA Filter)',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">The Line of Truth</h3>
          <p className="text-slate-300">While ICT concepts provide surgical entries, the Oliver Velez 200 SMA provides the macro directional bias. The 200 SMA is the ultimate filter against trading in chop or fighting institutional macro trends.</p>
        </div>
        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700">
          <h4 className="text-lg font-bold text-indigo-400 mb-4">The Binary Rule of 200</h4>
          <ul className="space-y-4 text-slate-300">
            <li><strong className="text-white">Uptrend (Price above rising 200):</strong> Execute ONLY long FVGs and bullish MSS setups. Ignore all short setups.</li>
            <li><strong className="text-white">Downtrend (Price below falling 200):</strong> Execute ONLY short FVGs and bearish MSS setups. Ignore all long setups.</li>
          </ul>
        </div>
      </div>
    ),
    homework: [
      "Load the 200 SMA on your chart.",
      "Backtest 20 ICT setups that aligned with the 200 SMA slope, and 20 that fought it.",
      "Calculate the win rate difference between the two environments."
    ]
  },
  {
    id: 'ep5',
    title: 'Episode 5: Time Cycles (AMD & Killzones)',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Accumulation, Manipulation, Distribution</h3>
          <p className="text-slate-300">Price is fractal, and every session follows the AMD cycle. Asian session accumulates orders in a tight range. London manipulates price to sweep Asian liquidity (the Judas Swing). New York distributes price in the true daily direction.</p>
        </div>
      </div>
    ),
    homework: [
      "Draw vertical lines marking 20:00 - 00:00 EST (Asia), 02:00 - 05:00 EST (London), and 07:00 - 10:00 EST (NY) on your chart for the last 5 days.",
      "Identify the AMD profile for each day.",
      "Locate the London 'Judas Swing' manipulation in each cycle."
    ]
  },
  {
    id: 'ep6',
    title: 'Episode 6: Wholesale vs. Retail (Premium & Discount Matrix)',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">The Dealing Range</h3>
          <p className="text-slate-300">Institutions only buy at wholesale (Discount) and sell at retail (Premium). By measuring the dealing range from the most recent structural high to low, you map the institutional matrix.</p>
        </div>
      </div>
    ),
    homework: [
      "Use the Fib tool (0, 0.5, 1) on the last 10 dealing ranges.",
      "Mark all FVGs. Discard any long FVGs in Premium, and discard any short FVGs in Discount.",
      "Observe how often price seeks the equilibrium (0.5) before expanding."
    ]
  },
  {
    id: 'ep7',
    title: 'Episode 7: Capital Preservation & Risk Parameters',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">The 1% Mandate</h3>
          <p className="text-slate-300">Mastery is not about making money; it is about keeping it. Your system is void if your risk profile allows for emotional drawdowns.</p>
        </div>
        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700">
          <h4 className="text-lg font-bold text-indigo-400 mb-4">Hard Rules</h4>
          <ul className="space-y-4 text-slate-300">
            <li>Never risk more than 1% of total account equity per trade.</li>
            <li>Stop loss must sit beyond the structural pivot (ITH/LTH) that created the MSS.</li>
            <li>Take 50% partials at 2R, and let the runner seek the HTF liquidity draw.</li>
          </ul>
        </div>
      </div>
    ),
    homework: [
      "Calculate your exact lot size for a 1% risk on a $50k account with a 15-pip stop.",
      "Review your last 10 trades and calculate what your PnL would be if you strictly applied the 50% partial at 2R rule."
    ]
  },
  {
    id: 'ep8',
    title: 'Episode 8: Institutional Sponsorship & HTF Draw on Liquidity',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">The HTF Magnet</h3>
          <p className="text-slate-300">Lower timeframe patterns are noise unless they are magnetically pulled toward a Higher Timeframe (4H or Daily) Draw on Liquidity (DOL). You must know where the weekly algorithm is reaching before you take a 5M trade.</p>
        </div>
      </div>
    ),
    homework: [
      "Map the Daily DOL for the current week on EURUSD or NQ.",
      "Monitor how LTF setups inside the Killzones exclusively deliver price toward that Daily DOL."
    ]
  },
  {
    id: 'ep9',
    title: 'Episode 9: Power of 3 Deep Dive & Opening Range Math',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">O-H-L-C Dynamics</h3>
          <p className="text-slate-300">The Power of 3 defines the Open, High, Low, and Close of the daily candle. On a bullish day, the algorithm opens, manipulates down to create the Low of Day (LOD) in a Discount array, expands up to the High of Day (HOD), and closes near the highs.</p>
        </div>
      </div>
    ),
    homework: [
      "Analyze the last 5 bullish daily candles.",
      "Drop to the 15M chart and find the exact time the LOD was formed. Did it occur during London or NY AM?"
    ]
  },
  {
    id: 'ep10',
    title: 'Episode 10: New York AM Killzone Execution',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">The 07:00 to 10:00 Window</h3>
          <p className="text-slate-300">The NY AM Killzone provides the highest volume institutional injections. This window typically creates the true continuation of the London trend, or a violent reversal if London met a HTF POI.</p>
        </div>
      </div>
    ),
    homework: [
      "Backtest 1 month of price data specifically between 07:00 and 10:00 EST.",
      "Identify how often the NY AM session creates an MSS and FVG entry that aligns with the 200 SMA."
    ]
  },
  {
    id: 'ep11',
    title: 'Episode 11: PM Session Killzone Continuation & Reversals',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">The 13:30 Algorithmic Reset</h3>
          <p className="text-slate-300">Following the NY lunch lull, algorithms reset at 13:30 EST. The PM session will either provide a late-day continuation of the AM trend, or a brutal reversal if the AM session achieved the Daily Draw on Liquidity.</p>
        </div>
      </div>
    ),
    homework: [
      "Review PM sessions (13:30 - 16:00 EST) for the past two weeks.",
      "Note the behavior of price at exactly 13:30 when the macro injection occurs."
    ]
  },
  {
    id: 'ep12',
    title: 'Episode 12: Advanced Market Structure & Swing Points',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Intermediate Term Highs/Lows</h3>
          <p className="text-slate-300">Not all swing highs are created equal. An Intermediate Term High (ITH) is a swing high that has a lower short-term high to its left and right. These are the true structural bastions protected by smart money.</p>
        </div>
      </div>
    ),
    homework: [
      "Map out Short Term Highs (STH), Intermediate Term Highs (ITH), and Long Term Highs (LTH) on a 1H chart.",
      "Observe how STHs are frequently swept, while ITHs hold the trend intact."
    ]
  },
  {
    id: 'ep13',
    title: 'Episode 13: IPDA Lookbacks & Internal vs External Liquidity',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">The Liquidity Pendulum</h3>
          <p className="text-slate-300">The IPDA algorithm strictly bounces between two objectives: External Liquidity (sweeping old highs/lows) and Internal Liquidity (returning to FVGs). Once external is taken, the draw becomes internal. Once internal is balanced, the draw becomes external.</p>
        </div>
      </div>
    ),
    homework: [
      "Track the pendulum on a 15M chart. Highlight when price sweeps an old high (External), and then immediately targets an FVG (Internal) in the opposite direction."
    ]
  },
  {
    id: 'ep14',
    title: 'Episode 14: Macro Timeframes & Parent/Child Trend Alignment',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Timeframe Fractalization</h3>
          <p className="text-slate-300">The 4H chart dictates the structure (Parent), the 15M chart dictates the narrative, and the 1M chart dictates the execution (Child). You cannot trade the 1M effectively if you are ignorant to the 4H Order Block.</p>
        </div>
      </div>
    ),
    homework: [
      "Find a 4H Order Block.",
      "Drop to the 1M chart when price taps that 4H OB, and execute the standard MSS/FVG setup. Note the precision."
    ]
  },
  {
    id: 'ep15',
    title: 'Episode 15: Interest Rate Yields & Intermarket Analysis (SMT)',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Smart Money Technique (SMT)</h3>
          <p className="text-slate-300">Correlated assets (like ES and NQ, or EURUSD and GBPUSD) should move in tandem. When one asset makes a lower low, but the correlated asset fails to make a lower low, you have an SMT Divergence. This reveals heavy institutional accumulation.</p>
        </div>
      </div>
    ),
    homework: [
      "Open ES and NQ side-by-side.",
      "Locate 3 instances of SMT divergence at a key Killzone. Watch the explosive move that follows."
    ]
  },
  {
    id: 'ep16',
    title: 'Episode 16: Intermarket Analysis & SMT Divergence Execution',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Weaponizing SMT</h3>
          <p className="text-slate-300">SMT is not an entry trigger on its own; it is an institutional footprint. Combine SMT Divergence with a Discount FVG during the NY Killzone for the highest probability setup in the curriculum.</p>
        </div>
      </div>
    ),
    homework: [
      "Backtest 10 setups where SMT occurred concurrently with a 200 SMA trend alignment."
    ]
  },
  {
    id: 'ep17',
    title: 'Episode 17: Top Down Analysis Pipeline',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Putting It All Together</h3>
          <p className="text-slate-300">The daily routine: 1. Identify Daily DOL. 2. Confirm 200 SMA slope on 15M. 3. Wait for Killzone. 4. Wait for AMD manipulation sweep. 5. Enter on 1M or 5M MSS + FVG.</p>
        </div>
      </div>
    ),
    homework: [
      "Build a physical checklist on your desk with these 5 steps. Do not take a trade for a week unless all 5 boxes are checked."
    ]
  },
  {
    id: 'ep18',
    title: 'Episode 18: Weekly Profile & Friday Close Math',
    youtubeUrl: 'https://youtube.com',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">The Weekly Range</h3>
          <p className="text-slate-300">In a classic Tuesday Low of Week profile, Monday consolidates, Tuesday sweeps lower to form the true low, Wednesday expands, Thursday continues, and Friday consolidates into the close. Understanding the day of the week dictates your profit targets.</p>
        </div>
      </div>
    ),
    homework: [
      "Review the Weekly OHLC profiles for the last month. Identify which days formed the Highs and Lows of the week."
    ]
  }
];
