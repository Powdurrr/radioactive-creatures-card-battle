
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DraggableCard } from "../DraggableCard";

interface CardSelectionProps {
  card: any;
  isSelected: boolean;
  isTargeted: boolean;
  canAttack: boolean;
  canBeTargeted: boolean;
  onClick: () => void;
}

export const CardSelection = ({
  card,
  isSelected,
  isTargeted,
  canAttack,
  canBeTargeted,
  onClick,
}: CardSelectionProps) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <AnimatePresence>
        {(isSelected || isTargeted) && (
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className={`absolute -inset-2 rounded-lg ${isSelected ? 'border-2 border-red-500 bg-red-500/10' : ''} ${isTargeted ? 'border-2 border-red-500/50 bg-red-500/5' : ''}`}
          />
        )}
      </AnimatePresence>

      <DraggableCard 
        {...card}
        isAttacking={isSelected}
        isTargeted={isTargeted}
        onClick={onClick}
        className={`
          transition-all duration-300
          ${canAttack ? 'cursor-pointer hover:ring-2 hover:ring-red-500/50' : ''}
          ${canBeTargeted ? 'cursor-pointer hover:ring-2 hover:ring-red-500/30' : ''}
          ${isSelected || isTargeted ? 'z-10' : ''}
        `}
      />
    </motion.div>
  );
};
