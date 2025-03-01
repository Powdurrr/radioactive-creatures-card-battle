import React from "react";
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
  onClick?: () => void;
}

export const DraggableCard = (props: DraggableCardProps) => {
  const { gameState } = useGameState();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  const isBeingTargeted = gameState.targetedDefender === props.id;

  const getCombatAnimation = () => {
    if (props.isAttacking || props.isBlocking) {
      return {
        scale: [1, 1.1, 1],
        y: [0, -10, 0],
        transition: { 
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 1
        }
      };
    }
    return {};
  };

  return (
    <AnimatePresence>
      <motion.div 
        ref={setNodeRef} 
        style={style} 
        {...listeners} 
        {...attributes}
        initial={{ opacity: 1, scale: 1 }}
        animate={getCombatAnimation()}
        exit={{ 
          scale: 0,
          opacity: 0,
          rotate: 360,
          y: 100,
          transition: { 
            duration: 0.8,
            ease: "backIn"
          }
        }}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        onClick={props.onClick}
        className="w-full h-full cursor-pointer"
      >
        <div className={`
          relative transition-all duration-300 h-full
          ${props.isAttacking ? 'ring-4 ring-red-500 shadow-lg shadow-red-500/50' : ''}
          ${props.isBlocking ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50' : ''}
          ${isBeingTargeted ? 'ring-4 ring-red-500 shadow-lg shadow-red-500/50' : ''}
        `}>
          {(props.isAttacking || isBeingTargeted) && (
            <motion.div
              className="absolute -inset-1 bg-red-500/20 rounded-lg z-0"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
          {props.isBlocking && (
            <motion.div
              className="absolute -inset-1 bg-blue-500/20 rounded-lg z-0"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
          <Card {...props} isTargeted={isBeingTargeted} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
