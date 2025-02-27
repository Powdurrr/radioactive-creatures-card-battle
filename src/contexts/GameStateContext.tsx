import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameStateContextType, initialGameState } from './gameState/types';
import { playCard, attachStone, transformCard } from './gameState/cardActions';
import { selectAttacker, selectTarget, selectBlocker } from './gameState/combatActions';
import { advancePhase } from './gameState/phaseActions';
import { toast } from 'sonner';

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState(initialGameState);
  const [turnCount, setTurnCount] = useState(1);

  const handlePlayCard = (cardId: string, zoneId: string) => {
    setGameState(prev => playCard(prev, cardId, zoneId));
  };

  const handleAttachStone = (sourceId: string, targetId: string) => {
    setGameState(prev => attachStone(prev, sourceId, targetId));
  };

  const handleTransformCard = (cardId: string) => {
    setGameState(prev => transformCard(prev, cardId));
  };

  const handleSelectAttacker = (cardId: string) => {
    if (gameState.currentPhase !== 'Attack') {
      toast.error("You can only select attackers during the Attack phase!");
      return;
    }
    setGameState(prev => selectAttacker(prev, cardId));
  };

  const handleSelectTarget = (targetId: string) => {
    if (!gameState.selectedAttacker) {
      toast.error("Select an attacker first!");
      return;
    }
    setGameState(prev => selectTarget(prev, targetId));
  };

  const handleSelectBlocker = (cardId: string) => {
    if (gameState.currentPhase !== 'Block') {
      toast.error("You can only select blockers during the Block phase!");
      return;
    }
    setGameState(prev => selectBlocker(prev, cardId));
  };

  const handleAdvancePhase = () => {
    setGameState(prev => {
      const newState = advancePhase(prev);
      if (newState.currentPhase === 'Draw') {
        setTurnCount(turnCount + 1);
      }
      return newState;
    });
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setTurnCount(1);
    toast.success("Starting new game!");
  };

  const value = {
    gameState,
    attachStone: handleAttachStone,
    playCard: handlePlayCard,
    transformCard: handleTransformCard,
    advancePhase: handleAdvancePhase,
    selectAttacker: handleSelectAttacker,
    selectBlocker: handleSelectBlocker,
    selectTarget: handleSelectTarget,
    resetGame,
    useUltimateAbility: () => {} // Placeholder for future implementation
  };

  useEffect(() => {
    if (gameState.currentPhase === 'Draw') {
      handleAdvancePhase();
    }
  }, [gameState.currentPhase]);

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export { GameStateContext, useGameState };
