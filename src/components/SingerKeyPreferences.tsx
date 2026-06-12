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
import { Music, Trash2, Users } from "lucide-react";

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
    <div className="space-y-6">
      <section id="singers" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Singers
                </CardTitle>
                <CardDescription>
                  Each singer becomes a column in the key matrix below.
                </CardDescription>
              </div>
              <Badge variant="secondary">{singers.length} singers</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {singers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No singers available yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {singers.map((singer) => (
                  <div
                    key={singer.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{singer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {Object.keys(singerKeyData).length} songs tracked
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${singer.name}`}
                      onClick={() => handleDeleteSinger(singer)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section id="songs" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Songs
                </CardTitle>
                <CardDescription>
                  Each song becomes a row in the key matrix below.
                </CardDescription>
              </div>
              <Badge variant="secondary">{songs.length} songs</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {songs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No songs available yet.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{song.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {singers.length} singer keys available
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${song.title}`}
                      onClick={() => handleDeleteSong(song)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section id="comfortable-keys" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Comfortable Key Matrix</CardTitle>
              <CardDescription>
                View and edit each singer&apos;s comfortable key for every song.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {singers.length === 0 || songs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Add singers and songs to build the key matrix.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Song
                      </th>
                      {singers.map((singer) => (
                        <th
                          key={singer.id}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {singer.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {songs.map((song) => (
                      <tr key={song.id} className="hover:bg-muted/40">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground">
                          {song.title}
                        </td>
                        {singers.map((singer) => (
                          <td key={`${song.id}-${singer.id}`} className="px-4 py-3">
                            <Input
                              value={getKeyForSinger(song.id, singer.id)}
                              onChange={(event) => {
                                setSingerKeyData((current) => ({
                                  ...current,
                                  [song.id]: {
                                    ...(current[song.id] ?? {}),
                                    [singer.id]: event.target.value,
                                  },
                                }));
                              }}
                              className="h-9 w-16 text-center"
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