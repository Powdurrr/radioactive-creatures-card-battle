
interface RadiationEffectInfo {
  color: string;
  description: string;
}

export const getRadiationEffectInfo = (radiationEffect?: string): RadiationEffectInfo => {
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
