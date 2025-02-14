
import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Swords } from "lucide-react";

interface AttackMenuProps {
  children: React.ReactNode;
  onAttack: () => void;
  showAttackOption: boolean;
}

export const AttackMenu = ({ children, onAttack, showAttackOption }: AttackMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {showAttackOption && (
          <ContextMenuItem
            className="flex items-center gap-2 text-red-500 cursor-pointer"
            onClick={onAttack}
          >
            <Swords className="w-4 h-4" />
            Select as Attacker
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
