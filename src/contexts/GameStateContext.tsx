<lov-code>
import React, { createContext, useContext, useState } from 'react';
import { toast } from "sonner";

interface RadiationZone {
  index: number;
  type: "boost" | "drain" | "shield";
  duration: number;
}

interface EvolutionPath {
  level: number;
  name: string;
  attackBonus: number;
  defenseBonus: number;
  specialAbility: string;
  requirement: {
    radiation: number;
    stones: number;
    transformedTurns?: number;
  };
}

interface UltimateAbility {
  name: string;
  cost: number;
  effect: string;
  cooldown: number;
  currentCooldown?: number;
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
    adjacentEffects?: string[];
    minTurn?: number;
    maxRadiation?: number;
  };
  // New: Evolution and ultimate ability properties
  evolutionPaths?: EvolutionPath[];
  currentEvolutionLevel?: number;
  transformedTurns?: number;
  ultimateAbility?: UltimateAbility;
  comboEffects?: {
    type: "chain" | "synergy" | "resonance";
    bonus: number;
    requirement: string[];
  }[];
  energyStored?: number;
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

interface GameState {
  playerBoard: (Card | null)[];
  playerHand: Card[];
  playerDeck: Card[];
  opponentBoard: (Card | null)[];
  currentPhase: string;
  selectedAttacker: string | null;
  selectedBlocker: string | null;
  playerRadiation: number;
  opponentRadiation: number;
  isGameOver: boolean;
  winner: string | null;
  radiationZones: RadiationZone[];
  // New: Field events
  activeEvents: FieldEvent[];
}

type FieldEvent = {
  type: "meteor" | "meltdown" | "storm" | "powerSurge";
  duration: number;
  effect: (state: GameState) => void;
};

