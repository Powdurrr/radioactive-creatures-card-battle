
import React from "react";

interface CardProps {
  name?: string;
  attack?: number;
  defense?: number;
  image?: string;
}

export const Card = ({ name = "Baby Godzilla", attack = 2, defense = 3 }: CardProps) => {
  return (
    <div className="group relative w-[100px] h-[140px] flex-shrink-0">
      <div className="
        absolute inset-0 rounded-lg
        bg-card backdrop-blur-sm shadow-lg
        border border-gray-200/50
        transition-all duration-300
        group-hover:scale-105 group-hover:shadow-xl
      ">
        <div className="p-2 flex flex-col h-full">
          <div className="text-xs font-medium mb-2">{name}</div>
          <div className="flex-grow bg-gray-100/50 rounded-md" />
          <div className="flex justify-between mt-2 text-xs">
            <span>ATK: {attack}</span>
            <span>DEF: {defense}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
