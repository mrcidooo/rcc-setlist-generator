"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/home/Header";
import { DashboardStats } from "@/components/home/DashboardStats";
import { QuickActions } from "@/components/home/QuickActions";
import { TeamMembers } from "@/components/home/TeamMembers";
import { UserPlus, Library, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

type VoiceType = "male" | "female";

type Singer = {
  id: string;
  name: string;
  nickname: string;
  voiceType: VoiceType;
  notes: string;
};

const quickActions = [
  { title: "Add Singer", icon: UserPlus, color: "bg-purple-500/5", action: "singer" as const },
  { title: "Create Setlist", icon: Library, color: "bg-emerald-500/5", action: "setlist" as const },
  { title: "Generate PDF", icon: FileText, color: "bg-amber-500/5", action: "pdf" as const },
];

const getVoiceTypeLabel = (voice: VoiceType) => (voice === "male" ? "Male" : "Female");

export default function Index() {
  const [singers, setSingers] = useState<Singer[]>([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch dynamic active songs count
      const { count: songCount } = await supabase
        .from("songs")
        .select("*", { count: "exact", head: true });
      setTotalSongs(songCount ?? 0);

      // Fetch dynamic singers list directly from Supabase
      const { data: singersData, error } = await supabase
        .from("singers")
        .select("id, name, nickname, voice_type, notes");

      if (error) {
        console.error("Error loading singers for Dashboard:", error);
        return;
      }

      if (singersData) {
        setSingers(
          singersData.map((record) => ({
            id: record.id,
            name: record.name,
            nickname: record.nickname ?? "",
            voiceType: (record.voice_type as VoiceType) ?? "male",
            notes: record.notes ?? "",
          }))
        );
      }
    };

    fetchData();
  }, []);

  const handleQuickAction = (action: typeof quickActions[number]["action"]) => {
    switch (action) {
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
        {/* Dynamic Neumorphic Stats */}
        <div>
          <DashboardStats
            totalSongs={totalSongs}
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
      </div>
    </div>
  );
}