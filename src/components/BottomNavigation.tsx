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

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/songs", label: "Songs", icon: Music },
  { to: "/singers", label: "Singers", icon: Users },
  { to: "/setlists", label: "Setlists", icon: Calendar },
  { to: "/singer-keys", label: "Singer Keys", icon: List },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="border-t border-border bg-white p-4 dark:bg-gray-800 flex justify-around">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        const Icon = item.icon;

        return (
          <Link key={item.to} to={item.to}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className="flex flex-col items-center gap-1 p-2"
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