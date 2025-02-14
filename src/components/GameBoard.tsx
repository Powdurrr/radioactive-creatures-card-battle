
import React from "react";
import { PlayerZone } from "./PlayerZone";
import { GameInfo } from "./GameInfo";
import { PlayerInfo } from "./PlayerInfo";
import { GameControls } from "./GameControls";
import { GameStateProvider } from "../contexts/GameStateContext";

export const GameBoard = () => {
  return (
    <GameStateProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-800 p-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-[280px_1fr] gap-6">
            {/* Left Column - Player Info & Controls */}
            <div className="flex flex-col gap-4">
              <PlayerInfo username="Opponent" isOpponent />
              <PlayerInfo username="Player" />
              <div className="sticky bottom-4 mt-auto">
                <GameControls />
              </div>
            </div>
            
            {/* Center Column - Game Board */}
            <div className="flex flex-col gap-1">
              {/* Opponent Zone - Fixed Height */}
              <div className="h-[200px] min-h-[200px]">
                <PlayerZone isOpponent />
              </div>
              
              {/* Center Zone */}
              <div className="flex justify-center items-center h-[32px]">
                <GameInfo />
              </div>
              
              {/* Player Zone - Fixed Height */}
              <div className="h-[200px] min-h-[200px]">
                <PlayerZone />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameStateProvider>
  );
};
