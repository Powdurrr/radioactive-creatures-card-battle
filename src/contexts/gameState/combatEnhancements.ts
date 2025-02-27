
import { GameState, Card, RadiationZone, GameLogEntry } from '../../types/GameTypes';
import { toast } from "sonner";

interface CombatResult {
  attackerDamage: number;
  defenderDamage: number;
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
  radiationGained: number;
  specialEffects: string[];
}

export const calculateCombatDamage = (
  attacker: Card,
  defender: Card,
  gameState: GameState,
  attackerZoneIndex?: number,
  defenderZoneIndex?: number
): CombatResult => {
  let attackerDamage = attacker.attack;
  let defenderDamage = 0;
  let radiationGained = 0;
  const specialEffects: string[] = [];
  
  // Base attack power calculations
  if (attacker.isTransformed) {
    attackerDamage *= 2; // Double damage for transformed creatures
    specialEffects.push("Transformation bonus (2x damage)");
  }

  // Apply radiation effect modifiers for attacker
  switch (attacker.radiationEffect) {
    case "boost":
      const radiationBonus = Math.floor(gameState.playerRadiation / 3);
      if (radiationBonus > 0) {
        attackerDamage += radiationBonus;
        specialEffects.push(`Radiation boost (+${radiationBonus} damage)`);
      }
      break;
    case "burst":
      if (attacker.energyStored && attacker.energyStored > 0) {
        const burstDamage = attacker.energyStored;
        attackerDamage += burstDamage;
        specialEffects.push(`Radiation burst (+${burstDamage} damage)`);
        // Reset stored energy after burst
        attacker.energyStored = 0;
      }
      break;
    case "amplify":
      if (gameState.playerRadiation >= 3) {
        attackerDamage = Math.floor(attackerDamage * 1.5);
        specialEffects.push("Amplify bonus (1.5x damage)");
      }
      break;
    case "drain":
      // Drain radiation from opponent
      radiationGained = 1;
      specialEffects.push("Radiation drained from opponent");
      break;
  }

  // Check for zone effects
  if (attackerZoneIndex !== undefined) {
    const attackerZone = gameState.radiationZones.find(zone => zone.index === attackerZoneIndex);
    if (attackerZone) {
      applyZoneEffect(attackerZone, attacker, defender, attackerDamage, specialEffects);
    }
  }
  
  if (defenderZoneIndex !== undefined) {
    const defenderZone = gameState.radiationZones.find(zone => zone.index === defenderZoneIndex);
    if (defenderZone) {
      if (defenderZone.type === "shield") {
        attackerDamage = Math.max(0, attackerDamage - 2);
        specialEffects.push("Shield zone reduced damage by 2");
      }
    }
  }

  // Check for combo effects
  if (attackerZoneIndex !== undefined) {
    const adjacentEffectsBonus = calculateAdjacentEffectsBonus(
      gameState.playerBoard, 
      attackerZoneIndex,
      attacker.radiationEffect
    );
    
    if (adjacentEffectsBonus > 0) {
      attackerDamage += adjacentEffectsBonus;
      specialEffects.push(`Adjacent effect combo (+${adjacentEffectsBonus} damage)`);
    }
  }

  // Calculate counterattack damage
  if (defender.radiationEffect === "shield") {
    defenderDamage = Math.floor(defender.attack / 2);
    specialEffects.push("Shield counterattack");
  }

  // Apply evolution bonuses
  if (attacker.currentEvolutionLevel && attacker.currentEvolutionLevel > 0) {
    const evolutionBonus = attacker.currentEvolutionLevel * 2;
    attackerDamage += evolutionBonus;
    specialEffects.push(`Evolution bonus (+${evolutionBonus} damage)`);
  }

  // Critical hit system (20% chance)
  if (Math.random() < 0.2) {
    attackerDamage = Math.floor(attackerDamage * 1.5);
    specialEffects.push("CRITICAL HIT! (1.5x damage)");
  }

  // Floor damage to minimum of 1 unless fully shielded
  attackerDamage = Math.max(1, attackerDamage);
  defenderDamage = Math.max(0, defenderDamage);

  // Determine if creatures are destroyed
  const attackerDestroyed = attacker.defense <= defenderDamage;
  const defenderDestroyed = defender.defense <= attackerDamage;

  return {
    attackerDamage,
    defenderDamage,
    attackerDestroyed,
    defenderDestroyed,
    radiationGained,
    specialEffects
  };
};

