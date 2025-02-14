
import React from 'react';
import { getRadiationEffectInfo } from '@/utils/radiationEffects';

interface CardTooltipProps {
  name: string;
  radiationEffect?: string;
  specialAbility?: string;
  canTransform: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
  attack: number;
  defense: number;
  isTransformed: boolean;
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
  isTransformed
}: CardTooltipProps) => {
  const { color, description } = getRadiationEffectInfo(radiationEffect);

  return (
    <div className="flex flex-col gap-2">
      <div className="font-semibold text-sm">{name}</div>
      {radiationEffect && (
        <div className="text-xs opacity-90">
          <span className={`font-medium ${color}`}>
            {radiationEffect.charAt(0).toUpperCase() + radiationEffect.slice(1)}:
          </span> {description}
        </div>
      )}
      {specialAbility && (
        <div className="text-xs opacity-90">
          <span className="font-medium text-primary">Special:</span> {specialAbility}
        </div>
      )}
      {canTransform && (
        <div className="text-xs text-yellow-400">
          Ready to transform! (3 stones collected)
        </div>
      )}
      {isAttacking && (
        <div className="text-xs text-red-400">
          Attacking with {isTransformed ? attack * 2 : attack} power
        </div>
      )}
      {isBlocking && (
        <div className="text-xs text-blue-400">
          Blocking with {isTransformed ? Math.floor(defense * 1.5) : defense} defense
        </div>
      )}
    </div>
  );
};
