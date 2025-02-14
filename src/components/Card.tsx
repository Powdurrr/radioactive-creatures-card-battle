
import React, { useEffect, useState } from "react";
import { Swords, Shield, Zap, BoltIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { CardStats } from "./card/CardStats";
import { CardStones } from "./card/CardStones";
import { CardTooltip } from "./card/CardTooltip";
import { getRadiationEffectInfo } from "@/utils/radiationEffects";

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
}: CardProps) => {
  const [isTransforming, setIsTransforming] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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

  useEffect(() => {
    if (isAttacking || isBlocking) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAttacking, isBlocking]);

  const { color } = getRadiationEffectInfo(radiationEffect);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              group relative w-[100px] h-[140px] flex-shrink-0
              ${onClick ? 'cursor-pointer' : ''}
              ${isTransforming ? 'animate-[transform_1s_ease-in-out]' : ''}
              ${isAttacking ? 'animate-[attack_0.5s_ease-in-out]' : ''}
              ${isBlocking ? 'animate-[block_0.5s_ease-in-out]' : ''}
              transition-all duration-300
            `}
            onClick={onClick}
          >
            <div className={`
              absolute inset-0 rounded-lg
              bg-gray-800/90 backdrop-blur-sm
              border 
              transition-all duration-300
              group-hover:scale-105 group-hover:shadow-xl
              ${canTransform ? 'ring-2 ring-primary animate-pulse' : ''}
              ${isTransformed ? 'border-primary/50 scale-110' : ''}
              ${isAttacking ? 'ring-2 ring-red-500 border-red-500/50' : ''}
              ${isBlocking ? 'ring-2 ring-blue-500 border-blue-500/50' : ''}
              ${!isAttacking && !isBlocking ? 'border-gray-700/50' : ''}
              ${isTransforming ? 'animate-[glow_1s_ease-in-out] scale-125' : ''}
              ${isAnimating ? 'shadow-lg' : ''}
            `}>
              <div className="p-2 flex flex-col h-full relative overflow-hidden">
                {isTransforming && (
                  <div className="absolute inset-0 bg-primary/30 animate-pulse" />
                )}
                {isAnimating && (
                  <div className={`
                    absolute inset-0 
                    ${isAttacking ? 'bg-red-500/20' : ''}
                    ${isBlocking ? 'bg-blue-500/20' : ''}
                    animate-pulse
                  `} />
                )}
                
                <div className="text-xs font-medium text-white/90 mb-2 flex justify-between items-center">
                  <span className={isTransformed ? 'text-primary font-bold' : ''}>
                    {name}
                  </span>
                  {isAttacking && <Swords className="w-4 h-4 text-red-500 animate-bounce" />}
                  {isBlocking && <Shield className="w-4 h-4 text-blue-500 animate-pulse" />}
                  {radiationEffect && (
                    <Zap className={`w-4 h-4 ${color}`} />
                  )}
                </div>
                
                <div className="flex-grow bg-gray-700/50 rounded-md relative">
                  <CardStones stones={stones} isTransformed={isTransformed} />
                  
                  {radiationEffect === "amplify" && (
                    <BoltIcon className="absolute bottom-1 right-1 w-6 h-6 text-yellow-400/50 animate-pulse" />
                  )}
                </div>
                
                <CardStats
                  attack={attack}
                  defense={defense}
                  isTransformed={isTransformed}
                  isAttacking={isAttacking}
                  isBlocking={isBlocking}
                />
                
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
          <CardTooltip
            name={name}
            radiationEffect={radiationEffect}
            specialAbility={specialAbility}
            canTransform={canTransform}
            isAttacking={isAttacking}
            isBlocking={isBlocking}
            attack={attack}
            defense={defense}
            isTransformed={isTransformed}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
