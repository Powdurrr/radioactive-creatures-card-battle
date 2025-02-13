
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
      {phases.map((phase, i) => {
        const isActive = phase === gameState.currentPhase;
        const isPast = phases.indexOf(phase) < phases.indexOf(gameState.currentPhase);
        
        return (
          <div
            key={i}
            className={`
              px-3 py-1 rounded-md text-sm transition-colors
              ${isActive 
                ? "bg-primary text-white" 
                : isPast
                  ? "text-primary/60"
                  : "text-white/60 hover:bg-gray-700/50"}
            `}
          >
            {phase}
          </div>
        );
      })}
    </div>
  );
};
