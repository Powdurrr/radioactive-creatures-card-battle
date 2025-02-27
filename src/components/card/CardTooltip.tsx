
import React from "react";
import { getRadiationEffectInfo } from "@/utils/radiationEffects";

export interface CardTooltipProps {
  name: string;
  radiationEffect?: string;
  specialAbility?: string;
  canTransform: boolean;
  isAttacking: boolean;
  isBlocking: boolean;
  attack: number;
  defense: number;
  isTransformed: boolean;
  evolutionLevel: number;
}

export const CardTooltip = ({ 
  name,
  radiationEffect,
  specialAbility,
  canTransform,
  isAttacking,
  isBlocking,
  attack,
  defense,
  isTransformed,
  evolutionLevel
}: CardTooltipProps) => {
  const effectInfo = getRadiationEffectInfo(radiationEffect);
  
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <h3 className={`font-medium ${isTransformed ? 'text-primary' : 'text-white'}`}>
          {name}
        </h3>
        {evolutionLevel > 0 && (
          <span className={`
            text-xs px-2 py-0.5 rounded-full
            ${evolutionLevel === 1 ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}
          `}>
            Level {evolutionLevel}
          </span>
        )}
      </div>
      
      {radiationEffect && (
        <div className="text-sm">
          <span className={`font-medium ${effectInfo.color}`}>
            {radiationEffect.charAt(0).toUpperCase() + radiationEffect.slice(1)}:
          </span>{' '}
          <span className="text-gray-300">{effectInfo.description}</span>
        </div>
      )}
      
      {specialAbility && (
        <div className="text-sm">
          <span className="font-medium text-blue-400">Special:</span>{' '}
          <span className="text-gray-300">{specialAbility}</span>
        </div>
      )}
      
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Attack</span>
          <span className="text-white">{attack}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Defense</span>
          <span className="text-white">{defense}</span>
        </div>
      </div>
      
      {canTransform && (
        <div className="text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded">
          Can transform with 5+ radiation!
        </div>
      )}
      
      {(isAttacking || isBlocking) && (
        <div className={`
          text-xs px-2 py-1 rounded
          ${isAttacking ? 'text-red-400 bg-red-500/10' : 'text-blue-400 bg-blue-500/10'}
        `}>
          {isAttacking ? 'Attacking' : 'Blocking'}
        </div>
      )}
    </div>
  );
};
