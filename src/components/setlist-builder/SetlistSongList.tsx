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
import {
  ArrowDown,
  ArrowUp,
  ListMusic,
  Music,
  Trash2,
  Users,
  Eye,
} from "lucide-react";
import type { MoveDirection, SetlistSong } from "./types";
import { transposeLyrics } from "@/utils/transposer";
import SetlistSongVideoDialog from "./SetlistSongVideoDialog";
import { supabase } from "@/lib/supabaseClient";

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
  const [lyricsCache, setLyricsCache] = useState<Record<string, string>>({});
  const [youtubeLinks, setYoutubeLinks] = useState<Record<string, string>>({});
  const [previewingSong, setPreviewingSong] = useState<{
    title: string;
    originalKey: string;
    lyrics?: string;
    youtubeLink?: string;
  } | null>(null);

  // Load the full song details (lyrics and youtube link) dynamically so we can transpose them and show video
  useEffect(() => {
    const fetchAllDetails = async () => {
      const songIds = songs.map(s => s.songId);
      if (songIds.length === 0) return;

      const { data, error } = await supabase
        .from("songs")
        .select("id, lyrics, youtube_link")
        .in("id", songIds);

      if (!error && data) {
        const lyricsCache: Record<string, string> = {};
        const youtubeLinks: Record<string, string> = {};
        data.forEach((r: any) => {
          lyricsCache[String(r.id)] = r.lyrics || "";
          youtubeLinks[String(r.id)] = r.youtube_link || "";
        });
        setLyricsCache(lyricsCache);
        setYoutubeLinks(youtubeLinks);
      }
    };

    fetchAllDetails();
  }, [songs]);

  const handlePreviewTransposed = (songItem: SetlistSong) => {
    const rawLyrics = lyricsCache[songItem.songId] || "";
    const youtubeLink = youtubeLinks[songItem.songId] || "";
    // Transpose based on comfort key vs original key
    const transposedLyrics = transposeLyrics(
      rawLyrics,
      songItem.originalKey,
      songItem.selectedKey
    );

    setPreviewingSong({
      title: `${songItem.songTitle} (${songItem.singerName}'s comfortable key)`,
      originalKey: songItem.originalKey,
      lyrics: transposedLyrics,
      youtubeLink: youtubeLink,
    });
  };

  return (
    <>
      <Card className="neu-card border-0 bg-white/75 dark:bg-card/75">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Worship Sequence Order</CardTitle>
          <CardDescription>
            Organize track order, view matched keys, and manage items in the set.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {songs.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-black/10 dark:border-white/10 p-12 text-center bg-black/[0.01]">
              <ListMusic className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60 animate-bounce" />
              <p className="font-bold text-foreground">No Tracks Added Yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Choose 'Add Song to Setlist' above to construct your worship experience.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map((songItem) => (
                <div
                  key={songItem.id}
                  className="flex flex-col gap-4 rounded-[22px] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-indigo-500/5 duration-300 transition-colors"
                  onClick={() => handlePreviewTransposed(songItem)} // Make the whole row clickable
                >
                  <div className="flex items-start gap-3">
                    {/* Glowing step circle */} 
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[18px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-extrabold text-sm border border-indigo-500/15 shadow-inner">
                      {songItem.order}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-foreground text-sm tracking-tight">
                          {songItem.songTitle}
                        </h3>
                        <Badge variant="secondary" className="rounded-[8px] bg-black/10 dark:bg-white/10 text-foreground font-semibold text-[10px]">
                          Orig: {songItem.originalKey}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <Users className="h-3.5 w-3.5 text-indigo-400" />
                          {songItem.singerName}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-indigo-500 dark:text-indigo-400">
                          <Music className="h-3.5 w-3.5" />
                          Comfortable Key: {songItem.selectedKey}
                        </span>
                      </div>
                      {songItem.notes && (
                        <p className="mt-2 text-xs text-muted-foreground/80 italic bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/5">
                          Note: {songItem.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl w-fit">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking button
                        handlePreviewTransposed(songItem);
                      }}
                      className="h-8 rounded-[10px] text-[11px] font-bold text-indigo-500 hover:bg-indigo-500/10"
                    >
                      <Eye className="mr-0.5 h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSong(songItem.id, "up");
                      }}
                      disabled={songItem.order === 1}
                      className="h-8 rounded-[10px] text-[11px] font-semibold hover:bg-white/50 dark:hover:bg-white/10"
                    >
                      <ArrowUp className="mr-0.5 h-3.5 w-3.5" />
                      Up
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSong(songItem.id, "down");
                      }}
                      disabled={songItem.order === songs.length}
                      className="h-8 rounded-[10px] text-[11px] font-semibold hover:bg-white/50 dark:hover:bg-white/10"
                    >
                      <ArrowDown className="mr-0.5 h-3.5 w-3.5" />
                      Down
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-[10px] text-[11px] font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSong(songItem.id);
                      }}
                    >
                      <Trash2 className="mr-0.5 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SetlistSongVideoDialog
        song={previewingSong}
        open={previewingSong !== null}
        onClose={() => setPreviewingSong(null)}
      />
    </>
  );
}