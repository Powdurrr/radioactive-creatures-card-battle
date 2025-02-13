
import React from "react";
import { Card } from "./Card";

interface PlayerZoneProps {
  isOpponent?: boolean;
}

export const PlayerZone = ({ isOpponent = false }: PlayerZoneProps) => {
  const zoneClasses = `
    w-full p-4 rounded-lg
    bg-gray-900/30 backdrop-blur-sm
    border border-gray-700/50
  `;

  // Example cards with different states
  const exampleCards = [
    { name: "Baby Godzilla", attack: 2, defense: 3, stones: 0 },
    { name: "Baby Godzilla", attack: 2, defense: 3, stones: 2 },
    { name: "Godzilla", attack: 2, defense: 3, stones: 3, isTransformed: true },
  ];

  return (
    <div className={zoneClasses}>
      <div className="flex flex-col gap-4">
        {/* Board */}
        <div className="grid grid-cols-5 gap-4 min-h-[140px]">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-600/30 rounded-lg h-full min-h-[140px]"
            >
              {i < exampleCards.length && !isOpponent && (
                <Card {...exampleCards[i]} />
              )}
            </div>
          ))}
        </div>
        
        {/* Hand (only shown for player) */}
        {!isOpponent && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
