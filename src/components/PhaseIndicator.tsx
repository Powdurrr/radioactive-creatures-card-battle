
import React from "react";
import { useGameState } from "../contexts/GameStateContext";

export const PhaseIndicator = () => {
  const { gameState } = useGameState();
  const phases = [
    "Draw",
    "Initiative",
    "Attack",
    "Block",
    "Damage",
    "Recovery",
    "End",
  ];

  return (
    <div className="flex justify-between bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700 p-2">
      {phases.map((phase, i) => (
        <div
          key={i}
          className={`
            px-3 py-1 rounded-md text-sm transition-colors
            ${phase === gameState.currentPhase 
              ? "bg-primary text-white" 
              : "text-white/60 hover:bg-gray-700/50"}
          `}
        >
          {phase}
        </div>
      ))}
    </div>
  );
};
