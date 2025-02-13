import React, { useEffect, useState } from "react";
import { Swords, Shield, Zap, BoltIcon, RadioTower } from "lucide-react";

interface CardProps {
  name?: string;
  attack?: number;
  defense?: number;
  image?: string;
  stones?: number;
  isTransformed?: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
  radiationEffect?: "reduce" | "boost" | "drain" | "amplify" | "shield" | "burst";
  specialAbility?: string;
  onClick?: () => void;
  radiationZone?: { type: "boost" | "drain" | "shield" };
}

export const Card = ({ 
  name = "Baby Godzilla", 
  attack = 2, 
  defense = 3,
  stones = 0,
  isTransformed = false,
  isAttacking = false,
  isBlocking = false,
  radiationEffect,
  specialAbility,
  onClick,
  radiationZone
}: CardProps & { radiationZone?: { type: "boost" | "drain" | "shield" } }) => {
  const [isTransforming, setIsTransforming] = useState(false);
  const canTransform = stones >= 3 && !isTransformed;
  
  useEffect(() => {
    if (isTransformed) {
      setIsTransforming(true);
      const timer = setTimeout(() => {
        setIsTransforming(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isTransformed]);

  const getRadiationComboClass = () => {
    switch (radiationEffect) {
      case "amplify":
        return "before:absolute before:inset-0 before:bg-yellow-500/20 before:animate-pulse";
      case "burst":
        return "after:absolute after:inset-0 after:bg-red-500/20 after:animate-ping";
      case "shield":
        return "before:absolute before:inset-0 before:bg-blue-500/20 before:animate-pulse";
      default:
        return "";
    }
  };

  const getRadiationZoneClass = () => {
    if (!radiationZone) return "";
    
    switch (radiationZone.type) {
      case "boost":
        return "after:absolute after:inset-0 after:bg-yellow-500/20 after:animate-pulse";
      case "drain":
        return "after:absolute after:inset-0 after:bg-red-500/20 after:animate-ping";
      case "shield":
        return "after:absolute after:inset-0 after:bg-blue-500/20 after:animate-pulse";
      default:
        return "";
    }
  };

  return (
    <div 
      className={`
        group relative w-[100px] h-[140px] flex-shrink-0
        ${onClick ? 'cursor-pointer' : ''}
        ${isTransforming ? 'animate-[transform_1s_ease-in-out]' : ''}
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
        ${isTransformed ? 'border-primary/50 scale-110' : ''}
        ${isAttacking ? 'ring-2 ring-red-500' : ''}
        ${isBlocking ? 'ring-2 ring-blue-500' : ''}
        ${getRadiationComboClass()}
        ${getRadiationZoneClass()}
        ${isTransforming ? 'animate-[glow_1s_ease-in-out] scale-125' : ''}
      `}>
        <div className="p-2 flex flex-col h-full relative overflow-hidden">
          {isTransforming && (
            <div className="absolute inset-0 bg-primary/30 animate-pulse" />
          )}
          
          <div className="text-xs font-medium text-white/90 mb-2 flex justify-between items-center">
            <span className={isTransformed ? 'text-primary font-bold' : ''}>
              {name}
            </span>
            {isAttacking && <Swords className="w-4 h-4 text-red-500" />}
            {isBlocking && <Shield className="w-4 h-4 text-blue-500" />}
            {radiationEffect && (
              <Zap className={`w-4 h-4 ${
                radiationEffect === "boost" ? "text-yellow-400" :
                radiationEffect === "reduce" ? "text-blue-400" :
                radiationEffect === "drain" ? "text-red-400" :
                radiationEffect === "amplify" ? "text-purple-400" :
                radiationEffect === "shield" ? "text-blue-300" :
                "text-orange-400"
              }`} />
            )}
          </div>
          
          <div className="flex-grow bg-gray-700/50 rounded-md relative">
            {stones > 0 && (
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
            )}
            
            {radiationEffect === "amplify" && (
              <BoltIcon className="absolute bottom-1 right-1 w-6 h-6 text-yellow-400/50 animate-pulse" />
            )}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-white/80">
            <span className={`${isTransformed ? 'text-primary font-bold' : ''}`}>
              ATK: {isTransformed ? attack * 2 : attack}
            </span>
            <span className={`${isTransformed ? 'text-primary font-bold' : ''}`}>
              DEF: {isTransformed ? Math.floor(defense * 1.5) : defense}
            </span>
          </div>
          
          {specialAbility && (
            <div className={`
              text-[10px] mt-1 text-center
              ${isTransformed ? 'text-primary/90' : 'text-blue-400/90'}
            `}>
              {specialAbility}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
