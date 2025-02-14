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
  checkComboEffects
} from '../utils/gameUtils';
import {
  getCardNameByEffect,
  getCardAttackByEffect,
  getCardDefenseByEffect,
  getComboEffectsByEffect
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

      const comboEffects = checkComboEffects(newState.playerBoard);
      comboEffects.forEach(combo => {
        const sourceCard = newState.playerBoard.find(c => c?.id === combo.sourceCardId);
        if (sourceCard) {
          sourceCard.attack += combo.attackBonus;
          sourceCard.defense += combo.defenseBonus;
          toast.success(`Combo Effect: ${combo.type}!`, {
            description: `${sourceCard.name} gained +${combo.attackBonus} attack and +${combo.defenseBonus} defense`
          });
        }
      });
      
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
      const newState = { ...prev };
      
      if (nextPhase === 'Draw') {
        setTurnCount(turnCount + 1);
        updateRadiationZones();
        
        // Check for possible evolutions
        newState.playerBoard.forEach((card, index) => {
          if (!card || !card.evolutionPaths || card.currentEvolutionLevel === undefined) return;
          
          const nextEvolution = card.evolutionPaths[card.currentEvolutionLevel];
          if (nextEvolution && checkEvolutionRequirements(card, nextEvolution, newState.playerRadiation)) {
            evolveCard(newState, index);
          }
        });

        // Random chance to create new radiation zone
        if (Math.random() < 0.3) {
          const availableSpots = prev.playerBoard
            .map((card, index) => ({ card, index }))
            .filter(({ card, index }) => 
              card && !prev.radiationZones.some(zone => zone.index === index)
            )
            .map(({ index }) => index);

          if (availableSpots.length > 0) {
            const randomIndex = availableSpots[Math.floor(Math.random() * availableSpots.length)];
            const zoneTypes: RadiationZone["type"][] = ["boost", "drain", "shield"];
            const randomType = zoneTypes[Math.floor(Math.random() * zoneTypes.length)];
            createRadiationZone(randomIndex, randomType);
          }
        }

        // Random chance to trigger field event
        if (Math.random() < 0.2) {
          triggerRandomFieldEvent(newState);
        }

        // Update ultimate ability cooldowns
        newState.playerBoard.forEach(card => {
          if (card?.ultimateAbility?.currentCooldown) {
            card.ultimateAbility.currentCooldown--;
          }
        });

        // Apply active field event effects
        newState.activeEvents.forEach(event => event.effect(newState));
        
        // Update field event durations and remove expired ones
        newState.activeEvents = newState.activeEvents
          .map(event => ({ ...event, duration: event.duration - 1 }))
          .filter(event => event.duration > 0);
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

  const resolveCombat = () => {
    setGameState(prev => {
      if (!prev.selectedAttacker || !prev.selectedBlocker) {
        return prev;
      }

      const newState = { ...prev };
      const attackerIndex = newState.playerBoard.findIndex(card => card?.id === prev.selectedAttacker);
      const blocker = newState.opponentBoard.find(card => card?.id === prev.selectedBlocker);
      const attacker = newState.playerBoard[attackerIndex];

      if (!attacker || !blocker) {
        return prev;
      }

      // Calculate damage with zone modifiers
      const attackerDamage = attacker.attack + 
        calculateRadiationBonus(newState.playerRadiation, hasAmplifierOnBoard(newState.playerBoard)) +
        getZoneModifier(attackerIndex, "attack");
        
      const blockerDamage = blocker.attack + 
        calculateRadiationBonus(newState.opponentRadiation, hasAmplifierOnBoard(newState.opponentBoard));

      // Apply damage
      blocker.defense -= attackerDamage;
      attacker.defense -= blockerDamage;

      // Process results
      if (blocker.defense <= 0) {
        const blockerIndex = newState.opponentBoard.findIndex(card => card?.id === blocker.id);
        newState.opponentBoard[blockerIndex] = null;
        toast.success(`${blocker.name} was destroyed!`);
      }

      if (attacker.defense <= 0) {
        newState.playerBoard[attackerIndex] = null;
        toast.error(`${attacker.name} was destroyed!`);
      }

      // Reset combat state
      newState.selectedAttacker = null;
      newState.selectedBlocker = null;

      // Check win conditions
      const playerBoardEmpty = newState.playerBoard.every(card => card === null);
      const opponentBoardEmpty = newState.opponentBoard.every(card => card === null);

      if (playerBoardEmpty && !opponentBoardEmpty) {
        newState.isGameOver = true;
        newState.winner = "Opponent";
      } else if (!playerBoardEmpty && opponentBoardEmpty) {
        newState.isGameOver = true;
        newState.winner = "Player";
      }

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

const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export { GameStateContext, GameStateProvider, useGameState };
