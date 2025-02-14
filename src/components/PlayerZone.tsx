
import React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { DraggableCard } from "./DraggableCard";
import { DroppableZone } from "./DroppableZone";
import { useGameState } from "../contexts/GameStateContext";
import { RadiationZone } from "./RadiationZone";
import { motion } from "framer-motion";

interface PlayerZoneProps {
  isOpponent?: boolean;
}

export const PlayerZone = ({ isOpponent = false }: PlayerZoneProps) => {
  const { gameState, attachStone, playCard } = useGameState();
  
  const zoneClasses = `
    w-full p-4 rounded-lg
    bg-gray-900/30 backdrop-blur-sm
    border border-gray-700/50
    ${isOpponent ? 'mb-4' : 'mt-4'}
  `;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const sourceId = active.id.toString();
    const targetId = over.id.toString();
    
    if (sourceId.includes('stone') && targetId.includes('card')) {
      attachStone(sourceId, targetId);
    }
    else if (targetId.includes('zone')) {
      playCard(sourceId, targetId);
    }
  };

  const board = isOpponent ? gameState.opponentBoard : gameState.playerBoard;
  const hand = isOpponent ? [] : gameState.playerHand;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={zoneClasses}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-5 gap-4 min-h-[140px]">
            {board.map((card, i) => (
              <DroppableZone
                key={`zone-${i}`}
                id={`zone-${i}`}
                className={`
                  border border-gray-600/30 rounded-lg h-full min-h-[140px] relative
                  ${gameState.currentPhase === 'Attack' && !isOpponent ? 'hover:border-red-500/50' : ''}
                  ${gameState.currentPhase === 'Block' && isOpponent ? 'hover:border-blue-500/50' : ''}
                `}
              >
                {gameState.radiationZones.find(zone => zone.index === i) && (
                  <RadiationZone 
                    zone={gameState.radiationZones.find(zone => zone.index === i)!}
                    position={i}
                  />
                )}
                {card && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DraggableCard {...card} />
                  </motion.div>
                )}
              </DroppableZone>
            ))}
          </div>
          
          {!isOpponent && (
            <motion.div 
              className="flex gap-4 overflow-x-auto pb-4"
              layout
            >
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
            </motion.div>
          )}
        </div>
      </div>
    </DndContext>
  );
};
