
import React from "react";
import { Heart } from "lucide-react";
import { useGameState } from "../contexts/GameStateContext";

interface PlayerInfoProps {
  username: string;
  isOpponent?: boolean;
}

export const PlayerInfo = ({ username, isOpponent = false }: PlayerInfoProps) => {
  const { gameState } = useGameState();
  const lifePoints = isOpponent ? gameState.opponentLife : gameState.playerLife;
  const creaturesOnBoard = isOpponent 
    ? gameState.opponentBoard.filter(card => card !== null).length
    : gameState.playerBoard.filter(card => card !== null).length;

  return (
    <div className="bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700 p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">{creaturesOnBoard}</span>
        </div>
        <span className="text-white/90 font-medium">{username}</span>
        
        {/* Life Points Display */}
        <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-full">
          <Heart className={`w-4 h-4 ${lifePoints <= 10 ? 'text-red-500' : 'text-primary'}`} />
          <span className={`font-medium ${lifePoints <= 10 ? 'text-red-500' : 'text-primary'}`}>
            {lifePoints}
          </span>
        </div>

        {/* Creature Count Indicators */}
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
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
