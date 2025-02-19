
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  GameState, 
  GameStateContextType, 
  Card, 
  RadiationZone,
  FieldEvent,
  EvolutionPath 
} from '../types/GameTypes';
import { 
  getInitialDeck, 
  checkEvolutionRequirements, 
  evolveCard, 
  calculateBoardStrength,
  calculateCombatDamage 
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
  targetedDefender: null,
  playerRadiation: 0,
  opponentRadiation: 0,
  isGameOver: false,
  winner: null,
  radiationZones: [],
  activeEvents: []
};

const phases = ['Draw', 'Recovery', 'Attack', 'Block', 'Damage', 'End'];

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const updateRadiationZones = () => {
    setGameState(prev => {
      const newState = { ...prev };
      // Update durations and remove expired zones
      newState.radiationZones = newState.radiationZones
        .map(zone => ({ ...zone, duration: zone.duration - 1 }))
        .filter(zone => zone.duration > 0);
      
      // Apply zone effects
      newState.radiationZones.forEach(zone => {
        const card = newState.playerBoard[zone.index];
        if (!card) return;

        switch (zone.type) {
          case "boost":
            card.attack += 1;
            break;
          case "drain":
            newState.playerRadiation = Math.max(0, newState.playerRadiation - 1);
            break;
          case "shield":
            // Shield effect handled during combat
            break;
        }
      });

      return newState;
    });
  };

  const getZoneModifier = (index: number, type: "attack" | "defense") => {
    const zone = gameState.radiationZones.find(z => z.index === index);
    if (!zone) return 0;

    switch (zone.type) {
      case "boost":
        return type === "attack" ? 1 : 0;
      case "shield":
        return type === "defense" ? 1 : 0;
      default:
        return 0;
    }
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

  const calculateBoardStrength = (board: (Card | null)[]): number => {
    return board.reduce((total, card) => {
      if (!card) return total;
      return total + card.attack + card.defense;
    }, 0);
  };

  const checkEvolutionRequirements = (
    card: Card, 
    evolution: EvolutionPath,
    radiation: number
  ): boolean => {
    if (!card.isTransformed) return false;
    
    const hasRadiation = radiation >= evolution.requirement.radiation;
    const hasStones = card.stones >= evolution.requirement.stones;
    const hasTurns = !evolution.requirement.transformedTurns || 
                     (card.transformedTurns || 0) >= evolution.requirement.transformedTurns;
    
    return hasRadiation && hasStones && hasTurns;
  };

  const evolveCard = (state: GameState, cardIndex: number): void => {
    const card = state.playerBoard[cardIndex];
    if (!card || !card.evolutionPaths || card.currentEvolutionLevel === undefined) return;
    
    const evolution = card.evolutionPaths[card.currentEvolutionLevel];
    if (!evolution) return;
    
    state.playerBoard[cardIndex] = {
      ...card,
      attack: card.attack + evolution.attackBonus,
      defense: card.defense + evolution.defenseBonus,
      name: evolution.name,
      specialAbility: evolution.specialAbility,
      currentEvolutionLevel: card.currentEvolutionLevel + 1
    };
    
    toast.success(`${card.name} has evolved into ${evolution.name}!`, {
      description: `Gained ${evolution.attackBonus} attack and ${evolution.defenseBonus} defense`
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
        defense: Math.floor(card.defense * 1.5),
        transformedTurns: 0,
        currentEvolutionLevel: 0
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
    if (gameState.currentPhase !== 'Attack') {
      toast.error("You can only select attackers during the Attack phase!");
      return;
    }

    setGameState(prev => {
      const newState = { ...prev };
      
      // Clear previous target if deselecting attacker
      if (cardId === "") {
        newState.selectedAttacker = null;
        newState.targetedDefender = null;
      } else {
        newState.selectedAttacker = cardId;
      }

      if (cardId) {
        toast.success("Selected attacker - choose a target!");
      }

      return newState;
    });
  };

  const selectTarget = (targetId: string) => {
    if (!gameState.selectedAttacker) {
      toast.error("Select an attacker first!");
      return;
    }

    setGameState(prev => {
      const newState = { ...prev };
      newState.targetedDefender = targetId;
      toast.success("Target selected - opponent may now block!");
      return newState;
    });
  };

  const selectBlocker = (cardId: string) => {
    if (gameState.currentPhase !== 'Block') {
      toast.error("You can only select blockers during the Block phase!");
      return;
    }

    setGameState(prev => {
      const newState = { ...prev };
      newState.selectedBlocker = cardId;
      toast.success("Blocker selected - combat will resolve!");
      return newState;
    });
  };

  const resolveCombat = () => {
    if (gameState.currentPhase !== 'Damage') {
      return;
    }

    setGameState(prev => {
      if (!prev.selectedAttacker || !prev.targetedDefender) {
        toast.error("No valid combat to resolve!");
        return prev;
      }

      const newState = { ...prev };
      const attacker = newState.playerBoard.find(card => card?.id === prev.selectedAttacker);
      const defender = newState.opponentBoard.find(card => card?.id === prev.targetedDefender);
      
      if (!attacker || !defender) {
        toast.error("Combat creatures not found!");
        return prev;
      }

      // Calculate and apply combat damage
      const damage = calculateCombatDamage(attacker, defender, newState);
      
      if (newState.selectedBlocker) {
        const blocker = newState.opponentBoard.find(card => card?.id === newState.selectedBlocker);
        if (blocker) {
          // Handle blocking damage
          const blockDamage = calculateCombatDamage(blocker, attacker, newState);
          attacker.defense -= blockDamage;
          blocker.defense -= damage;

          toast.info(`Combat Results:`, {
            description: `${attacker.name} deals ${damage} damage to blocker, receives ${blockDamage} damage`
          });

          if (blocker.defense <= 0) {
            const blockerIndex = newState.opponentBoard.findIndex(card => card?.id === blocker.id);
            newState.opponentBoard[blockerIndex] = null;
            toast.success(`${blocker.name} was destroyed!`);
          }
        }
      } else {
        // Direct damage to defender
        defender.defense -= damage;
        toast.info(`Combat Results:`, {
          description: `${attacker.name} deals ${damage} damage to ${defender.name}`
        });
      }

      if (attacker.defense <= 0) {
        const attackerIndex = newState.playerBoard.findIndex(card => card?.id === attacker.id);
        newState.playerBoard[attackerIndex] = null;
        toast.error(`${attacker.name} was destroyed!`);
      }

      if (defender.defense <= 0) {
        const defenderIndex = newState.opponentBoard.findIndex(card => card?.id === defender.id);
        newState.opponentBoard[defenderIndex] = null;
        toast.success(`${defender.name} was destroyed!`);
      }

      // Reset combat state
      newState.selectedAttacker = null;
      newState.selectedBlocker = null;
      newState.targetedDefender = null;

      return newState;
    });
  };

  const advancePhase = () => {
    setGameState(prev => {
      const currentIndex = phases.indexOf(prev.currentPhase);
      const nextPhase = phases[(currentIndex + 1) % phases.length];
      const newState = { ...prev };

      // Phase-specific logic
      switch (nextPhase) {
        case 'Draw':
          setTurnCount(turnCount + 1);
          // Draw phase logic
          if (newState.playerDeck.length > 0) {
            const drawnCard = newState.playerDeck[0];
            newState.playerHand.push(drawnCard);
            newState.playerDeck = newState.playerDeck.slice(1);
            toast.success(`Drew ${drawnCard.name}!`);
          }
          break;

        case 'Attack':
          // Check if player has any creatures that can attack
          const hasAttackers = newState.playerBoard.some(card => card !== null);
          if (hasAttackers) {
            toast.info("Select a creature to attack with!");
          } else {
            toast.warning("No creatures available to attack!");
          }
          break;

        case 'Block':
          if (!newState.selectedAttacker) {
            toast.warning("No attacker was selected, skipping combat.");
            return {
              ...newState,
              currentPhase: 'End'
            };
          }
          toast.info("Select a blocker!");
          break;

        case 'Damage':
          if (newState.selectedAttacker && newState.selectedBlocker) {
            resolveCombat();
          }
          break;

        case 'End':
          // Reset any end-of-turn effects
          updateRadiationZones();
          break;
      }

      return {
        ...newState,
        currentPhase: nextPhase
      };
    });
  };

  const drawCard = () => {
    setGameState(prev => {
      if (prev.playerDeck.length === 0) {
        toast.error("No more cards in deck!");
        return prev;
      }

      const newState = { ...prev };
      const drawnCard = newState.playerDeck[0];
      newState.playerDeck = newState.playerDeck.slice(1);
      newState.playerHand.push(drawnCard);

      toast.success(`Drew ${drawnCard.name}!`);
      return newState;
    });
  };

  useEffect(() => {
    if (gameState.currentPhase === 'Draw') {
      drawCard();
    } else if (gameState.currentPhase === 'Damage' && gameState.selectedAttacker && gameState.selectedBlocker) {
      resolveCombat();
    }
  }, [gameState.currentPhase]);

  const resetGame = () => {
    setGameState(initialGameState);
    setTurnCount(1);
    toast.success("Starting new game!");
  };

  const useUltimateAbility = (cardId: string) => {
    setGameState(prev => {
      const newState = { ...prev };
      const card = newState.playerBoard.find(c => c?.id === cardId);
      
      if (!card || !card.ultimateAbility) {
        toast.error("No ultimate ability available!");
        return prev;
      }

      if (card.ultimateAbility.currentCooldown && card.ultimateAbility.currentCooldown > 0) {
        toast.error(`Ultimate ability on cooldown for ${card.ultimateAbility.currentCooldown} more turns!`);
        return prev;
      }

      if (newState.playerRadiation < card.ultimateAbility.cost) {
        toast.error(`Not enough radiation! Need ${card.ultimateAbility.cost} radiation.`);
        return prev;
      }

      // Apply ability cost
      newState.playerRadiation -= card.ultimateAbility.cost;
      
      // Set cooldown
      if (card.ultimateAbility) {
        card.ultimateAbility.currentCooldown = card.ultimateAbility.cooldown;
      }

      toast.success(`${card.name} used their ultimate ability!`);
      return newState;
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
    selectTarget,
    resetGame,
    useUltimateAbility
  };

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

export { GameStateContext, GameStateProvider, useGameState };
