"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ChevronRight, Music } from "lucide-react";

type Props = {};

export const RecentSongs = (props: Props) => (
  <section className="mb-6">
    <div className="flex items-center justify-between mb-3.5 px-1">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Recent Songs
      </h2>
      <span className="text-xs font-semibold text-indigo-500 cursor-pointer hover:underline">
        View All
      </span>
    </div>
    
    <div className="space-y-3">
      {[
        { title: "Amazing Grace", key: "C", time: "2 days ago" },
        { title: "Way Maker", key: "D", time: "3 days ago" },
        { title: "Goodness of God", key: "G", time: "5 days ago" }
      ].map((song, i) => (
        <Card
          key={i}
          className="neu-card border-0 bg-white/75 dark:bg-card/70 hover:translate-x-1 duration-300 overflow-hidden"
        >
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">
                <Music className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="font-bold text-foreground text-sm tracking-tight">{song.title}</div>
                <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
                  Key: {song.key} • Added {song.time}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
);