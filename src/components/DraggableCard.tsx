
import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card } from "./Card";
import { useGameState } from "../contexts/GameStateContext";
import { motion, AnimatePresence } from "framer-motion";

interface DraggableCardProps {
  id: string;
  name?: string;
  attack?: number;
  defense?: number;
  stones?: number;
  isTransformed?: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
}

export const DraggableCard = (props: DraggableCardProps) => {
  const { gameState, selectAttacker, selectBlocker } = useGameState();
  const [isDestroyed, setIsDestroyed] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  const handleClick = () => {
    if (gameState.currentPhase === 'Attack') {
      selectAttacker(props.id);
    } else if (gameState.currentPhase === 'Block') {
      selectBlocker(props.id);
    }
  };

  return (
    <AnimatePresence>
      {!isDestroyed ? (
        <motion.div 
          ref={setNodeRef} 
          style={style} 
          {...listeners} 
          {...attributes}
          initial={{ scale: 1, opacity: 1 }}
          exit={{ 
            scale: 0,
            opacity: 0,
            rotate: 360,
            y: 100
          }}
          transition={{ duration: 0.5 }}
          animate={props.isAttacking ? {
            x: [0, 20, 0],
            transition: { duration: 0.3 }
          } : {}}
        >
          <Card {...props} onClick={handleClick} />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
