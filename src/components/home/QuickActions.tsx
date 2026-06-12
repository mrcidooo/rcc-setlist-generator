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
  <div className="mb-6 grid grid-cols-2 gap-4">
    {actions.map((action, idx) => {
      const Icon = action.icon;
      return (
        <Button
          key={idx}
          type="button"
          className={`${action.color} h-20 flex-col gap-2 text-white`}
          onClick={() => onAction(action.action)}
        >
          <Icon className="h-6 w-6" />
          <span className="text-sm font-medium">{action.title}</span>
        </Button>
      );
    })}
  </div>
);