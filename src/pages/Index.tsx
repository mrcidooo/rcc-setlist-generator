"use client";

import { useState } from "react";
import { type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Header } from "@/components/home/Header";
import { DashboardStats } from "@/components/home/DashboardStats";
import { QuickActions } from "@/components/home/QuickActions";
import { TeamMembers } from "@/components/home/TeamMembers";
import { RecentSongs } from "@/components/home/RecentSongs";
import { Upload, UserPlus, Library, FileText, Search, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

type VoiceType = "male" | "female";

type Singer = {
  id: string;
  name: string;
  nickname: string;
  voiceType: VoiceType;
  notes: string;
};

const quickActions = [
  { title: "Upload Song", icon: Upload, color: "bg-indigo-500/5", action: "upload" as const },
  { title: "Add Singer", icon: UserPlus, color: "bg-purple-500/5", action: "singer" as const },
  { title: "Create Setlist", icon: Library, color: "bg-emerald-500/5", action: "setlist" as const },
  { title: "Generate PDF", icon: FileText, color: "bg-amber-500/5", action: "pdf" as const },
];

const initialSingers: Singer[] = [
  { id: "1", name: "John Smith", nickname: "Johnny", voiceType: "male", notes: "Tenor" },
  { id: "2", name: "Sarah Johnson", nickname: "Sara", voiceType: "female", notes: "Alto" },
  { id: "3", name: "Mike Davis", nickname: "", voiceType: "male", notes: "Bass" },
];

const getVoiceTypeLabel = (voice: VoiceType) => (voice === "male" ? "Male" : "Female");

export default function Index() {
  const [singers, setSingers] = useState<Singer[]>(initialSingers);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const handleQuickAction = (action: typeof quickActions[number]["action"]) => {
    switch (action) {
      case "upload":
        toast({ title: "Upload flow available under 'Songs' tab", description: "Navigate using navigation bar." });
        break;
      case "singer":
        toast({ title: "Team singer management available under 'Singers' tab", description: "Use singers navigation to add team members." });
        break;
      case "setlist":
        toast({ title: "Setlist building workflow ready!", description: "Press the central calendar action button to open." });
        break;
      case "pdf":
        toast({ title: "PDF generation is automated in Setlists!", description: "Choose any setlist to instantly download high-quality PDFs." });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-32 flex flex-col px-4 sm:px-6 md:px-8 max-w-2xl mx-auto">
      {/* Premium Header */}
      <Header />

      <div className="flex-1 space-y-6">
        {/* Search bar designed like Apple Vision Pro / AI Assistant */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl rounded-[28px] opacity-100 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center glass-panel rounded-[28px] border border-white/20 p-2 pl-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <Input
              type="text"
              placeholder="Ask VocalFlow to search songs, keys, or singers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none focus:ring-0 text-foreground text-sm w-full p-0 shadow-none focus-visible:ring-0"
            />
            <div className="hidden sm:flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-xl px-2 py-1 text-[11px] font-bold text-muted-foreground mr-2 border border-white/5">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              AI Mode
            </div>
          </div>
        </div>

        {/* Featured Smart Insight Panel */}
        <div className="neu-card border-0 bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent p-5 relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] h-28 w-28 rounded-full bg-indigo-500/10 blur-3xl" />
          <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" /> Team Insight
          </h3>
          <p className="text-sm font-bold text-foreground mt-2 leading-relaxed">
            All 3 active singers have registered custom comfortable keys for the next Sunday worship service.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="w-2/3 bg-black/5 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full w-[100%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </div>
            <span className="text-[11px] font-extrabold text-foreground tracking-wider uppercase">100% Ready</span>
          </div>
        </div>

        {/* Dynamic Neumorphic Stats */}
        <div>
          <DashboardStats
            totalSongs={42}
            upcomingSetlists={5}
            recentAdded={3}
            totalSingers={singers.length}
          />
        </div>

        {/* Modular Grid Workspaces */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Quick Workspaces
          </h2>
          <QuickActions actions={quickActions as any} onAction={handleQuickAction} />
        </div>

        {/* Team profiles */}
        <TeamMembers singers={singers} getLabel={getVoiceTypeLabel} />

        {/* Recent actions / list */}
        <RecentSongs />
      </div>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
}