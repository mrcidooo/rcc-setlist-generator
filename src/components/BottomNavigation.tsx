"use client";

import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Music,
  Users,
  Calendar,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/songs", label: "Songs", icon: Music },
  { to: "/singers", label: "Singers", icon: Users },
  { to: "/setlists", label: "Setlists", icon: Calendar },
  { to: "/singer-keys", label: "Singer Keys", icon: List },
];

type BottomNavigationProps = {
  className?: string;
};

export const BottomNavigation = ({ className }: BottomNavigationProps) => {
  const location = useLocation();

  return (
    <nav
      className={cn(
        "fixed inset-x-4 bottom-4 flex justify-around rounded-xl bg-gradient-to-r from-background/90 to-background/80 p-2 shadow-xl backdrop-blur dark:from-background/95 dark:to-background/90",
        className,
      )}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        const Icon = item.icon;

        return (
          <Link key={item.to} to={item.to}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className="flex flex-col items-center gap-1 p-2"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};