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
  1: {
    title: "Episode 1: Liquidity & Order Pairing Mechanics",
    heading: "Algorithmic Delivery and Retail Stop-Loss Harvest Architecture",
    p1: "Interbank algorithms (IPDA) do not search for random chart patterns; they systematically seek pools of resting liquidity to execute massive block orders without creating catastrophic slippage. Institutional sponsors require retail market participants to act as involuntary counterparties by clustering stop-losses and breakout entries at predictable structural boundaries. Master traders must stop looking at price as random wave forms and start tracking it as an algorithmic magnet moving from one liquidity pool to the next.",
    bullets: [
      "Buy Side Liquidity (BSL): Clustered resting stop-loss orders of short sellers and breakout buy-stop orders sitting directly above equal highs (EQH), session highs, and weekly/monthly structural resistance peaks.",
      "Sell Side Liquidity (SSL): Clustered resting stop-loss orders of long buyers and breakout sell-stop orders sitting directly below equal lows (EQL), session lows, and structural support floors.",
      "Liquidity Voids: Extreme institutional imbalances characterized by fast, directional candle expansion where no counterparty orders were matched, leaving price magnets that algorithms must revisit."
    ],
    executionTitle: "Institutional Liquidity Mapping Protocol:",
    executionSteps: [
      "Step 1: Open your higher timeframe (HTF) charts (Daily and 4-Hour) and isolate every clear, unmitigated swing high and swing low where retail traders are guaranteed to place manual stop losses.",
      "Step 2: Identify relative Equal Highs (EQH) and Equal Lows (EQL) that have remained untouched for a minimum of 3 to 5 trading sessions, as these accumulate dense retail liquidity blocks.",
      "Step 3: Never enter a trade in the middle of a dealing range; wait for price to aggressively sweep an external liquidity pool (BSL or SSL) before anticipating an institutional reversal."
    ],
    visualType: "Liquidity",
    homework: "Open your futures execution platform (ES/NQ), mark 5 historical sessions, and map every single BSL and SSL pool with exact coordinate prices before validating how price reacted upon sweeping them."
  },
  2: {
    title: "Episode 2: Institutional Displacement & Market Structure Shifts (MSS)",
    heading: "Quantifying Smart Money Trend Inception",
    p1: "A Market Structure Shift (MSS) is the definitive fingerprint of institutional market entry. Unlike minor retail swing breaks that occur via wicks and low volume, an institutional MSS requires aggressive, high-velocity displacement candles whose bodies decisively close past a structural pivot point. This invalidates the minor micro-trend and forces trapped retail participants into instant liquidation, fueling the true institutional expansion leg.",
    bullets: [
      "Displacement Definition: Measured by candle bodies expanding to at least 2.5x the average true range (ATR) of preceding candles, closing firmly across structural pivot points.",
      "Bullish MSS Confirmation: Occurs when price sweeps Sell Side Liquidity (SSL) and immediately generates an impulsive up-close candle body closing above the nearest intermediate-term high (ITH).",
      "Bearish MSS Confirmation: Occurs when price sweeps Buy Side Liquidity (BSL) and generates an impulsive down-close candle body closing below the nearest intermediate-term low (ITH)."
    ],
    executionTitle: "Step-by-Step MSS Validation Checklist:",
    executionSteps: [
      "Step 1: Wait for price to execute a clean, aggressive sweep of an external liquidity pool (BSL or SSL).",
      "Step 2: Monitor the immediate candle reaction: look for rapid order flow acceleration and a decisive candle body close past the structural pivot (avoid wick-only breaks).",
      "Step 3: Verify that volume metrics (if using volume profile or footprint charts) expand significantly during the structural break to confirm institutional sponsorship."
    ],
    visualType: "MSS",
    homework: "Review 10 distinct session opens on a 5-minute chart. Identify every liquidity sweep, pinpoint the exact candle responsible for the MSS, and calculate the subsequent pip/point expansion."
  },
  3: {
    title: "Episode 3: Fair Value Gaps (FVG) & Imbalance Re-delivery",
    heading: "Algorithmic Vacuum Mapping and Consequent Encroachment (CE)",
    p1: "A Fair Value Gap (FVG) represents an absolute mathematical imbalance created when interbank algorithms inject aggressive volume into the market faster than opposing limit orders can match. Because price moves too rapidly, it leaves an un-rebalanced vacuum of price action. Algorithms are programmed to return to these imbalances to rebalance institutional portfolios before resuming the macro trend.",
    bullets: [
      "Three-Candle FVG Formation: The structural gap between the wick high of candle 1 and the wick low of candle 3 in an impulsive 3-candle sequence.",
      "BISI (Buy Side Inefficiency / Sell Side Imbalance): Rapid upward expansion leaving an unmitigated discount FVG zone.",
      "SIBI (Sell Side Inefficiency / Buy Side Imbalance): Rapid downward plunge leaving an unmitigated premium FVG zone.",
      "Consequent Encroachment (CE): The exact 50% midpoint of the FVG boundary, acting as the primary institutional pivot reaction zone."
    ],
    executionTitle: "Execution Blueprint for FVG Re-delivery:",
    executionSteps: [
      "Step 1: Draw a precise rectangular zone from the wick high of candle 1 to the wick low of candle 3 following an MSS.",
      "Step 2: Mark the 50% CE midpoint with a solid horizontal line; recognize that institutional limit orders are often heavily concentrated at this exact mathematical level.",
      "Step 3: Execute limit orders when price retraces into the FVG during a designated killzone, placing your stop loss safely behind the origin candle of the imbalance."
    ],
    visualType: "FVG",
    homework: "Isolate 15 Fair Value Gaps across 1-hour and 15-minute charts. Measure how many times price respected the exact 50% CE level versus breaching the outer edge."
  },
  4: {
    title: "Episode 4: The Oliver Velez Macro Baseline (200 SMA Filter)",
    heading: "Structural Gravity and Trend Adherence Rules",
    p1: " Adhering strictly to Oliver Velez's core trading tenets, the 200-period Simple Moving Average (SMA) on your primary execution timeframe is our non-negotiable macro filter. Fighting the slope of the 200 SMA is statistically suicidal. Short-term exponential moving averages react too erratically to market noise, but the 200 SMA provides true structural gravity, separating high-probability institutional expansions from retail counter-trend traps.",
    bullets: [
      "Bullish Macro Filter: When the 200 SMA slope is angled upward, all short setups are strictly prohibited; trading execution is restricted to long configurations only.",
      "Bearish Macro Filter: When the 200 SMA slope is angled downward, all long configurations are discarded; trading execution is restricted strictly to short setups.",
      "Mean Reversion Extremes: When price extends excessively far away from the 200 SMA line, anticipate consolidation or sharp mean-reversion pullbacks rather than chasing breakout extensions."
    ],
    executionTitle: "Implementing the 200 SMA Filter in Live Execution:",
    executionSteps: [
      "Step 1: Apply the 200 SMA to your primary chart (e.g., 5-minute or 15-minute execution timeframe) and assess its visual angle and trajectory.",
      "Step 2: Categorize the session environment as either trending (steep slope) or range-bound (flat slope).",
      "Step 3: Cross-reference every potential FVG or Order Block entry: if the signal opposes the 200 SMA slope, discard it immediately regardless of how clean the pattern appears."
    ],
    visualType: "SMA",
    homework: "Backtest 50 historical signals across various market conditions, quantifying the strict win-rate delta between trades taken with 200 SMA alignment versus those taken against it."
  },
  5: {
    title: "Episode 5: Time Cycles (AMD & Killzones)",
    heading: "The Power of Three (Accumulation, Manipulation, Distribution)",
    p1: "Interbank execution operates on rigid, time-based algorithmic cycles. The Power of Three (AMD) model dictates how daily sessions unfold structurally: algorithms accumulate orders during low-volatility hours, engineer a false breakout (Judas Swing/Manipulation) during session opens to trap retail traders, and finally expand into true multi-hour distribution.",
    bullets: [
      "Accumulation Phase: Characterized by tight consolidation ranges, typically forming during the Asian session or pre-market hours.",
      "Manipulation Phase (Judas Swing): A sharp, high-velocity false breakout engineered right before or during the London/New York opens to trap early breakout participants.",
      "Distribution Phase: The true directional expansion leg that delivers price toward higher-timeframe institutional liquidity objectives."
    ],
    executionTitle: "Execution Protocol for the AMD Cycle:",
    executionSteps: [
      "Step 1: Mark the Midnight EST opening price line on your chart as your primary institutional baseline.",
      "Step 2: Observe price action during session open windows (02:00 EST for London, 08:30-09:30 EST for New York); wait for the Judas Swing sweep away from the Midnight open.",
      "Step 3: Execute your entry the exact moment the Judas Swing reverses, breaks back across the Midnight open price, and confirms with an MSS."
    ],
    visualType: "PO3",
    homework: "Track the Midnight EST open price across 10 consecutive trading days, measuring the precise pips/points captured by the Judas Swing before the distribution leg initiated."
  },
  6: {
    title: "Episode 6: Wholesale vs. Retail (Premium & Discount Matrix)",
    heading: "Dealing Range Fibonacci Grid Calibration",
    p1: "Institutional smart money operates like wholesale buyers: they never purchase assets at retail (high) prices during an uptrend. By establishing a dealing range between a verified swing high and swing low, we apply a specialized Fibonacci grid to divide price into distinct discount and premium quadrants, ensuring we only buy at wholesale and sell at retail.",
    bullets: [
      "Premium Zone (50% to 100% Equilibrium): Institutional territory reserved exclusively for short-side execution and profit-taking on long positions.",
      "Discount Zone (0% to 50% Equilibrium): Institutional territory reserved exclusively for long-side accumulation and profit-taking on short positions.",
      "Equilibrium (Exact 50% Level): Fair value boundary; price frequently pauses, consolidates, or reacts violently at this exact coordinate."
    ],
    executionTitle: "Dealing Range Matrix Application Protocol:",
    executionSteps: [
      "Step 1: Identify the most recent significant dealing range between an established structural high and swing low on your execution timeframe.",
      "Step 2: Apply your Fib tool configured with exact levels at 0.0, 0.5 (Equilibrium), and 1.0.",
      "Step 3: Restrict long entries strictly to the lower discount quadrant (0.5 to 1.0) and short entries strictly to the upper premium quadrant (0.0 to 0.5)."
    ],
    visualType: "Matrix",
    homework: "Draw dealing range grids across 10 major market swings, verifying whether institutional FVGs and Order Blocks consistently triggered within extreme quartiles."
  },
  7: {
    title: "Episode 7: Capital Preservation & Risk Parameters",
    heading: "Mathematical Position Sizing and the 1% Rule",
    p1: "Professional trading is fundamentally a game of mathematical survival. Without strict capital preservation rules, even the most advanced ICT and Velez concepts will fail due to emotional drawdown. You must enforce the 1% risk rule and maintain rigid daily loss limits to ensure statistical edge compounds over hundreds of samples.",
    bullets: [
      "The 1% Rule: Never risk more than 1% of total account equity on any single execution setup under any circumstances.",
      "Daily Drawdown Cutoff: A hard rule terminating all trading activity for the session after sustaining 3 consecutive losses or hitting a max daily loss threshold.",
      "Dynamic Position Sizing: Contract or lot size must scale dynamically based entirely on stop-loss tick distance, never on emotional conviction."
    ],
    executionTitle: "Risk Sizing Mathematical Calculation:",
    executionSteps: [
      "Step 1: Calculate 1% of your current total account equity in cash value (e.g., $200 risk on a $20,000 account).",
      "Step 2: Measure your planned structural stop-loss distance in exact ticks or points.",
      "Step 3: Divide your allowable dollar risk by the point-value multiplier to derive your exact contract size before placing the trade."
    ],
    visualType: "PO3",
    homework: "Draft a signed risk management contract specifying your account size, maximum allowable dollar risk per trade, and daily drawdown stop-out threshold."
  },
  8: {
    title: "Episode 8: Institutional Sponsorship & HTF Draw on Liquidity",
    heading: "Daily and Weekly Master Objective Mapping",
    p1: "Intraday price action is never random; it is magnetically pulled toward higher-timeframe (HTF) institutional order blocks and liquidity pools on Daily and Weekly charts. Daily and Weekly PD arrays completely override 1-minute and 5-minute micro structures every single time. Establishing your macro HTF draw on liquidity is mandatory before dropping down to execution charts.",
    bullets: [
      "HTF Supremacy: Daily and Weekly structural arrays dictate the primary institutional sponsorship of the current trading week.",
      "Draw on Liquidity (DOL): The specific external liquidity pool that interbank algorithms are actively programming price to reach.",
      "Macro Bias Alignment: Intraday setups taken against the HTF draw on liquidity have an extremely high failure rate."
    ],
    executionTitle: "Mapping HTF Draw on Liquidity:",
    executionSteps: [
      "Step 1: Open the Daily and Weekly charts to identify un-swept external liquidity pools resting beyond major swing points.",
      "Step 2: Determine which side of the market holds active institutional sponsorship based on recent displacement candles.",
      "Step 3: Align all intraday 5-minute and 15-minute executions to target that specific HTF objective."
    ],
    visualType: "Liquidity",
    homework: "Write a comprehensive 3-paragraph institutional bias report for a major market index based entirely on Daily chart liquidity targets."
  },
  9: {
    title: "Episode 9: Power of 3 Deep Dive & Opening Range Math",
    heading: "Session Volatility Projections and Measured Moves",
    p1: "Expanding on the Power of Three framework, session opening ranges provide mathematical blueprints for intraday expansion targets using measured moves. The initial pre-market consolidation box sets the expected volatility boundary, and false breakouts outside this range trap retail breakout traders while providing structural fuel for measured expansions.",
    bullets: [
      "Opening Range Definition: The high and low boundaries established during the initial 30 minutes of the New York or London cash sessions.",
      "False Breakout Trap: Retail traders entering breakouts outside the opening range before the manipulation sweep completes.",
      "Measured Move Projections: Projecting the total point height of the consolidation box outward from the breakout vector."
    ],
    executionTitle: "Calculating Session Expansion Targets:",
    executionSteps: [
      "Step 1: Measure the exact point height of the pre-market consolidation box.",
      "Step 2: Project that point distance outward from the manipulation sweep point once the true MSS occurs.",
      "Step 3: Scale out 50% of your position at the 1x projection and manage the remainder to the 1.5x target."
    ],
    visualType: "PO3",
    homework: "Calculate measured move projections for the last 5 New York sessions and verify how precisely price respected the mathematical expansion boundaries."
  },
  10: {
    title: "Episode 10: New York AM Killzone Execution",
    heading: "Mastering the 08:30 - 11:00 EST High-Volume Window",
    p1: "The New York AM Killzone is the highest-volume trading window of the global financial day, driven by major US economic data releases and institutional positioning. Navigating this window requires extreme discipline: waiting out the initial 08:30 EST data shock, identifying the liquidity sweep, and executing on the post-news Fair Value Gap retest.",
    bullets: [
      "08:30 EST Data Release: High-impact macro news that frequently triggers massive, volatile stop-hunts across equity indices.",
      "The True Trend Window: The authentic directional move typically locks in between 09:30 EST (NYSE open) and 10:30 EST.",
      "News Avoidance: Standing aside during the chaotic first 5 minutes of high-impact news spikes to avoid erratic spread slippage."
    ],
    executionTitle: "Trading the NY AM Session Step-by-Step:",
    executionSteps: [
      "Step 1: Wait for the 08:30 EST news candle to sweep an existing structural liquidity level (BSL or SSL).",
      "Step 2: Allow the market to form a clear Market Structure Shift and Fair Value Gap following the initial spike.",
      "Step 3: Execute your entry on the retracement into the post-news FVG with a tight structure stop."
    ],
    visualType: "MSS",
    homework: "Log the price action of an NQ or ES chart during today's 08:30 - 10:00 EST window, annotating the exact timestamp of the liquidity sweep and subsequent FVG entry."
  },
  11: {
    title: "Episode 11: PM Session Killzone Continuation",
    heading: "Capturing Afternoon Institutional Re-Accumulation",
    p1: "The PM Session (13:30 - 16:00 EST) often provides clean trend continuation or institutional re-accumulation after the midday lunch chop. Institutional order flow frequently resumes right after the 13:30 EST bond market cash open, offering high-probability trend continuation entries for disciplined traders.",
    bullets: [
      "Bond Market Influence: Institutional desks return following the 13:30 EST US Treasury cash open, renewing directional volume.",
      "Midday Chop Avoidance: Avoiding all trade entries during the low-liquidity institutional lunch lull between 12:00 and 13:00 EST.",
      "PM Expansion Behavior: Afternoon trends tend to be steady, methodical expansions rather than explosive morning volatility spikes."
    ],
    executionTitle: "Executing PM Session Setups:",
    executionSteps: [
      "Step 1: Review the morning session high and low to evaluate whether the daily range has been fully completed or has room for expansion.",
      "Step 2: Look for a retracement into a 1-Hour or 15-minute FVG during the 13:30 - 14:00 EST window.",
      "Step 3: Manage risk tightly as liquidity dries up rapidly after 15:30 EST ahead of the cash close."
    ],
    visualType: "PO3",
    homework: "Backtest 10 afternoon sessions to determine how often the morning trend reversed versus how often it continued into the 16:00 EST close."
  },
  12: {
    title: "Episode 12: Advanced Market Structure Hierarchy",
    heading: "Classifying STH, ITH, and LTH Structural Pivots",
    p1: "Not all swing points carry equal weight. Grouping market structure into Short-Term Highs/Lows (STH), Intermediate-Term Highs/Lows (ITH), and Long-Term Highs/Lows (LTH) prevents traders from falling for false-signal traps. Recognizing the hierarchy of swings ensures you place stop losses behind robust structural barriers rather than minor micro-noise.",
    bullets: [
      "STH (Short-Term High/Low): A swing point flanked by one lower high/higher low on each side representing minor noise.",
      "ITH (Intermediate-Term High/Low): A swing point flanked by lower highs/higher lows across a broader multi-candle window.",
      "LTH (Long-Term High/Low): A major structural pivot point visible on higher timeframes that defines absolute institutional bias."
    ],
    executionTitle: "Categorizing Structural Pivots on Charts:",
    executionSteps: [
      "Step 1: Mark your chart clearly, giving higher visual weight and importance to LTH and ITH pivots.",
      "Step 2: Ignore STH breakouts unless they coincide with higher-timeframe array retests.",
      "Step 3: Ensure your stop losses are tucked safely behind valid ITH or LTH levels, never behind STH/STL noise."
    ],
    visualType: "MSS",
    homework: "Annotate a 1-hour chart by labeling every swing point strictly as STH, ITH, or LTH according to strict multi-candle flaking rules."
  },
  13: {
    title: "Episode 13: IPDA Lookbacks & Internal/External Range Liquidity",
    heading: "Navigating Interbank Price Delivery Oscillations",
    p1: "Interbank Price Delivery Algorithm (IPDA) cycles dictate that price oscillates perpetually between Internal Range Liquidity (fair value gaps, order blocks) and External Range Liquidity (old highs and lows). Understanding this oscillation model allows you to predict exact turning points as price transitions from external sweeps to internal re-delivery.",
    bullets: [
      "External Range Liquidity: Major resting stop pools (BSL/SSL) sitting outside current consolidation structures.",
      "Internal Range Liquidity: Imbalances, gaps, and order blocks trapped inside a trading range.",
      "The IPDA Flow: External Sweep -> Internal Rebalance -> External Target expansion."
    ],
    executionTitle: "Navigating IPDA Oscillations in Execution:",
    executionSteps: [
      "Step 1: Identify when price has swept an external high/low liquidity pool.",
      "Step 2: Anticipate an immediate rotation back toward internal fair value gaps.",
      "Step 3: Use the internal FVG bounce to propel price toward the next external objective."
    ],
    visualType: "Liquidity",
    homework: "Trace 3 complete IPDA oscillation cycles on a 15-minute chart, documenting how price moved from external liquidity sweeps to internal FVG retests."
  },
  14: {
    title: "Episode 14: Macro Timeframes & Parent Context",
    heading: "The Multi-Timeframe Execution Pipeline",
    p1: "Your execution timeframe is strictly subordinate to your parent timeframe. A 1-minute chart setup running counter to a Daily timeframe institutional objective has an extremely low statistical probability of success. Establishing parent timeframe context is the ultimate filter against false breakout execution.",
    bullets: [
      "Parent Timeframe Context: Provides macro boundary limits and directional bias.",
      "Execution Timeframe Precision: Provides granular entry triggers and reduced risk exposure.",
      "Rule of Subordination: Never divorce an intraday micro pattern from its higher-timeframe environment."
    ],
    executionTitle: "Building a Multi-Timeframe Matrix:",
    executionSteps: [
      "Step 1: Establish Daily/4-Hour bias and major PD arrays first before touching lower timeframes.",
      "Step 2: Drop to 1-Hour/15-minute charts to locate intermediate structure and session killzones.",
      "Step 3: Use 1-minute or 5-minute charts exclusively for entry execution and stop placement."
    ],
    visualType: "Liquidity",
    homework: "Create a structured top-down analysis log connecting a Daily level down to a 1-minute execution trigger for a single trade idea."
  },
  15: {
    title: "Episode 15: Interest Rate Yields & Intermarket Flow",
    heading: "Correlating TNX Bond Yields and DXY with Equity Indices",
    p1: "Equity index futures do not trade in a vacuum. They are inextricably linked to bond markets, Treasury yields (TNX), and the US Dollar Index (DXY). Rising 10-Year Treasury yields apply heavy downward pressure on growth equities and indices like NQ and ES, while a strengthening DXY signals capital flight into safe havens.",
    bullets: [
      "TNX Yield Correlation: Rising 10-Year Treasury yields inversely pressure equity index futures (TNX up = NQ down).",
      "DXY Dollar Correlation: A strengthening US Dollar Index signals risk-off capital flows, pressuring equity indices.",
      "Pre-Market Verification: Always check TNX and DXY trends during pre-market analysis before taking index positions."
    ],
    executionTitle: "Correlating Yields with Index Execution:",
    executionSteps: [
      "Step 1: Pull up the TNX (10-Year Yield) chart alongside your ES or NQ execution chart during pre-market prep.",
      "Step 2: Verify that bond yield direction supports your intended equity trade direction.",
      "Step 3: Stand aside if equity price action diverges violently from intermarket bond behavior."
    ],
    visualType: "SMT",
    homework: "Document 3 instances where a sharp move in TNX yields preceded a correlated reversal in index futures."
  },
  16: {
    title: "Episode 16: Intermarket Analysis & SMT Divergence",
    heading: "Spotting Institutional Manipulation via Asset Divergence",
    p1: "Smart Money Tool (SMT) Divergence occurs when correlated assets (such as ES and NQ, or EURUSD and GBPUSD) fail to confirm each other at a key structural high or low, exposing institutional manipulation. If Asset A makes a higher high, but correlated Asset B fails to make a higher high, institutional distribution is underway.",
    bullets: [
      "SMT Definition: Failure of correlated assets to confirm structural highs or lows during liquidity sweeps.",
      "High-Probability Reversal: SMT divergence at an external liquidity sweep is one of the highest-probability reversal signals in institutional trading.",
      "Institutional Accumulation: Confirms smart money is accumulating positions in one asset while trapping retail in another."
    ],
    executionTitle: "Spotting and Trading SMT Divergence:",
    executionSteps: [
      "Step 1: Place ES and NQ side-by-side on your screen during a major structural liquidity sweep.",
      "Step 2: Check the extreme wicks: did one index break its old high/low while the other failed to do so?",
      "Step 3: Execute your reversal entry on the asset that showed relative weakness/strength divergence."
    ],
    visualType: "SMT",
    homework: "Find a historical chart window where ES and NQ displayed clear SMT divergence at a major high, and measure the subsequent move."
  },
  17: {
    title: "Episode 17: Top Down Analysis Pipeline",
    heading: "The 4-Step Systematic Execution Check",
    p1: "Mastering the top-down pipeline ensures seamless translation from macroeconomic thesis to microsecond execution without second-guessing. A rigid 4-step pipeline eliminates emotional trading and forces you to wait patiently for confluence.",
    bullets: [
      "Step 1: Macro Calendar & Bond Yields check (TNX/DXY).",
      "Step 2: Daily/4H structural draw on liquidity identification.",
      "Step 3: 15m/5m Killzone timing and PD array mapping.",
      "Step 4: 1m precision entry confirmation."
    ],
    executionTitle: "Executing the Pipeline Systematically:",
    executionSteps: [
      "Step 1: Never rush past Step 1 or Step 2 under any circumstances.",
      "Step 2: Wait patiently for price to arrive at your pre-mapped HTF array during a killzone.",
      "Step 3: Execute strictly when all 4 pipeline checkpoints align perfectly."
    ],
    visualType: "FVG",
    homework: "Write out your personal 4-step execution pipeline checklist and tape it next to your monitor."
  },
  18: {
    title: "Episode 18: Weekly Profile & Friday Close Dynamics",
    heading: "Managing Weekend Risk and End-of-Week Position Squaring",
    p1: "The weekly profile concludes with institutional position squaring ahead of the weekend, often creating sharp counter-trend retracements or acceleration into the Friday 16:00 EST close. Smart money often squares books between 15:00 and 16:00 EST on Fridays to eliminate weekend gap risk.",
    bullets: [
      "Position Squaring: Institutional desks close out intra-week inventory ahead of weekend geopolitical risk.",
      "Friday Counter-Trend Scalp: Late-session exhaustion moves into major weekly support/resistance levels.",
      "Weekend Gap Protection: Avoiding unhedged swing positions over weekends when macro risk is elevated."
    ],
    executionTitle: "Navigating Friday Closes:",
    executionSteps: [
      "Step 1: Observe the weekly candle profile by Friday afternoon (trending vs. consolidation).",
      "Step 2: Look for late-session exhaustion moves into major weekly support/resistance levels.",
      "Step 3: Secure open profits before the final 15 minutes of the session to avoid erratic end-of-week spreads."
    ],
    visualType: "PO3",
    homework: "Review the price action of the final hour across the last 4 Friday sessions and categorize how institutional closing flows impacted price."
  },
  19: {
    title: "Episode 19: Daily Profile & Chop Day Filtering",
    heading: "Identifying Compression Ranges and Avoiding Chop Traps",
    p1: "Not every day trends. Recognizing consolidation days (inside days or low-volatility compression ranges) saves you from death by a thousand paper cuts in choppy markets. If today opens entirely inside yesterday's true body range, expect compressed, mean-reverting price action.",
    bullets: [
      "Inside Day Compression: Opening entirely inside yesterday's body range signals low-volatility chop.",
      "Breakout Trap: Chop days destroy breakout traders; adapt by trading mean-reversion between range extremes.",
      "ATR Collapse: Protect capital by reducing position size or standing aside when Average True Range collapses."
    ],
    executionTitle: "Trading Chop Days Effectively:",
    executionSteps: [
      "Step 1: Mark yesterday's high and low boundaries immediately at the overnight open.",
      "Step 2: If price fails to expand past these boundaries by 10:30 EST, classify the day as a range-bound environment.",
      "Step 3: Target mid-range equilibrium levels rather than expecting massive breakout trends."
    ],
    visualType: "Matrix",
    homework: "Identify 3 recent chop days on your chart and document the exact morning structural clues that signaled a low-expansion environment."
  },
  20: {
    title: "Episode 20: London Open Killzone Extremes",
    heading: "Forming the Daily High or Low of the Session",
    p1: "The London Open killzone (02:00 - 05:00 EST) frequently establishes the high or low of the entire session, setting the structural tone for the rest of the European and North American trading day. European institutional desks step in at 02:00 EST, often reversing overnight Asian ranges.",
    bullets: [
      "European Institutional Influx: 02:00 EST brings heavy liquidity and trend initialization.",
      "London Manipulation Swings: False breakouts that trap early European participants before true expansion.",
      "Daily Extreme Formation: Aligning London extremes with New York continuation yields exceptional intraday trades."
    ],
    executionTitle: "Trading London Extremes:",
    executionSteps: [
      "Step 1: Check the Asian session high and low at 02:00 EST.",
      "Step 2: Watch for a sweep of Asian liquidity during the early London open window.",
      "Step 3: Enter on the structural shift back toward the true daily trend direction."
    ],
    visualType: "PO3",
    homework: "Examine 5 historical charts to see how often the London Killzone successfully formed the ultimate high or low of the day."
  },
  21: {
    title: "Episode 21: Tape Reading & Real-Time Flow",
    heading: "Analyzing Candle Velocity and Institutional Defense",
    p1: "Tape reading involves watching how price interacts with key PD arrays in real-time. Do candles slice through effortlessly, or do they stall, reject, and show immediate institutional defense? Analyzing effort versus result allows you to distinguish real absorption from fake breakouts.",
    bullets: [
      "Effort vs. Result: High volume with zero structural progress indicates absorption and impending reversal.",
      "Effortless Slicing: Slicing through an array with massive displacement proves aggressive institutional sponsorship.",
      "Array Defense: Respecting an array with clean rejections signals high-probability defense."
    ],
    executionTitle: "Reading the Tape in Real-Time:",
    executionSteps: [
      "Step 1: Watch candle close velocity as price approaches a pre-mapped Fair Value Gap or Order Block.",
      "Step 2: If price pauses, wicks heavily, and reverses with body expansion, validate the array defense.",
      "Step 3: Close or reduce positions instantly if price slices through your array without hesitation."
    ],
    visualType: "FVG",
    homework: "Record your observations of tape behavior as price tests a major institutional order block during an active session."
  },
  22: {
    title: "Episode 22: Identifying Traps & Trendline Baits",
    heading: "Weaponizing Retail Trendlines and Support/Resistance",
    p1: "Retail traders love drawing diagonal trendlines. Smart money algorithms weaponize these exact trendlines, engineering liquidity sweeps right above or below them before executing true reversals. A sudden breakout past a clean trendline is almost always an institutional stop-raid.",
    bullets: [
      "Diagonal Liquidity Pools: Retail trendlines accumulate massive resting stop-loss pools over multiple touches.",
      "Stop-Raid Mechanics: Breakouts past trendlines frequently trigger immediate algorithmic reversals.",
      "Fading the Breakout: Fade retail trendline breakouts once the liquidity grab is confirmed by an MSS."
    ],
    executionTitle: "Spotting and Trading Retail Traps:",
    executionSteps: [
      "Step 1: Locate obvious retail trendlines on your chart where multiple swing highs or lows line up diagonally.",
      "Step 2: Wait for price to accelerate aggressively through that trendline into an HTF array.",
      "Step 3: Fade the breakout once displacement confirms rejection."
    ],
    visualType: "Liquidity",
    homework: "Find 3 examples where a retail trendline breakout resulted in an immediate institutional reversal trap."
  },
  23: {
    title: "Episode 23: Reversals vs. Retracements",
    heading: "Validating Structural Shifts and Preventing False Calls",
    p1: "Misinterpreting a temporary retracement as a full structural reversal is a primary cause of account drawdown. You must verify candle anatomy and order flow before declaring a trend reversal. Retracements test internal arrays within an ongoing trend, whereas reversals break major HTF structure.",
    bullets: [
      "Retracement Mechanics: Tests internal arrays (FVGs/OBs) within an ongoing trend before continuation.",
      "Reversal Criteria: Breaks major HTF structure, shifts moving average slopes, and delivers sustained displacement.",
      "Wick Traps: Wicks poking past minor levels represent stop runs, not genuine reversals."
    ],
    executionTitle: "Validating Structural Shifts:",
    executionSteps: [
      "Step 1: Check whether candle closes confirm the structural break or if it's just a wick rejection.",
      "Step 2: Verify if the move aligns with the 200 SMA macro slope.",
      "Step 3: Never enter a reversal until an undeniable Market Structure Shift occurs."
    ],
    visualType: "MSS",
    homework: "Analyze a chart sequence where a wick stop-run tricked traders into calling a reversal, contrasting it with a true structural reversal."
  },
  24: {
    title: "Episode 24: Breaker Blocks",
    heading: "Trading Failed Institutional Arrays and Polarity Flips",
    p1: "When an institutional Order Block fails to hold price and is cleanly broken through, it transforms into a Breaker Block—one of the most reliable support/resistance flip zones in price action trading. Breakers combine stop-run mechanics with polarity inversion.",
    bullets: [
      "Breaker Formation: Formed when an order block is violated by high-momentum displacement.",
      "Polarity Inversion: The broken block acts as a magnet and defense wall when price returns to test it from the opposite direction.",
      "High-Probability Setup: Combines stop-run liquidity grabs with structural support/resistance flipping."
    ],
    executionTitle: "Trading Breaker Blocks:",
    executionSteps: [
      "Step 1: Identify an Order Block that failed and was broken by strong displacement.",
      "Step 2: Highlight the candle that created the failed swing extreme.",
      "Step 3: Execute your entry when price returns to retest that exact breaker zone."
    ],
    visualType: "Breaker",
    homework: "Locate 3 Breaker Blocks on a 15-minute chart and track how price reacted upon returning to test them."
  },
  25: {
    title: "Episode 25: Mitigation Blocks",
    heading: "Managing Failure Swings and Trapped Inventory",
    p1: "A Mitigation Block is similar to a Breaker, but it forms during a failure swing where price fails to create a higher high or lower low, providing trapped institutional participants a chance to exit at breakeven. Institutions use this block to mitigate resting losses without taking a net loss.",
    bullets: [
      "Failure Swing Context: Occurs during second-leg structural failures where momentum stalls.",
      "Inventory Mitigation: Institutions use this block to exit trapped positions at breakeven.",
      "Reaction Array: Acts as a powerful reaction array for intraday scalpers."
    ],
    executionTitle: "Trading Mitigation Blocks:",
    executionSteps: [
      "Step 1: Spot a swing point that failed to surpass the previous extreme.",
      "Step 2: Mark the last down-close (for bullish) or up-close (for bearish) candle of that failed push.",
      "Step 3: Set limit orders at the mitigation block boundary."
    ],
    visualType: "Breaker",
    homework: "Differentiate between a Breaker Block and a Mitigation Block on your chart using structural failure criteria."
  },
  26: {
    title: "Episode 26: Rejection Blocks",
    heading: "Harvesting Extreme Wick Rejections",
    p1: "Rejection Blocks capture the extreme price rejections embedded within long candlestick wicks, representing aggressive institutional defense of key price thresholds. The body preceding the long wick defines the tight reaction zone for low-risk scalping.",
    bullets: [
      "Wick Extremes: Formed by massive wick rejections of liquidity levels.",
      "Body Definition: The candle body preceding the rejection wick defines the tight reaction zone.",
      "Risk-Reward Profile: Offers exceptionally high-reward, low-risk entries for scalp traders."
    ],
    executionTitle: "Trading Rejection Blocks:",
    executionSteps: [
      "Step 1: Identify candles with wicks that span multiple times the body length following a liquidity sweep.",
      "Step 2: Box the candle body adjacent to the rejection wick.",
      "Step 3: Execute entries upon the return test of that body zone."
    ],
    visualType: "Liquidity",
    homework: "Mark 3 Rejection Blocks on a 5-minute chart during high-volatility news events."
  },
  27: {
    title: "Episode 27: Vacuum Blocks & Sunday Open Gaps",
    heading: "Trading Opening Gaps and Absolute Liquidity Voids",
    p1: "Vacuum Blocks occur when markets open with massive gaps (such as Sunday evening session opens) leaving absolute voids of trading activity that act as extreme price magnets. Price is magnetically drawn to fill these gaps before resuming macro trend direction.",
    bullets: [
      "Sunday Open Gaps: Weekend geopolitical events create institutional vacuum blocks at the open.",
      "Gap Filling Magnet: Price is algorithmically drawn to completely fill opening gaps.",
      "Directional Targets: Provides clear, high-probability directional targets for early week trading."
    ],
    executionTitle: "Trading Voids & Gaps:",
    executionSteps: [
      "Step 1: Locate opening price gaps on Sunday evening or post-news releases.",
      "Step 2: Draw a box covering the entire unfilled gap space.",
      "Step 3: Target the complete filling of the vacuum block as your primary profit objective."
    ],
    visualType: "FVG",
    homework: "Review Sunday market open gaps over the last month and document how quickly and completely they were filled."
  },
  28: {
    title: "Episode 28: Order Block Theory & Validation",
    heading: "Filtering True Institutional Order Blocks via FVG and MSS",
    p1: "Not every up-close or down-close candle is an Order Block. A true institutional Order Block must be validated by subsequent FVG creation and a clean Market Structure Shift. Filtering out false order blocks prevents amateur execution mistakes.",
    bullets: [
      "Bullish OB Criteria: The last down-close candle before an impulsive up-move that creates an FVG and breaks structure.",
      "Bearish OB Criteria: The last up-close candle before an impulsive down-move.",
      "Validation Rule: Must align with higher-timeframe draw on liquidity and be accompanied by displacement."
    ],
    executionTitle: "Validating Order Blocks:",
    executionSteps: [
      "Step 1: Isolate the candle immediately preceding a major displacement leg.",
      "Step 2: Verify that the move left behind an FVG and broke an intermediate structural pivot.",
      "Step 3: Box the candle body and wick for your institutional entry zone."
    ],
    visualType: "MSS",
    homework: "Filter out false order blocks on your chart by applying strict FVG and MSS validation rules."
  },
  29: {
    title: "Episode 29: Fair Value Gaps Deep Dive & Mitigation",
    heading: "Partial Re-delivery vs. Full CE Mitigation",
    p1: "Mastering FVG re-delivery mechanics requires understanding how algorithms fill imbalances from partial mitigation to full Consequent Encroachment mitigation. Partial re-delivery occurs when price taps the outer edge, while full re-delivery penetrates deep to the 50% CE level.",
    bullets: [
      "Partial Re-delivery: Price taps the outer edge of the FVG and continues trending rapidly.",
      "Full Mitigation: Price penetrates deep into the FVG, filling it completely before expansion.",
      "CE Pivot: The 50% midpoint acts as the ultimate institutional reaction pivot."
    ],
    executionTitle: "Trading FVG Sequences:",
    executionSteps: [
      "Step 1: Map the full boundary of the FVG.",
      "Step 2: Set alert triggers at the 50% CE level.",
      "Step 3: Scale position entries between the outer edge and the 50% midpoint."
    ],
    visualType: "FVG",
    homework: "Track 10 FVG re-deliveries to see how often price respected the 50% CE versus the outer boundary."
  },
  30: {
    title: "Episode 30: Liquidity Voids & Waterfall Cascades",
    heading: "Anticipating High-Velocity Price Traversal",
    p1: "Liquidity voids are multi-candle directional cascades where price moves so fast that zero structural support or opposing order blocks are left behind. Price travels through liquidity voids like a knife through butter, providing rapid profit-delivery pathways.",
    bullets: [
      "Cascade Definition: Consecutive large-bodied candles with minimal overlap.",
      "Zero Resistance: Price travels rapidly through voids due to absolute lack of opposing limit orders.",
      "Momentum Targets: Target the completion boundary of the void as your momentum profit objective."
    ],
    executionTitle: "Navigating Voids:",
    executionSteps: [
      "Step 1: Identify the initiation point of a liquidity void.",
      "Step 2: Avoid counter-trend entries inside active voids.",
      "Step 3: Target the completion boundary of the void as your momentum profit objective."
    ],
    visualType: "FVG",
    homework: "Identify a major liquidity void on a 1-hour chart and measure the speed of price traversal across the imbalance."
  },
  31: {
    title: "Episode 31: Engineering Retail Liquidity Pools",
    heading: "Mapping Double Tops/Bottoms as Institutional Fuel",
    p1: "Institutions frequently engineer liquidity pools by keeping price range-bound between equal highs and lows until enough retail volume is trapped to fuel their next expansion. The longer a level is respected by retail, the larger the resting stop pool behind it.",
    bullets: [
      "Engineered Pools: Equal Highs (EQH) and Equal Lows (EQL) act as neon signs for smart money.",
      "Retail Trap Duration: The longer a level holds, the denser the resting stop pool.",
      "Sweep Anticipation: Anticipate aggressive stop-hunts whenever obvious retail patterns form."
    ],
    executionTitle: "Mapping Engineered Pools:",
    executionSteps: [
      "Step 1: Spot clear double tops or double bottoms on standard retail indicators.",
      "Step 2: Mark them as engineered liquidity pools rather than valid support/resistance breakout zones.",
      "Step 3: Wait for the sweep before executing your entry."
    ],
    visualType: "Liquidity",
    homework: "Scan your charts for engineered double tops/bottoms and log how liquidity sweeps wiped them out."
  },
  32: {
    title: "Episode 32: Stop Runs & Mechanical Execution",
    heading: "Algorithmic Triggering of Trailing Stops",
    p1: "Stop runs are mechanical operations executed by algorithms to clear out resting orders before true price discovery occurs. Executed with sudden, high-velocity wicks, they trigger trailing stops and breakout entries simultaneously, providing the ultimate entry trigger when faded.",
    bullets: [
      "Mechanical Operation: Executed via sudden, high-velocity wicks by interbank algorithms.",
      "Trigger Mechanics: Clears trailing stops and breakout entries simultaneously.",
      "Fade Opportunity: The ultimate entry trigger when faded upon rejection confirmation."
    ],
    executionTitle: "Trading Stop Runs:",
    executionSteps: [
      "Step 1: Identify vulnerable resting stop clusters above/below recent swings.",
      "Step 2: Wait for the mechanical wick to pierce the level.",
      "Step 3: Enter immediately in the opposite direction upon confirmation of rejection."
    ],
    visualType: "Liquidity",
    homework: "Document the exact point size and duration of a mechanical stop run during a high-impact news release."
  },
  33: {
    title: "Episode 33: Equilibrium & Discount Disciplines",
    heading: "Enforcing the 50% Rule to Eliminate FOMO",
    p1: "Discipline is defined by your willingness to sit on your hands when price is in the premium zone during a bullish bias. Enforcing the 50% rule eliminates chasing FOMO trades and ensures you never buy high or sell low.",
    bullets: [
      "Bullish Constraint: Never buy above the 50% equilibrium line in an uptrend.",
      "Bearish Constraint: Never sell below the 50% equilibrium line in a downtrend.",
      "Value Boundary: Equilibrium is the exact boundary between institutional value and retail trap zones."
    ],
    executionTitle: "Enforcing the Rule strictly:",
    executionSteps: [
      "Step 1: Apply your dealing range Fib grid on every single trade setup.",
      "Step 2: Cancel any pending limit order if price enters the wrong side of the equilibrium line.",
      "Step 3: Wait patiently for price to pull back into the discount/premium quadrant."
    ],
    visualType: "Matrix",
    homework: "Review your last 20 trade journal entries and flag any trades that violated the 50% equilibrium rule."
  },
  34: {
    title: "Episode 34: Premium Arrays & Short-Side Execution",
    heading: "Mastering Upper-Quadrant Short Distributions",
    p1: "When higher-timeframe bias is bearish, premium arrays (order blocks and FVGs sitting above the 50% equilibrium line) become your exclusive hunting grounds for short positions. Filter out all discount buy setups during a macro bearish cycle.",
    bullets: [
      "Bearish Macro Filter: Filter out all discount buy setups during a macro bearish cycle.",
      "Premium Focus: Focus exclusively on premium SIBI imbalances and bearish order blocks.",
      "Profit Objectives: Target discount liquidity pools as primary profit objectives."
    ],
    executionTitle: "Executing Premium Shorts:",
    executionSteps: [
      "Step 1: Establish macro bearish bias on HTF charts.",
      "Step 2: Fib the dealing range and isolate arrays located strictly in the upper 50-100% premium zone.",
      "Step 3: Execute short entries upon retest of those premium arrays."
    ],
    visualType: "Matrix",
    homework: "Backtest 10 short-side setups using strict premium array criteria."
  },
  35: {
    title: "Episode 35: Risk Management & The 50/75 Protocol",
    heading: "Systematic Tranche Scaling and Stop Management",
    p1: "Protecting open profits is just as important as initial risk control. The 50/75 protocol provides a systematic framework for scaling out and managing stop losses as trades move in your favor, locking in profits and eliminating risk.",
    bullets: [
      "50% Tranche Scale: Take 50% off the table when trade reaches your first measured profit target (1:1 or 1:2 R:R).",
      "75% Stop Adjustment: Move stop loss to break-even or lock in profit once price reaches 75% of your target distance.",
      "Runner Management: Let the final runner chase the ultimate HTF liquidity objective."
    ],
    executionTitle: "Applying the 50/75 Protocol:",
    executionSteps: [
      "Step 1: Define your target and split your position size into managed tranches.",
      "Step 2: Automate partial profit-taking at predetermined structural levels.",
      "Step 3: Adjust stop-loss orders systematically without emotional interference."
    ],
    visualType: "PO3",
    homework: "Simulate 5 trades using the 50/75 stop management protocol and calculate the impact on overall expectancy."
  },
  36: {
    title: "Episode 36: Trading Psychology & Drawdown Mastery",
    heading: "Embracing Losses and Neutralizing Emotional Tilt",
    p1: "Professional trading requires embracing losses as standard operating business expenses rather than personal failures. Managing drawdown without emotional tilt separates profitable traders from amateurs. A loss is simply a tax paid for gathering market data.",
    bullets: [
      "Business Expense View: Losses are standard operational costs of statistical edge.",
      "Loss Streak Protocol: Halve your risk immediately following a 2-consecutive-loss streak.",
      "Revenge Trading Ban: Never attempt revenge trading; step away from screens after hitting max daily loss."
    ],
    executionTitle: "Managing Psychological Tilt:",
    executionSteps: [
      "Step 1: Write your mandatory drawdown rules on a physical card next to your desk.",
      "Step 2: If you experience emotional frustration, close your trading platform for the remainder of the session.",
      "Step 3: Review losing trades objectively during evening journal reviews."
    ],
    visualType: "PO3",
    homework: "Write a personal trading psychology manifesto outlining your exact protocol when facing a drawdown streak."
  },
  37: {
    title: "Episode 37: Clinical Journaling & Data Collection",
    heading: "Building Your Quantitative Trading Database",
    p1: "A professional trading journal is a clinical data-collection tool. It must record technical annotations, market conditions, and execution screenshots without emotional venting. Track win rate, average risk-to-reward ratio, time of day, and setup type.",
    bullets: [
      "Clinical Documentation: Every journal entry must include pre-entry and post-exit annotated screenshots.",
      "Quantitative Metrics: Track win rate, average R:R, time of day, and setup category.",
      "Eliminating Narrative: Eliminate emotional narrative; focus purely on execution mechanics."
    ],
    executionTitle: "Building Your Quantitative Journal:",
    executionSteps: [
      "Step 1: Take clean chart snapshots before entering any position.",
      "Step 2: Log the exact setup category (e.g., FVG retest, Breaker bounce, SMT divergence).",
      "Step 3: Review your aggregate monthly journal metrics every Sunday."
    ],
    visualType: "FVG",
    homework: "Create a standardized spreadsheet template for your trade journaling containing all required technical metrics."
  },
  38: {
    title: "Episode 38: Prop Firm Funding & Evaluation Rules",
    heading: "Navigating Trailing Drawdown and Daily Loss Limits",
    p1: "Prop firm evaluations require strict adherence to daily drawdown limits. Passing evaluations is not about hitting home runs; it is about consistent, disciplined base hits. Treat evaluation accounts with the exact same risk protocol as personal live capital.",
    bullets: [
      "Base Hit Philosophy: Prop evaluations require steady base hits, not home run gambles.",
      "Trailing Drawdown Respect: Never violate the trailing max drawdown rule for short-term gains.",
      "Volatility Scaling: Scale down position size during high-volatility news events to protect daily loss limits."
    ],
    executionTitle: "Navigating Prop Evaluations:",
    executionSteps: [
      "Step 1: Calculate your maximum daily risk dollar limit based on the prop firm's rules.",
      "Step 2: Set a hard stop cutoff in your trading platform to prevent accidental rule breaches.",
      "Step 3: Aim for steady, small percentage gains over a 20-trading-day window."
    ],
    visualType: "PO3",
    homework: "Write a comprehensive prop firm risk checklist outlining exact daily loss limits and maximum contract sizing."
  },
  39: {
    title: "Episode 39: Building Your Unified Personal Model",
    heading: "Synthesizing Bias, Time, Trigger, and Risk",
    p1: "Success in trading comes from mastering one single, repeatable setup model rather than chasing every strategy on the internet. Combine your bias, time filter, and execution trigger into a unified personal model that you execute blindly.",
    bullets: [
      "Rule 1: HTF Bias established.",
      "Rule 2: Killzone timing verified.",
      "Rule 3: Liquidity sweep + MSS + FVG entry trigger present.",
      "Rule 4: 1% risk enforced."
    ],
    executionTitle: "Finalizing Your Model:",
    executionSteps: [
      "Step 1: Write out your personal 4-rule model in stone.",
      "Step 2: Pledge to take *only* trades that check all 4 boxes.",
      "Step 3: Backtest your unified model across 100 historical chart samples."
    ],
    visualType: "SMA",
    homework: "Draft your formal 1-page Master Trading Model document, outlining every entry, exit, and risk parameter."
  },
  40: {
    title: "Episode 40: Execution & The 60-Second Rule",
    heading: "Absolute Neutrality and Standing Aside in Chop",
    p1: "Absolute emotional neutrality is the hallmark of an elite trader. If market conditions become muddy or unclear, apply the 60-second rule: close your charts and walk away. Confusion equals zero edge; never force a trade in choppy conditions.",
    bullets: [
      "Confusion Equals Zero Edge: Never force a trade when market structure is muddy.",
      "Neutrality Definition: Feeling neither euphoria after a win nor despair after a loss.",
      "The 60-Second Rule: Close your charts and walk away the moment conditions become unclear."
    ],
    executionTitle: "Practicing Neutrality:",
    executionSteps: [
      "Step 1: If you find yourself questioning your analysis, stand down immediately.",
      "Step 2: Accept that missing a move is infinitely better than taking a sloppy, un-modelled loss.",
      "Step 3: Treat trading like a boring, mechanical factory job."
    ],
    visualType: "PO3",
    homework: "Practice walking away from your trading desk for the rest of the day the moment you spot unclear, choppy market conditions."
  },
  41: {
    title: "Episode 41: The Final Master Blueprint Synthesis",
    heading: "The Ultimate ICT & Velez Execution Masterclass",
    p1: "This final session synthesizes every concept—liquidity, displacement, imbalances, time windows, and risk management—into an impenetrable master execution blueprint. Respect the Power of Three cycle, demand institutional validation, and execute with supreme confidence.",
    bullets: [
      "Power of Three Mastery: Respect the AMD cycle across all daily sessions without exception.",
      "Institutional Validation: Demand FVG and MSS confirmation before risking capital.",
      "Rigid Discipline: Never compromise on risk parameters or moving average trend filters.",
      "Professional Execution: Execute with supreme confidence and complete emotional detachment."
    ],
    executionTitle: "Finalizing Your Master Blueprint:",
    executionSteps: [
      "Step 1: Review all previous 40 episode notes and homework completions thoroughly.",
      "Step 2: Commit to practicing your master model in live simulation before scaling capital.",
      "Step 3: Step into the markets as a disciplined professional trader."
    ],
    visualType: "Matrix",
    homework: "Complete your Master ICT & Velez Trading Blueprint and prepare your live execution journal for ongoing success."
  }
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
