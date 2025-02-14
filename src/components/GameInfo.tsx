
import React from "react";
import { useGameState } from "../contexts/GameStateContext";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";

export const GameInfo = () => {
  const { gameState, advancePhase } = useGameState();

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900/30 backdrop-blur-sm border border-gray-700/50">
      <span className="text-sm text-white/80 font-medium">{gameState.currentPhase}</span>
      <Button 
        size="sm"
        variant="ghost" 
        onClick={advancePhase}
        className="h-8 px-3 text-sm hover:bg-gray-700/50"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
