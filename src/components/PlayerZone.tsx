
import React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useGameState } from "../contexts/GameStateContext";
import { toast } from "sonner";
import { PlayerBoard } from "./player-zone/PlayerBoard";
import { PlayerHand } from "./player-zone/PlayerHand";

interface PlayerZoneProps {
  isOpponent?: boolean;
}

export const PlayerZone = ({ isOpponent = false }: PlayerZoneProps) => {
  const { gameState, attachStone, playCard, selectAttacker, selectTarget } = useGameState();

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

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col">
        <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 flex-grow">
          <PlayerBoard
            board={board}
            isOpponent={isOpponent}
            gameState={gameState}
            onCardClick={handleCardClick}
          />
          {!isOpponent && <PlayerHand hand={hand} />}
        </div>
      </div>
    </DndContext>
  );
};
