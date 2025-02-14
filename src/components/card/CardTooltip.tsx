
import React from 'react';
import { getRadiationEffectInfo } from '@/utils/radiationEffects';
import { Swords, Shield, Zap } from 'lucide-react';

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
  const transformedAttack = isTransformed ? attack * 2 : attack;
  const transformedDefense = isTransformed ? Math.floor(defense * 1.5) : defense;

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
      
      <div className="flex flex-col gap-1 mt-1">
        <div className={`text-xs ${isAttacking ? 'text-red-400' : 'text-white/80'} flex items-center gap-1`}>
          <Swords className="w-3 h-3" />
          Attack Power: {transformedAttack}
          {isTransformed && <span className="text-primary">(Transformed)</span>}
        </div>
        
        <div className={`text-xs ${isBlocking ? 'text-blue-400' : 'text-white/80'} flex items-center gap-1`}>
          <Shield className="w-3 h-3" />
          Defense: {transformedDefense}
          {isTransformed && <span className="text-primary">(Transformed)</span>}
        </div>
      </div>

      {canTransform && (
        <div className="text-xs text-yellow-400 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Ready to transform!
        </div>
      )}
      
      {isAttacking && (
        <div className="text-xs text-red-400 font-medium">
          Attacking with {transformedAttack} power
        </div>
      )}
      
      {isBlocking && (
        <div className="text-xs text-blue-400 font-medium">
          Blocking with {transformedDefense} defense
        </div>
      )}
    </div>
  );
};
