
import React from 'react';

interface CardStatsProps {
  attack: number;
  defense: number;
  isTransformed: boolean;
  isAttacking: boolean;
  isBlocking: boolean;
}

export const CardStats = ({ 
  attack, 
  defense, 
  isTransformed, 
  isAttacking, 
  isBlocking 
}: CardStatsProps) => {
  return (
    <div className="flex justify-between mt-2 text-xs text-white/80">
      <span className={`
        ${isTransformed ? 'text-primary font-bold' : ''}
        ${isAttacking ? 'text-red-400' : ''}
      `}>
        ATK: {isTransformed ? attack * 2 : attack}
      </span>
      <span className={`
        ${isTransformed ? 'text-primary font-bold' : ''}
        ${isBlocking ? 'text-blue-400' : ''}
      `}>
        DEF: {isTransformed ? Math.floor(defense * 1.5) : defense}
      </span>
    </div>
  );
};
