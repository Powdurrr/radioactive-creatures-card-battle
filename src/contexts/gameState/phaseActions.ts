
import { GameState } from './types';
import { toast } from 'sonner';
import { handleRadiationEffects } from '../../utils/radiationMechanics';
import { phases } from './types';
import { resolveCombat } from './combatActions';

export const advancePhase = (state: GameState): GameState => {
  const currentIndex = phases.indexOf(state.currentPhase);
  const nextPhase = phases[(currentIndex + 1) % phases.length];
  const newState = { ...state };

  switch (nextPhase) {
    case 'Draw':
      // Draw phase logic
      if (newState.playerDeck.length > 0) {
        const drawnCard = newState.playerDeck[0];
        newState.playerHand.push(drawnCard);
        newState.playerDeck = newState.playerDeck.slice(1);
        toast.success(`Drew ${drawnCard.name}!`);
      }
      break;

    case 'Attack':
      // Check if player has any creatures that can attack
      const hasAttackers = newState.playerBoard.some(card => card !== null);
      if (hasAttackers) {
        toast.info("Select a creature to attack with!");
      } else {
        toast.warning("No creatures available to attack!");
      }
      break;

    case 'Block':
      if (!newState.selectedAttacker) {
        toast.warning("No attacker was selected, skipping combat.");
        return {
          ...newState,
          currentPhase: 'End'
        };
      }
      toast.info("Select a blocker!");
      break;

    case 'Damage':
      if (newState.selectedAttacker && newState.selectedBlocker) {
        return resolveCombat(newState);
      }
      break;

    case 'End':
      // Apply end-of-turn effects
      return handleRadiationEffects(newState);
  }

  return {
    ...newState,
    currentPhase: nextPhase
  };
};
