
import React from "react";
import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { DraggableCard } from "./DraggableCard";
import { DroppableZone } from "./DroppableZone";

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
    { id: "card-1", name: "Baby Godzilla", attack: 2, defense: 3, stones: 0 },
    { id: "card-2", name: "Baby Godzilla", attack: 2, defense: 3, stones: 2 },
    { id: "card-3", name: "Godzilla", attack: 2, defense: 3, stones: 3, isTransformed: true },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      console.log(`Moved card ${active.id} to zone ${over.id}`);
      // Here we'll implement the actual card movement logic
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={zoneClasses}>
        <div className="flex flex-col gap-4">
          {/* Board */}
          <div className="grid grid-cols-5 gap-4 min-h-[140px]">
            {[...Array(5)].map((_, i) => (
              <DroppableZone
                key={`zone-${i}`}
                id={`zone-${i}`}
                className="border border-gray-600/30 rounded-lg h-full min-h-[140px]"
              >
                {i < exampleCards.length && !isOpponent && (
                  <DraggableCard {...exampleCards[i]} />
                )}
              </DroppableZone>
            ))}
          </div>
          
          {/* Hand (only shown for player) */}
          {!isOpponent && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[...Array(5)].map((_, i) => (
                <DraggableCard 
                  key={`hand-${i}`}
                  id={`hand-${i}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};
