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
  <div className="grid grid-cols-2 gap-4">
    {actions.map((action, idx) => {
      const Icon = action.icon;
      return (
        <Button
          key={idx}
          type="button"
          onClick={() => onAction(action.action)}
          className="relative flex flex-col items-center justify-center p-4 rounded-[22px] bg-white/70 dark:bg-card/70 border border-white/20 dark:border-white/5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow duration-300"
        >
          {/* Gradient icon background */}
          <div className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${action.color} mb-2`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-foreground">{action.title}</span>
        </Button>
      );
    })}
  </div>
);