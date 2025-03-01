
import { GameState } from './types';
import { toast } from 'sonner';
import { calculateCombatDamage } from '../../utils/gameUtils';

export const resolveCombat = (state: GameState): GameState => {
  console.log('Resolving combat:', {
    attacker: state.selectedAttacker,
    defender: state.targetedDefender,
    blocker: state.selectedBlocker
  });

  if (!state.selectedAttacker || !state.targetedDefender) {
    toast.error("No valid combat to resolve!");
    return state;
  }

  const newState = { ...state };
  const attacker = newState.playerBoard.find(card => card?.id === state.selectedAttacker);
  const defender = newState.opponentBoard.find(card => card?.id === state.targetedDefender);
  const blocker = newState.opponentBoard.find(card => card?.id === state.selectedBlocker);
  
  if (!attacker) {
    toast.error("Attacker not found!");
    return state;
  }

  // If opponent has creatures, they must block
  const hasValidBlockers = newState.opponentBoard.some(card => card !== null);
  if (hasValidBlockers && !blocker) {
    toast.error("Opponent must assign a blocker!");
    return state;
  }

  // Apply damage to blocker or defender
  const target = blocker || defender;
  if (!target) {
    toast.error("Combat target not found!");
    return state;
  }

  // Calculate and apply combat damage
  const damage = calculateCombatDamage(attacker, target, newState);
  target.defense -= damage;
  
  toast.info(`Combat Results:`, {
    description: `${attacker.name} deals ${damage} damage to ${target.name}`
  });

  // Handle destroyed creatures
  if (target.defense <= 0) {
    const targetIndex = newState.opponentBoard.findIndex(card => card?.id === target.id);
    if (targetIndex !== -1) {
      newState.opponentBoard[targetIndex] = null;
      toast.success(`${target.name} was destroyed!`);
    }
  }

  // Reset combat state
  newState.selectedAttacker = null;
  newState.targetedDefender = null;
  newState.selectedBlocker = null;
  newState.attackPhaseStep = 'selectAttacker';
  
  console.log('Combat resolved, new state:', newState);
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
    newState.selectedBlocker = null;
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
    newState.selectedBlocker = null;
    toast.info("Target deselected");
    return newState;
  }

  const defender = state.opponentBoard.find(card => card?.id === targetId);
  if (!defender) {
    toast.error("Invalid target selection");
    return state;
  }

  newState.targetedDefender = targetId;
  newState.attackPhaseStep = 'selectBlocker';
  
  // Check if opponent has any creatures to block with
  const hasBlockers = state.opponentBoard.some(card => card !== null);
  if (!hasBlockers) {
    console.log('No blockers available, resolving combat...');
    return resolveCombat(newState);
  }
  
  toast.info("Select a blocker to defend with!");
  return newState;
};

export const selectBlocker = (state: GameState, cardId: string): GameState => {
  console.log('Selecting blocker:', cardId);
  
  if (state.currentPhase !== 'Attack' || state.attackPhaseStep !== 'selectBlocker') {
    toast.error("Must select an attacker and target first!");
    return state;
  }

  if (!state.selectedAttacker || !state.targetedDefender) {
    toast.error("No valid attack to block!");
    return state;
  }

  const newState = { ...state };
  
  // If clicking already selected blocker, deselect it
  if (cardId === state.selectedBlocker) {
    newState.selectedBlocker = null;
    toast.info("Blocker deselected");
    return newState;
  }

  const blocker = state.opponentBoard.find(card => card?.id === cardId);
  if (!blocker) {
    toast.error("Invalid blocker selection");
    return state;
  }

  newState.selectedBlocker = cardId;
  toast.success("Blocker selected - combat will resolve!");
  return resolveCombat(newState);
};
