"use client";

import { Link, useLocation } from "react-router-dom";
import { Home, Settings, Music, Users, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/songs", label: "Songs", icon: Music },
  { to: "/singers", label: "Singers", icon: Users },
  { to: "/setlists", label: "Setlists", icon: Calendar },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <nav className="w-full bg-white dark:bg-gray-800 border-t border-border h-screen flex flex-col p-4">
      <div className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start text-left"
              >
                <icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};