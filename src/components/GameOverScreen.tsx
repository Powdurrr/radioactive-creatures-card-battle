
import React from "react";
import { Zap } from "lucide-react";
import { Button } from "./ui/button";
import { useGameState } from "../contexts/GameStateContext";

interface GameOverScreenProps {
  winner: "player" | "opponent";
}

export const GameOverScreen = ({ winner }: GameOverScreenProps) => {
  const { resetGame } = useGameState();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-900/90 border border-gray-700 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Title */}
          <div className="space-y-2">
            <h2 className={`text-4xl font-bold ${winner === "player" ? "text-green-400" : "text-red-400"}`}>
              {winner === "player" ? "Victory!" : "Game Over"}
            </h2>
            <p className="text-gray-400">
              {winner === "player" 
                ? "Your opponent's radiation levels reached critical mass!" 
                : "Your radiation levels reached critical mass!"}
            </p>
          </div>

          {/* Radiation Icon */}
          <div className={`p-6 rounded-full ${
            winner === "player" ? "bg-green-500/20" : "bg-red-500/20"
          }`}>
            <Zap className={`w-12 h-12 ${
              winner === "player" ? "text-green-400" : "text-red-400"
            } animate-pulse`} />
          </div>

          {/* Play Again Button */}
          <Button 
            onClick={resetGame}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};
