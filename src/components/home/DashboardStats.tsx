"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Music, Calendar, FileText } from "lucide-react";
import { type ComponentType } from "react";

type Stat = {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  glow: string;
  gradient: string;
};

type Props = {
  totalSongs: number;
  upcomingSetlists: number;
  recentAdded: number;
  totalSingers: number;
};

export const DashboardStats = ({
  totalSongs,
  upcomingSetlists,
  recentAdded,
  totalSingers,
}: Props) => {
  const stats: Stat[] = [
    { 
      title: "Active Songs", 
      value: totalSongs.toString(), 
      icon: Music, 
      color: "text-indigo-500 dark:text-indigo-400",
      glow: "glow-primary",
      gradient: "from-indigo-500/10 to-transparent"
    },
    { 
      title: "Setlists", 
      value: upcomingSetlists.toString(), 
      icon: Calendar, 
      color: "text-fuchsia-500 dark:text-fuchsia-400",
      glow: "glow-purple",
      gradient: "from-fuchsia-500/10 to-transparent"
    },
    { 
      title: "Recent", 
      value: recentAdded.toString(), 
      icon: FileText, 
      color: "text-amber-500 dark:text-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
      gradient: "from-amber-500/10 to-transparent"
    },
    { 
      title: "Team Singers", 
      value: totalSingers.toString(), 
      icon: Users, 
      color: "text-emerald-500 dark:text-emerald-400",
      glow: "glow-green",
      gradient: "from-emerald-500/10 to-transparent"
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card
            key={idx}
            className={`neu-card group overflow-hidden border-0 bg-gradient-to-b ${stat.gradient} to-background/5 p-[1px] hover:translate-y-[-2px] transition-transform duration-300`}
          >
            <div className="rounded-[27px] bg-white/85 dark:bg-card/90 p-4 flex flex-col items-center text-center">
              <div className={`p-3 rounded-[20px] bg-background/50 border border-white/10 ${stat.glow} mb-2.5 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-black tracking-tight text-foreground">{stat.value}</div>
              <div className="text-[12px] font-medium text-muted-foreground tracking-wide mt-0.5">{stat.title}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};