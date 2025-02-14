
import React, { createContext, useContext, useState } from 'react';
import { toast } from "sonner";
import { 
  GameState, 
  GameStateContextType, 
  Card, 
  RadiationZone,
  FieldEvent 
} from '../types/GameTypes';
import { 
  getInitialDeck, 
  checkEvolutionRequirements, 
  evolveCard, 
  calculateBoardStrength 
} from '../utils/gameUtils';
import {
  getCardNameByEffect,
  getCardAttackByEffect,
  getCardDefenseByEffect
} from '../utils/cardUtils';

const initialGameState: GameState = {
  playerBoard: Array(5).fill(null),
  playerHand: [],
  playerDeck: getInitialDeck(),
  opponentBoard: [
    { 
      id: 'op-1', 
      name: 'Radiation Drainer', 
      attack: 3, 
      defense: 2, 
      stones: 0, 
      isTransformed: false,
      radiationEffect: "drain"
    },
    null,
    { 
      id: 'op-2', 
      name: 'Baby Godzilla', 
      attack: 2, 
      defense: 3, 
      stones: 0, 
      isTransformed: false,
      radiationEffect: "boost"
    },
    null,
    null
  ],
  currentPhase: 'Draw',
  selectedAttacker: null,
  selectedBlocker: null,
  playerRadiation: 0,
  opponentRadiation: 0,
  isGameOver: false,
  winner: null,
  radiationZones: [],
  activeEvents: []
};

