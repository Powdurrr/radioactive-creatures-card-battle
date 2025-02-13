import React, { createContext, useContext, useState } from 'react';
import { toast } from "sonner";

interface Card {
  id: string;
  name: string;
  attack: number;
  defense: number;
  stones: number;
  isTransformed: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
  radiationCost?: number;
  radiationEffect?: "reduce" | "boost" | "drain";
  specialAbility?: string;
}

interface GameState {
  playerBoard: (Card | null)[];
  playerHand: Card[];
  opponentBoard: (Card | null)[];
  currentPhase: string;
  selectedAttacker: string | null;
  selectedBlocker: string | null;
  playerRadiation: number;
  opponentRadiation: number;
  isGameOver: boolean;
  winner: string | null;
}

interface GameStateContextType {
  gameState: GameState;
  attachStone: (sourceId: string, targetId: string) => void;
  playCard: (cardId: string, zoneId: string) => void;
  transformCard: (cardId: string) => void;
  advancePhase: () => void;
  selectAttacker: (cardId: string) => void;
  selectBlocker: (cardId: string) => void;
  resetGame: () => void;
}

const initialGameState: GameState = {
  playerBoard: Array(5).fill(null),
  playerHand: [
    { 
      id: 'hand-1', 
      name: 'Baby Godzilla', 
      attack: 2, 
      defense: 3, 
      stones: 0, 
      isTransformed: false,
      radiationEffect: "boost"
    },
    { 
      id: 'hand-2', 
      name: 'Radiation Absorber', 
      attack: 1, 
      defense: 4, 
      stones: 0, 
      isTransformed: false,
      radiationEffect: "reduce",
      specialAbility: "Reduce radiation by 1 when played"
    },
    { 
      id: 'stone-1', 
      name: 'Stone', 
      attack: 0, 
      defense: 0, 
      stones: 0, 
      isTransformed: false 
    },
  ],
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
  winner: null
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const calculateRadiationBonus = (radiation: number) => {
    if (radiation >= 8) return 3;
    if (radiation >= 5) return 2;
    if (radiation >= 3) return 1;
    return 0;
  };

  const resolveCombat = (attacker: Card, blocker: Card) => {
    const attackerBonus = calculateRadiationBonus(gameState.playerRadiation);
    const blockerBonus = calculateRadiationBonus(gameState.opponentRadiation);
    
    let attackerPower = attacker.isTransformed ? attacker.attack * 2 : attacker.attack;
    let blockerDefense = blocker.isTransformed ? Math.floor(blocker.defense * 1.5) : blocker.defense;
    
    // Apply radiation bonuses
    if (attacker.radiationEffect === "boost") {
      attackerPower += attackerBonus;
    }
    if (blocker.radiationEffect === "boost") {
      blockerDefense += blockerBonus;
    }
    
    const isDestroyed = attackerPower >= blockerDefense;
    console.log(`Combat Result: ${attacker.name} (${attackerPower}) vs ${blocker.name} (${blockerDefense})`);
    console.log(`Creature ${isDestroyed ? 'destroyed' : 'survived'}`);
    
    return isDestroyed;
  };

  const checkWinCondition = (newState: GameState) => {
    if (newState.playerRadiation >= 10) {
      toast.error("Game Over - Opponent Wins!", {
        description: "Your radiation levels reached critical mass!",
        duration: 5000
      });
      newState.isGameOver = true;
      newState.winner = "opponent";
    } else if (newState.opponentRadiation >= 10) {
      toast.success("Victory!", {
        description: "Your opponent's radiation levels reached critical mass!",
        duration: 5000
      });
      newState.isGameOver = true;
      newState.winner = "player";
    }
  };

  const phases = [
    "Draw",
    "Initiative",
    "Attack",
    "Block",
    "Damage",
    "Recovery",
    "End"
  ];

  const attachStone = (sourceId: string, targetId: string) => {
    if (gameState.currentPhase !== 'Initiative') {
      console.log('Stones can only be attached during Initiative phase');
      return;
    }

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
    if (gameState.currentPhase !== 'Initiative') {
      console.log('Cards can only be played during Initiative phase');
      return;
    }

    setGameState(prev => {
      const newState = { ...prev };
      const zoneIndex = parseInt(zoneId.split('-')[1]);
      const card = newState.playerHand.find(c => c.id === cardId);
      
      if (card && zoneIndex >= 0 && zoneIndex < 5) {
        // Apply radiation effects when card is played
        if (card.radiationEffect === "reduce") {
          newState.playerRadiation = Math.max(0, newState.playerRadiation - 1);
          toast.success(`${card.name} reduced your radiation by 1!`);
        } else if (card.radiationEffect === "drain") {
          const drainAmount = 1;
          newState.opponentRadiation = Math.min(10, newState.opponentRadiation + drainAmount);
          toast.success(`${card.name} increased opponent's radiation by ${drainAmount}!`);
        }

        // Apply special abilities based on radiation thresholds
        if (newState.playerRadiation >= 5 && card.radiationEffect === "boost") {
          toast.success("Radiation Surge: Attack power increased!", {
            description: `${card.name} gains +${calculateRadiationBonus(newState.playerRadiation)} attack!`
          });
        }

        newState.playerBoard[zoneIndex] = card;
        newState.playerHand = newState.playerHand.filter(c => c.id !== cardId);
      }
      
      return newState;
    });
  };

  const transformCard = (cardId: string) => {
    if (gameState.currentPhase !== 'Recovery') {
      console.log('Transformations can only occur during Recovery phase');
      return;
    }

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

  const selectAttacker = (cardId: string) => {
    if (gameState.currentPhase !== 'Attack') {
      console.log('Attackers can only be selected during Attack phase');
      return;
    }

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
    if (gameState.currentPhase !== 'Block') {
      console.log('Blockers can only be selected during Block phase');
      return;
    }

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

  const advancePhase = () => {
    setGameState(prev => {
      const currentIndex = phases.indexOf(prev.currentPhase);
      const nextIndex = (currentIndex + 1) % phases.length;
      const nextPhase = phases[nextIndex];
      
      const newState = { ...prev, currentPhase: nextPhase };
      
      switch (nextPhase) {
        case 'Draw':
          // Increment radiation counter at the start of each turn
          newState.playerRadiation = Math.min(10, prev.playerRadiation + 1);
          checkWinCondition(newState);
          
          // Add a new card to hand with random radiation effects
          const effects: Card['radiationEffect'][] = ["boost", "reduce", "drain"];
          const randomEffect = effects[Math.floor(Math.random() * effects.length)];
          
          newState.playerHand = [
            ...newState.playerHand,
            { 
              id: `hand-${Date.now()}`, 
              name: randomEffect === "reduce" ? "Radiation Absorber" : 
                   randomEffect === "drain" ? "Radiation Drainer" : "Baby Godzilla", 
              attack: randomEffect === "drain" ? 3 : 2, 
              defense: randomEffect === "reduce" ? 4 : 3, 
              stones: 0, 
              isTransformed: false,
              radiationEffect: randomEffect,
              specialAbility: randomEffect === "reduce" ? "Reduce radiation by 1 when played" : undefined
            }
          ];
          break;
          
        case 'Recovery':
          // Check for transformations
          newState.playerBoard = newState.playerBoard.map(card => {
            if (card && card.stones >= 3 && !card.isTransformed) {
              return {
                ...card,
                isTransformed: true,
                name: card.name.replace('Baby ', '')
              };
            }
            return card;
          });
          break;

        case 'Damage':
          // Resolve combat if there are attacking and blocking creatures
          if (prev.selectedAttacker && prev.selectedBlocker) {
            const attacker = prev.playerBoard.find(card => card?.id === prev.selectedAttacker);
            const blocker = prev.opponentBoard.find(card => card?.id === prev.selectedBlocker);
            
            if (attacker && blocker) {
              const isDestroyed = resolveCombat(attacker, blocker);
              if (isDestroyed) {
                // Remove the destroyed creature
                newState.opponentBoard = newState.opponentBoard.map(card =>
                  card?.id === prev.selectedBlocker ? null : card
                );
              }
            } else if (prev.selectedAttacker) {
              // Direct attack with no blocker - remove a random opponent creature
              const attacker = prev.playerBoard.find(card => card?.id === prev.selectedAttacker);
              if (attacker) {
                const occupiedSlots = newState.opponentBoard
                  .map((card, index) => card ? index : -1)
                  .filter(index => index !== -1);
                
                if (occupiedSlots.length > 0) {
                  const randomIndex = occupiedSlots[Math.floor(Math.random() * occupiedSlots.length)];
                  newState.opponentBoard[randomIndex] = null;
                  console.log(`Direct attack destroyed creature at position ${randomIndex + 1}`);
                }
              }
            }
          }
          
          // Reset combat selections
          newState.selectedAttacker = null;
          newState.selectedBlocker = null;
          newState.playerBoard = newState.playerBoard.map(card => 
            card ? { ...card, isAttacking: false } : null
          );
          newState.opponentBoard = newState.opponentBoard.map(card =>
            card ? { ...card, isBlocking: false } : null
          );
          break;
      }
      
      return newState;
    });
  };

  const resetGame = () => {
    setGameState(initialGameState);
  };

  return (
    <GameStateContext.Provider value={{ 
      gameState, 
      attachStone, 
      playCard, 
      transformCard,
      advancePhase,
      selectAttacker,
      selectBlocker,
      resetGame
    }}>
      {children}
      {gameState.isGameOver && gameState.winner && (
        <GameOverScreen winner={gameState.winner} />
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

const GameOverScreen = ({ winner }: { winner: string }) => {
  return (
    <div>
      <h1>Game Over</h1>
      <p>The {winner} wins!</p>
    </div>
  );
};
