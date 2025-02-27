
import { Zap, Shield, Droplets, BoltIcon } from "lucide-react";

interface RadiationEffectInfo {
  color: string;
  description: string;
  icon: any; // Using any here since we're dealing with Lucide icons
}

export const getRadiationEffectInfo = (radiationEffect?: string): RadiationEffectInfo => {
  switch (radiationEffect) {
    case "amplify":
      return {
        color: "text-purple-400",
        description: "Doubles radiation effects on adjacent cards",
        icon: BoltIcon
      };
    case "burst":
      return {
        color: "text-orange-400",
        description: "Releases stored radiation as damage",
        icon: Zap
      };
    case "shield":
      return {
        color: "text-blue-300",
        description: "Reduces incoming radiation damage",
        icon: Shield
      };
    case "drain":
      return {
        color: "text-red-400",
        description: "Steals radiation from opponent",
        icon: Droplets
      };
    case "boost":
      return {
        color: "text-yellow-400",
        description: "Gains power from radiation",
        icon: Zap
      };
    case "reduce":
      return {
        color: "text-blue-400",
        description: "Reduces radiation in play",
        icon: Zap
      };
    default:
      return {
        color: "text-gray-400",
        description: "",
        icon: Zap
      };
  }
};
