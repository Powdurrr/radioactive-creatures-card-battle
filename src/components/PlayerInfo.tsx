
import React from "react";

interface PlayerInfoProps {
  username: string;
  life: number;
  isOpponent?: boolean;
}

export const PlayerInfo = ({ username, life, isOpponent = false }: PlayerInfoProps) => {
  return (
    <div className="bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700 p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">{life}</span>
        </div>
        <span className="text-white/90 font-medium">{username}</span>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-gray-700/50 border border-gray-600"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
