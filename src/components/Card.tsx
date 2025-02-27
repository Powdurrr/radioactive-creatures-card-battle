
import React, { useEffect, useState } from "react";
import { Swords, Shield, Zap, BoltIcon, Droplets } from "lucide-react";
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
import { motion } from "framer-motion";

interface CardProps {
  name?: string;
  attack?: number;
  defense?: number;
  image?: string;
  stones?: number;
  isTransformed?: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
  isTargeted?: boolean;
  radiationEffect?: "reduce" | "boost" | "drain" | "amplify" | "shield" | "burst";
  specialAbility?: string;
  onClick?: () => void;
  radiationZone?: { type: "boost" | "drain" | "shield" };
  evolutionLevel?: number;
}

// Particle Effect Components
const TransformationParticles = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(10)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary"
        initial={{ 
          x: Math.random() * 100, 
          y: Math.random() * 140,
          scale: 0
        }}
        animate={{ 
          x: Math.random() * 100,
          y: Math.random() * 140,
          scale: [0, 1.5, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          delay: Math.random() * 2
        }}
      />
    ))}
  </div>
);

const AttackParticles = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-red-500"
        initial={{ x: 50, y: 70, scale: 0 }}
        animate={{ 
          x: 110,
          y: 70 + (Math.random() * 30 - 15),
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 0.8,
          repeat: Infinity,
          repeatType: "loop",
          delay: Math.random() * 0.8
        }}
      />
    ))}
  </div>
);

const DefenseParticles = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute inset-0 border-2 border-blue-500 rounded-md"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: [0, 0.5, 0],
        scale: [0.8, 1.1, 0.8]
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop"
      }}
    />
  </div>
);

