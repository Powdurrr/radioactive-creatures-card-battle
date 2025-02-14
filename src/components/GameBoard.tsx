
import React from "react";
import { PlayerZone } from "./PlayerZone";
import { GameInfo } from "./GameInfo";
import { GameLog } from "./GameLog";
import { PlayerInfo } from "./PlayerInfo";
import { GameControls } from "./GameControls";
import { GameStateProvider } from "../contexts/GameStateContext";

export const GameBoard = () => {
  return (
    <GameStateProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-800 p-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-[250px_1fr_300px] gap-6">
            {/* Left Column - Player Info & Controls */}
            <div className="flex flex-col gap-4 h-[calc(100vh-2rem)]">
              <PlayerInfo username="Opponent" isOpponent />
              <PlayerInfo username="Player" />
              <div className="mt-auto">
                <GameControls />
              </div>
            </div>
            
            {/* Center Column - Game Board */}
            <div className="grid grid-rows-[auto_1fr_auto] gap-6 h-[calc(100vh-2rem)]">
              {/* Opponent Zone */}
              <PlayerZone isOpponent />
              
              {/* Center Zone */}
              <div className="flex justify-center items-center">
                <GameInfo />
              </div>
              
              {/* Player Zone */}
              <PlayerZone />
            </div>
            
            {/* Right Column - Game Log */}
            <GameLog />
          </div>
        </div>
      </div>
    </GameStateProvider>
  );
};
