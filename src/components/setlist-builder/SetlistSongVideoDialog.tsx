"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Music,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Sliders,
} from "lucide-react";
import { transposeLyrics } from "@/utils/transposer";

type SongPreviewData = {
  title: string;
  originalKey: string;
  lyrics?: string;
  youtubeLink?: string;
};

type SetlistSongVideoDialogProps = {
  song: SongPreviewData | null;
  open: boolean;
  onClose: () => void;
};

const keysArray = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export default function SetlistSongVideoDialog({
  song,
  open,
  onClose,
}: SetlistSongVideoDialogProps) {
  if (!song) return null;

  const [currentKey, setCurrentKey] = useState<string>(song.originalKey);

  // Reset currentKey when song changes
  useEffect(() => {
    if (song) {
      setCurrentKey(song.originalKey);
    }
  }, [song]);

  const handleShiftKey = (direction: "up" | "down") => {
    const currentIndex = keysArray.indexOf(currentKey);
    if (currentIndex < 0) return;

    let nextIndex = direction === "up" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= keysArray.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = keysArray.length - 1;

    setCurrentKey(keysArray[nextIndex]);
  };

  const transposedLyrics = song.lyrics
    ? transposeLyrics(song.lyrics, song.originalKey, currentKey)
    : "";

  const formatLyricsWithMarkup = (lyricsText: string) => {
    if (!lyricsText.trim()) {
      return (
        <p className="text-xs text-muted-foreground italic text-center py-6">
          No lyrics available for this song.
        </p>
      );
    }

    return lyricsText.split("\n").map((line, idx) => {
      const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);
      return (
        <p key={idx} className="min-h-[1.5rem] leading-relaxed whitespace-pre-wrap font-mono text-sm">
          {parts.map((part, i) => {
            if (/^\[[^\]]+\]$/.test(part)) {
              return (
                <span
                  key={i}
                  className="text-indigo-500 dark:text-indigo-400 font-extrabold text-[12px] bg-indigo-500/10 px-1.5 py-0.5 rounded-[6px] mx-0.5 inline-block"
                >
                  {part.replace(/[\[\]]/g, "")}
                </span>
              );
            }
            if (/^<[^>]+>$/.test(part)) {
              return (
                <span
                  key={i}
                  className="text-purple-600 dark:text-purple-300 font-black text-[11px] bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider mx-1 inline-block border border-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                >
                  {part.replace(/[<>]/g, "")}
                </span>
              );
            }
            return <React.Fragment key={i}>{part}</React.Fragment>;
          })}
        </p>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl">
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <Music className="h-5 w-5 text-indigo-500" />
              {song.title}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Audio & Lyrics
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* YouTube Video Section */}
          <div className="rounded-[24px] border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-foreground">YouTube Audio</span>
              {song.youtubeLink ? (
                <span className="text-xs text-muted-foreground">
                  (Click to play audio)
                </span>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  No YouTube link available
                </span>
              )}
            </div>
            {song.youtubeLink ? (
              <div className="relative w-full h-0 pb-[56.25%]">
                {/* Responsive 16:9 iframe */}
                <iframe
                  className="absolute inset-0 w-full h-full border-0"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(
                    song.youtubeLink
                  )}?autoplay=1&mute=1&controls=0&showinfo=0&modestbranding=1&rel=0`}
                  title="YouTube video"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No video available
              </div>
            )}
          </div>

          {/* Transposition Controls */}
          <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-[20px]">
            <div>
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5" /> Performance Key
              </span>
              <div className="text-lg font-black text-foreground mt-1">Key of {currentKey}</div>
              {currentKey !== song.originalKey && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  Transposed from {song.originalKey}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShiftKey("up")}
                className="h-8 w-8 rounded-[8px] hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Transpose Up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShiftKey("down")}
                className="h-8 w-8 rounded-[8px] hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Transpose Down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lyrics Section */}
          <div className="mt-4">
            <div className="mb-2 font-semibold text-foreground">
              Lyrics
            </div>
            <div className="max-h-[60vh] overflow-y-auto rounded-[24px] bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 p-4">
              {formatLyricsWithMarkup(transposedLyrics)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper to extract YouTube ID from various URL formats
function extractYouTubeId(url: string): string | null {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}