"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Music, Calendar, FileText } from "lucide-react";
import { type ComponentType } from "react";

type Stat = {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
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
    { title: "Total Songs", value: totalSongs.toString(), icon: Music, color: "text-blue-600" },
    { title: "Upcoming Setlists", value: upcomingSetlists.toString(), icon: Calendar, color: "text-purple-600" },
    { title: "Recently Added", value: recentAdded.toString(), icon: FileText, color: "text-orange-600" },
    { title: "Total Singers", value: totalSingers.toString(), icon: Users, color: "text-green-600" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <Icon className={`mx-auto mb-2 h-8 w-8 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};