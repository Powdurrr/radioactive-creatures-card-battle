
import React from "react";
import { PlayerZone } from "./PlayerZone";
import { GameInfo } from "./GameInfo";

export const GameBoard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-rows-[auto_1fr_auto] gap-4 min-h-[80vh]">
          {/* Opponent Zone */}
          <PlayerZone isOpponent />
          
          {/* Center Zone */}
          <div className="flex justify-center items-center">
            <GameInfo />
          </div>
          
          {/* Player Zone */}
          <PlayerZone />
        </div>
      </div>
    </div>
  );
};
