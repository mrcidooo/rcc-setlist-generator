"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/home/Header";
import { DashboardStats } from "@/components/home/DashboardStats";
import { TeamMembers } from "@/components/home/TeamMembers";
import { UserPlus, Library, FileText, Download, Share, Plus, X, Share as ShareIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import WelcomeSplash from "@/components/WelcomeSplash";

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
   Home page component
   ----------------------------------------------------------------- */
export default function Index() {
  const [singers, setSingers] = useState<Singer[]>([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const { toast } = useToast();

  // Control splash visibility
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

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

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast({
          title: "App installed!",
          description: "Enjoy using Worship Setlist Generator offline.",
        });
      }
      setDeferredPrompt(null);
    } else {
      // Native one‑click is not available (e.g. iOS Safari, or already installed). Show the custom step‑by‑step visual helper!
      setIsInstallGuideOpen(true);
    }
  };

  // Hide splash once the page is ready
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-transparent pb-32 flex flex-col px-4 sm:px-6 md:px-8 max-w-2xl mx-auto">
      {/* Show premium splash while loading */}
      {showSplash && <WelcomeSplash />}

      {/* Dynamic Neumorphic Stats */}
      <DashboardStats totalSongs={totalSongs} totalSingers={singers.length} />

      {/* Team profiles */}
      <TeamMembers singers={singers} getLabel={getVoiceTypeLabel} />

      {/* Install to Device Button (Always Visible) */}
      <div className="mt-8 flex justify-center">
        <Button
          onClick={handleInstallClick}
          className="flex items-center gap-2 rounded-[22px] bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-[0_4px_18px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform duration-300 font-bold px-8 py-5 text-sm"
        >
          <Download className="h-4.5 w-4.5 animate-bounce" />
          Install App to Home Screen
        </Button>
      </div>

      {/* Elegant, step‑by‑step install guide dialog */}
      <Dialog open={isInstallGuideOpen} onOpenChange={setIsInstallGuideOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <Download className="h-5 w-5 text-indigo-500" />
                Add to Home Screen
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Follow these simple steps to run as a standalone, seamless app.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsInstallGuideOpen(false)}
              aria-label="Close guide"
              className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-5 mt-6">
            {/* iOS Safari Guide */}
            <div className="rounded-[24px] border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] p-4.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-wider">
                Apple iOS (iPhone / iPad)
              </div>
              <ol className="text-xs space-y-2 text-foreground/85 list-decimal pl-4.5">
                <li>Open this page in the <strong className="font-extrabold text-foreground">Safari Browser</strong>.</li>
                <li>
                  Tap the <span className="inline-flex items-center gap-1 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-bold"><ShareIcon className="h-3 w-3 inline" /> Share</span> button at the bottom of the screen.</li>
                <li>
                  Scroll down the share sheet and tap <span className="inline-flex items-center gap-1 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded font-bold"><Plus className="h-3 w-3 inline" /> Add to Home Screen</span>.</li>
              </ol>
            </div>

            {/* Android / Chrome Guide */}
            <div className="rounded-[24px] border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] p-4.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-500 uppercase tracking-wider">
                Android / Google Chrome
              </div>
              <ol className="text-xs space-y-2 text-foreground/85 list-decimal pl-4.5">
                <li>Tap the three vertical dots (menu icon) on Chrome's top‑right corner.</li>
                <li>
                  Select <strong className="font-bold text-foreground">Add to Home screen</strong> or <strong className="font-bold text-foreground">Install App</strong>.</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}