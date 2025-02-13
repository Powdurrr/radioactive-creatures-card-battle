
import React from "react";
import { Zap } from "lucide-react";
import { useGameState } from "../contexts/GameStateContext";

interface PlayerInfoProps {
  username: string;
  isOpponent?: boolean;
}

export const PlayerInfo = ({ username, isOpponent = false }: PlayerInfoProps) => {
  const { gameState } = useGameState();
  const creaturesOnBoard = isOpponent 
    ? gameState.opponentBoard.filter(card => card !== null).length
    : gameState.playerBoard.filter(card => card !== null).length;
  
  const radiationCount = isOpponent ? gameState.opponentRadiation : gameState.playerRadiation;
  const isMaxRadiation = radiationCount >= 10;

  return (
    <div className="bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700 p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">{creaturesOnBoard}</span>
        </div>
        <span className="text-white/90 font-medium">{username}</span>

        {/* Radiation Tracker */}
        <div className={`flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full transition-all duration-300 ${isMaxRadiation ? 'animate-pulse bg-yellow-900/30' : ''}`}>
          <Zap className={`w-4 h-4 transition-colors duration-300 ${isMaxRadiation ? 'text-yellow-400 animate-pulse' : 'text-yellow-600/70'}`} />
          <span className={`font-medium transition-colors duration-300 ${isMaxRadiation ? 'text-yellow-400' : 'text-yellow-600/70'}`}>
            {radiationCount}/10
          </span>
        </div>

        {/* Radiation Indicators */}
        <div className="flex gap-1.5">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transform transition-all duration-300 ${
                i < radiationCount 
                  ? `bg-yellow-400/70 border border-yellow-500/30 ${i === radiationCount - 1 ? 'scale-125 animate-pulse' : ''}` 
                  : 'bg-gray-700/50 border border-gray-600/30'
              }`}
            />
          ))}
        </div>

        {/* Creature Count Indicators */}
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < creaturesOnBoard 
                  ? 'bg-primary/50 border border-primary/30' 
                  : 'bg-gray-700/50 border border-gray-600/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
