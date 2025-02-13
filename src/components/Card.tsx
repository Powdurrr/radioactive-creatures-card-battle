
import React from "react";

interface CardProps {
  name?: string;
  attack?: number;
  defense?: number;
  image?: string;
  stones?: number;
  isTransformed?: boolean;
}

export const Card = ({ 
  name = "Baby Godzilla", 
  attack = 2, 
  defense = 3,
  stones = 0,
  isTransformed = false 
}: CardProps) => {
  const canTransform = stones >= 3 && !isTransformed;
  
  return (
    <div className="group relative w-[100px] h-[140px] flex-shrink-0">
      <div className={`
        absolute inset-0 rounded-lg
        bg-gray-800/90 backdrop-blur-sm
        border border-gray-700/50
        transition-all duration-300
        group-hover:scale-105 group-hover:shadow-xl
        ${canTransform ? 'ring-2 ring-primary animate-pulse' : ''}
        ${isTransformed ? 'border-primary/50' : ''}
      `}>
        <div className="p-2 flex flex-col h-full">
          <div className="text-xs font-medium text-white/90 mb-2">{name}</div>
          <div className="flex-grow bg-gray-700/50 rounded-md relative">
            {/* Stone indicators */}
            {stones > 0 && (
              <div className="absolute top-1 right-1 flex gap-1">
                {[...Array(stones)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/80"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/80">
            <span className={`${isTransformed ? 'text-primary' : ''}`}>
              ATK: {isTransformed ? attack * 2 : attack}
            </span>
            <span className={`${isTransformed ? 'text-primary' : ''}`}>
              DEF: {isTransformed ? defense * 1.5 : defense}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
