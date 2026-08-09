import React from 'react';
import { LiquiditySweepVisual, MSSVisual, FVGVisual, SMAVisual, PO3Visual, MatrixVisual, BreakerVisual, SMTVisual } from '../assets/svgs';

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
    heading: "The Counter-Party Requirement",
    p1: "Large banks cannot buy massive quantities without shifting price; they need willing sellers.",
    bullets: ["BSL: Buy stops above old highs", "SSL: Sell stops below old lows"],
    executionTitle: "How to Map Liquidity:",
    executionSteps: ["Draw lines at major peaks/valleys", "Label as BSL/SSL"],
    visualType: "Liquidity",
    homework: "Assignment: Mark 3 BSL/SSL levels."
  },
  // (Paste the remaining 40 episodes from the previous response here using the same structure)
};
