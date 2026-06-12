"use client";

import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Settings,
  Music,
  Users,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/songs", label: "Songs", icon: Music },
  { to: "/singers", label: "Singers", icon: Users },
  { to: "/setlists", label: "Setlists", icon: Calendar },
  { to: "/singer-keys", label: "Singer Keys", icon: Music },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <nav className="h-screen w-full border-t border-border bg-gradient-to-b from-background/80 to-background/60 p-4 shadow-lg dark:from-background/90 dark:to-background/70 flex flex-col">
      <div className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <Link key={item.to} to={item.to}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start text-left"
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};