// Helper functions
const applyZoneEffect = (
  zone: RadiationZone,
  attacker: Card,
  defender: Card,
  attackerDamage: number,
  specialEffects: string[]
) => {
  switch (zone.type) {
    case "boost":
      attackerDamage += 2;
      specialEffects.push("Boost zone (+2 damage)");
      break;
    case "drain":
      specialEffects.push("Drain zone active");
      break;
    case "shield":
      break;
  }
};

const calculateAdjacentEffectsBonus = (
  board: (Card | null)[],
  cardIndex: number,
  effect?: string
): number => {
  if (!effect) return 0;
  
  let bonus = 0;
  if (cardIndex > 0 && board[cardIndex - 1]?.radiationEffect === effect) {
    bonus += 1;
  }
  if (cardIndex < board.length - 1 && board[cardIndex + 1]?.radiationEffect === effect) {
    bonus += 1;
  }
  
  return bonus;
};

// Combat resolution
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
    defenderIndex + 5 // Offset for opponent board
  );
  
  // Handle blocking
  if (newState.selectedBlocker) {
    const blockerIndex = newState.opponentBoard.findIndex(card => card?.id === newState.selectedBlocker);
    if (blockerIndex !== -1) {
      const blocker = newState.opponentBoard[blockerIndex]!;
      const blockResult = calculateCombatDamage(blocker, attacker, newState, blockerIndex + 5, attackerIndex);
      
      attacker.defense -= blockResult.attackerDamage;
      blocker.defense -= combatResult.attackerDamage;
      
      addCombatLogEntry(newState, {
        message: `${attacker.name} attacks ${defender.name}, but ${blocker.name} blocks!`,
        details: [
          `${attacker.name} deals ${combatResult.attackerDamage} damage to ${blocker.name}`,
          `${blocker.name} counterattacks for ${blockResult.attackerDamage} damage`
        ],
        effects: [...combatResult.specialEffects, ...blockResult.specialEffects]
      });
      
      if (blocker.defense <= 0) {
        newState.opponentBoard[blockerIndex] = null;
        addCombatLogEntry(newState, {
          message: `${blocker.name} was destroyed!`,
          details: [],
          effects: []
        });
      }
    }
  } else {
    // Direct attack
    defender.defense -= combatResult.attackerDamage;
    attacker.defense -= combatResult.defenderDamage;
    
    addCombatLogEntry(newState, {
      message: `${attacker.name} attacks ${defender.name} directly!`,
      details: [
        `${attacker.name} deals ${combatResult.attackerDamage} damage to ${defender.name}`,
        combatResult.defenderDamage > 0 ? `${defender.name} counterattacks for ${combatResult.defenderDamage} damage` : ''
      ],
      effects: combatResult.specialEffects
    });
  }
  
  // Check for destroyed creatures
  if (attacker.defense <= 0) {
    newState.playerBoard[attackerIndex] = null;
    addCombatLogEntry(newState, {
      message: `${attacker.name} was destroyed!`,
      details: [],
      effects: []
    });
  }
  
  if (defender.defense <= 0) {
    newState.opponentBoard[defenderIndex] = null;
    addCombatLogEntry(newState, {
      message: `${defender.name} was destroyed!`,
      details: [],
      effects: []
    });
    
    newState.playerRadiation = Math.min(10, newState.playerRadiation + 1);
    addCombatLogEntry(newState, {
      message: `Gained 1 radiation from defeating ${defender.name}`,
      details: [],
      effects: []
    });
  }
  
  // Apply radiation effects
  newState.playerRadiation = Math.min(10, newState.playerRadiation + combatResult.radiationGained);
  
  // Reset combat state
  newState.selectedAttacker = null;
  newState.selectedBlocker = null;
  newState.targetedDefender = null;
  
  return newState;
};

// Combat log helper
interface LogEntry {
  message: string;
  details: string[];
  effects: string[];
}

const addCombatLogEntry = (state: GameState, entry: LogEntry) => {
  if (!state.gameLog) {
    state.gameLog = [];
  }
  
  state.gameLog.push({
    timestamp: new Date().toISOString(),
    text: entry.message,
    details: entry.details.filter(d => d !== ''),
    effects: entry.effects,
    type: 'combat'
  });
};