const phases = ['Draw', 'Recovery', 'Initiative', 'Attack', 'Block', 'Damage'];

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [turnCount, setTurnCount] = useState(1);

  const calculateRadiationBonus = (radiation: number, hasAmplifier: boolean) => {
    let bonus = 0;
    if (radiation >= 8) bonus = 3;
    else if (radiation >= 5) bonus = 2;
    else if (radiation >= 3) bonus = 1;
    
    return hasAmplifier ? bonus * 2 : bonus;
  };

  const hasAmplifierOnBoard = (board: (Card | null)[]) => {
    return board.some(card => card?.radiationEffect === "amplify");
  };

  const createRadiationZone = (index: number, type: RadiationZone["type"]) => {
    setGameState(prev => {
      const newState = { ...prev };
      newState.radiationZones.push({
        index,
        type,
        duration: 3
      });
      
      toast.info("Radiation Zone Created!", {
        description: `A ${type} zone has appeared at position ${index + 1}`
      });
      
      return newState;
    });
  };

  const triggerRandomFieldEvent = (state: GameState) => {
    const events: FieldEvent[] = [
      {
        type: "meteor",
        duration: 2,
        effect: (state) => {
          state.playerRadiation = Math.min(10, state.playerRadiation + 1);
          state.opponentRadiation = Math.min(10, state.opponentRadiation + 1);
          toast.error("Radiation Meteor Impact!", {
            description: "Radiation levels rising for both players"
          });
        }
      },
      {
        type: "meltdown",
        duration: 3,
        effect: (state) => {
          state.playerBoard.forEach(card => {
            if (card && !card.isTransformed && card.radiationEffect === "boost") {
              card.attack += 1;
            }
          });
          toast.warning("Radiation Meltdown!", {
            description: "Boost creatures gain increased power"
          });
        }
      },
      {
        type: "storm",
        duration: 2,
        effect: (state) => {
          const randomIndex = Math.floor(Math.random() * 5);
          if (state.playerBoard[randomIndex]) {
            state.playerBoard[randomIndex] = null;
            toast.error("Radiation Storm!", {
              description: "Random creature destroyed"
            });
          }
        }
      }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    state.activeEvents.push(event);
    toast.info(`Field Event: ${event.type}`, {
      description: "A new environmental effect has begun!"
    });
  };

  const attachStone = (sourceId: string, targetId: string) => {
    setGameState(prev => {
      const newState = { ...prev };
      const targetCard = newState.playerBoard.find(card => card?.id === targetId);
      
      if (targetCard) {
        targetCard.stones += 1;
        toast.success(`Added stone to ${targetCard.name}!`, {
          description: `Now has ${targetCard.stones} stones`
        });
      }
      
      return newState;
    });
  };

  const transformCard = (cardId: string) => {
    setGameState(prev => {
      const newState = { ...prev };
      const cardIndex = newState.playerBoard.findIndex(card => card?.id === cardId);
      
      if (cardIndex === -1) return prev;
      
      const card = newState.playerBoard[cardIndex];
      if (!card || card.isTransformed) return prev;
      
      if (newState.playerRadiation < 5) {
        toast.error("Not enough radiation to transform!");
        return prev;
      }
      
      newState.playerBoard[cardIndex] = {
        ...card,
        isTransformed: true,
        name: card.name.replace('Baby ', ''),
        attack: card.attack * 2,
        defense: Math.floor(card.defense * 1.5)
      };
      
      toast.success(`${card.name} has transformed!`);
      return newState;
    });
  };

  const playCard = (cardId: string, zoneId: string) => {
    setGameState(prev => {
      const newState = { ...prev };
      const zoneIndex = parseInt(zoneId.split('-')[1]);
      const card = newState.playerHand.find(c => c.id === cardId);
      
      if (!card || !Number.isInteger(zoneIndex) || zoneIndex < 0 || zoneIndex > 4) {
        return prev;
      }
      
      newState.playerBoard[zoneIndex] = card;
      newState.playerHand = newState.playerHand.filter(c => c.id !== cardId);
      
      if (card.radiationEffect === "reduce") {
        newState.playerRadiation = Math.max(0, newState.playerRadiation - 1);
        toast.success(`${card.name} reduced radiation by 1`);
      }
      
      return newState;
    });
  };

  const selectAttacker = (cardId: string) => {
    setGameState(prev => ({
      ...prev,
      selectedAttacker: cardId,
      playerBoard: prev.playerBoard.map(card =>
        card?.id === cardId
          ? { ...card, isAttacking: true }
          : card?.isAttacking
            ? { ...card, isAttacking: false }
            : card
      )
    }));
  };

  const selectBlocker = (cardId: string) => {
    setGameState(prev => ({
      ...prev,
      selectedBlocker: cardId,
      opponentBoard: prev.opponentBoard.map(card =>
        card?.id === cardId
          ? { ...card, isBlocking: true }
          : card?.isBlocking
            ? { ...card, isBlocking: false }
            : card
      )
    }));
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setTurnCount(1);
  };

  const useUltimateAbility = (cardId: string) => {
    setGameState(prev => {
      const newState = { ...prev };
      const card = newState.playerBoard.find(c => c?.id === cardId);
      
      if (!card?.ultimateAbility || !card.isTransformed) {
        toast.error("Card cannot use ultimate ability!");
        return prev;
      }
      
      if (card.ultimateAbility.currentCooldown) {
        toast.error("Ultimate ability is on cooldown!");
        return prev;
      }
      
      if (newState.playerRadiation < card.ultimateAbility.cost) {
        toast.error("Not enough radiation!");
        return prev;
      }
      
      card.ultimateAbility.currentCooldown = card.ultimateAbility.cooldown;
      newState.playerRadiation -= card.ultimateAbility.cost;
      
      toast.success(`${card.name} uses ${card.ultimateAbility.name}!`);
      return newState;
    });
  };

  const advancePhase = () => {
    setGameState(prev => {
      const currentIndex = phases.indexOf(prev.currentPhase);
      const nextPhase = phases[(currentIndex + 1) % phases.length];
      
      if (nextPhase === 'Draw') {
        setTurnCount(turnCount + 1);
      }
      
      return {
        ...prev,
        currentPhase: nextPhase
      };
    });
  };

  const value = {
    gameState,
    attachStone,
    playCard,
    transformCard,
    advancePhase,
    selectAttacker,
    selectBlocker,
    resetGame,
    useUltimateAbility
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
      {gameState.isGameOver && gameState.winner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Game Over</h2>
            <p className="text-xl">{gameState.winner} wins!</p>
            <button
              onClick={resetGame}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
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
