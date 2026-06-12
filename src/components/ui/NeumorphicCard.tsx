"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export const NeumorphicCard = ({ children, className }: Props) => {
  return (
    <div className={cn("neumorphic-card", className)}>
      {children}
    </div>
  );
};

// Also export as default for flexible imports
export default NeumorphicCard;