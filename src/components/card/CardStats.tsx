
import React from 'react';
import { Swords, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface CardStatsProps {
  attack: number;
  defense: number;
  isTransformed: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
}

export const CardStats = ({ 
  attack, 
  defense, 
  isTransformed, 
  isAttacking, 
  isBlocking 
}: CardStatsProps) => {
  return (
    <div className="flex justify-between mt-2 text-xs">
      <motion.div 
        className={`
          flex items-center gap-1 px-2 py-1 rounded
          ${isAttacking ? 'bg-red-500/20 text-red-400' : 'text-white/80'}
          ${isTransformed ? 'font-bold' : ''}
        `}
        animate={isAttacking ? {
          scale: [1, 1.1, 1],
          transition: { duration: 0.5, repeat: Infinity }
        } : {}}
      >
        <Swords className="w-3 h-3" />
        <span>{isTransformed ? attack * 2 : attack}</span>
      </motion.div>

      <motion.div 
        className={`
          flex items-center gap-1 px-2 py-1 rounded
          ${isBlocking ? 'bg-blue-500/20 text-blue-400' : 'text-white/80'}
          ${isTransformed ? 'font-bold' : ''}
        `}
        animate={isBlocking ? {
          scale: [1, 1.1, 1],
          transition: { duration: 0.5, repeat: Infinity }
        } : {}}
      >
        <Shield className="w-3 h-3" />
        <span>{isTransformed ? Math.floor(defense * 1.5) : defense}</span>
      </motion.div>
    </div>
  );
};
