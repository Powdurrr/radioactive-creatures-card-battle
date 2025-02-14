
import { Card, EvolutionPath, UltimateAbility } from '../types/GameTypes';

export const getCardNameByEffect = (effect: Card['radiationEffect']): string => {
  switch (effect) {
    case "boost": return "Baby Godzilla";
    case "reduce": return "Radiation Absorber";
    case "drain": return "Radiation Drainer";
    case "amplify": return "Radiation Amplifier";
    case "shield": return "Radiation Shield";
    case "burst": return "Radiation Burster";
    default: return "Unknown Creature";
  }
};

export const getCardAttackByEffect = (effect: Card['radiationEffect']): number => {
  switch (effect) {
    case "boost": return 2;
    case "reduce": return 1;
    case "drain": return 3;
    case "amplify": return 3;
    case "shield": return 1;
    case "burst": return 4;
    default: return 2;
  }
};

export const getCardDefenseByEffect = (effect: Card['radiationEffect']): number => {
  switch (effect) {
    case "boost": return 3;
    case "reduce": return 4;
    case "drain": return 2;
    case "amplify": return 2;
    case "shield": return 5;
    case "burst": return 1;
    default: return 3;
  }
};

export const getCardAbilityByEffect = (effect: Card['radiationEffect']): string | undefined => {
  switch (effect) {
    case "reduce": return "Reduce radiation by 1 when played";
    case "amplify": return "Double all radiation effects";
    case "shield": return "Reduces radiation damage by 1";
    case "burst": return "Release stored radiation at level 5";
    default: return undefined;
  }
};

export const getEvolutionPathsByEffect = (effect: Card['radiationEffect']): EvolutionPath[] => {
  switch (effect) {
    case "boost":
      return [
        {
          level: 1,
          name: "Radiation Absorber",
          attackBonus: 2,
          defenseBonus: 1,
          specialAbility: "Gains +1 attack for each radiation point",
          requirement: { radiation: 6, stones: 4 }
        },
        {
          level: 2,
          name: "Radiation Master",
          attackBonus: 3,
          defenseBonus: 2,
          specialAbility: "Can store double radiation energy",
          requirement: { radiation: 8, stones: 5, transformedTurns: 2 }
        }
      ];
    case "burst":
      return [
        {
          level: 1,
          name: "Chain Reactor",
          attackBonus: 3,
          defenseBonus: 0,
          specialAbility: "Burst affects adjacent zones",
          requirement: { radiation: 7, stones: 4 }
        },
        {
          level: 2,
          name: "Meltdown Entity",
          attackBonus: 4,
          defenseBonus: 1,
          specialAbility: "Survives after burst with 1 HP",
          requirement: { radiation: 9, stones: 6, transformedTurns: 3 }
        }
      ];
    default:
      return [];
  }
};

export const getUltimateAbilityByEffect = (effect: Card['radiationEffect']): UltimateAbility | undefined => {
  switch (effect) {
    case "boost":
      return {
        name: "Radiation Overdrive",
        cost: 8,
        effect: "Triple attack for one turn",
        cooldown: 3
      };
    case "drain":
      return {
        name: "Total Absorption",
        cost: 6,
        effect: "Steal all opponent's radiation",
        cooldown: 4
      };
    case "burst":
      return {
        name: "Chain Reaction",
        cost: 10,
        effect: "Destroy all non-transformed creatures",
        cooldown: 5
      };
    default:
      return undefined;
  }
};
