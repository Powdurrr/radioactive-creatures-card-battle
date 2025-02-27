
import { GameState, RadiationZone, Card, FieldEvent } from '../types/GameTypes';
import { toast } from "sonner";

// Manage radiation levels and effects
export const handleRadiationEffects = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Apply passive radiation gain each turn
  newState.playerRadiation = Math.min(10, newState.playerRadiation + 1);
  newState.opponentRadiation = Math.min(10, newState.opponentRadiation + 1);
  
  // Apply radiation zone effects
  updateRadiationZones(newState);
  
  // Check for radiation-based events
  checkForRadiationEvents(newState);
  
  // Check for critical radiation levels (win/lose condition)
  checkCriticalRadiationLevels(newState);
  
  return newState;
};

// Update and apply radiation zone effects
const updateRadiationZones = (state: GameState) => {
  // Reduce duration of existing zones
  state.radiationZones = state.radiationZones
    .map(zone => ({ ...zone, duration: zone.duration - 1 }))
    .filter(zone => zone.duration > 0);
  
  // Apply zone effects to cards
  state.radiationZones.forEach(zone => {
    // Apply to player board
    if (zone.index < 5) {
      const card = state.playerBoard[zone.index];
      if (card) applyZoneEffectToCard(zone, card, state);
    } 
    // Apply to opponent board (offset by 5 for indices 5-9)
    else if (zone.index >= 5 && zone.index < 10) {
      const opponentIndex = zone.index - 5;
      const card = state.opponentBoard[opponentIndex];
      if (card) applyZoneEffectToCard(zone, card, state, true);
    }
  });
  
  // Random chance to create new radiation zones
  if (Math.random() < 0.2) {
    createRandomRadiationZone(state);
  }
};

// Apply a zone's effect to a card
const applyZoneEffectToCard = (
  zone: RadiationZone, 
  card: Card, 
  state: GameState,
  isOpponent: boolean = false
) => {
  switch (zone.type) {
    case "boost":
      card.attack += 1;
      toast.info(`${zone.type} zone boosted ${card.name}'s attack`);
      break;
    case "drain":
      if (isOpponent) {
        state.opponentRadiation = Math.max(0, state.opponentRadiation - 1);
        state.playerRadiation = Math.min(10, state.playerRadiation + 1);
      } else {
        state.playerRadiation = Math.max(0, state.playerRadiation - 1);
        state.opponentRadiation = Math.min(10, state.opponentRadiation + 1);
      }
      toast.info(`${zone.type} zone drained radiation`);
      break;
    case "shield":
      // Shield effect is passive and applied during combat
      break;
  }
  
  // Apply radiation effect to creatures with specific abilities
  if (card.radiationEffect === "amplify") {
    // Amplify creatures enhance nearby radiation zones
    strengthenAdjacentZones(state, zone.index);
  }
  
  // Store energy for burst creatures
  if (card.radiationEffect === "burst") {
    card.energyStored = (card.energyStored || 0) + 1;
    toast.info(`${card.name} stored energy from radiation zone`);
  }
};

// Strengthen radiation zones adjacent to an amplifier
const strengthenAdjacentZones = (state: GameState, zoneIndex: number) => {
  state.radiationZones = state.radiationZones.map(zone => {
    // Check if zone is adjacent to the amplifier
    const isAdjacent = Math.abs(zone.index - zoneIndex) === 1;
    
    if (isAdjacent) {
      return {
        ...zone,
        duration: zone.duration + 1, // Extend duration
      };
    }
    
    return zone;
  });
};

// Create a random radiation zone
export const createRandomRadiationZone = (state: GameState) => {
  const zoneTypes: RadiationZone["type"][] = ["boost", "drain", "shield"];
  const randomType = zoneTypes[Math.floor(Math.random() * zoneTypes.length)];
  
  // Choose a board position - can be on either player's side
  // 0-4 for player, 5-9 for opponent
  const availablePositions = [];
  
  // Check player positions
  for (let i = 0; i < 5; i++) {
    if (!state.radiationZones.some(zone => zone.index === i)) {
      availablePositions.push(i);
    }
  }
  
  // Check opponent positions
  for (let i = 5; i < 10; i++) {
    if (!state.radiationZones.some(zone => zone.index === i)) {
      availablePositions.push(i);
    }
  }
  
  if (availablePositions.length > 0) {
    const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    
    state.radiationZones.push({
      index: randomPosition,
      type: randomType,
      duration: 3
    });
    
    toast.info(`A ${randomType} radiation zone has appeared!`, {
      description: `Position: ${randomPosition < 5 ? 'Player' : 'Opponent'} zone ${randomPosition % 5 + 1}`
    });
  }
};

// Check for events triggered by radiation levels
const checkForRadiationEvents = (state: GameState) => {
  // Trigger events based on radiation levels
  if (state.playerRadiation >= 8 || state.opponentRadiation >= 8) {
    const event: FieldEvent = {
      type: "meltdown",
      duration: 3,
      effect: (state) => {
        state.playerBoard.forEach(card => {
          if (card && !card.isTransformed && card.radiationEffect === "boost") {
            card.attack += 1;
          }
        });
        toast.warning("Radiation Meltdown!", {
          description: "Boost creatures gain increased power"
        });
      }
    };
    
    if (!state.activeEvents.some(e => e.type === event.type)) {
      state.activeEvents.push(event);
      event.effect(state);
    }
  }
};

// Check for critical radiation levels
const checkCriticalRadiationLevels = (state: GameState) => {
  if (state.playerRadiation >= 10) {
    state.isGameOver = true;
    state.winner = "opponent";
    toast.error("Game Over!", {
      description: "Player radiation levels critical - opponent wins!"
    });
  } else if (state.opponentRadiation >= 10) {
    state.isGameOver = true;
    state.winner = "player";
    toast.success("Victory!", {
      description: "Opponent radiation levels critical - you win!"
    });
  }
};
