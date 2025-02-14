
import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableZoneProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DroppableZone = ({ id, children, className = "", onClick }: DroppableZoneProps) => {
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
      onClick={onClick}
    >
      {children}
    </div>
  );
};
