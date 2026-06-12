"use client";

import { Sun, Moon, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Small ripple for the button itself
  const [buttonRipple, setButtonRipple] = useState(false);
  // Full‑screen ripple that covers the whole page
  const [screenRipple, setScreenRipple] = useState(false);

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
    setButtonRipple(true);
    setScreenRipple(true);
  };

  // Clean up button ripple
  useEffect(() => {
    if (buttonRipple) {
      const timer = setTimeout(() => setButtonRipple(false), 300);
      return () => clearTimeout(timer);
    }
  }, [buttonRipple]);

  // Clean up screen ripple (duration matches the CSS animation)
  useEffect(() => {
    if (screenRipple) {
      const timer = setTimeout(() => setScreenRipple(false), 600);
      return () => clearTimeout(timer);
    }
  }, [screenRipple]);

  return (
    <header className="relative z-10 glass-panel rounded-[32px] p-5 mb-6 mx-1 mt-3">
      {/* Full‑screen ripple overlay */}
      {screenRipple && (
        <div className="fixed inset-0 pointer-events-none animate-ripple-screen bg-indigo-500/10 rounded-full" />
      )}

      <div className="flex items-center justify-between">
        {/* Logo / Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[kick_0.4s_ease-out]">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              RCC Setlist Generator
            </h1>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase opacity-80">
              Worship Space
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {/* Theme button with its own tiny ripple */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={handleToggle}
            className="h-10 w-10 rounded-[18px] hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 relative overflow-hidden"
          >
            <span
              className={`
                absolute inset-0 rounded-full bg-primary/20 
                transform scale-0 
                ${buttonRipple ? "animate-[ripple_0.3s_ease-out]" : ""}`}
            />
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-600" />
            )}
          </Button>

          {/* Settings shortcut button */}
          <Link to="/singer-keys">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Singer Keys Preferences"
              className="h-10 w-10 rounded-[18px] hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Settings className="h-4.5 w-4.5 text-muted-foreground" />
            </Button>
          </Link>

          {/* User profile avatar */}
          <div className="h-9 w-9 rounded-[16px] bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-500/20 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
};