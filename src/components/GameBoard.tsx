
import React from "react";
import { PlayerZone } from "./PlayerZone";
import { GameInfo } from "./GameInfo";
import { GameLog } from "./GameLog";
import { PlayerInfo } from "./PlayerInfo";
import { PhaseIndicator } from "./PhaseIndicator";
import { GameStateProvider } from "../contexts/GameStateContext";

export const GameBoard = () => {
  return (
    <GameStateProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-800 p-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-[200px_1fr_300px] gap-4 min-h-[90vh]">
            {/* Left Column - Player Info */}
            <div className="flex flex-col gap-4">
              <PlayerInfo username="Opponent" isOpponent />
              <PlayerInfo username="Player" />
            </div>
            
            {/* Center Column - Game Board */}
            <div className="grid grid-rows-[auto_1fr_auto] gap-4">
              {/* Opponent Zone */}
              <PlayerZone isOpponent />
              
              {/* Center Zone */}
              <div className="flex justify-center items-center">
                <GameInfo />
              </div>
              
              {/* Player Zone */}
              <div className="flex flex-col gap-4">
                <PlayerZone />
                <PhaseIndicator />
              </div>
            </div>
            
            {/* Right Column - Game Log */}
            <GameLog />
          </div>
        </div>
      </div>
    </GameStateProvider>
  );
};
