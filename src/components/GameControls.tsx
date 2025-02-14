
import React from "react";
import { useGameState } from "../contexts/GameStateContext";
import { Button } from "./ui/button";
import { Zap, RotateCcw, ChevronRight } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const GameControls = () => {
  const { gameState, resetGame, advancePhase } = useGameState();
  
  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900/30 backdrop-blur-sm rounded-lg border border-gray-700/50">
      {/* Turn and Phase Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-400">Phase</span>
          <h3 className="text-lg font-bold text-white">{gameState.currentPhase}</h3>
        </div>
        <div className="bg-gray-800/50 p-3 rounded-lg text-center">
          <span className="text-sm text-gray-400">Deck</span>
          <h3 className="text-lg font-bold text-white">{gameState.playerDeck.length} cards</h3>
        </div>
      </div>

      {/* Radiation Meters */}
      <div className="grid grid-cols-2 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Your Radiation</span>
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(gameState.playerRadiation / 10) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 mt-1">
                  {gameState.playerRadiation}/10
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Current radiation level. Needed for transformations and abilities.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Opponent</span>
                  <Zap className="w-4 h-4 text-red-500" />
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(gameState.opponentRadiation / 10) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 mt-1">
                  {gameState.opponentRadiation}/10
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Opponent's radiation level.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 bg-red-500/10 hover:bg-red-500/20 border-red-500/50"
          onClick={resetGame}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Game
        </Button>
        <Button 
          className="flex-1 bg-primary hover:bg-primary/90"
          onClick={advancePhase}
        >
          <ChevronRight className="w-4 h-4 mr-2" />
          Next Phase
        </Button>
      </div>
    </div>
  );
};
