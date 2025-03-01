
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
  if (state.currentPhase !== 'Attack') {
    toast.error("Can only select attackers during Attack phase!");
    return state;
  }

  const newState = { ...state };
  
  // If deselecting current attacker
  if (cardId === state.selectedAttacker) {
    newState.selectedAttacker = null;
    newState.targetedDefender = null;
    newState.attackPhaseStep = 'selectAttacker';
    toast.info("Attacker deselected");
  } else {
    // Selecting new attacker
    const attacker = state.playerBoard.find(card => card?.id === cardId);
    if (!attacker) {
      toast.error("Invalid attacker selection");
      return state;
    }
    newState.selectedAttacker = cardId;
    newState.attackPhaseStep = 'selectTarget';
    toast.success("Selected attacker - choose a target!");
  }

  return newState;
};

export const selectTarget = (state: GameState, targetId: string): GameState => {
  if (state.currentPhase !== 'Attack' || state.attackPhaseStep !== 'selectTarget') {
    toast.error("Must select an attacker first!");
    return state;
  }

  const newState = { ...state };
  
  // If clicking already selected target, deselect it
  if (targetId === state.targetedDefender) {
    newState.targetedDefender = null;
    toast.info("Target deselected");
  } else {
    const defender = state.opponentBoard.find(card => card?.id === targetId);
    if (!defender) {
      toast.error("Invalid target selection");
      return state;
    }
    newState.targetedDefender = targetId;
    newState.attackPhaseStep = 'complete';
    
    // Immediately resolve combat since we're not implementing blocking for now
    return resolveCombat(newState);
  }

  return newState;
};

export const selectBlocker = (state: GameState, cardId: string): GameState => {
  if (!state.selectedAttacker || !state.targetedDefender) {
    toast.error("No valid attack to block!");
    return state;
  }

  const newState = { ...state };
  newState.selectedBlocker = cardId;
  toast.success("Blocker selected - combat will resolve!");
  return resolveCombat(newState);
};
