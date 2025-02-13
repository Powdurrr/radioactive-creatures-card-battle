
import React from "react";
import { Card } from "./Card";

interface PlayerZoneProps {
  isOpponent?: boolean;
}

export const PlayerZone = ({ isOpponent = false }: PlayerZoneProps) => {
  const zoneClasses = `
    w-full p-6 rounded-xl
    bg-card backdrop-blur-sm shadow-lg
    border border-gray-200/50
    ${isOpponent ? "mb-4" : "mt-4"}
  `;

  return (
    <div className={zoneClasses}>
      <div className="flex flex-col gap-4">
        {/* Board */}
        <div className="grid grid-cols-5 gap-4 min-h-[120px]">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border-2 border-dashed border-gray-200/50 rounded-lg h-full min-h-[120px]"
            />
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
