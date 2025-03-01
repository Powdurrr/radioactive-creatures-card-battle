
import React from "react";
import { DroppableZone } from "../DroppableZone";
import { CardSelection } from "./CardSelection";
import { AttackIndicator } from "./AttackIndicator";
import { RadiationZone } from "../RadiationZone";
import { GameState } from "@/contexts/gameState/types";

interface PlayerBoardProps {
  board: any[];
  isOpponent: boolean;
  gameState: GameState;
  onCardClick: (cardId: string) => void;
}

export const PlayerBoard = ({ 
  board,
  isOpponent,
  gameState,
  onCardClick
}: PlayerBoardProps) => {
  const handleZoneClick = (index: number, card: any) => {
    if (!card) return;
    onCardClick(card.id);
  };

  const canSelectCard = (cardId: string) => {
    if (gameState.currentPhase !== 'Attack') return false;
    
    if (!isOpponent && gameState.attackPhaseStep === 'selectAttacker') {
      return true;
    }
    
    if (isOpponent && gameState.attackPhaseStep === 'selectTarget' && gameState.selectedAttacker) {
      return true;
    }

    if (isOpponent && gameState.attackPhaseStep === 'selectBlocker') {
      return true;
    }

    return false;
  };

  return (
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
              ${canSelectCard(card?.id) ? 'hover:border-red-500/50 cursor-pointer' : ''}
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
            {card && (
              <>
                <CardSelection
                  card={card}
                  isSelected={card.id === gameState.selectedAttacker}
                  isTargeted={card.id === gameState.targetedDefender}
                  isBlocking={card.id === gameState.selectedBlocker}
                  canAttack={!isOpponent && gameState.attackPhaseStep === 'selectAttacker'}
                  canBeTargeted={isOpponent && gameState.attackPhaseStep === 'selectTarget'}
                  canBlock={isOpponent && gameState.attackPhaseStep === 'selectBlocker'}
                  onClick={() => handleZoneClick(i, card)}
                />
                {card.id === gameState.selectedAttacker && gameState.attackPhaseStep === 'selectTarget' && (
                  <AttackIndicator 
                    isVisible={true}
                    isOpponent={isOpponent}
                  />
                )}
              </>
            )}
          </DroppableZone>
        ))}
      </div>
    </div>
  );
};
