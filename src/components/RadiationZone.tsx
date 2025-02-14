
import React from 'react';
import { Zap, Shield, Battery } from 'lucide-react';
import { RadiationZone as RadiationZoneType } from '../types/GameTypes';
import { toast } from 'sonner';

interface RadiationZoneProps {
  zone: RadiationZoneType;
  position: number;
}

export const RadiationZone = ({ zone, position }: RadiationZoneProps) => {
  const getZoneIcon = () => {
    switch (zone.type) {
      case "boost":
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case "drain":
        return <Battery className="w-4 h-4 text-red-400" />;
      case "shield":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getZoneColor = () => {
    switch (zone.type) {
      case "boost":
        return "bg-yellow-400/20 border-yellow-400/50";
      case "drain":
        return "bg-red-400/20 border-red-400/50";
      case "shield":
        return "bg-blue-400/20 border-blue-400/50";
      default:
        return "bg-gray-400/20 border-gray-400/50";
    }
  };

  return (
    <div 
      className={`
        absolute inset-0 
        border-2 rounded-lg 
        flex items-center justify-center
        ${getZoneColor()}
        animate-pulse
      `}
      onMouseEnter={() => {
        toast.info(`${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone`, {
          description: `Duration: ${zone.duration} turns remaining`
        });
      }}
    >
      {getZoneIcon()}
    </div>
  );
};
