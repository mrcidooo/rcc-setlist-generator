"use client";

import { Button } from "@/components/ui/button";
import { type ComponentType } from "react";

type QuickAction = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  action: "upload" | "singer" | "setlist" | "pdf";
};

type Props = {
  actions: QuickAction[];
  onAction: (action: QuickAction["action"]) => void;
};

export const QuickActions = ({ actions, onAction }: Props) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    {actions.map((action, idx) => {
      const Icon = action.icon;
      return (
        <Button
          key={idx}
          type="button"
          onClick={() => onAction(action.action)}
          className="neu-card neu-btn h-[88px] relative overflow-hidden bg-white/70 dark:bg-card/60 p-0 text-foreground flex flex-col items-center justify-center gap-2 border border-white/20 dark:border-white/5 hover:bg-indigo-500/5 group"
        >
          {/* Subtle colorful backing gradient inside the button */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-5 w-5" />
          </div>
          
          <span className="text-[12px] font-semibold tracking-wide text-foreground/90">{action.title}</span>
        </Button>
      );
    })}
  </div>
);