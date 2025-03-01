
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Swords, Shield } from "lucide-react";

interface TutorialModalProps {
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
}

export const TutorialModal = ({ showTutorial, setShowTutorial }: TutorialModalProps) => {
  return (
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
  );
};
