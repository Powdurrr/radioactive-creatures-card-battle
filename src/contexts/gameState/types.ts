
import { GameState } from '../../types/GameTypes';
import { getInitialDeck } from '../../utils/gameUtils';

export const initialGameState: GameState = {
  playerBoard: Array(5).fill(null),
  playerHand: [],
  playerDeck: getInitialDeck(),
  opponentBoard: [
    { 
      id: 'op-1', 
      name: 'Radiation Drainer', 
      attack: 3, 
      defense: 2, 
      stones: 0, 
      isTransformed: false,
      radiationEffect: "drain"
    },
    null,
    { 
      id: 'op-2', 
      name: 'Baby Godzilla', 
      attack: 2, 
      defense: 3, 
      stones: 0, 
      isTransformed: false,
      radiationEffect: "boost"
    },
    null,
    null
  ],
  currentPhase: 'Draw',
  selectedAttacker: null,
  selectedBlocker: null,
  targetedDefender: null,
  playerRadiation: 0,
  opponentRadiation: 0,
  isGameOver: false,
  winner: null,
  radiationZones: [],
  activeEvents: [],
  combatStack: [],
  gameLog: []
};

export const phases = ['Draw', 'Recovery', 'Attack', 'Block', 'Damage', 'End'];

export interface GameStateContextType {
  gameState: GameState;
  attachStone: (sourceId: string, targetId: string) => void;
  playCard: (cardId: string, zoneId: string) => void;
  transformCard: (cardId: string) => void;
  advancePhase: () => void;
  selectAttacker: (cardId: string) => void;
  selectBlocker: (cardId: string) => void;
  selectTarget: (targetId: string) => void;
  resetGame: () => void;
  useUltimateAbility: (cardId: string) => void;
}

export type { GameState };
