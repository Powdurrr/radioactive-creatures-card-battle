import { GameState, Card, CombatStackItem, GameLogEntry } from '../../types/GameTypes';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface CombatResult {
  attackerDamage: number;
  defenderDamage: number;
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
  radiationGained: number;
  specialEffects: string[];
}

interface TriggeredAbilityEffect {
  (state: GameState, card: Card): { gameState: GameState; log: string[] };
}

interface TriggeredAbility {
  triggerEvent: "preCombat" | "postCombat" | "onDeath";
  effect: TriggeredAbilityEffect;
}

// Helper to add entries to combat log
interface LogEntry {
  message: string;
  details: string[];
  effects: string[];
  type: "combat" | "effect" | "transform" | "play";
}

const addCombatLogEntry = (state: GameState, entry: LogEntry): GameState => {
  return {
    ...state,
    gameLog: [
      ...state.gameLog,
      {
        timestamp: new Date().toISOString(),
        text: entry.message,
        details: entry.details.filter(d => d !== ''),
        effects: entry.effects,
        type: entry.type
      }
    ]
  };
};

export const calculateCombatDamage = (
  attacker: Card,
  defender: Card,
  gameState: GameState,
  attackerIndex?: number,
  defenderIndex?: number
): CombatResult => {
  let attackerDamage = attacker.attack;
  let defenderDamage = 0;
  let radiationGained = 0;
  const specialEffects: string[] = [];
  
  if (attacker.isTransformed) {
    attackerDamage *= 2;
    specialEffects.push("Transformed: Damage doubled");
  }

  if (gameState.radiationZones.length > 0 && attackerIndex !== undefined) {
    const zone = gameState.radiationZones[attackerIndex];
    if (zone) {
      attackerDamage = applyZoneEffect(zone, attacker, defender, attackerDamage, specialEffects);
    }
  }

  if (attacker.radiationEffect === "boost") {
    const adjacentBonus = calculateAdjacentEffectsBonus(gameState.playerBoard, attackerIndex || 0, "boost");
    attackerDamage += adjacentBonus;
    specialEffects.push(`Boost Adjacent Bonus: +${adjacentBonus}`);
  }

  return {
    attackerDamage,
    defenderDamage,
    attackerDestroyed: defender.defense <= attackerDamage,
    defenderDestroyed: attacker.defense <= defenderDamage,
    radiationGained,
    specialEffects
  };
};

// Apply zone effects to combat
const applyZoneEffect = (
  zone: { type: "boost" | "drain" | "shield" },
  attacker: Card,
  defender: Card,
  attackerDamage: number,
  specialEffects: string[]
): number => {
  switch (zone.type) {
    case "boost":
      attackerDamage += 2;
      specialEffects.push("Boost Zone: +2 damage");
      break;
    case "drain":
      attackerDamage -= 1;
      specialEffects.push("Drain Zone: -1 damage");
      break;
    case "shield":
      attackerDamage = Math.max(0, attackerDamage - 1);
      specialEffects.push("Shield Zone: Damage reduced by 1");
      break;
  }
  return attackerDamage;
};

// Calculate bonus from adjacent cards with same effect
const calculateAdjacentEffectsBonus = (
  board: (Card | null)[],
  cardIndex: number,
  effect?: string
): number => {
  let bonus = 0;
  const adjacentIndices = [cardIndex - 1, cardIndex + 1].filter(i => i >= 0 && i < board.length);

  adjacentIndices.forEach(index => {
    const card = board[index];
    if (card && card.radiationEffect === effect) {
      bonus += 1;
    }
  });
  return 0;
};

export const resolveCombat = (state: GameState): GameState => {
  const newState = { ...state };
  
  if (!newState.selectedAttacker || !newState.targetedDefender) {
    toast.error("No valid combat to resolve!");
    return newState;
  }

  const attackerIndex = newState.playerBoard.findIndex(card => card?.id === newState.selectedAttacker);
  const defenderIndex = newState.opponentBoard.findIndex(card => card?.id === newState.targetedDefender);
  
  if (attackerIndex === -1 || defenderIndex === -1) {
    toast.error("Combat creatures not found!");
    return newState;
  }

  const attacker = newState.playerBoard[attackerIndex]!;
  const defender = newState.opponentBoard[defenderIndex]!;

  const combatResult = calculateCombatDamage(
    attacker,
    defender,
    newState,
    attackerIndex,
    defenderIndex
  );

  // Apply combat results
  const updatedState = addCombatLogEntry(newState, {
    message: `${attacker.name} attacks ${defender.name}`,
    details: [
      `Deals ${combatResult.attackerDamage} damage`,
      ...combatResult.specialEffects
    ],
    effects: combatResult.specialEffects,
    type: "combat"
  });

  // Update creature states
  if (combatResult.defenderDestroyed) {
    updatedState.opponentBoard[defenderIndex] = null;
  } else {
    defender.defense -= combatResult.attackerDamage;
  }

  if (combatResult.attackerDestroyed) {
    updatedState.playerBoard[attackerIndex] = null;
  } else {
    attacker.defense -= combatResult.defenderDamage;
  }

  // Reset combat state
  updatedState.selectedAttacker = null;
  updatedState.selectedBlocker = null;
  updatedState.targetedDefender = null;

  return updatedState;
};
