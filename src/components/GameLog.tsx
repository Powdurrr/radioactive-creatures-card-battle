
import React from "react";
import { ScrollArea } from "./ui/scroll-area";

export const GameLog = () => {
  const logEntries = [
    { time: "12:01", text: "Game started" },
    { time: "12:02", text: "Player draws 2 cards" },
    { time: "12:03", text: "Player plays Baby Godzilla" },
  ];

  return (
    <div className="bg-gray-900/50 rounded-lg backdrop-blur-sm border border-gray-700 p-4 h-full">
      <h3 className="text-white/90 font-medium mb-3">Game Log</h3>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-2 pr-4">
          {logEntries.map((entry, i) => (
            <div key={i} className="text-xs">
              <span className="text-white/50">{entry.time}</span>
              <span className="text-white/80 ml-2">{entry.text}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
