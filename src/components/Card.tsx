
import React from "react";
import { Swords, Shield } from "lucide-react";

interface CardProps {
  name?: string;
  attack?: number;
  defense?: number;
  image?: string;
  stones?: number;
  isTransformed?: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
  onClick?: () => void;
}

export const Card = ({ 
  name = "Baby Godzilla", 
  attack = 2, 
  defense = 3,
  stones = 0,
  isTransformed = false,
  isAttacking = false,
  isBlocking = false,
  onClick 
}: CardProps) => {
  const canTransform = stones >= 3 && !isTransformed;
  
  return (
    <div 
      className={`
        group relative w-[100px] h-[140px] flex-shrink-0
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <div className={`
        absolute inset-0 rounded-lg
        bg-gray-800/90 backdrop-blur-sm
        border ${isAttacking || isBlocking ? 'border-primary' : 'border-gray-700/50'}
        transition-all duration-300
        group-hover:scale-105 group-hover:shadow-xl
        ${canTransform ? 'ring-2 ring-primary animate-pulse' : ''}
        ${isTransformed ? 'border-primary/50' : ''}
        ${isAttacking ? 'ring-2 ring-red-500' : ''}
        ${isBlocking ? 'ring-2 ring-blue-500' : ''}
      `}>
        <div className="p-2 flex flex-col h-full">
          <div className="text-xs font-medium text-white/90 mb-2 flex justify-between items-center">
            <span>{name}</span>
            {isAttacking && <Swords className="w-4 h-4 text-red-500" />}
            {isBlocking && <Shield className="w-4 h-4 text-blue-500" />}
          </div>
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
