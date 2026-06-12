"use client";

import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "./card";

/**
 * A thin wrapper that injects the `.neumorphic-card` class
 * to give every card the futuristic floating‑neumorphic look.
 * Usage mirrors the original Card component.
 */
export const NeumorphicCard = ({
  className = "",
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Card>) => {
  return (
    <Card className={`neumorphic-card ${className}`} {...props}>
      {children}
    </Card>
  );
};

export {
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
};