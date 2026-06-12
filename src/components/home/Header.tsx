"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Ripple state – toggles each time the button is pressed
  const [ripple, setRipple] = useState(false);

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
    // Trigger ripple
    setRipple(true);
  };

  // Reset ripple after animation completes (300ms)
  useEffect(() => {
    if (ripple) {
      const timer = setTimeout(() => setRipple(false), 300);
      return () => clearTimeout(timer);
    }
  }, [ripple]);

  return (
    <header className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 shadow-sm dark:bg-gradient-to-r dark:from-primary/20 dark:to-secondary/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Worship Setlist Generator
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Church Worship Team
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle dark mode"
          onClick={handleToggle}
          className="relative overflow-hidden"
        >
          {/* Ripple element */}
          <span
            className={`
              absolute inset-0 rounded-full bg-primary/20 
              transform scale-0 
              ${ripple ? "animate-[ripple_0.3s_ease-out]" : ""}`}
          />
          <Sun className={`h-5 w-5 ${isDark ? "hidden" : "block"}`} />
          <Moon className={`h-5 w-5 ${isDark ? "block" : "hidden"}`} />
        </Button>
      </div>
    </header>
  );
};

/* Tailwind custom animation – add to your global CSS (globals.css) */
@layer utilities {
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  .animate-\[ripple_0\.3s_ease-out\] {
    animation: ripple 0.3s ease-out forwards;
  }
}