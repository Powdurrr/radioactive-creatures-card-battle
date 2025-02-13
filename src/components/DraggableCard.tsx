
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card } from "./Card";
import { useGameState } from "../contexts/GameStateContext";

interface DraggableCardProps {
  id: string;
  name?: string;
  attack?: number;
  defense?: number;
  stones?: number;
  isTransformed?: boolean;
  isAttacking?: boolean;
  isBlocking?: boolean;
}

export const DraggableCard = (props: DraggableCardProps) => {
  const { gameState, selectAttacker, selectBlocker } = useGameState();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: props.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  const handleClick = () => {
    if (gameState.currentPhase === 'Attack') {
      selectAttacker(props.id);
    } else if (gameState.currentPhase === 'Block') {
      selectBlocker(props.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card {...props} onClick={handleClick} />
    </div>
  );
};
