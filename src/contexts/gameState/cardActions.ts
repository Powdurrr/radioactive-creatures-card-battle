
import { GameState } from './types';
import { toast } from 'sonner';

export const playCard = (state: GameState, cardId: string, zoneId: string): GameState => {
  const newState = { ...state };
  const zoneIndex = parseInt(zoneId.split('-')[1]);
  const card = newState.playerHand.find(c => c.id === cardId);
  
  if (!card || !Number.isInteger(zoneIndex) || zoneIndex < 0 || zoneIndex > 4) {
    return state;
  }
  
  newState.playerBoard[zoneIndex] = card;
  newState.playerHand = newState.playerHand.filter(c => c.id !== cardId);
  
  if (card.radiationEffect === "reduce") {
    newState.playerRadiation = Math.max(0, newState.playerRadiation - 1);
    toast.success(`${card.name} reduced radiation by 1`);
  }
  
  return newState;
};

export const attachStone = (state: GameState, sourceId: string, targetId: string): GameState => {
  const newState = { ...state };
  const targetCard = newState.playerBoard.find(card => card?.id === targetId);
  
  if (targetCard) {
    targetCard.stones += 1;
    toast.success(`Added stone to ${targetCard.name}!`, {
      description: `Now has ${targetCard.stones} stones`
    });
  }
  
  return newState;
};

export const transformCard = (state: GameState, cardId: string): GameState => {
  const newState = { ...state };
  const cardIndex = newState.playerBoard.findIndex(card => card?.id === cardId);
  
  if (cardIndex === -1) return state;
  
  const card = newState.playerBoard[cardIndex];
  if (!card || card.isTransformed) return state;
  
  if (newState.playerRadiation < 5) {
    toast.error("Not enough radiation to transform!");
    return state;
  }
  
  newState.playerBoard[cardIndex] = {
    ...card,
    isTransformed: true,
    name: card.name.replace('Baby ', ''),
    attack: card.attack * 2,
    defense: Math.floor(card.defense * 1.5),
    transformedTurns: 0,
    currentEvolutionLevel: 0
  };
  
  toast.success(`${card.name} has transformed!`);
  return newState;
};
