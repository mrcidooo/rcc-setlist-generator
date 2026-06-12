"use client";

import { Card, CardContent } from "@/components/ui/card";
import { type Singer } from "@/types";
import { ChevronRight } from "lucide-react";

type Props = {
  singers: Singer[];
  getLabel: (voice: Singer["voiceType"]) => string;
};

export const TeamMembers = ({ singers, getLabel }: Props) => {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3.5 px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Team Members
        </h2>
        <span className="text-xs font-semibold text-indigo-500 cursor-pointer hover:underline">
          Manage
        </span>
      </div>

      <div className="space-y-3">
        {singers.slice(0, 3).map((singer) => {
          const initials = singer.name.split(" ").map(n => n[0]).join("").toUpperCase();
          const isFemale = singer.voiceType === "female";

          return (
            <Card
              key={singer.id}
              className="neu-card border-0 bg-white/75 dark:bg-card/70 hover:translate-x-1 duration-300 overflow-hidden"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {/* Dynamic Gradient Avatar Container */}
                  <div className={`flex h-11 w-11 items-center justify-center rounded-[18px] text-xs font-bold ${
                    isFemale 
                      ? "bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/10" 
                      : "bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10"
                  }`}>
                    {initials}
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm tracking-tight">
                      {singer.name}
                    </div>
                    <div className="text-[11px] font-medium text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded-[6px] text-[10px] font-bold ${
                        isFemale ? "bg-pink-500/10 text-pink-600" : "bg-blue-500/10 text-blue-600"
                      }`}>
                        {getLabel(singer.voiceType)}
                      </span>
                      {singer.nickname && <span>• Nickname: "{singer.nickname}"</span>}
                      {singer.notes && <span>• {singer.notes}</span>}
                    </div>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};