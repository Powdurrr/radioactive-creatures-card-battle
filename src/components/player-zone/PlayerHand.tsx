
import React from "react";
import { motion } from "framer-motion";
import { DraggableCard } from "../DraggableCard";

interface PlayerHandProps {
  hand: any[];
}

export const PlayerHand = ({ hand }: PlayerHandProps) => {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
          Your Hand
        </h3>
        <span className="text-xs text-white/60">{hand.length} cards</span>
      </div>
      <motion.div 
        className="flex gap-4 overflow-x-auto bg-gray-800/50 p-4 rounded-lg border-2 border-gray-700/50 h-[160px] min-h-[160px]"
        layout
      >
        {hand.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500/30 text-sm">
            No cards in hand
          </div>
        ) : (
          <div className="flex gap-4">
            {hand.map((card) => (
              <motion.div
                key={card.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                layout
              >
                <DraggableCard {...card} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
