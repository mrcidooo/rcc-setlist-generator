"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  ListMusic,
  Music,
  Trash2,
  Users,
} from "lucide-react";
import type { MoveDirection, SetlistSong } from "./types";

type SetlistSongListProps = {
  songs: SetlistSong[];
  onRemoveSong: (id: string) => void;
  onMoveSong: (id: string, direction: MoveDirection) => void;
};

export default function SetlistSongList({
  songs,
  onRemoveSong,
  onMoveSong,
}: SetlistSongListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Song Order</CardTitle>
        <CardDescription>
          Reorder songs, adjust keys, and remove items from the setlist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {songs.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <ListMusic className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No songs added yet</p>
            <p className="text-sm text-muted-foreground">
              Use the form above to add songs to this setlist.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {songs.map((songItem) => (
              <div
                key={songItem.id}
                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {songItem.order}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {songItem.songTitle}
                      </h3>
                      <Badge variant="secondary">{songItem.originalKey}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {songItem.singerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Music className="h-3.5 w-3.5" />
                        Key: {songItem.selectedKey}
                      </span>
                    </div>
                    {songItem.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {songItem.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveSong(songItem.id, "up")}
                    disabled={songItem.order === 1}
                  >
                    <ArrowUp className="mr-1 h-4 w-4" />
                    Up
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMoveSong(songItem.id, "down")}
                    disabled={songItem.order === songs.length}
                  >
                    <ArrowDown className="mr-1 h-4 w-4" />
                    Down
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onRemoveSong(songItem.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}