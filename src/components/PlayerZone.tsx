
import React from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { DraggableCard } from "./DraggableCard";
import { DroppableZone } from "./DroppableZone";
import { useGameState } from "../contexts/GameStateContext";
import { RadiationZone } from "./RadiationZone";
import { motion, AnimatePresence } from "framer-motion";
import { Swords } from "lucide-react";
import { toast } from "sonner";

interface PlayerZoneProps {
  isOpponent?: boolean;
}

export const PlayerZone = ({ isOpponent = false }: PlayerZoneProps) => {
  const { gameState, attachStone, playCard, selectAttacker, selectTarget } = useGameState();
  
  const zoneClasses = `w-full p-4 rounded-lg bg-gray-900/30 backdrop-blur-sm border border-gray-700/50`;

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

  const handleCardClick = (cardId: string) => {
    if (gameState.currentPhase !== 'Attack') {
      return;
    }

    // Handle attacker selection
    if (!isOpponent && gameState.attackPhaseStep === 'selectAttacker') {
      if (cardId === gameState.selectedAttacker) {
        // Deselect current attacker
        selectAttacker("");
        toast.info("Attacker deselected");
      } else {
        // Select new attacker
        selectAttacker(cardId);
        toast.success("Select a target to attack!");
      }
      return;
    }

    // Handle target selection
    if (isOpponent && gameState.attackPhaseStep === 'selectTarget' && gameState.selectedAttacker) {
      selectTarget(cardId);
      toast.success("Target selected - opponent may now block!");
    }
  };

  const board = isOpponent ? gameState.opponentBoard : gameState.playerBoard;
  const hand = isOpponent ? [] : gameState.playerHand;

  const renderCard = (card: any, index: number) => {
    if (!card) return null;

    const isSelected = card.id === gameState.selectedAttacker;
    const isTargeted = card.id === gameState.targetedDefender;
    const canAttack = !isOpponent && 
                     gameState.currentPhase === 'Attack' && 
                     gameState.attackPhaseStep === 'selectAttacker';
    const canBeTargeted = isOpponent && 
                         gameState.currentPhase === 'Attack' && 
                         gameState.attackPhaseStep === 'selectTarget' &&
                         gameState.selectedAttacker;

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
              className={`absolute -inset-2 rounded-lg ${isSelected ? 'border-2 border-red-500' : ''} ${isTargeted ? 'border-2 border-red-500/50' : ''}`}
            />
          )}
        </AnimatePresence>
        
        <DraggableCard 
          {...card}
          isAttacking={isSelected}
          isTargeted={isTargeted}
          onClick={() => handleCardClick(card.id)}
          className={`
            transition-all duration-300
            ${canAttack ? 'cursor-pointer hover:ring-2 hover:ring-red-500/50' : ''}
            ${canBeTargeted ? 'cursor-pointer hover:ring-2 hover:ring-red-500/30' : ''}
          `}
        />

        {isSelected && gameState.attackPhaseStep === 'selectTarget' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-0 right-0 -mr-2 -mt-2"
          >
            <div className="bg-red-500 p-1 rounded-full shadow-lg">
              <Swords className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col">
        <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 flex-grow">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                {isOpponent ? "Opponent's Board" : "Your Board"}
              </h3>
              <span className="text-xs text-white/60">
                {board.filter(card => card !== null).length}/5 creatures
              </span>
            </div>
            <div className="grid grid-cols-5 gap-4 h-[160px] min-h-[160px] bg-gray-800/50 p-4 rounded-lg border-2 border-gray-700/50">
              {board.map((card, i) => (
                <DroppableZone
                  key={`zone-${i}`}
                  id={`zone-${i}`}
                  onClick={() => card && handleZoneClick(i, card)}
                  className={`
                    border-2 rounded-lg h-[140px] min-h-[140px] relative
                    ${!card ? 'border-dashed border-gray-600/30 bg-gray-800/30' : 'border-transparent'}
                    ${gameState.currentPhase === 'Attack' && !isOpponent ? 'hover:border-red-500/50 cursor-pointer' : ''}
                    ${gameState.currentPhase === 'Block' && isOpponent ? 'hover:border-blue-500/50 cursor-pointer' : ''}
                    ${card && gameState.currentPhase === 'Attack' && isOpponent ? 'hover:border-red-500/50 cursor-pointer' : ''}
                  `}
                >
                  {gameState.radiationZones.find(zone => zone.index === i) && (
                    <RadiationZone 
                      zone={gameState.radiationZones.find(zone => zone.index === i)!}
                      position={i}
                    />
                  )}
                  {!card && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500/30 text-xs">
                      Empty Zone {i + 1}
                    </div>
                  )}
                  {card && renderCard(card, i)}
                </DroppableZone>
              ))}
            </div>
          </div>
          
          {!isOpponent && (
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
          )}
        </div>
      </div>
    </DndContext>
  );
};
