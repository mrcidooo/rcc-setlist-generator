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
import { Upload, UserPlus, Library, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NeumorphicCard } from "@/components/ui/NeumorphicCard";

type VoiceType = "male" | "female";

type Singer = {
  id: string;
  name: string;
  nickname: string;
  voiceType: VoiceType;
  notes: string;
};

const quickActions = [
  { title: "Upload Song", icon: Upload, color: "bg-indigo-600", action: "upload" as const },
  { title: "Add Singer", icon: UserPlus, color: "bg-indigo-500", action: "singer" as const },
  { title: "Create Setlist", icon: Library, color: "bg-indigo-400", action: "setlist" as const },
  { title: "Generate PDF", icon: FileText, color: "bg-indigo-300", action: "pdf" as const },
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

  const handleQuickAction = (action: typeof quickActions[number]["action"]) => {
    switch (action) {
      case "upload":
        toast({ title: "Upload dialog would open", description: "" });
        break;
      case "singer":
        toast({ title: "Add Singer dialog would open", description: "" });
        break;
      case "setlist":
        toast({ title: "Setlist dialog would open", description: "" });
        break;
      case "pdf":
        toast({ title: "PDF generation coming soon", description: "" });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 pb-20 flex flex-col mobile-px">
      <Header />

      <div className="flex-1 py-6">
        {/* Dashboard stats – wrapped in neumorphic card */}
        <NeumorphicCard className="mb-6">
          <DashboardStats
            totalSongs={42}
            upcomingSetlists={5}
            recentAdded={3}
            totalSingers={singers.length}
          />
        </NeumorphicCard>

        <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
        <QuickActions actions={quickActions as any} onAction={handleQuickAction} />

        <TeamMembers singers={singers} getLabel={getVoiceTypeLabel} />

        <RecentSongs />
      </div>

      <footer className="mt-auto">
        <MadeWithDyad />
      </footer>
    </div>
  );
}