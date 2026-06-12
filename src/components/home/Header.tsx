"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="bg-white p-4 shadow-sm dark:bg-gray-800 flex items-center justify-between">
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
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        <Sun className={`h-5 w-5 ${isDark ? "hidden" : "block"}`} />
        <Moon className={`h-5 w-5 ${isDark ? "block" : "hidden"}`} />
      </Button>
    </header>
  );
};