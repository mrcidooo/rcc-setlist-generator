"use client";

import { useState, useEffect } from "react";
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
import { Music, Trash2, Users, Sliders, KeyRound, Save } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Singer = {
  id: string;
  name: string;
};

type Song = {
  id: string;
  title: string;
};

export default function SingerKeyPreferences() {
  const [singers, setSingers] = useState<Singer[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [singerKeyData, setSingerKeyData] = useState<
    Record<string, Record<string, string>>
  >({});

  const { toast } = useToast();

  useEffect(() => {
    const loadSupabaseData = async () => {
      // Load singers
      const { data: singersData, error: singersError } = await supabase
        .from("singers")
        .select("id, name");

      if (singersError) {
        console.error("Error loading singers for keys:", singersError);
      } else if (singersData) {
        setSingers(singersData);
      }

      // Load songs
      const { data: songsData, error: songsError } = await supabase
        .from("songs")
        .select("id, title");

      if (songsError) {
        console.error("Error loading songs for keys:", songsError);
      } else if (songsData) {
        setSongs(songsData);
      }

      // Load matrix data from Supabase if it exists (fallback to localStorage)
      const { data: matrixData, error: matrixError } = await supabase
        .from("key_matrix")
        .select("matrix, user_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "public")
        .single();

      if (!matrixError && matrixData?.matrix) {
        setSingerKeyData(matrixData.matrix as Record<string, Record<string, string>>);
      } else {
        // If no DB entry, try localStorage (preserves previous behaviour)
        const storedMatrix = localStorage.getItem("vocal_key_matrix");
        if (storedMatrix) {
          try {
            const parsed = JSON.parse(storedMatrix);
            const normalized: Record<string, Record<string, string>> = {};
            Object.keys(parsed).forEach((songId) => {
              normalized[songId] = {};
              Object.keys(parsed[songId]).forEach((singerId) => {
                normalized[songId][singerId] = String(parsed[songId][singerId] || "");
              });
            });
            setSingerKeyData(normalized);
          } catch (e) {
            console.error("Error parsing stored keys matrix:", e);
          }
        }
      }
    };

    loadSupabaseData();
  }, []);

  const getKeyForSinger = (songId: string, singerId: string) => {
    return singerKeyData[songId]?.[singerId] ?? "";
  };

  const handleKeyChange = (songId: string, singerId: string, value: string) => {
    const updated = {
      ...singerKeyData,
      [songId]: {
        ...(singerKeyData[songId] ?? {}),
        [singerId]: value,
      },
    };
    setSingerKeyData(updated);
  };

  const handleSaveMatrix = async () => {
    // Persist to localStorage (keeps legacy behaviour)
    localStorage.setItem("vocal_key_matrix", JSON.stringify(singerKeyData));

    // Persist to Supabase
    const user = (await supabase.auth.getUser()).data.user;
    const userId = user?.id ?? "public"; // fallback if not logged in

    const payload = {
      user_id: userId,
      matrix: singerKeyData,
    };

    const { error } = await supabase.from("key_matrix").upsert(payload, {
      onConflict: "user_id",
    });

    if (error) {
      toast({
        title: "Matrix save failed",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Matrix Saved Successfully",
      description: "Comfort key preferences have been stored for all team vocalists.",
    });
  };

  const handleDeleteSinger = async (singer: Singer) => {
    const confirmed = window.confirm(
      `Delete ${singer.name}? This will remove them from the database.`,
    );

    if (!confirmed) return;

    const { error } = await supabase.from("singers").delete().eq("id", singer.id);
    if (error) {
      toast({ title: "Failed to delete singer", description: error.message });
      return;
    }

    setSingers((current) =>
      current.filter((currentSinger) => currentSinger.id !== singer.id),
    );

    toast({
      title: "Singer removed",
      description: `${singer.name} was removed from the key list.`,
    });
  };

  const handleDeleteSong = async (song: Song) => {
    const confirmed = window.confirm(
      `Delete "${song.title}"? This will remove it from the database.`,
    );

    if (!confirmed) return;

    const { error } = await supabase.from("songs").delete().eq("id", song.id);
    if (error) {
      toast({ title: "Failed to delete song", description: error.message });
      return;
    }

    setSongs((current) =>
      current.filter((currentSong) => currentSong.id !== song.id),
    );

    toast({
      title: "Song removed",
      description: `"${song.title}" was removed from the key list.`,
    });
  };

  return (
    <div className="space-y-6 px-4 py-6 max-w-4xl mx-auto pb-32">
      <div className="px-1 mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <KeyRound className="h-6 w-6 text-indigo-500 animate-pulse" />
          Vocal Key Matrix
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define and track key preferences for worship team singers to ensure stress‑free vocals.
        </p>
      </div>

      <section id="singers" className="scroll-mt-24">
        <Card className="neu-card border-0 bg-white/75 dark:bg-card/75">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Users className="h-5 w-5 text-indigo-500" />
                  Singers Configuration
                </CardTitle>
                <CardDescription>
                  Team vocalists mapped to dynamic service components.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-[12px] bg-indigo-500/10 text-indigo-500 px-3 py-1 font-bold">
                {singers.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {singers.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No active singers registered.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {singers.map((singer) => (
                  <div
                    key={singer.id}
                    className="flex items-center justify-between rounded-[20px] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-bold text-foreground text-sm">{singer.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Comfortable key mapped
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${singer.name}`}
                      onClick={() => handleDeleteSinger(singer)}
                      className="h-9 w-9 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section id="songs" className="scroll-mt-24">
        <Card className="neu-card border-0 bg-white/75 dark:bg-card/75">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Music className="h-5 w-5 text-purple-500" />
                  Active Songs Index
                </CardTitle>
                <CardDescription>
                  Registered tracklist representing worship libraries.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="rounded-[12px] bg-purple-500/10 text-purple-500 px-3 py-1 font-bold">
                {songs.length} Tracks
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {songs.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No songs registered.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between rounded-[20px] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-bold text-foreground text-sm">{song.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Singer matrix enabled
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${song.title}`}
                      onClick={() => handleDeleteSong(song)}
                      className="h-9 w-9 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section id="comfortable-keys" className="scroll-mt-24">
        <Card className="neu-card border-0 bg-white/75 dark:bg-card/75 overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-500" />
                <div>
                  <CardTitle className="text-lg font-bold">Interactive Key Matrix</CardTitle>
                  <CardDescription>
                    Manage comfort zones directly by changing values inline.
                  </CardDescription>
                </div>
              </div>
              {singers.length > 0 && songs.length > 0 && (
                <Button
                  onClick={handleSaveMatrix}
                  className="h-10 rounded-[18px] bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] font-bold px-5 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Save className="h-4 w-4" />
                  Save Matrix
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {singers.length === 0 || songs.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border p-8 text-center text-sm text-muted-foreground m-4">
                Configure both singers and songs to unlock the matrix database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-black/5 dark:divide-white/5">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.02]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Song
                      </th>
                      {singers.map((singer) => (
                        <th
                          key={singer.id}
                          className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          {singer.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5 bg-transparent">
                    {songs.map((song) => (
                      <tr key={song.id} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-foreground">
                          {song.title}
                        </td>
                        {singers.map((singer) => (
                          <td key={`${song.id}-${singer.id}`} className="px-6 py-4 text-center">
                            <Input
                              value={getKeyForSinger(song.id, singer.id)}
                              onChange={(event) =>
                                handleKeyChange(song.id, singer.id, event.target.value)
                              }
                              className="h-10 w-16 text-center font-extrabold text-indigo-500 dark:text-indigo-400 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:border-indigo-500 inline-block"
                              placeholder="-"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}