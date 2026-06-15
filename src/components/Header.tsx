"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Music, Sun, Moon, Settings, User } from "lucide-react";

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [buttonRipple, setButtonRipple] = useState(false);
  const [screenRipple, setScreenRipple] = useState(false);

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
    setButtonRipple(true);
    setScreenRipple(true);
  };

  useEffect(() => {
    if (!buttonRipple) return;

    const timer = setTimeout(() => setButtonRipple(false), 300);
    return () => clearTimeout(timer);
  }, [buttonRipple]);

  useEffect(() => {
    if (!screenRipple) return;

    const timer = setTimeout(() => setScreenRipple(false), 600);
    return () => clearTimeout(timer);
  }, [screenRipple]);

  return (
    <header className="relative z-10 glass-panel rounded-[32px] p-5 mb-6 mx-1 mt-3 bg-black bg-gradient-to-b from-indigo-500/30 to-purple-600/30 dark:bg-card/40">
      {screenRipple && (
        <div className="fixed inset-0 pointer-events-none animate-ripple-screen bg-indigo-500/10 rounded-full" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] ring-2 ring-indigo-600/30 animate-[kick_0.4s_ease-out]">
            <Music className="h-6 w-6 text-white" />
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

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={handleToggle}
            className="h-10 w-10 rounded-[18px] hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 relative overflow-hidden"
          >
            <span className="absolute inset-0 rounded-full bg-primary/20 transform scale-0 animate-[ripple_0.3s_ease-out]" />
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-600" />
            )}
          </Button>

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

          <div className="h-9 w-9 rounded-[16px] bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-500/20 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
};