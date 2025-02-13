
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card } from "./Card";

interface DraggableCardProps {
  id: string;
  name?: string;
  attack?: number;
  defense?: number;
  stones?: number;
  isTransformed?: boolean;
}

export const DraggableCard = (props: DraggableCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card {...props} />
    </div>
  );
};
