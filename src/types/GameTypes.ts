
export interface RadiationZone {
  index: number;
  type: "boost" | "drain" | "shield";
  duration: number;
}

export interface EvolutionPath {
  level: number;
  name: string;
  attackBonus: number;
  defenseBonus: number;
  specialAbility: string;
  requirement: {
    radiation: number;
    stones: number;
    transformedTurns?: number;
  };
}

export interface UltimateAbility {
  name: string;
  cost: number;
  effect: string;
  cooldown: number;
  currentCooldown?: number;
}

export interface Card {
  id: string;
  name: string;
  attack: number;
  defense: number;
  stones: number;
  isTransformed: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
  radiationCost?: number;
  radiationEffect?: "reduce" | "boost" | "drain" | "amplify" | "shield" | "burst";
  specialAbility?: string;
  transformRequirement?: {
    radiation: number;
    stones: number;
    adjacentEffects?: string[];
    minTurn?: number;
    maxRadiation?: number;
  };
  evolutionPaths?: EvolutionPath[];
  currentEvolutionLevel?: number;
  transformedTurns?: number;
  ultimateAbility?: UltimateAbility;
  comboEffects?: {
    type: "chain" | "synergy" | "resonance";
    bonus: number;
    requirement: string[];
  }[];
  energyStored?: number;
}

export interface GameState {
  playerBoard: (Card | null)[];
  playerHand: Card[];
  playerDeck: Card[];
  opponentBoard: (Card | null)[];
  currentPhase: string;
  selectedAttacker: string | null;
  selectedBlocker: string | null;
  playerRadiation: number;
  opponentRadiation: number;
  isGameOver: boolean;
  winner: string | null;
  radiationZones: RadiationZone[];
  activeEvents: FieldEvent[];
}

export type FieldEvent = {
  type: "meteor" | "meltdown" | "storm" | "powerSurge";
  duration: number;
  effect: (state: GameState) => void;
};

export interface GameStateContextType {
  gameState: GameState;
  attachStone: (sourceId: string, targetId: string) => void;
  playCard: (cardId: string, zoneId: string) => void;
  transformCard: (cardId: string) => void;
  advancePhase: () => void;
  selectAttacker: (cardId: string) => void;
  selectBlocker: (cardId: string) => void;
  resetGame: () => void;
  useUltimateAbility: (cardId: string) => void;
}
