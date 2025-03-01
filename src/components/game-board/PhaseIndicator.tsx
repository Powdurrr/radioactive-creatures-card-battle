
import React from "react";
import { Zap, Shield } from "lucide-react";
import { useGameState } from "../../contexts/GameStateContext";

export const PhaseIndicator = () => {
  const { gameState } = useGameState();
  const phases = ["Draw", "Recovery", "Attack", "Block", "Damage", "End"];
  
  return (
    <div className="mb-2 p-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/30">
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium text-yellow-500">Turn {gameState.currentTurn || 1}</span>
        </div>
        
        <div className="flex gap-2">
          {phases.map((phase) => (
            <div 
              key={phase}
              className={`px-3 py-1 text-xs rounded-full transition-colors
                ${phase === gameState.currentPhase
                  ? "bg-primary text-white font-medium" 
                  : "text-gray-400 bg-gray-800/30"}`
              }
            >
              {phase}
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-1 text-gray-400">
          <Shield className="h-4 w-4" />
          <span className="text-xs">Phase Effects Active</span>
        </div>
      </div>
    </div>
  );
};