const getCardNameByEffect = (effect: Card['radiationEffect']): string => {
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

const getCardAttackByEffect = (effect: Card['radiationEffect']): number => {
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

const getCardDefenseByEffect = (effect: Card['radiationEffect']): number => {
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

const getCardAbilityByEffect = (effect: Card['radiationEffect']): string | undefined => {
  switch (effect) {
    case "reduce": return "Reduce radiation by 1 when played";
    case "amplify": return "Double all radiation effects";
    case "shield": return "Reduces radiation damage by 1";
    case "burst": return "Release stored radiation at level 5";
    default: return undefined;
  }
};

const getInitialDeck = (): Card[] => {
  const deck: Card[] = [];
  const effects: Card['radiationEffect'][] = ["boost", "reduce", "drain", "amplify", "shield", "burst"];
  
  effects.forEach(effect => {
    const name = getCardNameByEffect(effect);
    const attack = getCardAttackByEffect(effect);
    const defense = getCardDefenseByEffect(effect);
    const ability = getCardAbilityByEffect(effect);
    
    // Add evolution paths based on card type
    const evolutionPaths = getEvolutionPathsByEffect(effect);
    const ultimateAbility = getUltimateAbilityByEffect(effect);
    
    for (let i = 0; i < 3; i++) {
      deck.push({
        id: `deck-${effect}-${i}`,
        name,
        attack,
        defense,
        stones: 0,
        isTransformed: false,
        radiationEffect: effect,
        specialAbility: ability,
        transformRequirement: {
          radiation: 5,
          stones: 3
        },
        evolutionPaths,
        ultimateAbility,
        currentEvolutionLevel: 0,
        transformedTurns: 0
      });
    }
  });
  
  return deck.sort(() => Math.random() - 0.5);
};

const getEvolutionPathsByEffect = (effect: Card['radiationEffect']): EvolutionPath[] => {
  switch (effect) {
    case "boost":
      return [
        {
          level: 1,
          name: "Radiation Absorber",
          attackBonus: 2,
          defenseBonus: 1,
          specialAbility: "Gains +1 attack for each radiation point",
          requirement: { radiation: 6, stones: 4 }
        },
        {
          level: 2,
          name: "Radiation Master",
          attackBonus: 3,
          defenseBonus: 2,
          specialAbility: "Can store double radiation energy",
          requirement: { radiation: 8, stones: 5, transformedTurns: 2 }
        }
      ];
    case "burst":
      return [
        {
          level: 1,
          name: "Chain Reactor",
          attackBonus: 3,
          defenseBonus: 0,
          specialAbility: "Burst affects adjacent zones",
          requirement: { radiation: 7, stones: 4 }
        },
        {
          level: 2,
          name: "Meltdown Entity",
          attackBonus: 4,
          defenseBonus: 1,
          specialAbility: "Survives after burst with 1 HP",
          requirement: { radiation: 9, stones: 6, transformedTurns: 3 }
        }
      ];
    // ... Add evolution paths for other effects
    default:
      return [];
  }
};

const getUltimateAbilityByEffect = (effect: Card['radiationEffect']): UltimateAbility | undefined => {
  switch (effect) {
    case "boost":
      return {
        name: "Radiation Overdrive",
        cost: 8,
        effect: "Triple attack for one turn",
        cooldown: 3
      };
    case "drain":
      return {
        name: "Total Absorption",
        cost: 6,
        effect: "Steal all opponent's radiation",
        cooldown: 4
      };
    case "burst":
      return {
        name: "Chain Reaction",
        cost: 10,
        effect: "Destroy all non-transformed creatures",
        cooldown: 5
      };
    // ... Add ultimate abilities for other effects
    default:
      return undefined;
  }
};

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

  const resolveCombat = (attacker: Card, blocker: Card) => {
    const attackerBonus = calculateRadiationBonus(gameState.playerRadiation, hasAmplifierOnBoard(gameState.playerBoard));
    const blockerBonus = calculateRadiationBonus(gameState.opponentRadiation, hasAmplifierOnBoard(gameState.opponentBoard));
    
    let attackerPower = attacker.isTransformed ? attacker.attack * 2 : attacker.attack;
    let blockerDefense = blocker.isTransformed ? Math.floor(blocker.defense * 1.5) : blocker.defense;
    
    // Apply radiation bonuses and check for stored energy
    if (attacker.radiationEffect === "boost") {
      attackerPower += attackerBonus;
      if (attacker.energyStored) {
        attackerPower += attacker.energyStored;
        toast.success(`Energy Release: +${attacker.energyStored} attack!`);
      }
    }

    // New: Strategic positioning bonus
    const attackerIndex = gameState.playerBoard.findIndex(card => card?.id === attacker.id);
    const centerBonus = attackerIndex === 2 ? 1 : 0;
    if (centerBonus) {
      attackerPower += centerBonus;
      toast.success("Center Position Bonus: +1 attack!");
    }

    // New: Combo Effects
    attacker.comboEffects?.forEach(combo => {
      const hasRequiredCards = combo.requirement.every(effect =>
        gameState.playerBoard.some(card => card?.radiationEffect === effect)
      );
      
      if (hasRequiredCards) {
        switch (combo.type) {
          case "chain":
            attackerPower += combo.bonus;
            toast.success(`Chain Combo: +${combo.bonus} attack!`);
            break;
          case "synergy":
            if (attacker.isTransformed) {
              attackerPower += combo.bonus * 2;
              toast.success(`Synergy Bonus: +${combo.bonus * 2} attack!`);
            }
            break;
          case "resonance":
            if (gameState.playerRadiation >= 5) {
              attackerPower += combo.bonus;
              toast.success(`Radiation Resonance: +${combo.bonus} attack!`);
            }
            break;
        }
      }
    });

    // New: Combat chain effects
    if (attacker.radiationEffect === "burst" && gameState.playerRadiation >= 5) {
      attackerPower += Math.floor(gameState.playerRadiation / 2);
      toast.success("Radiation Burst boost activated!");
    }

    // New: Shield break mechanics
    if (attacker.radiationEffect === "drain" && blocker.radiationEffect === "shield") {
      attackerPower += 2;
      toast.warning("Shield break bonus activated!");
    }

    // New: Combo attack bonus
    const adjacentAttackers = gameState.playerBoard.filter((card, index) => {
      const attackerIndex = gameState.playerBoard.findIndex(c => c?.id === attacker.id);
      return card?.isAttacking && Math.abs(index - attackerIndex) === 1;
    });
    
    if (adjacentAttackers.length > 0) {
      const comboBonus = adjacentAttackers.length;
      attackerPower += comboBonus;
      toast.success(`Combo Attack! +${comboBonus} power`);
    }

    const isDestroyed = attackerPower >= blockerDefense;
    console.log(`Combat Result: ${attacker.name} (${attackerPower}) vs ${blocker.name} (${blockerDefense})`);
    console.log(`Creature ${isDestroyed ? 'destroyed' : 'survived'}`);
    
    if (isDestroyed) {
      // New: Chain destruction effect
      if (blocker.radiationEffect === "burst") {
        gameState.opponentRadiation = Math.min(10, gameState.opponentRadiation + 2);
        toast.warning("Destroyed creature releases stored radiation!");
      }
    } else {
      // New: Counter-attack mechanics
      if (blocker.attack > attacker.defense && blocker.radiationEffect === "drain") {
        setGameState(prev => ({
          ...prev,
          playerRadiation: Math.min(10, prev.playerRadiation + 1)
        }));
        toast.error("Counter-attack increases your radiation!");
      }
    }
    
    return isDestroyed;
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

  const checkTransformationRequirements = (
    card: Card, 
    index: number, 
    radiation: number,
    board: (Card | null)[]
  ): { canTransform: boolean; reason?: string } => {
    const requirement = card.transformRequirement;
    if (!requirement) return { canTransform: false, reason: "No transformation available" };

    if (card.stones < requirement.stones) {
      return { 
        canTransform: false, 
        reason: `Needs ${requirement.stones} stones (has ${card.stones})`
      };
    }

    if (radiation < requirement.radiation) {
      return { 
        canTransform: false, 
        reason: `Needs ${requirement.radiation} radiation (has ${radiation})`
      };
    }

    if (requirement.maxRadiation && radiation > requirement.maxRadiation) {
      return { 
        canTransform: false, 
        reason: `Radiation too high (max ${requirement.maxRadiation})`
      };
    }

    if (requirement.minTurn && turnCount < requirement.minTurn) {
      return { 
        canTransform: false, 
        reason: `Must wait until turn ${requirement.minTurn}`
      };
    }

    if (requirement.adjacentEffects) {
      const adjacentCards = [
        index > 0 ? board[index - 1] : null,
        index < board.length - 1 ? board[index + 1] : null
      ].filter((card): card is Card => card !== null);

      const hasRequiredAdjacent = adjacentCards.some(
        adjacent => adjacent.radiationEffect && 
        requirement.adjacentEffects?.includes(adjacent.radiationEffect)
      );

      if (!hasRequiredAdjacent) {
        return { 
          canTransform: false, 
          reason: `Needs adjacent ${requirement.adjacentEffects.join(" or ")} effect`
        };
      }
    }

    return { canTransform: true };
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
          const transformCheck = checkTransformationRequirements(
            card,
            i,
            prev.playerRadiation,
            prev.playerBoard
          );
          
          if (transformCheck.canTransform && !card.isTransformed) {
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
            
            if (card.radiationEffect === "burst") {
              newState.opponentRadiation = Math.min(10, newState.opponentRadiation + 3);
              toast.warning("Transformation caused a radiation burst!");
            }
          } else if (transformCheck.reason) {
            toast.error("Transformation requirements not met!", {
              description: transformCheck.reason
            });
          }
          break;
        }
      }

      if (transformedIndex !== -1) {
        checkChainReactions(newState, transformedIndex);
      }
      
      return newState;
    });
  };

  const checkChainReactions = (newState: GameState, transformedCardIndex: number) => {
    const transformedCard = newState.playerBoard[transformedCardIndex];
    if (!transformedCard) return;

    // New: Energy storage mechanic
    if (transformedCard.radiationEffect === "boost") {
      transformedCard.energyStored = Math.floor(newState.playerRadiation / 2);
      toast.info(`${transformedCard.name} stores ${transformedCard.energyStored} energy!`);
    }

    const adjacentIndices = [
      transformedCardIndex - 1,
      transformedCardIndex + 1
    ].filter(i => i >= 0 && i < 5);

    adjacentIndices.forEach(index => {
      const adjacentCard = newState.playerBoard[index];
      if (!adjacentCard || adjacentCard.isTransformed) return;

      if (transformedCard.radiationEffect === "amplify" && 
          adjacentCard.radiationEffect === "burst") {
        newState.opponentRadiation = Math.min(10, newState.opponentRadiation + 3);
        toast.success("Chain Reaction: Amplified Burst!", {
          description: `${adjacentCard.name} resonates with ${transformedCard.name}`
        });
      } else if (transformedCard.radiationEffect === "shield" && 
                adjacentCard.radiationEffect === "boost") {
        adjacentCard.defense += 2;
        toast.success("Chain Reaction: Reinforced Defense!", {
          description: `${adjacentCard.name} is strengthened by ${transformedCard.name}`
        });
      }
    });

    const boardCards = newState.playerBoard.filter((card): card is Card => card !== null);
    const transformedCount = boardCards.filter(card => card.isTransformed).length;
    
    if (transformedCount >= 3) {
      boardCards.forEach(card => {
        if (card.isTransformed) {
          card.attack += 1;
          card.defense += 1;
        }
      });
      toast.success("Board Synergy: All transformed creatures powered up!", {
        description: "Multiple transformations create a resonance effect"
      });
    }

    const radiationEffectTypes = new Set(boardCards.map(card => card.radiationEffect));
    if (radiationEffectTypes.size >= 3) {
      newState.playerRadiation = Math.max(0, newState.playerRadiation - 1);
      toast.success("Radiation Harmony achieved!", {
        description: "Diverse radiation effects stabilize the field"
      });
    }

    // New: Advanced board positioning effects
    const isInCenter = transformedCardIndex === 2;
    if (isInCenter && transformedCard.isTransformed) {
      const adjacentCards = [
        newState.playerBoard[1],
        newState.playerBoard[3]
      ].filter((card): card is Card => card !== null);
      
      adjacentCards.forEach(card => {
        if (card.radiationEffect === transformedCard.radiationEffect) {
          card.defense += 1;
          toast.success("Center Formation Bonus!", {
            description: `Adjacent ${card.name} gains +1 defense`
          });
        }
      });
    }
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
        // New: Strategic placement effects
        if (zoneIndex === 2) {
          if (card.radiationEffect === "amplify") {
            toast.success("Center Amplification!", {
              description: "Radiation effects are enhanced"
            });
            card.specialAbility = card.specialAbility + " (Center Enhanced)";
          }
        }

        // New: Formation bonuses
        const adjacentCards = [
          zoneIndex > 0 ? newState.playerBoard[zoneIndex - 1] : null,
          zoneIndex < 4 ? newState.playerBoard[zoneIndex + 1] : null
        ].filter((c): c is Card => c !== null);

        if (adjacentCards.length > 0) {
          const matchingEffects = adjacentCards.filter(
            c => c.radiationEffect === card.radiationEffect
          );

          if (matchingEffects.length > 0) {
            card.defense += matchingEffects.length;
            toast.success("Formation Bonus!", {
              description: `+${matchingEffects.length} defense from adjacent allies`
            });
          }
        }

        const hasAmplifier = hasAmplifierOnBoard(newState.playerBoard);
        
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

        if (newState.playerRadiation >= 5 && card.radiationEffect === "boost") {
          toast.success("Radiation Surge: Attack power increased!", {
            description: `${card.name} gains +${calculateRadiationBonus(newState.playerRadiation, hasAmplifier)} attack!`
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

    setGameState(prev => {
      const newState = { ...prev };
      
      // New: Check for chain attack possibility
      const selectedCard = prev.playerBoard.find(card => card?.id === cardId);
      const adjacentCards = prev.playerBoard.filter((card, index) => {
        const selectedIndex = prev.playerBoard.findIndex(c => c?.id === cardId);
        return card && Math.abs(index - selectedIndex) === 1;
      });

      const canChainAttack = adjacentCards.some(card => 
        card?.radiationEffect === selectedCard?.radiationEffect
      );

      if (canChainAttack) {
        toast.info("Chain Attack Available!", {
          description: "Adjacent creatures can join the attack"
        });
      }

      return {
        ...newState,
        selectedAttacker: cardId,
        playerBoard: prev.playerBoard.map(card => 
          card?.id === cardId 
            ? { ...card, isAttacking: true }
            : card?.isAttacking 
              ? { ...card, isAttacking: false }
              : card
        )
      };
    });
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
      
      if (nextPhase === 'Draw') {
        setTurnCount(turnCount + 1);
        
        if (newState.playerHand.length < 5) {
          drawCard();
        }
        
        newState.playerRadiation = Math.min(10, prev.playerRadiation + 1);
        
        // New: AI opponent decision making
        if (newState.opponentBoard.some(card => card === null)) {
          const emptySpots = newState.opponentBoard
            .map((card, index) => ({ card, index }))
            .filter(({ card }) => card === null)
            .map(({ index }) => index);
          
          // AI tries to maintain board control
          if (emptySpots.length > 0) {
            const playerBoardStrength = calculateBoardStrength(newState.playerBoard);
            const opponentBoardStrength = calculateBoardStrength(newState.opponentBoard);
            
            if (opponentBoardStrength < playerBoardStrength) {
              // Deploy stronger creatures in response to player's board
              const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
              const newCard = createAICard(newState.playerRadiation, playerBoardStrength);
              newState.opponentBoard[randomSpot] = newCard;
              
              toast.warning("Opponent deploys a new creature!", {
                description: `${newCard.name} appears on the field`
              });
            }
          }
        }
        
        // New: Random field events
        if (Math.random() < 0.2) {  // 20% chance each turn
          triggerRandomFieldEvent(newState);
        }
        
        // Process active events
        newState.activeEvents = newState.activeEvents.map(event => {
          event.effect(newState);
          return { ...event, duration: event.duration - 1 };
        }).filter(event => event.duration > 0);
        
        applyRadiationZoneEffects(newState);
        calculateBoardControl();
        checkWinCondition(newState);
      }
      
      // Update transformed turns counter
      newState.playerBoard = newState.playerBoard.map(card => {
        if (card?.isTransformed) {
          return {
            ...card,
            transformedTurns: (card.transformedTurns || 0) + 1
          };
        }
        return card;
      });

      // Check for evolution opportunities
      newState.playerBoard.forEach((card, index) => {
        if (card?.isTransformed && card.evolutionPaths && card.currentEvolutionLevel !== undefined) {
          const nextEvolution = card.evolutionPaths[card.currentEvolutionLevel];
          if (nextEvolution && checkEvolutionRequirements(card, nextEvolution)) {
            evolveCard(newState, index);
          }
        }
      });

      // Reset ultimate ability cooldowns
      newState.playerBoard = newState.playerBoard.map(card => {
        if (card?.ultimateAbility?.currentCooldown) {
          return {
            ...card,
            ultimateAbility: {
              ...card.ultimateAbility,
              currentCooldown: Math.max(0, card.ultimateAbility.currentCooldown - 1)
            }
          };
        }
        return card;
      });
    }
    
    return newState;
  });
};

