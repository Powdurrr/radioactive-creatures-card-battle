
import React from "react";

export const GameInfo = () => {
  return (
    <div className="
      px-6 py-4 rounded-lg
      bg-card backdrop-blur-sm shadow-lg
      border border-gray-200/50
      animate-fade-in
    ">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg font-medium">Initiative Phase</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors">
            End Phase
          </button>
        </div>
      </div>
    </div>
  );
};
