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

export interface CombatKeywords {
  firstStrike?: boolean;
  doubleStrike?: boolean;
  lifelink?: boolean;
  deathtouch?: boolean;
  trample?: boolean;
  indestructible?: boolean;
  vigilance?: boolean;
  damagePrevention?: number;
}

export interface TriggeredAbility {
  triggerEvent: "preCombat" | "postCombat" | "onDeath";
  effect: (card: Card, state: GameState) => { gameState: GameState; log: string[] };
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
  keywords?: CombatKeywords;
  triggeredAbilities?: TriggeredAbility[];
  toughness?: number;
  isTargetable?: boolean;
}

export interface GameLogEntry {
  timestamp: string;
  text: string;
  details: string[];
  effects: string[];
  type: 'combat' | 'effect' | 'transform' | 'play';
}

export interface GameState {
  playerBoard: (Card | null)[];
  playerHand: Card[];
  playerDeck: Card[];
  opponentBoard: (Card | null)[];
  currentPhase: string;
  selectedAttacker: string | null;
  selectedBlocker: string | null;
  targetedDefender: string | null;
  playerRadiation: number;
  opponentRadiation: number;
  isGameOver: boolean;
  winner: string | null;
  radiationZones: RadiationZone[];
  activeEvents: FieldEvent[];
  gameLog: GameLogEntry[];
  combatStack?: CombatStackItem[];
  attackPhaseStep: 'selectAttacker' | 'selectTarget' | 'selectBlocker' | 'complete';
}

export interface CombatStackItem {
  id: string;
  description: string;
  resolve: (state: GameState) => { gameState: GameState; log: string[] };
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
  selectTarget: (targetId: string) => void;
  resetGame: () => void;
  useUltimateAbility: (cardId: string) => void;
}
