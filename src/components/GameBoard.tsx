
import React, { useState } from "react";
import { PlayerZone } from "./PlayerZone";
import { GameInfo } from "./GameInfo";
import { PlayerInfo } from "./PlayerInfo";
import { GameControls } from "./GameControls";
import { GameStateProvider } from "../contexts/GameStateContext";
import { GameOverScreen } from "./GameOverScreen";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Swords } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameLog } from "./GameLog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export const GameBoard = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  
  return (
    <GameStateProvider>
      <div className="min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 relative">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Radiation Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0,
              }}
              animate={{
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight - 100,
                ],
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                delay: Math.random() * 20,
              }}
            />
          ))}
          
          {/* Radiation Symbol */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
            <svg width="600" height="600" viewBox="0 0 100 100" className="text-primary">
              <circle cx="50" cy="50" r="20" fill="currentColor" />
              <path d="M50,20 L50,80" stroke="currentColor" strokeWidth="10" />
              <path 
                d="M50,50 L76.6,80" 
                stroke="currentColor" 
                strokeWidth="10" 
                transform="rotate(45 50 50)"
              />
              <path 
                d="M50,50 L76.6,80" 
                stroke="currentColor" 
                strokeWidth="10" 
                transform="rotate(165 50 50)"
              />
            </svg>
          </div>
        </div>
      
        <div className="max-w-[1800px] mx-auto relative z-10">
          <header className="mb-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Radioactive Creatures Battle
              </h1>
              
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 rounded-lg bg-gray-800/70 border border-gray-700/50 text-sm text-white/80 hover:bg-gray-700/50"
                        onClick={() => setShowTutorial(true)}
                      >
                        Tutorial
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Learn how to play the game</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg bg-gray-800/70 border border-gray-700/50 text-sm text-white/80 hover:bg-gray-700/50"
                >
                  Settings
                </motion.button>
              </div>
            </div>
          </header>
          
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
              {/* Phase indicator banner */}
              <div className="mb-2 p-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/30">
                <div className="flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-500">Turn 3</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {["Draw", "Recovery", "Attack", "Block", "Damage", "End"].map((phase, i) => (
                      <div 
                        key={phase}
                        className={`px-3 py-1 text-xs rounded-full transition-colors
                          ${phase === "Attack" 
                            ? "bg-primary text-white font-medium" 
                            : "text-gray-400 bg-gray-800/30"}`
                        }
                      >
                        {phase}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs">Phase Effects Active</span>
                  </div>
                </div>
              </div>
              
              {/* Opponent Zone */}
              <div className="h-[210px] min-h-[210px] rounded-lg bg-gray-800/20 border border-gray-700/30 backdrop-blur-sm p-2">
                <PlayerZone isOpponent />
              </div>
              
              {/* Battle zone */}
              <div className="h-[80px] flex justify-center items-center relative my-1">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1.2, 1],
                        opacity: [0, 1, 0.7]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                      className="w-40 h-40 rounded-full bg-red-500/5 absolute"
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 0.8],
                        opacity: [0, 0.7, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: 0.5
                      }}
                      className="w-60 h-60 rounded-full bg-primary/5 absolute"
                    />
                  </div>
                </div>
                
                <div className="z-10">
                  <GameInfo />
                </div>
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
        
        {/* Tutorial Modal */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowTutorial(false)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="bg-gray-900/90 border border-gray-700 rounded-xl p-6 max-w-2xl mx-4 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-primary">How to Play</h2>
                  <button
                    onClick={() => setShowTutorial(false)}
                    className="p-1 hover:bg-gray-800 rounded-full"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white/90 mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Game Overview
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Battle with radioactive creatures, managing radiation levels to transform your creatures and defeat your opponent!
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white/90 mb-2 flex items-center gap-2">
                      <Swords className="w-5 h-5 text-red-400" />
                      Combat
                    </h3>
                    <p className="text-gray-300 text-sm">
                      During the Attack phase, select a creature to attack. Your opponent can choose to block with their own creature.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white/90 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      Transformations
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Once a creature has 3+ stones and you have 5+ radiation, you can transform it into a more powerful form! Transformed creatures deal double damage.
                    </p>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setShowTutorial(false)}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-white font-medium"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStateProvider>
  );
};
