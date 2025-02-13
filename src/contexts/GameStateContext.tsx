
import React, { createContext, useContext, useState } from 'react';

interface Card {
  id: string;
  name: string;
  attack: number;
  defense: number;
  stones: number;
  isTransformed: boolean;
}

interface GameState {
  playerBoard: (Card | null)[];
  playerHand: Card[];
  opponentBoard: (Card | null)[];
  currentPhase: string;
}

interface GameStateContextType {
  gameState: GameState;
  attachStone: (sourceId: string, targetId: string) => void;
  playCard: (cardId: string, zoneId: string) => void;
  transformCard: (cardId: string) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    playerBoard: Array(5).fill(null),
    playerHand: [
      { id: 'hand-1', name: 'Baby Godzilla', attack: 2, defense: 3, stones: 0, isTransformed: false },
      { id: 'hand-2', name: 'Baby Godzilla', attack: 2, defense: 3, stones: 0, isTransformed: false },
      { id: 'stone-1', name: 'Stone', attack: 0, defense: 0, stones: 0, isTransformed: false },
    ],
    opponentBoard: Array(5).fill(null),
    currentPhase: 'Initiative',
  });

  const attachStone = (sourceId: string, targetId: string) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      // Find the target card and update its stone count
      for (let i = 0; i < newState.playerBoard.length; i++) {
        const card = newState.playerBoard[i];
        if (card?.id === targetId) {
          newState.playerBoard[i] = {
            ...card,
            stones: card.stones + 1
          };
          break;
        }
      }
      
      // Remove the stone card from hand
      newState.playerHand = newState.playerHand.filter(card => card.id !== sourceId);
      
      return newState;
    });
  };

  const playCard = (cardId: string, zoneId: string) => {
    setGameState(prev => {
      const newState = { ...prev };
      const zoneIndex = parseInt(zoneId.split('-')[1]);
      const card = newState.playerHand.find(c => c.id === cardId);
      
      if (card && zoneIndex >= 0 && zoneIndex < 5) {
        newState.playerBoard[zoneIndex] = card;
        newState.playerHand = newState.playerHand.filter(c => c.id !== cardId);
      }
      
      return newState;
    });
  };

  const transformCard = (cardId: string) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      for (let i = 0; i < newState.playerBoard.length; i++) {
        const card = newState.playerBoard[i];
        if (card?.id === cardId && card.stones >= 3) {
          newState.playerBoard[i] = {
            ...card,
            isTransformed: true,
            name: card.name.replace('Baby ', ''),
          };
          break;
        }
      }
      
      return newState;
    });
  };

  return (
    <GameStateContext.Provider value={{ gameState, attachStone, playCard, transformCard }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