const checkEvolutionRequirements = (card: Card, evolution: EvolutionPath): boolean => {
  if (!card.isTransformed) return false;
  
  const hasRadiation = gameState.playerRadiation >= evolution.requirement.radiation;
  const hasStones = card.stones >= evolution.requirement.stones;
  const hasTurns = !evolution.requirement.transformedTurns || 
                   (card.transformedTurns || 0) >= evolution.requirement.transformedTurns;
  
  return hasRadiation && hasStones && hasTurns;
};

const evolveCard = (state: GameState, cardIndex: number) => {
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

const useUltimateAbility = (cardId: string) => {
  setGameState(prev => {
    const newState = { ...prev };
    const card = newState.playerBoard.find(c => c?.id === cardId);
    
    if (!card?.ultimateAbility || !card.isTransformed) return prev;
    
    if (card.ultimateAbility.currentCooldown) {
      toast.error("Ultimate ability is on cooldown!", {
        description: `${card.ultimateAbility.currentCooldown} turns remaining`
      });
      return prev;
    }
    
    if (newState.playerRadiation < card.ultimateAbility.cost) {
      toast.error("Not enough radiation!", {
        description: `Requires ${card.ultimateAbility.cost} radiation`
      });
      return prev;
    }
    
    // Apply ultimate ability effect
    switch (card.ultimateAbility.name) {
      case "Radiation Overdrive":
        card.attack *= 3;
        setTimeout(() => {
          card.attack /= 3;
        }, 1000); // Reset after the turn
        break;
      case "Total Absorption":
        newState.playerRadiation += newState.opponentRadiation;
        newState.opponentRadiation = 0;
        break;
      case "Chain Reaction":
        newState.opponentBoard = newState.opponentBoard.map(c => 
          c?.isTransformed ? c : null
        
