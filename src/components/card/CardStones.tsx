
import React from 'react';

interface CardStonesProps {
  stones: number;
  isTransformed: boolean;
}

export const CardStones = ({ stones, isTransformed }: CardStonesProps) => {
  if (stones === 0) return null;

  return (
    <div className="absolute top-1 right-1 flex gap-1">
      {[...Array(stones)].map((_, i) => (
        <div 
          key={i}
          className={`
            w-2 h-2 rounded-full 
            ${isTransformed ? 'bg-primary animate-pulse' : 'bg-primary/80'}
          `}
        />
      ))}
    </div>
  );
};
