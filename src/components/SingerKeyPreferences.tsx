"use client";

import { useState } from "react";
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
import { Music, Trash2, Users, Sliders, KeyRound } from "lucide-react";

type Singer = {
  id: string;
  name: string;
};

type Song = {
  id: string;
  title: string;
};

const initialSingers: Singer[] = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Mike Davis" },
];

const initialSongs: Song[] = [
  { id: "1", title: "Way Maker" },
  { id: "2", title: "Goodness of God" },
  { id: "3", title: "What A Beautiful Name" },
  { id: "4", title: "Reckless Love" },
  { id: "5", title: "Gratitude" },
];

const initialKeyData: Record<string, Record<string, string>> = {
  "1": { "1": "D", "2": "F", "3": "C" },
  "2": { "1": "G", "2": "B", "3": "E" },
  "3": { "1": "D", "2": "F#", "3": "B" },
  "4": { "1": "G", "2": "B", "3": "D" },
  "5": { "1": "A", "2": "C#", "3": "F#" },
};

export default function SingerKeyPreferences() {
  const [singers, setSingers] = useState<Singer[]>(initialSingers);
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [singerKeyData, setSingerKeyData] = useState<
    Record<string, Record<string, string>>
  >(initialKeyData);

  const { toast } = useToast();

  const getKeyForSinger = (songId: string, singerId: string) => {
    return singerKeyData[songId]?.[singerId] ?? "";
  };

  const handleDeleteSinger = (singer: Singer) => {
    const confirmed = window.confirm(
      `Delete ${singer.name}? This will remove their comfortable keys from every song.`,
    );

    if (!confirmed) return;

    setSingers((current) =>
      current.filter((currentSinger) => currentSinger.id !== singer.id),
    );

    setSingerKeyData((current) => {
      const next: Record<string, Record<string, string>> = {};

      Object.keys(current).forEach((songId) => {
        const remainingKeys: Record<string, string> = {};

        Object.keys(current[songId]).forEach((currentSingerId) => {
          if (currentSingerId !== singer.id) {
            remainingKeys[currentSingerId] = current[songId][currentSingerId];
          }
        });

        next[songId] = remainingKeys;
      });

      return next;
    });

    toast({
      title: "Singer removed",
      description: `${singer.name} was removed from the key list.`,
    });
  };

  const handleDeleteSong = (song: Song) => {
    const confirmed = window.confirm(
      `Delete "${song.title}"? This will remove all comfortable keys for this song.`,
    );

    if (!confirmed) return;

    setSongs((current) =>
      current.filter((currentSong) => currentSong.id !== song.id),
    );

    setSingerKeyData((current) => {
      const next: Record<string, Record<string, string>> = {};

      Object.keys(current).forEach((songId) => {
        if (songId !== song.id) {
          next[songId] = current[songId];
        }
      });

      return next;
    });

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
          Define and track key preferences for worship team singers to ensure stress-free vocals.
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
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-indigo-500" />
              <div>
                <CardTitle className="text-lg font-bold">Interactive Key Matrix</CardTitle>
                <CardDescription>
                  Manage comfort zones directly by changing values inline.
                </CardDescription>
              </div>
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
                              onChange={(event) => {
                                setSingerKeyData((current) => ({
                                  ...current,
                                  [song.id]: {
                                    ...(current[song.id] ?? {}),
                                    [singer.id]: event.target.value.toUpperCase(),
                                  },
                                }));
                              }}
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