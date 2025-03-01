import { GameState } from './types';
import { toast } from 'sonner';
import { calculateCombatDamage } from '../../utils/gameUtils';

export const resolveCombat = (state: GameState): GameState => {
  if (!state.selectedAttacker || !state.targetedDefender) {
    toast.error("No valid combat to resolve!");
    return state;
  }

  const newState = { ...state };
  const attacker = newState.playerBoard.find(card => card?.id === state.selectedAttacker);
  const defender = newState.opponentBoard.find(card => card?.id === state.targetedDefender);
  
  if (!attacker || !defender) {
    toast.error("Combat creatures not found!");
    return state;
  }

  // Calculate and apply combat damage
  const damage = calculateCombatDamage(attacker, defender, newState);
  
  if (newState.selectedBlocker) {
    const blocker = newState.opponentBoard.find(card => card?.id === newState.selectedBlocker);
    if (blocker) {
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
  newState.attackPhaseStep = 'selectAttacker';

  return newState;
};

export const selectAttacker = (state: GameState, cardId: string): GameState => {
  const newState = { ...state };
  
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
};

export const selectTarget = (state: GameState, targetId: string): GameState => {
  const newState = { ...state };
  newState.targetedDefender = targetId;
  toast.success("Target selected - opponent may now block!");
  return newState;
};

export const selectBlocker = (state: GameState, cardId: string): GameState => {
  const newState = { ...state };
  newState.selectedBlocker = cardId;
  toast.success("Blocker selected - combat will resolve!");
  return newState;
};
