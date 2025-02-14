
import React, { useEffect, useState } from "react";
import { Swords, Shield, Zap, BoltIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
}: CardProps) => {
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

  const getRadiationEffectInfo = () => {
    switch (radiationEffect) {
      case "amplify":
        return {
          color: "text-purple-400",
          description: "Doubles radiation effects on adjacent cards"
        };
      case "burst":
        return {
          color: "text-orange-400",
          description: "Releases stored radiation as damage"
        };
      case "shield":
        return {
          color: "text-blue-300",
          description: "Reduces incoming radiation damage"
        };
      case "drain":
        return {
          color: "text-red-400",
          description: "Steals radiation from opponent"
        };
      case "boost":
        return {
          color: "text-yellow-400",
          description: "Gains power from radiation"
        };
      case "reduce":
        return {
          color: "text-blue-400",
          description: "Reduces radiation in play"
        };
      default:
        return {
          color: "text-gray-400",
          description: ""
        };
    }
  };

  const { color, description } = getRadiationEffectInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
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
                    <Zap className={`w-4 h-4 ${color}`} />
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
        </TooltipTrigger>
        <TooltipContent side="top" className="p-3">
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
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
