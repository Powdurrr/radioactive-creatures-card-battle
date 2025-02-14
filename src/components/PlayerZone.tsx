import React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { DraggableCard } from "./DraggableCard";
import { DroppableZone } from "./DroppableZone";
import { useGameState } from "../contexts/GameStateContext";
import { RadiationZone } from "./RadiationZone";
import { motion } from "framer-motion";
import { AttackMenu } from "./AttackMenu";

interface PlayerZoneProps {
  isOpponent?: boolean;
}

export const PlayerZone = ({ isOpponent = false }: PlayerZoneProps) => {
  const { gameState, attachStone, playCard, selectAttacker, selectBlocker, selectTarget } = useGameState();
  
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

  const handleCardClick = (cardId: string) => {
    if (gameState.currentPhase === 'Attack' && !isOpponent && gameState.selectedAttacker === cardId) {
      selectAttacker("");
    } else if (gameState.currentPhase === 'Attack' && isOpponent && gameState.selectedAttacker) {
      selectTarget(cardId);
    } else if (gameState.currentPhase === 'Block' && isOpponent) {
      selectBlocker(cardId);
    }
  };

  const board = isOpponent ? gameState.opponentBoard : gameState.playerBoard;
  const hand = isOpponent ? [] : gameState.playerHand;

  const renderCard = (card: any, index: number) => {
    if (!card) return null;

    const cardElement = (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <DraggableCard 
          {...card} 
          onClick={() => handleCardClick(card.id)}
          isAttacking={!isOpponent && card.id === gameState.selectedAttacker}
          isBlocking={isOpponent && card.id === gameState.selectedBlocker}
        />
      </motion.div>
    );

    if (!isOpponent && gameState.currentPhase === 'Attack') {
      return (
        <AttackMenu
          onAttack={() => selectAttacker(card.id)}
          showAttackOption={true}
        >
          {cardElement}
        </AttackMenu>
      );
    }

    return cardElement;
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col">
        <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 flex-grow">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                {isOpponent ? "Opponent's Board" : "Your Board"}
              </h3>
              <span className="text-xs text-white/60">
                {board.filter(card => card !== null).length}/5 creatures
              </span>
            </div>
            <div className="grid grid-cols-5 gap-4 h-[220px] bg-gray-800/50 p-4 rounded-lg border-2 border-gray-700/50">
              {board.map((card, i) => (
                <DroppableZone
                  key={`zone-${i}`}
                  id={`zone-${i}`}
                  className={`
                    border-2 rounded-lg h-[200px] relative
                    ${!card ? 'border-dashed border-gray-600/30 bg-gray-800/30' : 'border-transparent'}
                    ${gameState.currentPhase === 'Attack' && !isOpponent ? 'hover:border-red-500/50 cursor-pointer' : ''}
                    ${gameState.currentPhase === 'Block' && isOpponent ? 'hover:border-blue-500/50 cursor-pointer' : ''}
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  Your Hand
                </h3>
                <span className="text-xs text-white/60">{hand.length} cards</span>
              </div>
              <motion.div 
                className="flex gap-4 overflow-x-auto bg-gray-800/50 p-4 rounded-lg border-2 border-gray-700/50 h-[200px]"
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
