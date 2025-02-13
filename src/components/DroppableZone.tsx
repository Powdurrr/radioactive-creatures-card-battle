
import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableZoneProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
}

export const DroppableZone = ({ id, children, className = "" }: DroppableZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`
        ${className}
        ${isOver ? 'ring-2 ring-primary' : ''}
      `}
    >
      {children}
    </div>
  );
};
