import { GameState, Card, EvolutionPath } from '../types/GameTypes';
import { toast } from "sonner";
import { 
  getCardNameByEffect, 
  getCardAttackByEffect, 
  getCardDefenseByEffect,
  getCardAbilityByEffect,
  getEvolutionPathsByEffect,
  getUltimateAbilityByEffect
} from './cardUtils';

export const getInitialDeck = (): Card[] => {
  const deck: Card[] = [];
  const effects: Card['radiationEffect'][] = ["boost", "reduce", "drain", "amplify", "shield", "burst"];
  
  effects.forEach(effect => {
    const name = getCardNameByEffect(effect);
    const attack = getCardAttackByEffect(effect);
    const defense = getCardDefenseByEffect(effect);
    const ability = getCardAbilityByEffect(effect);
    
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

export const calculateBoardStrength = (board: (Card | null)[]): number => {
  return board.reduce((total, card) => {
    if (!card) return total;
    return total + card.attack + card.defense;
  }, 0);
};

export const checkEvolutionRequirements = (
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

export const evolveCard = (state: GameState, cardIndex: number): void => {
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

export const calculateCombatDamage = (
  attacker: Card,
  defender: Card,
  gameState: GameState
): number => {
  let damage = attacker.attack;
  
  // Apply radiation bonuses
  if (attacker.isTransformed) {
    damage *= 2; // Double damage for transformed creatures
  }

  // Apply radiation effect modifiers
  switch (attacker.radiationEffect) {
    case "boost":
      if (gameState.playerRadiation >= 5) {
        damage += 1;
      }
      break;
    case "burst":
      damage += Math.floor(gameState.playerRadiation / 3);
      break;
    case "amplify":
      if (gameState.playerRadiation >= 3) {
        damage *= 1.5;
      }
      break;
  }

  // Check for shield effect on defender
  if (defender.radiationEffect === "shield") {
    damage = Math.max(0, damage - 1);
  }

  return Math.floor(damage);
};

