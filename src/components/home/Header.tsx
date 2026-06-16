"use client";

import { Sun, Moon, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [buttonRipple, setButtonRipple] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [revealTheme, setRevealTheme] = useState<"light" | "dark">("dark");

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Get exact location of button center
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // 2. Pass coordinates dynamically to CSS custom variables
    document.documentElement.style.setProperty("--reveal-x", `${x}px`);
    document.documentElement.style.setProperty("--reveal-y", `${y}px`);

    // Set preview state for circular overlay
    setRevealTheme(isDark ? "light" : "dark");
    setReveal(true);
    setButtonRipple(true);

    // 3. Perform theme swap
    setTheme(isDark ? "light" : "dark");
  };

  useEffect(() => {
    if (buttonRipple) {
      const timer = setTimeout(() => setButtonRipple(false), 400);
      return () => clearTimeout(timer);
    }
  }, [buttonRipple]);

  useEffect(() => {
    if (reveal) {
      const timer = setTimeout(() => setReveal(false), 750);
      return () => clearTimeout(timer);
    }
  }, [reveal]);

  return (
    <header className="relative z-10 glass-panel rounded-[32px] p-5 mb-6 mx-1 mt-3">
      {/* Absolute high-performance circular clip-path overlay */}
      {reveal && (
        <div 
          className={`fixed inset-0 pointer-events-none z-50 overflow-hidden animate-circular-reveal ${
            revealTheme === "dark" 
              ? "bg-[#0B0E1B]" 
              : "bg-[#FAFAFA]"
          }`}
        />
      )}

      <div className="flex items-center justify-between">
        {/* Brand identity featuring new Custom Guitar Pick Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden shadow-md animate-[kick_0.4s_ease-out]">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <defs>
                <linearGradient id="pickGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#0e7490" />
                </linearGradient>
              </defs>
              <path d="M 50,5 C 75,5 95,20 95,45 C 95,75 65,92 50,95 C 35,92 5,75 5,45 C 5,20 25,5 50,5 Z" fill="url(#pickGrad)" />
              {/* White Cross */}
              <rect x="47" y="20" width="6" height="24" rx="1.5" fill="white" />
              <rect x="38" y="26" width="24" height="6" rx="1.5" fill="white" />
              {/* White Decrescendo Bars */}
              <rect x="30" y="52" width="40" height="3" rx="1.5" fill="white" />
              <rect x="36" y="60" width="28" height="3" rx="1.5" fill="white" />
              <rect x="42" y="68" width="16" height="3" rx="1.5" fill="white" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Worship
            </h1>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase opacity-80">
              Setlist Generator
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
            {buttonRipple && (
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ripple pointer-events-none" />
            )}
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