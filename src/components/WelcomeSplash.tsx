"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * WelcomeSplash – premium loading screen shown while the application
 * initializes. It displays a glowing logo, tagline, and a subtle
 * pulsating animation that matches the app's dark‑mode/light‑mode
 * theme.
 */
export default function WelcomeSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [theme, setTheme] = useState("light");

  // Sync with the global theme so the splash matches the selected mode
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    setTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Hide splash after a short delay or when the page fully loads
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center overflow-hidden">
      {/* Pulsating gradient background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 animate-[pulse_3s_infinite]"
      />

      {/* Centered content */}
      <div className="relative z-10 max-w-md w-full text-center">
        {/* Animated logo */}
        <div className="flex h-24 items-center justify-center gap-2 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden shadow-md animate-[kick_0.4s_ease-out]">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <defs>
                <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#0e7490" />
                </linearGradient>
              </defs>
              <path d="M 50,5 C 75,5 95,20 95,45 C 95,75 65,92 50,95 C 35,92 5,75 5,45 C 5,20 25,5 50,5 Z" fill="url(#splashGrad)" />
              {/* White Cross */}
              <rect x="47" y="20" width="6" height="24" rx="1.5" fill="white" />
              <rect x="38" y="26" width="24" height="6" rx="1.5" fill="white" />
              {/* White Decrescendo Bars */}
              <rect x="30" y="52" width="40" height="3" rx="1.5" fill="white" />
              <rect x="36" y="60" width="28" height="3" rx="1.5" fill="white" />
              <rect x="42" y="68" width="16" height="3" rx="1.5" fill="white" />
            </svg>
          </div>

          {/* Theme‑aware icon */}
          <Sun
            className={cn(
              "h-6 w-6 text-amber-400 dark:text-amber-300",
              "animate-pulse"
            )}
          />
          <Moon
            className={cn(
              "h-6 w-6 text-indigo-600 dark:text-indigo-400",
              "animate-pulse"
            )}
          />
        </div>

        {/* Tagline */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Worship
        </h1>
        <p className="mt-1 text-lg text-muted-foreground uppercase tracking-wider">
          Setlist Generator
        </p>

        {/* Optional call‑to‑action that disappears with the splash */}
        <Button
          variant="ghost"
          className="mt-6 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] font-semibold px-6 py-2"
          onClick={() => setIsVisible(false)}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}

/* Premium keyframe animations */
const pulseKeyframes = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.05);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }
`;

export const injectPulseStyles = () => {
  const style = document.createElement("style");
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
};