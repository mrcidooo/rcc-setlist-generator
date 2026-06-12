"use client";

import { Button } from "@/components/ui/button";
import { type ComponentType } from "react";

type QuickAction = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  color: string; // gradient background colour for the icon container
  action: "upload" | "singer" | "setlist" | "pdf";
};

type Props = {
  actions: QuickAction[];
  onAction: (action: QuickAction["action"]) => void;
};

export const QuickActions = ({ actions, onAction }: Props) => {
  const isThree = actions.length === 3;

  /* -----------------------------------------------------------------
   * Layout strategy
   * -----------------------------------------------------------------
   * • 3 actions → flex container:
   *   – mobile (sm < 640px) → vertical stack, each button full width
   *   – md‑up (≥640px)   → three equal columns, centred
   * • other counts → simple 2‑column grid that also collapses to a
   *   single column on mobile.
   * ----------------------------------------------------------------- */
  const containerClass = isThree
    ? "flex flex-col sm:flex-row sm:justify-center sm:gap-5"
    : "grid grid-cols-1 sm:grid-cols-2 gap-5";

  const buttonBase =
    "relative flex flex-col items-center justify-center p-5 min-h-[120px] rounded-[22px] bg-white/70 dark:bg-card/70 border border-white/20 dark:border-white/5 neu-btn hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-shadow duration-300";

  const buttonResponsive = isThree
    ? "w-full sm:w-auto flex-1 max-w-[180px]"
    : "w-full";

  return (
    <div className={containerClass}>
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <Button
            key={idx}
            type="button"
            onClick={() => onAction(action.action)}
            className={`${buttonBase} ${buttonResponsive} ${buttonResponsive}`}
          >
            {/* Gradient icon background with neumorphic feel */}
            <div
              className={`
                flex h-14 w-14 items-center justify-center rounded-[16px] ${action.color}
                mb-3 text-white shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(0,0,0,0.2)]
              `}
            >
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-[13px] font-semibold text-foreground text-center">
              {action.title}
            </span>
          </Button>
        );
      })}
    </div>
  );
};