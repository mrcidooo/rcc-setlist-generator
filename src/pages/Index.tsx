"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/home/Header";
import { DashboardStats } from "@/components/home/DashboardStats";
import { TeamMembers } from "@/components/home/TeamMembers";
import { UserPlus, Library, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

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

/* -----------------------------------------------------------------
   Hook: capture the native PWA install prompt and expose a trigger
   ----------------------------------------------------------------- */
function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault(); // stop the default mini‑infobar
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    // @ts-ignore – the event has a prompt() method
    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    return outcome;
  };

  return { canInstall, promptInstall };
}

/* -----------------------------------------------------------------
   Home page component
   ----------------------------------------------------------------- */
export default function Index() {
  const [singers, setSingers] = useState<Singer[]>([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const { toast } = useToast();

  const { canInstall, promptInstall } = useInstallPrompt();

  useEffect(() => {
    const fetchData = async () => {
      const { count: songCount } = await supabase
        .from("songs")
        .select("*", { count: "exact", head: true });
      setTotalSongs(songCount ?? 0);

      const { data: singersData, error } = await supabase
        .from("singers")
        .select("id, name, nickname, voice_type, notes");

      if (error) {
        console.error("Error loading singers for Dashboard:", error);
        return;
      }

      if (singersData) {
        setSingers(
          singersData.map((record: any) => ({
            id: record.id,
            name: record.name,
            nickname: record.nickname ?? "",
            voiceType: (record.voice_type as VoiceType) ?? "male",
            notes: record.notes ?? "",
          })),
        );
      }
    };

    fetchData();
  }, []);

  const handleQuickAction = (action: typeof quickActions[number]["action"]) => {
    switch (action) {
      case "singer":
        toast({
          title: "Team singer management available under 'Singers' tab",
          description: "Use singers navigation to add team members.",
        });
        break;
      case "setlist":
        toast({
          title: "Setlist building workflow ready!",
          description: "Press the central calendar action button to open.",
        });
        break;
      case "pdf":
        toast({
          title: "PDF generation is automated in Setlists!",
          description: "Choose any setlist to instantly download high-quality PDFs.",
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-32 flex flex-col px-4 sm:px-6 md:px-8 max-w-2xl mx-auto">
      {/* Premium Header */}
      <Header />

      <div className="flex-1 space-y-6">
        {/* Dynamic Neumorphic Stats */}
        <DashboardStats totalSongs={totalSongs} totalSingers={singers.length} />

        {/* Team profiles */}
        <TeamMembers singers={singers} getLabel={getVoiceTypeLabel} />
      </div>

      {/* Install to Device button – always shown at the bottom if supported */}
      {canInstall && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="default"
            onClick={async () => {
              const outcome = await promptInstall();
              if (outcome === "accepted") {
                toast({ title: "App installed!", description: "Enjoy using RCC Setlist Generator offline." });
              } else {
                toast({ title: "Install cancelled", description: "You can install later from the browser menu." });
              }
            }}
            className="flex items-center gap-2 rounded-[18px] bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] font-bold px-6 py-2"
          >
            <Download className="h-4 w-4" />
            Install to Device
          </Button>
        </div>
      )}
    </div>
  );
}