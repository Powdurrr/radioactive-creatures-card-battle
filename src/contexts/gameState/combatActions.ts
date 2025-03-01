import { GameState } from './types';
import { toast } from 'sonner';
import { calculateCombatDamage } from '../../utils/gameUtils';

export const resolveCombat = (state: GameState): GameState => {
  console.log('Resolving combat:', {
    attacker: state.selectedAttacker,
    defender: state.targetedDefender
  });

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
  defender.defense -= damage;
  
  toast.info(`Combat Results:`, {
    description: `${attacker.name} deals ${damage} damage to ${defender.name}`
  });

  // Handle destroyed creatures
  if (defender.defense <= 0) {
    const defenderIndex = newState.opponentBoard.findIndex(card => card?.id === defender.id);
    newState.opponentBoard[defenderIndex] = null;
    toast.success(`${defender.name} was destroyed!`);
  }

  // Reset combat state
  newState.selectedAttacker = null;
  newState.targetedDefender = null;
  newState.attackPhaseStep = 'selectAttacker';
  
  console.log('Combat resolved, new state:', {
    attackPhaseStep: newState.attackPhaseStep,
    selectedAttacker: newState.selectedAttacker,
    targetedDefender: newState.targetedDefender
  });

  return newState;
};

export const selectAttacker = (state: GameState, cardId: string): GameState => {
  console.log('Selecting attacker:', cardId);

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

  console.log('After attacker selection:', {
    selectedAttacker: newState.selectedAttacker,
    attackPhaseStep: newState.attackPhaseStep
  });

  return newState;
};

export const selectTarget = (state: GameState, targetId: string): GameState => {
  console.log('Selecting target:', targetId);

  if (state.currentPhase !== 'Attack' || state.attackPhaseStep !== 'selectTarget') {
    toast.error("Must select an attacker first!");
    return state;
  }

  const newState = { ...state };
  
  // If clicking already selected target, deselect it
  if (targetId === state.targetedDefender) {
    newState.targetedDefender = null;
    toast.info("Target deselected");
    return newState;
  }

  const defender = state.opponentBoard.find(card => card?.id === targetId);
  if (!defender) {
    toast.error("Invalid target selection");
    return state;
  }

  newState.targetedDefender = targetId;
  console.log('Target selected, resolving combat...');
  
  // Immediately resolve combat
  return resolveCombat(newState);
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
