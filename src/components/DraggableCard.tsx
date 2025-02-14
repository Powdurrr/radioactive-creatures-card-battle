
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
    if (props.isAttacking) {
      return {
        scale: [1, 1.1, 1],
        x: [0, 30, 0],
        rotateZ: [0, -5, 0],
        transition: { 
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 1
        }
      };
    }
    if (props.isBlocking) {
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
      >
        <div className={`
          relative transition-all duration-300
          ${props.isAttacking ? 'ring-4 ring-red-500 shadow-lg shadow-red-500/50' : ''}
          ${props.isBlocking ? 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50' : ''}
          ${isBeingTargeted ? 'ring-4 ring-red-500 shadow-lg shadow-red-500/50' : ''}
          ${gameState.currentPhase === 'Attack' ? 'cursor-pointer hover:ring-2 hover:ring-red-300' : ''}
          ${gameState.currentPhase === 'Block' ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''}
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

        {props.isAttacking && gameState.targetedDefender && (
          <motion.div
            className="absolute top-1/2 left-full h-0.5 bg-red-500 origin-left z-50"
            style={{
              width: '100px',
              transformOrigin: '0% 50%'
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 border-solid border-transparent border-l-8 border-l-red-500" 
                 style={{ borderWidth: '4px 0 4px 8px' }} />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
