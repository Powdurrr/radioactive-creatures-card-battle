
import { v4 as uuidv4 } from 'uuid';
import { GameState, Card, CombatStackItem } from '../../types/GameTypes';
import { toast } from 'sonner';
import { calculateCombatDamage } from './combatActions';

interface CombatResult {
  outcome: {
    attackerSurvives: boolean;
    defenderSurvives: boolean;
    damageToAttacker: number;
    damageToDefender: number;
    combatLog: string[];
  };
  newState: GameState;
}

const resolveCombatWithStack = (attacker: Card, defender: Card, state: GameState): CombatResult => {
  let combatLog: string[] = [];
  let combatStack: CombatStackItem[] = [];
  
  // Calculate initial combat damage
  const damageResult = calculateCombatDamage(attacker, defender, state);
  
  // Process pre-combat triggers
  if (attacker.triggeredAbilities) {
    attacker.triggeredAbilities.forEach(ability => {
      if (ability.triggerEvent === "preCombat") {
        combatStack.push({
          id: uuidv4(),
          description: `${attacker.name}'s pre-combat trigger`,
          resolve: ability.effect
        });
      }
    });
  }

  // Apply damage and check for destruction
  const attackerDestroyed = attacker.defense <= damageResult.defenderDamage;
  const defenderDestroyed = defender.defense <= damageResult.attackerDamage;

  // Add destruction triggers to stack
  if (attackerDestroyed) {
    attacker.triggeredAbilities?.forEach(ability => {
      if (ability.triggerEvent === "onDeath") {
        combatStack.push({
          id: uuidv4(),
          description: `${attacker.name}'s death trigger`,
          resolve: ability.effect
        });
      }
    });
  }

  if (defenderDestroyed) {
    defender.triggeredAbilities?.forEach(ability => {
      if (ability.triggerEvent === "onDeath") {
        combatStack.push({
          id: uuidv4(),
          description: `${defender.name}'s death trigger`,
          resolve: ability.effect
        });
      }
    });
  }

  // Resolve the combat stack
  let newState = { ...state };
  while (combatStack.length > 0) {
    const item = combatStack.pop()!;
    const result = item.resolve(newState);
    newState = result.gameState;
    combatLog.push(...result.log);
  }

  // Update the creatures' status
  if (attackerDestroyed) {
    const attackerIndex = newState.playerBoard.findIndex(card => card?.id === attacker.id);
    if (attackerIndex !== -1) {
      newState.playerBoard[attackerIndex] = null;
    }
    combatLog.push(`${attacker.name} was destroyed!`);
  }

  if (defenderDestroyed) {
    const defenderIndex = newState.opponentBoard.findIndex(card => card?.id === defender.id);
    if (defenderIndex !== -1) {
      newState.opponentBoard[defenderIndex] = null;
    }
    combatLog.push(`${defender.name} was destroyed!`);
  }

  return {
    outcome: {
      attackerSurvives: !attackerDestroyed,
      defenderSurvives: !defenderDestroyed,
      damageToAttacker: damageResult.defenderDamage,
      damageToDefender: damageResult.attackerDamage,
      combatLog
    },
    newState
  };
};

export const resolveCombat = (state: GameState): GameState => {
  if (!state.selectedAttacker || !state.targetedDefender) {
    toast.error("No valid combat to resolve!");
    return state;
  }

  const attacker = state.playerBoard.find(card => card?.id === state.selectedAttacker);
  const defender = state.opponentBoard.find(card => card?.id === state.targetedDefender);

  if (!attacker || !defender) {
    toast.error("Combat creatures not found!");
    return state;
  }

  // Initialize toughness if not set
  if (attacker.toughness === undefined) attacker.toughness = attacker.defense;
  if (defender.toughness === undefined) defender.toughness = defender.defense;

  // Use the enhanced combat system
  const { outcome, newState } = resolveCombatWithStack(attacker, defender, state);

  // Update the game state with combat results
  const finalState = {
    ...newState,
    selectedAttacker: null,
    selectedBlocker: null,
    targetedDefender: null,
    gameLog: [
      ...newState.gameLog,
      {
        timestamp: new Date().toISOString(),
        text: `Combat between ${attacker.name} and ${defender.name}`,
        details: outcome.combatLog,
        effects: [],
        type: 'combat'
      }
    ]
  };

  // Display combat results
  outcome.combatLog.forEach(log => 
    toast.info(log)
  );

  return finalState;
};
