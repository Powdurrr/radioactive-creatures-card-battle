import React, { createContext, useContext, useState } from 'react';
import { toast } from "sonner";

interface RadiationZone {
  index: number;
  type: "boost" | "drain" | "shield";
  duration: number;
}

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
  radiationEffect?: "reduce" | "boost" | "drain" | "amplify" | "shield" | "burst";
  specialAbility?: string;
  transformRequirement?: {
    radiation: number;
    stones: number;
  };
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
  radiationZones: RadiationZone[];
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
      radiationEffect: "boost",
      transformRequirement: {
        radiation: 5,
        stones: 3
      }
    },
    { 
      id: 'hand-2', 
      name: 'Radiation Shield', 
      attack: 1, 
      defense: 5, 
      stones: 0, 
      isTransformed: false,
      radiationEffect: "shield",
      specialAbility: "Reduces radiation damage by 1"
    },
    { 
      id: 'hand-3', 
      name: 'Radiation Amplifier', 
      attack: 3, 
      defense: 2, 
      stones: 0, 
      isTransformed: false,
      radiationEffect: "amplify",
      specialAbility: "All radiation effects are doubled"
    }
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
  winner: null,
  radiationZones: []
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

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

  const checkRadiationTriggers = (newState: GameState, previousState: GameState) => {
    const hasShield = newState.playerBoard.some(card => card?.radiationEffect === "shield");
    const radiation = newState.playerRadiation;
    
    // Radiation threshold events
    if (radiation === 3) {
      toast.info("Radiation Level 3: Basic powers awakened!", {
        description: "Creatures with radiation boost gain +1 attack"
      });
    } else if (radiation === 5) {
      toast.warning("Radiation Level 5: Advanced powers unlocked!", {
        description: "Transformation available for eligible creatures"
      });
    } else if (radiation === 8) {
      toast.error("Radiation Level 8: Maximum power reached!", {
        description: "All radiation effects are enhanced"
      });
    }

    // Apply radiation effects
    if (radiation >= 5) {
      newState.playerBoard.forEach((card, index) => {
        if (card?.radiationEffect === "burst" && !card.isTransformed) {
          toast.success(`${card.name} unleashes stored radiation!`);
          newState.opponentRadiation = Math.min(10, newState.opponentRadiation + 2);
          // Remove the card after burst
          newState.playerBoard[index] = null;
        }
      });
    }

    // Shield effect
    if (hasShield && newState.playerRadiation > previousState.playerRadiation) {
      newState.playerRadiation--;
      toast.success("Radiation Shield absorbed 1 radiation!");
    }
  };

  const resolveCombat = (attacker: Card, blocker: Card) => {
    const attackerBonus = calculateRadiationBonus(gameState.playerRadiation, hasAmplifierOnBoard(gameState.playerBoard));
    const blockerBonus = calculateRadiationBonus(gameState.opponentRadiation, hasAmplifierOnBoard(gameState.opponentBoard));
    
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

  const transformCard = (cardId: string) => {
    if (gameState.currentPhase !== 'Recovery') {
      console.log('Transformations can only occur during Recovery phase');
      return;
    }

    setGameState(prev => {
      const newState = { ...prev };
      let transformedIndex = -1;
      
      for (let i = 0; i < newState.playerBoard.length; i++) {
        const card = newState.playerBoard[i];
        if (card?.id === cardId) {
          const requirement = card.transformRequirement;
          
          if (requirement && 
              card.stones >= requirement.stones && 
              prev.playerRadiation >= requirement.radiation &&
              !card.isTransformed) {
            
            newState.playerBoard[i] = {
              ...card,
              isTransformed: true,
              name: card.name.replace('Baby ', ''),
              specialAbility: card.specialAbility + " (Enhanced)",
            };
            
            transformedIndex = i;
            
            toast.success(`${card.name} has transformed!`, {
              description: "Power levels have increased significantly"
            });
            
            // Radiation burst on transformation
            if (card.radiationEffect === "burst") {
              newState.opponentRadiation = Math.min(10, newState.opponentRadiation + 3);
              toast.warning("Transformation caused a radiation burst!");
            }
            break;
          } else if (requirement) {
            toast.error("Transformation requirements not met!", {
              description: `Needs ${requirement.stones} stones and ${requirement.radiation} radiation`
            });
          }
        }
      }

      // Check for chain reactions if transformation occurred
      if (transformedIndex !== -1) {
        checkChainReactions(newState, transformedIndex);
      }
      
      return newState;
    });
  };

  const checkChainReactions = (newState: GameState, transformedCardIndex: number) => {
    const transformedCard = newState.playerBoard[transformedCardIndex];
    if (!transformedCard) return;

    // Check adjacent cards for chain reactions
    const adjacentIndices = [
      transformedCardIndex - 1,
      transformedCardIndex + 1
    ].filter(i => i >= 0 && i < 5);

    adjacentIndices.forEach(index => {
      const adjacentCard = newState.playerBoard[index];
      if (!adjacentCard || adjacentCard.isTransformed) return;

      // Chain reaction based on radiation effects
      if (transformedCard.radiationEffect === "amplify" && 
          adjacentCard.radiationEffect === "burst") {
        // Amplify + Burst combination
        newState.opponentRadiation = Math.min(10, newState.opponentRadiation + 3);
        toast.success("Chain Reaction: Amplified Burst!", {
          description: `${adjacentCard.name} resonates with ${transformedCard.name}`
        });
      } else if (transformedCard.radiationEffect === "shield" && 
                adjacentCard.radiationEffect === "boost") {
        // Shield + Boost combination
        adjacentCard.defense += 2;
        toast.success("Chain Reaction: Reinforced Defense!", {
          description: `${adjacentCard.name} is strengthened by ${transformedCard.name}`
        });
      }
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
        const hasAmplifier = hasAmplifierOnBoard(newState.playerBoard);
        
        // Apply radiation effects when card is played
        switch (card.radiationEffect) {
          case "reduce":
            const reduction = hasAmplifier ? 2 : 1;
            newState.playerRadiation = Math.max(0, newState.playerRadiation - reduction);
            toast.success(`${card.name} reduced your radiation by ${reduction}!`);
            break;
            
          case "drain":
            const drainAmount = hasAmplifier ? 2 : 1;
            newState.opponentRadiation = Math.min(10, newState.opponentRadiation + drainAmount);
            toast.success(`${card.name} increased opponent's radiation by ${drainAmount}!`);
            break;
            
          case "burst":
            if (newState.playerRadiation >= 5) {
              const burstAmount = hasAmplifier ? 4 : 2;
              newState.opponentRadiation = Math.min(10, newState.opponentRadiation + burstAmount);
              toast.success(`${card.name} released a radiation burst!`);
            }
            break;
            
          case "amplify":
            toast.success(`${card.name} will double all radiation effects!`);
            break;
            
          case "shield":
            toast.success(`${card.name} will protect against radiation buildup!`);
            break;
        }

        // Apply special abilities based on radiation thresholds
        const bonus = calculateRadiationBonus(newState.playerRadiation, hasAmplifier);
        if (newState.playerRadiation >= 5 && card.radiationEffect === "boost") {
          toast.success("Radiation Surge: Attack power increased!", {
            description: `${card.name} gains +${bonus} attack!`
          });
        }

        newState.playerBoard[zoneIndex] = card;
        newState.playerHand = newState.playerHand.filter(c => c.id !== cardId);
      }
      
      checkRadiationTriggers(newState, prev);
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
          // Apply radiation zone effects at the start of turn
          applyRadiationZoneEffects(newState);
          
          // Increment radiation counter
          newState.playerRadiation = Math.min(10, prev.playerRadiation + 1);
          
          // Random chance to create new radiation zone
          if (Math.random() < 0.3) { // 30% chance each turn
            const availableSpots = newState.playerBoard
              .map((card, index) => ({ card, index }))
              .filter(({ card }) => card !== null)
              .map(({ index }) => index);
            
            if (availableSpots.length > 0) {
              const randomSpot = availableSpots[Math.floor(Math.random() * availableSpots.length)];
              const zoneTypes: RadiationZone["type"][] = ["boost", "drain", "shield"];
              const randomType = zoneTypes[Math.floor(Math.random() * zoneTypes.length)];
              
              createRadiationZone(randomSpot, randomType);
            }
          }
          
          checkWinCondition(newState);
          checkRadiationTriggers(newState, prev);
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

  const applyRadiationZoneEffects = (newState: GameState) => {
    newState.radiationZones.forEach(zone => {
      const card = newState.playerBoard[zone.index];
      if (!card) return;

      switch (zone.type) {
        case "boost":
          if (card.radiationEffect === "boost") {
            card.attack += 1;
            toast.info(`${card.name} powered up by radiation zone!`);
          }
          break;
        case "drain":
          if (!card.isTransformed) {
            newState.playerRadiation = Math.min(10, newState.playerRadiation + 1);
            toast.warning(`Radiation zone affecting ${card.name}!`);
          }
          break;
        case "shield":
          if (card.radiationEffect === "shield") {
            card.defense += 1;
            toast.success(`${card.name} reinforced by radiation zone!`);
          }
          break;
      }
    });

    // Update zone durations and remove expired zones
    newState.radiationZones = newState.radiationZones
      .map(zone => ({ ...zone, duration: zone.duration - 1 }))
      .filter(zone => zone.duration > 0);
  };

  const createRadiationZone = (index: number, type: RadiationZone["type"]) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      // Create new radiation zone
      newState.radiationZones.push({
        index,
        type,
        duration: 3 // Zones last for 3 turns
      });

      toast.info("Radiation Zone Created!", {
        description: `A ${type} zone has appeared at position ${index + 1}`
      });

      return newState;
    });
  };

  const getCardNameByEffect = (effect: Card['radiationEffect']) => {
    switch (effect) {
      case "boost": return "Baby Godzilla";
      case "reduce": return "Radiation Absorber";
      case "drain": return "Radiation Drainer";
      case "amplify": return "Radiation Amplifier";
      case "shield": return "Radiation Shield";
      case "burst": return "Radiation Burster";
      default: return "Unknown Creature";
    }
  };

  const getCardAttackByEffect = (effect: Card['radiationEffect']) => {
    switch (effect) {
      case "boost": return 2;
      case "reduce": return 1;
      case "drain": return 3;
      case "amplify": return 3;
      case "shield": return 1;
      case "burst": return 4;
      default: return 2;
    }
  };

  const getCardDefenseByEffect = (effect: Card['radiationEffect']) => {
    switch (effect) {
      case "boost": return 3;
      case "reduce": return 4;
      case "drain": return 2;
      case "amplify": return 2;
      case "shield": return 5;
      case "burst": return 1;
      default: return 3;
    }
  };

  const getCardAbilityByEffect = (effect: Card['radiationEffect']) => {
    switch (effect) {
      case "reduce": return "Reduce radiation by 1 when played";
      case "amplify": return "Double all radiation effects";
      case "shield": return "Reduces radiation damage by 1";
      case "burst": return "Release stored radiation at level 5";
      default: return undefined;
    }
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