const RadiationParticles = ({ color = "yellow" }) => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute w-1 h-1 rounded-full bg-${color}-500`}
        initial={{ 
          x: 50, 
          y: 70,
          scale: 0
        }}
        animate={{ 
          x: 50 + Math.cos(i * 60 * Math.PI / 180) * 40,
          y: 70 + Math.sin(i * 60 * Math.PI / 180) * 40,
          scale: [0, 1, 0],
          opacity: [0, 0.7, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          delay: i * 0.3
        }}
      />
    ))}
  </div>
);

const EvolutionParticles = () => (
  <div className="absolute inset-0 overflow-hidden">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10"
      animate={{ 
        opacity: [0.1, 0.3, 0.1]
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        repeatType: "loop"
      }}
    />
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 h-8 bg-purple-500/30"
        initial={{ 
          x: Math.random() * 100, 
          y: -10,
          rotate: Math.random() * 20 - 10
        }}
        animate={{ 
          y: 140,
          opacity: [0, 0.8, 0]
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity,
          repeatType: "loop",
          delay: Math.random() * 2.5
        }}
      />
    ))}
  </div>
);

export const Card = ({ 
  name = "Baby Godzilla", 
  attack = 2, 
  defense = 3,
  stones = 0,
  isTransformed = false,
  isAttacking = false,
  isBlocking = false,
  isTargeted = false,
  radiationEffect,
  specialAbility,
  evolutionLevel = 0,
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

  const { color, description, icon: EffectIcon } = getRadiationEffectInfo(radiationEffect);

  const getCardBackground = () => {
    if (evolutionLevel >= 2) return "bg-gradient-to-br from-purple-900/90 to-indigo-900/90";
    if (evolutionLevel === 1) return "bg-gradient-to-br from-blue-900/90 to-cyan-900/90";
    if (isTransformed) return "bg-gradient-to-br from-gray-800/90 to-gray-900/90";
    return "bg-gray-800/90";
  };

  const getCardBorder = () => {
    if (!radiationEffect) return "border-gray-700/50";
    
    switch(radiationEffect) {
      case "boost": return "border-yellow-500/50";
      case "drain": return "border-red-500/50";
      case "amplify": return "border-purple-500/50";
      case "shield": return "border-blue-500/50";
      case "burst": return "border-orange-500/50";
      case "reduce": return "border-green-500/50";
      default: return "border-gray-700/50";
    }
  };

  const getParticleEffects = () => {
    if (isTransforming) return <TransformationParticles />;
    if (isAttacking) return <AttackParticles />;
    if (isBlocking) return <DefenseParticles />;
    if (radiationEffect === "amplify") return <RadiationParticles color="purple" />;
    if (evolutionLevel >= 2) return <EvolutionParticles />;
    return null;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            className={`
              group relative w-[110px] h-[160px] flex-shrink-0
              ${onClick ? 'cursor-pointer' : ''}
              ${isTransforming ? 'animate-[transform_1s_ease-in-out]' : ''}
              ${isAttacking ? 'animate-[attack_0.5s_ease-in-out]' : ''}
              ${isBlocking ? 'animate-[block_0.5s_ease-in-out]' : ''}
              transition-all duration-300
            `}
            whileHover={{ 
              scale: 1.05,
              y: -5,
              transition: { duration: 0.2 }
            }}
            onClick={onClick}
          >
            <div className={`
              absolute inset-0 rounded-lg
              ${getCardBackground()}
              backdrop-blur-sm
              border-2 ${getCardBorder()}
              transition-all duration-300
              group-hover:shadow-xl
              ${canTransform ? 'ring-2 ring-primary animate-pulse' : ''}
              ${isTransformed ? 'border-primary/50 scale-110' : ''}
              ${isAttacking ? 'ring-2 ring-red-500 border-red-500/50' : ''}
              ${isBlocking ? 'ring-2 ring-blue-500 border-blue-500/50' : ''}
              ${isTargeted ? 'ring-2 ring-red-500 border-red-500/50 animate-pulse' : ''}
              ${isTransforming ? 'animate-[glow_1s_ease-in-out] scale-125' : ''}
              ${isAnimating ? 'shadow-lg' : ''}
              ${evolutionLevel >= 1 ? 'shadow-md shadow-primary/50' : ''}
              ${evolutionLevel >= 2 ? 'shadow-lg shadow-purple-500/50' : ''}
            `}>
              <div className="p-2 flex flex-col h-full relative overflow-hidden">
                {/* Card Title */}
                <div className="flex justify-between items-center mb-1.5">
                  <div className="text-xs font-medium text-white/90 flex items-center gap-1.5">
                    {radiationEffect && (
                      <EffectIcon className={`w-3.5 h-3.5 ${color}`} />
                    )}
                    <span className={`
                      truncate max-w-[70px]
                      ${isTransformed ? 'text-primary font-bold' : ''}
                      ${evolutionLevel >= 1 ? 'text-blue-300 font-bold' : ''}
                      ${evolutionLevel >= 2 ? 'text-purple-300 font-bold' : ''}
                    `}>
                      {name}
                    </span>
                  </div>
                </div>
                
                {/* Level Indicator for Evolved Cards */}
                {evolutionLevel > 0 && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className={`
                      flex items-center justify-center rounded-full w-4 h-4 text-[10px] font-bold
                      ${evolutionLevel === 1 ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}
                    `}>
                      {evolutionLevel}
                    </div>
                  </div>
                )}
                
                {/* Status Icons */}
                <div className="absolute top-7 right-2 flex flex-col gap-1.5">
                  {isAttacking && <Swords className="w-4 h-4 text-red-500 animate-bounce" />}
                  {isBlocking && <Shield className="w-4 h-4 text-blue-500 animate-pulse" />}
                </div>
                
                {/* Card Image/Background */}
                <div className="flex-grow bg-gray-700/50 rounded-md relative overflow-hidden">
                  <CardStones stones={stones} isTransformed={isTransformed} />
                  
                  {/* Particle Effects */}
                  {getParticleEffects()}
                  
                  {/* Card Art */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    {radiationEffect === "boost" && <Zap className="w-12 h-12 text-yellow-500" />}
                    {radiationEffect === "drain" && <Droplets className="w-12 h-12 text-red-500" />}
                    {radiationEffect === "shield" && <Shield className="w-12 h-12 text-blue-500" />}
                    {radiationEffect === "amplify" && <BoltIcon className="w-12 h-12 text-purple-500" />}
                    {radiationEffect === "burst" && <Zap className="w-12 h-12 text-orange-500" />}
                    {radiationEffect === "reduce" && <Zap className="w-12 h-12 text-green-500" />}
                  </div>
                </div>
                
                {/* Card Stats */}
                <CardStats
                  attack={attack}
                  defense={defense}
                  isTransformed={isTransformed}
                  isAttacking={isAttacking}
                  isBlocking={isBlocking}
                />
                
                {/* Special Ability Indicator */}
                {specialAbility && (
                  <div className={`
                    text-[9px] mt-1 text-center overflow-hidden whitespace-nowrap text-ellipsis
                    ${isTransformed ? 'text-primary/90' : 'text-blue-400/90'}
                    ${evolutionLevel >= 1 ? 'text-blue-300/90' : ''}
                    ${evolutionLevel >= 2 ? 'text-purple-300/90' : ''}
                  `} title={specialAbility}>
                    {specialAbility}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-3 w-64">
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
            evolutionLevel={evolutionLevel}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
