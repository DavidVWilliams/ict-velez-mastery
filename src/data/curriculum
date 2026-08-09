// src/data/curriculum.js
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
    title: "Episode 1: Liquidity & Order Pairing",
    rawText: "Liquidity acts as the ultimate fuel for institutional algorithms. Large banks require a counter-party. To buy heavily, they need a vast pool of willing sellers found below established support levels.",
    heading: "The Counter-Party Requirement",
    p1: "Large banks cannot simply buy massive quantities without shifting the price. They need a vast pool of willing sellers. These are found where retail traders place their stop-loss orders.",
    bullets: [
      "Buy Side Liquidity (BSL): Buy stops resting above old highs; used by institutions to exit longs or enter shorts.",
      "Sell Side Liquidity (SSL): Sell stops resting below old lows; used by institutions to exit shorts or enter long."
    ],
    executionTitle: "How to Map Liquidity on Your Chart:",
    executionSteps: [
      "Switch your chart timeframe to 15-minute or 1-hour.",
      "Look for distinct 'A' shapes (peaks/swing highs) and 'V' shapes (valleys/swing lows).",
      "Draw a horizontal line exactly at the tip of the wick of these peaks and valleys.",
      "Label the lines above current price as BSL, and the lines below current price as SSL."
    ],
    visualType: "Liquidity",
    homework: "Assignment: Open a 15-minute chart and mark at least 3 major Swing Highs (BSL) and Swing Lows (SSL)."
  },
  2: {
    title: "Episode 2: Institutional Displacement (MSS)",
    rawText: "A liquidity sweep alone is not a valid trade signal. We look for institutional displacement, categorized as a Market Structure Shift breaking an Intermediate-Term High or Low.",
    heading: "Displacement & Market Structure",
    p1: "Displacement is a sudden, energetic move indicating institutional pressure. To identify a valid shift, we look for energetic displacement breaking an opposing swing point.",
    bullets: [
      "A true shift indicates a reversal, while a lethargic break is merely a stop run.",
      "The MSS must be heavy-handed and close with a large body, not just a wick."
    ],
    executionTitle: "How to Identify a Valid Market Structure Shift (MSS):",
    executionSteps: [
      "Wait for price to cross one of your drawn BSL or SSL lines (a liquidity sweep).",
      "Immediately after the sweep, look for price to aggressively reverse direction.",
      "Identify the last recent swing high (if reversing down) or swing low (if reversing up) before the sweep occurred.",
      "Watch for a large, energetic candle to close firmly past that swing point. This line is your MSS."
    ],
    visualType: "MSS",
    homework: "Assignment: Locate a liquidity sweep followed by an energetic Market Structure Shift (MSS) on a 5-minute chart. Mark the MSS line."
  },
  3: {
    title: "Episode 3: Price Inefficiencies (FVG)",
    rawText: "When institutional displacement occurs, it leaves behind a Fair Value Gap. The algorithm seeks equilibrium and will return to this inefficiency to properly offer both buy and sell liquidity.",
    heading: "The Imbalance-Rebalance Loop",
    p1: "Rapid repricing leaves behind a Fair Value Gap (FVG). Mechanically, it is a three-candle sequence where the wicks of Candle 1 and Candle 3 fail to overlap.",
    bullets: [
      "FVG: A vacuum of unfulfilled orders left behind by displacement.",
      "Price acts as a magnet, drawing back to this gap to 'fill' the empty space."
    ],
    executionTitle: "How to Draw a Fair Value Gap (FVG):",
    executionSteps: [
      "Find a massive, long displacement candle (this is Candle 2).",
      "Look at the candle immediately before it (Candle 1) and immediately after it (Candle 3).",
      "For a bullish (up) move: Draw a box from the HIGH wick of Candle 1 to the LOW wick of Candle 3.",
      "If there is empty space between those two wicks that Candle 2's body occupies, that box is your FVG."
    ],
    visualType: "FVG",
    homework: "Assignment: Find 3 FVGs on a 15-minute chart and draw a box from Candle 1's wick to Candle 3's wick."
  },
  4: {
    title: "Episode 4: The Velez Macro Baseline (200 SMA)",
    rawText: "To enhance execution safety, we apply the Oliver Velez 200 Simple Moving Average as a macro baseline. We never initiate positions contrary to its slope.",
    heading: "The Velez Macro Baseline",
    p1: "We integrate the 200 Simple Moving Average (SMA) as our primary trend filter. You must strictly use the Simple Moving Average (SMA), never an Exponential Moving Average (EMA).",
    bullets: [
      "Ascending SMA: Only authorize long (buy) executions.",
      "Descending SMA: Only authorize short (sell) executions.",
      "Ignition Confirmation: Wait for a definitive continuation bar pushing away from the SMA within the FVG."
    ],
    executionTitle: "How to Apply the 200 SMA Filter:",
    executionSteps: [
      "Open your chart indicators and add a 'Simple Moving Average' (SMA). Change the length setting to 200.",
      "Determine the visual slope: Is the line pointing up or down?",
      "If price drops into a bullish FVG, check the SMA. If the SMA is pointing UP, the trade is valid. If it is pointing DOWN, cancel the trade.",
      "Wait for a green 'Ignition' candle to form inside the FVG, bouncing off the SMA directionally, before entering."
    ],
    visualType: "SMA",
    homework: "Assignment: Apply the 200 SMA. Find examples where price retraced into an FVG while respecting the slope. Mark the Ignition candle."
  },
  5: {
    title: "Episode 5: Time Cycles (AMD & Killzones)",
    rawText: "Algorithmic delivery is Accumulation, Manipulation, and Distribution (AMD). Algorithms accumulate during illiquid hours, manipulate to capture stops, and distribute toward the true target.",
    heading: "Power of 3 & The Judas Swing",
    p1: "Order flow is irrelevant outside proper timing. Algorithmic volatility adheres to predictable daily cycles.",
    bullets: [
      "Accumulation: Passive baseline positioning during overnight sessions.",
      "Manipulation (Judas Swing): A deceptive price move opposite the true daily bias.",
      "Distribution: The true directional expansion toward primary targets."
    ],
    executionTitle: "How to Track the Power of 3:",
    executionSteps: [
      "Draw a vertical line on your chart at Midnight (00:00 EST) and another at 08:30 EST.",
      "Draw a horizontal line at the exact opening price at Midnight EST.",
      "If you expect a bearish day, look for price to rally ABOVE the Midnight open line during the London or early NY session (This is the Judas Swing / Manipulation).",
      "Look to short the market after this manipulation occurs, riding the distribution wave down."
    ],
    visualType: "PO3",
    homework: "Assignment: Draw vertical lines marking Midnight EST and 08:30 EST. Draw a horizontal line at the Midnight Open price. Identify the Judas Swing."
  },
  6: {
    title: "Episode 6: Wholesale vs. Retail (Premium/Discount)",
    rawText: "Institutions operate on wholesale pricing. We bisect price into Premium and Discount territories, strictly limiting executions to the Discount matrix for long positions.",
    heading: "Discount, Premium & Optimal Trade Entry",
    p1: "By mapping a Fibonacci tool from the highest and lowest bodies within a swing, we bisect the range to find fair wholesale pricing.",
    bullets: [
      "Premium: Above 50% equilibrium; ideal for selling.",
      "Discount: Below 50% equilibrium; ideal for buying.",
      "Optimal Trade Entry (OTE): Precision targeting between the 62% and 79% retracement levels."
    ],
    executionTitle: "How to use the Fibonacci for Premium/Discount:",
    executionSteps: [
      "Select the Fibonacci Retracement tool in your charting platform.",
      "Find the recent displacement wave. Click the absolute Low of the move and drag the tool to the absolute High.",
      "Look at the 0.5 (50%) line. This is Equilibrium.",
      "If you want to buy, you MUST wait for price to drop below the 50% line into the Discount area. Look for your FVG to line up with the 0.62 or 0.79 Fib levels."
    ],
    visualType: "Matrix",
    homework: "Assignment: Pull a Fibonacci retracement on a recent displacement wave. Mark the 50% Equilibrium and highlight the Discount territory."
  },
  7: {
    title: "Episode 7: Capital Preservation & Risk",
    rawText: "Variance guarantees flawless setups will fail. Exposure is capped at a maximum of 1% per configuration, with invalidation stops rigidly placed beyond the displacement wave.",
    heading: "Systematic Risk Management",
    p1: "Survival hinges entirely on rigid capital preservation and viewing drawdown as a temporary loan to the market.",
    bullets: [
      "The 1% Rule: Never exceed 1% account equity per setup.",
      "Drawdown Mitigation: Halve your risk for the next trade after a loss.",
      "Hard Invalidation: Place stops beyond the structural extreme."
    ],
    executionTitle: "How to Calculate and Apply 1% Risk:",
    executionSteps: [
      "Take your total account balance (e.g., $10,000) and multiply by 0.01 ($100). This is your absolute max risk.",
      "Find your entry price and your stop-loss price. Measure the distance in ticks/points.",
      "Calculate your position size (number of micro contracts or shares) so that if your stop is hit, you only lose exactly $100.",
      "If you lose the trade, your next trade's max risk is automatically cut to 0.5% ($50)."
    ],
    visualType: "PO3",
    homework: "Assignment: Calculate exactly 1% of your account balance. Find a setup, mark the stop loss, and calculate how many contracts/shares you can buy to equal exactly 1% risk."
  },
  8: {
    title: "Episode 8: Institutional Sponsorship",
    rawText: "Institutional sponsorship means higher timeframe objectives are actively drawing price. We look for HTF Order Blocks and liquidity pools to guide the daily bias.",
    heading: "Higher Timeframe Draw on Liquidity",
    p1: "The daily range expands toward macro liquidity pools. Sponsorship is confirmed when price energetically rejects counter-trend arrays.",
    bullets: [
      "Identify the HTF target first (Weekly/Daily).",
      "Sponsorship defends HTF arrays with obvious displacement.",
      "Avoid initiating intraday trades that conflict with the HTF draw."
    ],
    executionTitle: "How to Find the Draw on Liquidity:",
    executionSteps: [
      "Open the Daily chart.",
      "Look left. Find the most obvious, un-swept Swing High and Swing Low.",
      "Ask: Which level is price currently moving towards with the most momentum?",
      "That level is your Draw on Liquidity. Do not take intraday trades fighting this direction."
    ],
    visualType: "Liquidity",
    homework: "Assignment: Open a Daily chart. Mark the closest un-swept high and low. Determine which is the most likely draw on liquidity today."
  },
  9: {
    title: "Episode 9: Power of 3 Deep Dive",
    rawText: "The Midnight New York open dictates the daily bias base. For a bearish model, we expect a rally above the Midnight Open to accumulate shorts.",
    heading: "Opening Range Mathematics",
    p1: "The relationship between the Midnight Open and the 08:30 EST Open is critical for framing the Judas Swing.",
    bullets: [
      "Bearish Bias: Look for the Judas Swing to sweep above the open.",
      "Bullish Bias: Look for the Judas Swing to sweep below the open.",
      "Project the Judas Swing distance below the open to target distribution."
    ],
    executionTitle: "How to Project Targets using Opening Range Math:",
    executionSteps: [
      "Measure the distance from the Midnight Open price to the absolute peak of the Judas Swing (the manipulation).",
      "Take that exact measurement (e.g., 20 points).",
      "Project that measurement downward starting from the Midnight Open price.",
      "This gives you a highly accurate algorithmic profit target for the distribution phase."
    ],
    visualType: "PO3",
    homework: "Assignment: Measure the distance of a morning Judas Swing from the open. Project that distance in the opposite direction to map a profit target."
  },
  10: {
    title: "Episode 10: New York AM Killzone",
    rawText: "The 08:30 AM EST News Embargo serves as a volatility catalyst. High-impact news drivers engineer liquidity before the real move occurs.",
    heading: "The News Smoke Screen",
    p1: "News acts as a catalyst to run liquidity. The NY AM Killzone (08:30–11:00 EST) produces the bulk of the daily expansion.",
    bullets: [
      "Wait for the 8:30 embargo lift before executing.",
      "News spikes are typically algorithmic traps (Manipulation).",
      "Look for the MSS immediately following the news sweep."
    ],
    executionTitle: "How to Trade the NY AM Killzone:",
    executionSteps: [
      "Check an economic calendar for 08:30 AM EST high-impact news.",
      "Wait flat on your hands at 08:30. Let the news spike occur.",
      "Watch the spike sweep a BSL or SSL level.",
      "Wait for the 1m or 5m chart to print a Market Structure Shift reversing the news spike, then enter on the FVG."
    ],
    visualType: "MSS",
    homework: "Assignment: Mark 8:30 AM EST on a news day. Annotate the initial news spike (the trap) and the subsequent MSS that confirms the true direction."
  },
  11: {
    title: "Episode 11: PM Session Killzone",
    rawText: "The Lunch Hour (12:00-13:00 EST) is a void for observation. The PM Killzone (13:30-16:00 EST) offers secondary expansion or rebalancing of the morning delivery.",
    heading: "The Lunch Void & PM Distribution",
    p1: "Do not initiate new positions during the lunch hour. Monitor it for stop-runs that setup the PM session.",
    bullets: [
      "Rule 1: No new positions from 12:00 to 13:00 EST.",
      "Rule 2: The PM session either continues the AM trend or reverses to rebalance.",
      "Wait for the 1:30 PM algorithmic shift before looking for setups."
    ],
    executionTitle: "How to Trade the PM Killzone:",
    executionSteps: [
      "Draw a box covering price action from 12:00 PM to 1:30 PM EST. This is the lunch chop.",
      "At 1:30 PM EST, watch for price to break out of this box, usually sweeping lunch liquidity.",
      "If the AM session was heavily trending, look for the PM session to offer a Discount/Premium FVG entry to continue the trend.",
      "If the AM session hit a major Daily target, look for the PM session to reverse and rebalance."
    ],
    visualType: "PO3",
    homework: "Assignment: Find a setup that formed strictly after 13:30 EST. Did it continue the AM trend or reverse?"
  },
  12: {
    title: "Episode 12: Advanced Price Action Theory",
    rawText: "Market structure is categorized by Long-Term Highs (LTH), Intermediate-Term Highs (ITH), and Short-Term Highs (STH) to understand true algorithmic efficiency.",
    heading: "The Hierarchy of Swings",
    p1: "We move beyond simple 'higher highs' to track how the algorithm re-delivers price.",
    bullets: [
      "LTH: Anchored to Daily chart liquidity pools.",
      "ITH: A high flanked by two lower short-term highs, or a high that rebalances an FVG.",
      "STH: Immediate swing points acting as internal liquidity."
    ],
    executionTitle: "How to Identify an Intermediate-Term High (ITH):",
    executionSteps: [
      "Look at a recent peak (Swing High).",
      "Look at the swing high immediately to the left of it. Is it lower?",
      "Look at the swing high immediately to the right of it. Is it lower?",
      "If the center peak is higher than both immediate neighbors, it is an ITH. This is a critical level for Market Structure Shifts."
    ],
    visualType: "MSS",
    homework: "Assignment: Select an Hourly chart. Locate a peak and verify it has a lower high on both the left and right to label it an ITH."
  },
  13: {
    title: "Episode 13: Data Ranges & IPDA",
    rawText: "The Interbank Price Delivery Algorithm operates on specific lookback periods. We map the current dealing range to identify relevant internal and external liquidity.",
    heading: "Dealing Ranges & Lookbacks",
    p1: "Identify the current high-to-low dealing range. Price strictly moves from Internal Liquidity (FVGs) to External Liquidity (old highs/lows).",
    bullets: [
      "Define the high and low of the active algorithmic cycle.",
      "If price sweeps External Liquidity, expect a draw to Internal Liquidity.",
      "If price rebalances Internal Liquidity, expect a draw to External."
    ],
    executionTitle: "How to Trade Internal to External:",
    executionSteps: [
      "Identify the major Swing High and Swing Low of the current week.",
      "If price drops and sweeps the external Swing Low (External Liquidity), immediately shift your bias to bullish.",
      "Your new target is an un-filled FVG (Internal Liquidity) located higher up in the range."
    ],
    visualType: "Liquidity",
    homework: "Assignment: Find a chart where price swept a major low (External), then immediately rallied to fill an FVG (Internal)."
  },
  14: {
    title: "Episode 14: Macro Timeframes",
    rawText: "The daily chart is the 'Parent' of price structure. All minor intraday swings are subordinate to the daily chart's objective to reach old highs or fill macro imbalances.",
    heading: "The Parent Timeframe",
    p1: "To read order flow, lock in the macro narrative first. Intraday setups that conflict with the Daily draw on liquidity are inherently low probability.",
    bullets: [
      "Begin analysis strictly on Weekly and Daily charts.",
      "Identify the closest un-swept daily liquidity pool.",
      "Filter intraday setups to only trade toward the daily pool."
    ],
    executionTitle: "How to Lock in the Macro Narrative:",
    executionSteps: [
      "Open the Daily chart before looking at anything else.",
      "Identify if the current Daily candle is likely to expand UP or DOWN based on the closest liquidity pool.",
      "Write 'Daily Bias: BULLISH/BEARISH' on a sticky note.",
      "Drop to the 5-minute chart. Ignore ALL setups that go against your sticky note."
    ],
    visualType: "Liquidity",
    homework: "Assignment: Look at the Daily chart. Write down the directional bias. Go to the 15m chart and find a setup aligning with that bias."
  },
  15: {
    title: "Episode 15: Interest Rate Yields",
    rawText: "Understanding the correlation between bond yields and equities helps frame risk-on vs. risk-off environments, feeding into broader intermarket analysis.",
    heading: "Risk-On vs Risk-Off",
    p1: "The algorithm heavily weights macro environments. Rising yields typically pressure equities, providing a macro bias for shorting indices.",
    bullets: [
      "Monitor the 10-Year Treasury Yield (TNX).",
      "Use macro strength/weakness to validate your Daily bias.",
      "Align execution with the broader capital flow."
    ],
    executionTitle: "How to use Yields for Confirmation:",
    executionSteps: [
      "Open a chart for TNX (10-Year Yield).",
      "Determine if the daily trend for yields is sharply up or sharply down.",
      "If TNX is breaking out UP, expect intense downward pressure on SPX/Nasdaq. Prioritize short setups.",
      "If TNX is breaking DOWN, expect equities to rally. Prioritize long setups."
    ],
    visualType: "SMT",
    homework: "Assignment: Open the TNX (10-year yield) chart alongside the S&P 500. Annotate a period showing their inverse correlation."
  },
  16: {
    title: "Episode 16: Intermarket Analysis",
    rawText: "The 2022 model relies on Correlated Asset Divergence to confirm smart money activity. We use the Smart Money Technique (SMT) between closely related assets.",
    heading: "Smart Money Technique (SMT)",
    p1: "SMT occurs when correlated indices fail to make symmetrical highs or lows. This 'cracked correlation' reveals institutional heavy-handedness.",
    bullets: [
      "Compare ES (S&P 500) and NQ (Nasdaq).",
      "If ES makes a lower low but NQ makes a higher low, NQ is being supported.",
      "SMT divergence at a key liquidity pool confirms the Judas Swing."
    ],
    executionTitle: "How to Spot SMT Divergence:",
    executionSteps: [
      "Open TradingView with a split-screen. Left side: ES (S&P 500). Right side: NQ (Nasdaq).",
      "Watch price as it drops into a major support zone.",
      "If ES drops below its previous swing low, check NQ.",
      "If NQ stops short and forms a Higher Low while ES forms a Lower Low, SMT is confirmed. Buy NQ."
    ],
    visualType: "SMT",
    homework: "Assignment: Place ES and NQ side-by-side on a 5-minute chart. Find SMT divergence at a major swing low."
  },
  17: {
    title: "Episode 17: Top Down Analysis",
    rawText: "A mechanical Top-Down Analysis transitions from the Weekly narrative to the 1-minute execution context, ensuring intraday trades are sponsored by macro order flow.",
    heading: "The Execution Pipeline",
    p1: "Never execute based solely on a 1-minute pattern. The pattern must form at a HTF Key Level.",
    bullets: [
      "Weekly/Daily: Define the Draw on Liquidity.",
      "1-Hour/15-Minute: Identify the specific PD Array (FVG/OB).",
      "1-Minute/5-Minute: Wait for MSS and entry execution."
    ],
    executionTitle: "How to Build the Top-Down Pipeline:",
    executionSteps: [
      "Step 1: Daily Chart -> Mark the target liquidity pool (Draw).",
      "Step 2: 1-Hour Chart -> Mark a large FVG pointing in the direction of the Draw.",
      "Step 3: 5-Minute Chart -> Wait for price to touch the 1-Hour FVG, then look for a 5-minute MSS to enter."
    ],
    visualType: "FVG",
    homework: "Assignment: Annotate a chart progressing from Daily bias, to a 1-Hour FVG, down to a 5-minute entry setup inside that FVG."
  },
  18: {
    title: "Episode 18: Trading The Weekly Profile",
    rawText: "The weekly range often exhibits a specific expansion profile. Fridays frequently feature Market On Close (MOC) position squaring, creating predictable retracements.",
    heading: "Weekly Profiles & MOC",
    p1: "Institutions close weekly positions on Friday afternoons, causing price to retrace back toward the weekly range equilibrium.",
    bullets: [
      "Identify the Weekly High and Low by Thursday.",
      "MOC Macro: 15:50 - 16:00 EST on Fridays.",
      "Expect sharp counter-trend rebalancing into the close."
    ],
    executionTitle: "How to Trade the Friday MOC:",
    executionSteps: [
      "On Friday at 3:30 PM EST, review the entire week's move. Was it a massive bullish week?",
      "If yes, expect institutions to sell off their profits right before the weekend.",
      "At 15:50 EST, look for a sudden 1-minute MSS in the opposite direction of the weekly trend.",
      "Scalp the retracement back toward the middle of the week's range."
    ],
    visualType: "PO3",
    homework: "Assignment: Review last Friday's price action from 15:50 to 16:00 EST. Did price square off and retrace against the weekly trend?"
  },
  19: {
    title: "Episode 19: Trading The Daily Profile",
    rawText: "Daily Rebalance Theory filters out continuous expansion setups on days meant for tight, narrow consolidation, preventing over-trading during chop.",
    heading: "Consolidation Hurdles",
    p1: "Not every day expands. Learn to identify consolidation profiles where price ping-pongs between internal premium and discount FVGs.",
    bullets: [
      "Consolidation Day: Price remains inside the previous day's range.",
      "Avoid targeting external liquidity on these days.",
      "Take profits at the 50% equilibrium of the internal range."
    ],
    executionTitle: "How to Identify a Choppy Consolidation Day:",
    executionSteps: [
      "Mark the absolute High and Low of yesterday.",
      "If today's morning session fails to aggressively break yesterday's High or Low, assume consolidation.",
      "Stop aiming for home runs. Switch your targets to the 50% midpoint of yesterday's range.",
      "Buy Discount FVGs, Sell Premium FVGs within the box."
    ],
    visualType: "Matrix",
    homework: "Assignment: Identify a day where price remained entirely within the previous day's high/low. Mark the 50% line."
  },
  20: {
    title: "Episode 20: The London Open",
    rawText: "The London Killzone frequently engineers the highest or lowest price point of the daily range, executing the primary manipulation phase.",
    heading: "London Open Killzone (02:00 - 05:00 EST)",
    p1: "London sets the stage. If London creates the low of the day, New York will typically offer a continuation setup for distribution.",
    bullets: [
      "London Open: 02:00 - 05:00 EST.",
      "Often forms the Judas Swing extreme.",
      "NY session will trade away from the London extreme."
    ],
    executionTitle: "How to Use London to Trade New York:",
    executionSteps: [
      "Wake up at 08:00 EST and look at what happened between 02:00 and 05:00 EST.",
      "Did London drop aggressively and sweep a major Daily SSL level?",
      "If yes, London likely created the Low of the Day.",
      "In the NY session, only look for Bullish FVGs to buy the continuation of London's reversal."
    ],
    visualType: "PO3",
    homework: "Assignment: Find 3 examples where the London Killzone engineered the absolute High or Low of the Daily candle."
  },
  21: {
    title: "Episode 21: Tape Reading",
    rawText: "Active tape reading requires observing how price reacts at opposing arrays. If you are long, bearish FVGs should offer no resistance as price trades through them.",
    heading: "Reading Institutional Flow",
    p1: "Once in a trade, monitor the immediate reaction to opposing PD arrays.",
    bullets: [
      "A valid long trade will slice effortlessly through bearish FVGs.",
      "If price respects and reverses off a counter-trend FVG, your premise may be wrong.",
      "Use tape reading to cut losses early if the algorithm abandons the objective."
    ],
    executionTitle: "How to Tape Read Mid-Trade:",
    executionSteps: [
      "You enter a Long position based on a bullish FVG.",
      "As price moves up, it encounters an old bearish FVG.",
      "Watch the candle close. If it slices straight through the bearish FVG and closes above it, your trade is incredibly strong.",
      "If it wicks the bearish FVG and immediately prints a massive red candle against you, manually close the trade early."
    ],
    visualType: "FVG",
    homework: "Assignment: Replay a past trade. Note exactly how price reacted when it hit an opposing FVG. Did it slice through or reverse?"
  },
  22: {
    title: "Episode 22: Identifying Traps",
    rawText: "High impact news is a smoke screen. Initial aggressive spikes are almost always algorithmic traps designed to trap retail breakout artists.",
    heading: "The Retail Trap",
    p1: "The algorithm utilizes retail conventionality (trendlines, breakouts) to engineer liquidity pools.",
    bullets: [
      "Do not trade the immediate news candle.",
      "The initial move runs into liquidity to trap buyers/sellers.",
      "The true algorithmic reversal happens after the stops are purged."
    ],
    executionTitle: "How to Avoid the Breakout Trap:",
    executionSteps: [
      "Identify a retail 'Trendline' with 3 clean touches.",
      "Wait for news to aggressively break the trendline. Retail will pile in to buy the breakout.",
      "Watch the algorithm immediately slam price back down in the opposite direction to trap them.",
      "Enter short on the FVG created by the reversal slam."
    ],
    visualType: "Liquidity",
    homework: "Assignment: Review an NFP Friday. Annotate the initial trap spike and the subsequent true reversal."
  },
  23: {
    title: "Episode 23: Reversals vs Retracements",
    rawText: "A true shift in market structure requires energetic displacement. A lethargic break of a high/low is merely a retracement stop-run to continue the trend.",
    heading: "Validating the Shift",
    p1: "The visual signature of a true change in market structure is heavy-handed, one-sided price delivery.",
    bullets: [
      "Stop Run: Wicks through the level but fails to close heavily.",
      "True MSS: Closes decisively with a large body and creates an FVG.",
      "Context: Reversals happen at HTF arrays; retracements happen mid-range."
    ],
    executionTitle: "How to tell a Reversal from a Retracement:",
    executionSteps: [
      "Watch price cross an old Swing High.",
      "Look at the candle close. Did it close above the line, or did it pull back and leave a long wick?",
      "If it's just a wick, it's a stop run (Retracement). Expect price to continue downward.",
      "If a large, full-bodied candle closes well above the line leaving an FVG, it is a true Reversal (MSS)."
    ],
    visualType: "MSS",
    homework: "Assignment: Find a swing high that was broken by a wick (stop run) vs one broken by a heavy body (true shift)."
  },
  24: {
    title: "Episode 24: Breaker Blocks",
    rawText: "A Breaker Block is a failed Order Block. When price violently breaks through an established Order Block, it converts into a Breaker for trade execution.",
    heading: "Failed Arrays & Breakers",
    p1: "When an institution abandons a level, the resulting failed array becomes a highly sensitive execution zone.",
    bullets: [
      "Bullish Breaker: An old high that was swept, then broken downward.",
      "It forms the center of a 'High, Lower Low, Higher High' pattern.",
      "Price will return to the Breaker to mitigate positions."
    ],
    executionTitle: "How to Trade a Breaker Block:",
    executionSteps: [
      "Find a 'High, Lower Low, Higher High' pattern.",
      "Look at the peak of the first High. Draw a box around the last up-close candle before the drop.",
      "Once price forms the Higher High, wait for it to pull back down to the box you drew.",
      "Buy when price taps the top of the Breaker box."
    ],
    visualType: "Breaker",
    homework: "Assignment: Locate a Breaker. Find a High, Lower Low, Higher High sequence. Mark the up-close candle before the Lower Low."
  },
  25: {
    title: "Episode 25: Mitigation Blocks",
    rawText: "Similar to Breakers, Mitigation Blocks occur when price fails to make a higher high or lower low, creating a failure swing that institutions use to mitigate losses.",
    heading: "Failure Swings & Mitigation",
    p1: "Mitigation blocks lack the initial stop run of a Breaker. They represent a failure to sweep liquidity.",
    bullets: [
      "Forms from a Lower High or Higher Low.",
      "Institutions use the return to the block to close underwater positions at break-even.",
      "Provides excellent continuation entries."
    ],
    executionTitle: "How to Trade a Mitigation Block:",
    executionSteps: [
      "Find a 'High, Higher Low, Lower High, Lower Low' pattern (A failure to sweep the high).",
      "Draw a box around the down-close candle at the Higher Low.",
      "Wait for price to pull back up to this box.",
      "Sell when price taps the bottom of the Mitigation box."
    ],
    visualType: "Breaker",
    homework: "Assignment: Find a failure swing (e.g., Lower High). Mark the down-close candle before the failure as the Mitigation Block."
  },
  26: {
    title: "Episode 26: Rejection Blocks",
    rawText: "Rejection Blocks occur at the extremes of price action characterized by long wicks. Institutions accumulate positions inside the wick before price reverses.",
    heading: "Trading the Wick Extreme",
    p1: "Long wicks represent aggressive repricing. The body of the candle prior to the long wick forms the Rejection Block.",
    bullets: [
      "Bullish Rejection Block: The low of the candle body before a long downward wick.",
      "Bearish Rejection Block: The high of the candle body before a long upward wick.",
      "Price often returns to the Rejection Block before continuing."
    ],
    executionTitle: "How to use a Rejection Block:",
    executionSteps: [
      "Find a massive Swing Low that has a very long wick pointing down.",
      "Draw a horizontal line right at the bottom edge of the actual candle BODY (not the tip of the wick).",
      "When price pulls back to re-test the area, it will often bounce exactly off your body line (Rejection Block) without needing to sweep the tip of the wick."
    ],
    visualType: "Liquidity",
    homework: "Assignment: Find a long wick that swept liquidity. Mark the Rejection Block (candle body) and observe the retest."
  },
  27: {
    title: "Episode 27: Vacuum Blocks",
    rawText: "Vacuum Blocks are opening gaps in price delivery, typically seen at the start of a new trading week. They represent extreme imbalances.",
    heading: "Opening Gaps & Vacuums",
    p1: "When the market opens with a significant gap, it creates a Vacuum Block. The algorithm will eventually seek to close this gap.",
    bullets: [
      "Represents a complete absence of trading at specific prices.",
      "Acts identically to a Fair Value Gap.",
      "Price is magnetically drawn to fill the vacuum."
    ],
    executionTitle: "How to Trade a Vacuum Block:",
    executionSteps: [
      "Look at the Sunday 6:00 PM EST open for Index futures.",
      "If price opens with a massive physical gap separating Friday's close from Sunday's open, draw a box filling the empty space.",
      "Treat this box exactly like an FVG. Target it for profit taking if trading back towards it, or enter off it once it is filled."
    ],
    visualType: "FVG",
    homework: "Assignment: Look at a Sunday open on ES/NQ. Mark any opening gaps (Vacuum Blocks) and track when they were filled."
  },
  28: {
    title: "Episode 28: Order Block Theory",
    rawText: "A high-probability Order Block is not just any down-closed candle. It must be accompanied by a Fair Value Gap and a clear shift in market structure.",
    heading: "Validating Order Blocks",
    p1: "The algorithm uses Order Blocks to 'block' price from going lower and accumulate longs. Validation requires strict criteria.",
    bullets: [
      "Must have an associated FVG immediately following it.",
      "Must result in a Market Structure Shift (MSS).",
      "Must align with the HTF draw on liquidity."
    ],
    executionTitle: "How to Validate a True Order Block:",
    executionSteps: [
      "Find a down-close candle that sparked a massive up-move.",
      "Check 1: Did the up-move break a Swing High (MSS)? If no, invalid.",
      "Check 2: Did the up-move leave an FVG directly attached to the down candle? If no, invalid.",
      "If both are yes, draw a box around the entire down-close candle. This is your high-probability Bullish Order Block."
    ],
    visualType: "MSS",
    homework: "Assignment: Find a down-close candle that led to an up-move. Run the 2 checks. If valid, mark it as a Bullish Order Block."
  },
  29: {
    title: "Episode 29: Fair Value Gaps Deep Dive",
    rawText: "The FVG is the cornerstone of the 2022 model. It represents a specific price range offered only to one side of the market. The algorithm re-delivers price to ensure efficiency.",
    heading: "The Re-Delivery Sequence",
    p1: "Like a paint roller applied too fast, leaving an unpainted patch, the algorithm must 're-deliver' price to the FVG to close the inefficiency.",
    bullets: [
      "BISI: Buy-Side Imbalance, Sell-Side Inefficiency (Bullish FVG).",
      "SIBI: Sell-Side Imbalance, Buy-Side Inefficiency (Bearish FVG).",
      "Price returns to the FVG to offer the missing liquidity."
    ],
    executionTitle: "How to Target Consequent Encroachment (CE):",
    executionSteps: [
      "Draw your FVG box from wick to wick.",
      "Find the exact 50% midpoint of the FVG box.",
      "This 50% line is 'Consequent Encroachment'. Place your limit order exactly on this 50% line for the highest precision entry."
    ],
    visualType: "FVG",
    homework: "Assignment: Draw an FVG box. Use a Fib tool or math to draw a line at the exact 50% midpoint (Consequent Encroachment)."
  },
  30: {
    title: "Episode 30: Liquidity Voids",
    rawText: "Liquidity Voids are macro-scale inefficiencies created by extreme, multi-candle displacement. Price will often cascade through these voids to reach equilibrium.",
    heading: "Macro Inefficiencies",
    p1: "When news or heavy institutional selling creates consecutive, massive one-sided candles, it leaves a Liquidity Void.",
    bullets: [
      "Larger than a standard FVG (multiple huge candles).",
      "Price will rapidly retrace through the void because there is no structural support.",
      "Targets the origin of the displacement."
    ],
    executionTitle: "How to Trade a Liquidity Void:",
    executionSteps: [
      "Identify a 3 or 4 candle sequence of massive, unbroken green candles (often caused by news).",
      "When price eventually reverses, do not look for support inside those massive candles.",
      "Anticipate price will 'waterfall' crash rapidly through the void until it reaches the Order Block at the very bottom."
    ],
    visualType: "FVG",
    homework: "Assignment: Find a massive 4-candle drop caused by news (a void). Observe how easily price rallied back through that void."
  },
  31: {
    title: "Episode 31: Liquidity Pools",
    rawText: "Liquidity Pools (BSL/SSL) are the external targets for the IPDA algorithm. The algorithm constantly seeks to pair institutional orders with retail stops.",
    heading: "Engineering Liquidity",
    p1: "Retail support and resistance concepts are weaponized by the algorithm to build Liquidity Pools.",
    bullets: [
      "Equal Highs / Equal Lows are prime algorithmic targets.",
      "Retail traders view them as strong support/resistance.",
      "The algorithm views them as a dense pool of resting stop-loss orders."
    ],
    executionTitle: "How to Target Equal Highs/Lows:",
    executionSteps: [
      "Scan your chart for two swing highs that stop at almost the exact same price level (Retail Double Top).",
      "Recognize that thousands of retail traders have placed their stop losses just above this 'resistance'.",
      "Set your profit target just above those Equal Highs, knowing the algorithm will magnetically draw price up to sweep those stops."
    ],
    visualType: "Liquidity",
    homework: "Assignment: Find a 'Double Top' or 'Double Bottom'. Annotate the algorithmic sweep that inevitably blew through that retail pattern."
  },
  32: {
    title: "Episode 32: Stop Runs",
    rawText: "A stop run is the mechanical execution of the manipulation phase. By dropping price below an old low, the algorithm triggers sell-stops, allowing institutions to buy at a discount.",
    heading: "The Mechanics of Manipulation",
    p1: "The market must seek liquidity before it can expand. The stop run provides the fuel.",
    bullets: [
      "Occurs precisely at Killzone opens (e.g., 08:30 EST).",
      "Characterized by a rapid wick through a key level.",
      "Immediately followed by a structural shift in the opposite direction."
    ],
    executionTitle: "How to Identify the True Stop Run:",
    executionSteps: [
      "Identify the lowest point made during the Asian Session.",
      "As the London Session opens (02:00 EST), watch for price to dive quickly below the Asian Low.",
      "If it wicks below the Asian Low and immediately shoots upward, that was the Stop Run. It is now safe to look for longs."
    ],
    visualType: "Liquidity",
    homework: "Assignment: Focus on an 08:30 EST open. Did price spike down to take out an old low (Stop Run) before rallying for the day?"
  },
  33: {
    title: "Episode 33: Equilibrium & Discount",
    rawText: "Institutions refuse to buy at a Premium. We utilize the 50% Equilibrium midpoint of the dealing range to define the boundary between acceptable and prohibited execution zones.",
    heading: "The 50% Midpoint Rule",
    p1: "If you are bullish, you must wait for price to drop below the 50% Equilibrium of the current dealing range before executing.",
    bullets: [
      "Identify High to Low of the displacement wave.",
      "Bisect exactly at 50%.",
      "Executions above 50% for longs are strictly prohibited."
    ],
    executionTitle: "How to Enforce the Discount Rule:",
    executionSteps: [
      "You find a beautiful bullish FVG and you want to buy.",
      "Stop. Pull your Fib from the swing low to the swing high of the move.",
      "Look at the 50% line. Is your FVG above the 50% line (Premium)?",
      "If yes, cancel the trade. Only buy if the FVG is physically located below the 50% line (Discount)."
    ],
    visualType: "Matrix",
    homework: "Assignment: Pull a Fib on a daily dealing range. Mentally erase the top 50%. Find a valid FVG entry in the bottom half."
  },
  34: {
    title: "Episode 34: Premium Arrays",
    rawText: "For short-selling, the logic is inverted. Executions are only permitted in the Premium (upper 50%) of the range, specifically targeting FVGs or Order Blocks located there.",
    heading: "Selling in a Premium",
    p1: "Institutions sell at a premium to retail buyers. A Premium Array is a PD Array (OB, FVG, Breaker) located in the top 50% of the range.",
    bullets: [
      "Identify Low to High of the displacement wave.",
      "Bisect at 50%.",
      "Only execute short entries at arrays located in the Premium half."
    ],
    executionTitle: "How to Enforce the Premium Rule for Shorts:",
    executionSteps: [
      "You want to short the market.",
      "Pull the Fib from the Swing High down to the Swing Low.",
      "Look at the 50% line. Is your bearish FVG located below the 50% line (Discount)?",
      "If yes, cancel the trade. Only short if the FVG is physically located in the top half (Premium)."
    ],
    visualType: "Matrix",
    homework: "Assignment: Identify a bearish displacement. Locate a bearish FVG specifically in the top 50% (Premium) of that move."
  },
  35: {
    title: "Episode 35: Risk Management",
    rawText: "Strict systematic stop management protects equity. We employ the 50/75 rule: reducing risk as the trade progresses to systematically secure capital.",
    heading: "The 50/75 Stop Protocol",
    p1: "You must use the stop loss as a professional tool to limit liability and secure profits during the distribution phase.",
    bullets: [
      "When price reaches 50% of the target, reduce the stop by 25%.",
      "When price reaches 75% of the target, move the stop to Break-Even.",
      "Take partial profits at the 50% equilibrium of the dealing range."
    ],
    executionTitle: "How to Move Your Stops Mid-Trade:",
    executionSteps: [
      "Entry is at 4000. Target is 4040. Stop is 3980. Total expected range is 40 points.",
      "When price hits 4020 (50% of the way), move your stop up from 3980 to 3985 (reducing risk by 25%).",
      "When price hits 4030 (75% of the way), move your stop to 4000 (Break-Even). Your trade is now risk-free."
    ],
    visualType: "PO3",
    homework: "Assignment: In a paper trade, calculate your target distance. Mark the exact price level for 50% and 75% to manually move your stops."
  },
  36: {
    title: "Episode 36: Trading Psychology",
    rawText: "Professional operators act as a management company for losing trades. Drawdown is not a permanent loss; it is a 'Bank Loan' to the market that you will collect interest on.",
    heading: "The Professional Loser",
    p1: "The divide between an infantile gambler and a professional is defined entirely by adherence to protocol during a drawdown.",
    bullets: [
      "Infantile: Revenge trading to 'get back' losses.",
      "Professional: Viewing losses as a business tax.",
      "Protocol: Halve your risk after every losing trade (1% -> 0.5%)."
    ],
    executionTitle: "How to Apply Drawdown Halving:",
    executionSteps: [
      "You take a trade with 1% risk and lose.",
      "Your brain wants to risk 2% next time to 'make it back'. STOP.",
      "Your next trade MUST only risk 0.5%.",
      "If you lose again, your next trade MUST only risk 0.25%. Do not increase risk until you win."
    ],
    visualType: "PO3",
    homework: "Assignment: Write down the Drawdown Reduction Protocol on a post-it note and tape it to your monitor."
  },
  37: {
    title: "Episode 37: Journaling & Tracking",
    rawText: "Subconscious trust in the algorithm is built through data collection. Journaling must be purely technical, utilizing 'Self-Talk' annotations on charts.",
    heading: "Technical Self-Talk",
    p1: "Avoid emotional venting in your journal. Train your brain to recognize repeating signatures through objective documentation.",
    bullets: [
      "Annotate charts with statements like: 'I expect a run below this low because we are in a premium.'",
      "Log every trade with technical observations.",
      "Remove negative self-labeling."
    ],
    executionTitle: "How to Properly Annotate a Journal:",
    executionSteps: [
      "Take a screenshot of your finished trade.",
      "Add a text box pointing to the entry: 'Entered inside 15m FVG below 50% Equilibrium.'",
      "Add a text box at the target: 'Targeted Equal Highs (BSL) on the 1H chart.'",
      "Save the image to a folder. Never write 'I was scared' or 'I am stupid'."
    ],
    visualType: "FVG",
    homework: "Assignment: Take a screenshot of a completed trade. Add 3 'Self-Talk' text boxes explaining the logic objectively."
  },
  38: {
    title: "Episode 38: Prop Firm Funding",
    rawText: "Passing a funded evaluation requires capital preservation over raw return. The 1% risk rule and drawdown protocols ensure survival through inevitable variance.",
    heading: "The 12-Month Path",
    p1: "Treat evaluations as an exercise in consistency, not a get-rich-quick sprint.",
    bullets: [
      "Backtesting (Discovery): Build subconscious trust.",
      "Forward Testing (Desensitization): Paper trade to neutralize emotions.",
      "Live Execution (Professionalism): Transition only after 6 months of consistency."
    ],
    executionTitle: "How to Plan a Funded Evaluation:",
    executionSteps: [
      "Set your daily loss limit rule BEFORE starting. If you lose 2 trades in one day, close the platform.",
      "Calculate your maximum position size so that 2 losses never breaches the firm's daily drawdown limit.",
      "Focus solely on hitting base hits (1:2 R:R) rather than home runs to slowly build a buffer."
    ],
    visualType: "PO3",
    homework: "Assignment: Write down your specific rules for an evaluation (Max daily loss, Risk %, chosen Killzone)."
  },
  39: {
    title: "Episode 39: Building Your Model",
    rawText: "Synthesizing the concepts into the Master Execution Protocol: Bias, Time Filter, Displacement, Entry, and Targeting. Strict adherence prevents over-trading.",
    heading: "The Master Execution Algorithm",
    p1: "Your personalized model must check off every mechanical event before routing an order.",
    bullets: [
      "1. Bias: Midnight Open & HTF Draw.",
      "2. Time: NY AM or PM Killzone.",
      "3. Trigger: MSS & FVG in Discount/Premium.",
      "4. Safety: 200 SMA validation."
    ],
    executionTitle: "How to execute the 4-Step Master Model:",
    executionSteps: [
      "Step 1: Write down 'Bullish' or 'Bearish' based on the Daily chart.",
      "Step 2: Wait until exactly 08:30 EST.",
      "Step 3: Wait for a liquidity sweep followed by an MSS.",
      "Step 4: Ensure the 200 SMA is pointing your direction, then place your limit order at the FVG."
    ],
    visualType: "SMA",
    homework: "Assignment: Create a physical 4-step checklist based on the Master Protocol. Keep it next to your mouse."
  },
  40: {
    title: "Episode 40: Execution & Consistency",
    rawText: "If you cannot clearly define a lopsided probability for a setup, you must invoke Absolute Neutrality. Staying on the sidelines protects capital from low-probability chop.",
    heading: "Absolute Neutrality",
    p1: "The highest probability setup guarantees nothing on a trade-by-trade basis. If the market is confusing, do not force an execution.",
    bullets: [
      "If it's equally easy to argue for a bullish or bearish move, stand down.",
      "Protecting capital is more important than catching every move.",
      "Wait for the algorithm to clearly reveal its hand via displacement."
    ],
    executionTitle: "How to Practice Neutrality:",
    executionSteps: [
      "Open your chart. Give yourself 60 seconds to find the Draw on Liquidity.",
      "If you cannot confidently say 'Price is going to X' after 60 seconds, close the chart.",
      "Walk away from the computer for 1 hour. Do not trade chop."
    ],
    visualType: "PO3",
    homework: "Assignment: Identify a chart that is currently chopping sideways. Force yourself to close the chart without trading."
  },
  41: {
    title: "Episode 41: The Final Review",
    rawText: "The 2022 Mentorship culminates in the application of the model. Algorithmic price action is predictable, but demands a sober-minded strategist with professional humility.",
    heading: "Synthesizing the 2022 Model",
    p1: "Success is the result of impeccable risk management and the patience to allow the algorithm to deliver its scripted expansion.",
    bullets: [
      "Respect the Power of 3.",
      "Wait for the Killzones.",
      "Demand the FVG.",
      "Manage risk like a Professional Loser."
    ],
    executionTitle: "Final Finalization:",
    executionSteps: [
      "Review your written trading plan.",
      "Review your risk math.",
      "Commit to executing flawlessly on Demo for 6 months before funding."
    ],
    visualType: "Matrix",
    homework: "Final Assignment: Complete Trading Model Blueprint. Combine all your previous assignments into a single, cohesive Trading Plan document."
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
