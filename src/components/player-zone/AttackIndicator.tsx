
import React from "react";
import { Swords } from "lucide-react";
import { motion } from "framer-motion";

interface AttackIndicatorProps {
  isVisible: boolean;
}

export const AttackIndicator = ({ isVisible }: AttackIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className="absolute top-0 right-0 -mr-2 -mt-2"
      >
        <div className="bg-red-500 p-1.5 rounded-full shadow-lg">
          <Swords className="w-4 h-4 text-white animate-pulse" />
        </div>
      </motion.div>

      <motion.div 
        className="absolute left-1/2 top-1/2 w-32 h-0.5 bg-red-500/50 origin-left z-0"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        style={{
          transformOrigin: 'left center',
          rotate: '30deg'
        }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-l-8 border-red-500/50 border-y-transparent border-y-4" />
      </motion.div>
    </>
  );
};
