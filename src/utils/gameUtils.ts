
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

interface ComboEffect {
  sourceCardId: string;
  type: "chain" | "synergy" | "resonance";
  attackBonus: number;
  defenseBonus: number;
}

export const checkComboEffects = (board: (Card | null)[]): ComboEffect[] => {
  const effects: ComboEffect[] = [];
  
  board.forEach((card, index) => {
    if (!card?.comboEffects) return;
    
    card.comboEffects.forEach(combo => {
      // Check adjacent cards for chain effects
      if (combo.type === "chain") {
        const adjacentCards = [];
        if (index > 0) adjacentCards.push(board[index - 1]);
        if (index < board.length - 1) adjacentCards.push(board[index + 1]);
        
        if (adjacentCards.some(adjacent => 
          adjacent && combo.requirement.includes(adjacent.radiationEffect || "")
        )) {
          effects.push({
            sourceCardId: card.id,
            type: "chain",
            attackBonus: combo.bonus,
            defenseBonus: Math.floor(combo.bonus / 2)
          });
        }
      }
      
      // Check for synergy effects (specific card combinations)
      else if (combo.type === "synergy") {
        const hasRequiredCards = combo.requirement.every(effect =>
          board.some(c => c?.radiationEffect === effect)
        );
        
        if (hasRequiredCards) {
          effects.push({
            sourceCardId: card.id,
            type: "synergy",
            attackBonus: combo.bonus,
            defenseBonus: combo.bonus
          });
        }
      }
      
      // Check for resonance effects (three or more cards of same type)
      else if (combo.type === "resonance") {
        const sameTypeCount = board.filter(c => 
          c?.radiationEffect === card.radiationEffect
        ).length;
        
        if (sameTypeCount >= 3) {
          effects.push({
            sourceCardId: card.id,
            type: "resonance",
            attackBonus: combo.bonus * (sameTypeCount - 2),
            defenseBonus: Math.floor((combo.bonus * (sameTypeCount - 2)) / 2)
          });
        }
      }
    });
  });
  
  return effects;
};
