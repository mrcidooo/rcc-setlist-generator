"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Music, Search, KeyRound, Save, X, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Singer = {
  id: string;
  name: string;
  voiceType: "male" | "female";
};

type Song = {
  id: string;
  title: string;
  originalKey: string;
};

type KeyAssignment = {
  [singerId: string]: string;
};

export default function SingerKeyList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [singers, setSingers] = useState<Singer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [keyAssignments, setKeyAssignments] = useState<KeyAssignment>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");
  const { toast } = useToast();
  const isInitialLoad = useRef(true);

  // Load songs and singers from Supabase
  useEffect(() => {
    const loadData = async () => {
      // Load singers
      const { data: singersData, error: singersError } = await supabase
        .from("singers")
        .select("id, name, voice_type");
      if (!singersError && singersData) {
        setSingers(
          singersData.map((r: any) => ({
            id: r.id,
            name: r.name,
            voiceType: r.voice_type as "male" | "female",
          }))
        );
      }

      // Load songs
      const { data: songsData, error: songsError } = await supabase
        .from("songs")
        .select("id, title, original_key");
      if (!songsError && songsData) {
        setSongs(
          songsData.map((r: any) => ({
            id: r.id,
            title: r.title,
            originalKey: r.original_key || "C",
          }))
        );
      }

      isInitialLoad.current = false;
    };
    loadData();
  }, []);

  // Load key matrix for selected song when modal opens
  useEffect(() => {
    if (isModalOpen && selectedSong) {
      loadKeyMatrixForSong(selectedSong.id);
    }
  }, [isModalOpen, selectedSong]);

  const loadKeyMatrixForSong = async (songId: string) => {
    const { data: authUser } = await supabase.auth.getUser();
    const userId = authUser?.user?.id ?? getAnonymousUserId();

    const { data: matrixData, error } = await supabase
      .from("key_matrix")
      .select("matrix")
      .eq("user_id", userId)
      .single();

    if (!error && matrixData?.matrix) {
      const matrix = matrixData.matrix as Record<string, Record<string, string>>;
      setKeyAssignments(matrix[songId] || {});
    } else {
      setKeyAssignments({});
    }
  };

  const getAnonymousUserId = (): string => {
    const storageKey = "vocal_key_user";
    let id = localStorage.getItem(storageKey);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(storageKey, id);
    }
    return id;
  };

  const filteredSongs = songs.filter((song) =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
    setIsModalOpen(true);
  };

  const handleKeyChange = (singerId: string, value: string) => {
    setKeyAssignments((prev) => ({
      ...prev,
      [singerId]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedSong) return;

    setSyncStatus("syncing");
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const userId = authUser?.user?.id ?? getAnonymousUserId();

      // Load existing matrix
      const { data: existingData, error: loadError } = await supabase
        .from("key_matrix")
        .select("matrix")
        .eq("user_id", userId)
        .single();

      let currentMatrix: Record<string, Record<string, string>> = {};
      if (!loadError && existingData?.matrix) {
        currentMatrix = existingData.matrix as Record<string, Record<string, string>>;
      }

      // Update the matrix for this song
      const updatedMatrix = {
        ...currentMatrix,
        [selectedSong.id]: keyAssignments,
      };

      // Delete existing and insert new
      await supabase.from("key_matrix").delete().eq("user_id", userId);

      const { error: insertError } = await supabase
        .from("key_matrix")
        .insert({
          user_id: userId,
          matrix: updatedMatrix,
        });

      if (insertError) {
        setSyncStatus("error");
        toast({ title: "Save failed", description: insertError.message });
        return;
      }

      setSyncStatus("synced");
      toast({ title: "Keys saved", description: `Key assignments for "${selectedSong.title}" saved.` });
      setIsModalOpen(false);
    } catch (err) {
      setSyncStatus("error");
      toast({ title: "Save failed", description: "An unexpected error occurred." });
    }
  };

  const keysArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  return (
    <div className="min-h-screen bg-transparent p-4 pb-32 max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
            Singer Key Assignments
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Click a song to assign comfortable keys for each singer.
        </p>
      </header>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search songs..."
          className="pl-10 h-11 rounded-full bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
        />
      </div>

      {/* Songs list */}
      <div className="space-y-3">
        {filteredSongs.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-black/10 dark:border-white/10 p-12 text-center bg-black/[0.01]">
            <Music className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60 animate-pulse" />
            <p className="font-bold">No songs found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching for a different song title.
            </p>
          </div>
        ) : (
          filteredSongs.map((song) => (
            <Card
              key={song.id}
              onClick={() => handleSongClick(song)}
              className="neu-card border-0 bg-white/75 dark:bg-card/75 hover:translate-x-1 duration-300 cursor-pointer"
            >
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-bold text-foreground text-sm tracking-tight">{song.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Original Key: <span className="font-bold text-indigo-500">{song.originalKey}</span>
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-[12px] bg-indigo-500/10 text-indigo-500 px-3 py-1 font-bold border-0">
                  Assign Keys
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Key Assignment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl">
          <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                <Music className="h-5 w-5 text-indigo-500" />
                Assign Keys for "{selectedSong?.title}"
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set comfortable keys for each singer on this song.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
              className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {singers.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No singers registered. Add singers first to assign keys.
              </div>
            ) : (
              <div className="space-y-3">
                {singers.map((singer) => {
                  const initials = singer.name.split(" ").map(n => n[0]).join("").toUpperCase();
                  const isFemale = singer.voiceType === "female";

                  return (
                    <div
                      key={singer.id}
                      className="flex items-center justify-between rounded-[20px] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-[16px] text-xs font-bold ${
                          isFemale 
                            ? "bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/10" 
                            : "bg-blue-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10"
                        }`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{singer.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {isFemale ? "Female" : "Male"} • {singer.voiceType === "female" ? "Soprano/Alto" : "Tenor/Bass"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key:</span>
                        <select
                          value={keyAssignments[singer.id] || ""}
                          onChange={(e) => handleKeyChange(singer.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-[12px] border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-bold text-indigo-500 min-w-[60px] text-center"
                        >
                          <option value="">-</option>
                          {keysArray.map((k) => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5 mt-4">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={syncStatus === "syncing"}
                className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] font-bold px-5 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {syncStatus === "syncing" ? "Saving..." : "Save Keys"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}