
import React from "react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface GameHeaderProps {
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
}

export const GameHeader = ({ showTutorial, setShowTutorial }: GameHeaderProps) => {
  return (
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
  );
};
