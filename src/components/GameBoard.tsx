import React, { useState } from "react";
import { Zap } from "lucide-react";
import { PlayerZone } from "./PlayerZone";
import { GameInfo } from "./GameInfo";
import { PlayerInfo } from "./PlayerInfo";
import { GameControls } from "./GameControls";
import { GameStateProvider } from "../contexts/GameStateContext";
import { GameLog } from "./GameLog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackgroundEffects } from "./game-board/BackgroundEffects";
import { GameHeader } from "./game-board/GameHeader";
import { PhaseIndicator } from "./game-board/PhaseIndicator";
import { TutorialModal } from "./game-board/TutorialModal";

export const GameBoard = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  
  return (
    <GameStateProvider>
      <div className="min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 relative">
        <BackgroundEffects />
        
        <div className="max-w-[1800px] mx-auto relative z-10">
          <GameHeader showTutorial={showTutorial} setShowTutorial={setShowTutorial} />
          
          <div className="grid grid-cols-[280px_1fr_280px] gap-6">
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
              <PhaseIndicator />
              
              {/* Opponent Zone */}
              <div className="h-[210px] min-h-[210px] rounded-lg bg-gray-800/20 border border-gray-700/30 backdrop-blur-sm p-2">
                <PlayerZone isOpponent />
              </div>
              
              {/* Battle zone */}
              <div className="h-[80px] flex justify-center items-center relative my-1">
                <GameInfo />
              </div>
              
              {/* Player Zone */}
              <div className="h-[210px] min-h-[210px] rounded-lg bg-gray-800/20 border border-gray-700/30 backdrop-blur-sm p-2">
                <PlayerZone />
              </div>
            </div>
            
            {/* Right Column - Game Log & Info */}
            <div className="flex flex-col gap-4">
              <Tabs defaultValue="log" className="w-full">
                <TabsList className="w-full bg-gray-800/40">
                  <TabsTrigger value="log" className="flex-1">Game Log</TabsTrigger>
                  <TabsTrigger value="cards" className="flex-1">Card Info</TabsTrigger>
                </TabsList>
                <TabsContent value="log" className="mt-2">
                  <div className="h-[500px]">
                    <GameLog />
                  </div>
                </TabsContent>
                <TabsContent value="cards" className="mt-2">
                  <div className="h-[500px] bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700 p-4">
                    <h3 className="text-white/90 font-medium mb-3">Card Library</h3>
                    <div className="space-y-3">
                      <div className="text-xs text-white/80">
                        <strong className="text-primary">Radiation Effects:</strong>
                        <ul className="mt-1 space-y-1 pl-4">
                          <li className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span className="text-yellow-500">Boost</span> - Gains power from radiation
                          </li>
                          <li className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-red-500" />
                            <span className="text-red-500">Drain</span> - Steals radiation from opponent
                          </li>
                          <li className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-purple-500" />
                            <span className="text-purple-500">Amplify</span> - Doubles radiation effects
                          </li>
                        </ul>
                      </div>
                      
                      <div className="text-xs text-white/80">
                        <strong className="text-primary">Transformations:</strong>
                        <p className="mt-1 pl-4">
                          Cards with 3+ stones and 5+ radiation can transform into more powerful forms!
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        <TutorialModal showTutorial={showTutorial} setShowTutorial={setShowTutorial} />
      </div>
    </GameStateProvider>
  );
};
