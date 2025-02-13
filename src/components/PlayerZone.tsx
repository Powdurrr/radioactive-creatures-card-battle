
import React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { DraggableCard } from "./DraggableCard";
import { DroppableZone } from "./DroppableZone";
import { useGameState } from "../contexts/GameStateContext";

interface PlayerZoneProps {
  isOpponent?: boolean;
}

export const PlayerZone = ({ isOpponent = false }: PlayerZoneProps) => {
  const { gameState, attachStone, playCard } = useGameState();
  
  const zoneClasses = `
    w-full p-4 rounded-lg
    bg-gray-900/30 backdrop-blur-sm
    border border-gray-700/50
  `;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const sourceId = active.id.toString();
    const targetId = over.id.toString();
    
    // If the source is a stone card and the target is a creature
    if (sourceId.includes('stone') && targetId.includes('card')) {
      attachStone(sourceId, targetId);
    }
    // If dropping onto a board zone
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
          {/* Board */}
          <div className="grid grid-cols-5 gap-4 min-h-[140px]">
            {board.map((card, i) => (
              <DroppableZone
                key={`zone-${i}`}
                id={`zone-${i}`}
                className="border border-gray-600/30 rounded-lg h-full min-h-[140px]"
              >
                {card && (
                  <DraggableCard {...card} />
                )}
              </DroppableZone>
            ))}
          </div>
          
          {/* Hand (only shown for player) */}
          {!isOpponent && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {hand.map((card) => (
                <DraggableCard 
                  key={card.id}
                  {...card}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};
