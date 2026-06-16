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
  Clock, 
  BookOpen, 
  Sliders,
  Tags
} from "lucide-react";
import { transposeLyrics } from "@/utils/transposer";
import { type Song } from "./SongCard";

type SongDetailsDialogProps = {
  song: Song | null;
  open: boolean;
  onClose: () => void;
};

const keysArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function SongDetailsDialog({
  song,
  open,
  onClose,
}: SongDetailsDialogProps) {
  const [currentKey, setCurrentKey] = useState<string>("");

  // Update current key when song changes
  useEffect(() => {
    if (song) {
      setCurrentKey((song.originalKey || "C").trim());
    }
  }, [song]);

  if (!song) return null;

  const handleShiftKey = (direction: "up" | "down") => {
    const currentIndex = keysArray.indexOf(currentKey);
    if (currentIndex < 0) return;

    let nextIndex = direction === "up" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= keysArray.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = keysArray.length - 1;

    setCurrentKey(keysArray[nextIndex]);
  };

  const transposedLyrics = transposeLyrics(song.lyrics || "", song.originalKey, currentKey);

  const formatLyricsWithMarkup = (lyricsText: string) => {
    if (!lyricsText.trim()) {
      return (
        <p className="text-xs text-muted-foreground italic text-center py-6">
          No performance lyrics or chord markings mapped for this song.
        </p>
      );
    }

    return lyricsText.split("\n").map((line, idx) => {
      const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);
      return (
        <p key={idx} className="min-h-[1.5rem] leading-relaxed whitespace-pre-wrap font-mono text-xs text-foreground">
          {parts.map((part, i) => {
            if (/^\[[^\]]+\]$/.test(part)) {
              return (
                <span
                  key={i}
                  className="text-indigo-500 dark:text-indigo-400 font-extrabold text-[11px] bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded-[6px] mx-0.5 inline-block select-all"
                >
                  {part.replace(/[\[\]]/g, "")}
                </span>
              );
            }
            if (/^<[^>]+>$/.test(part)) {
              return (
                <span
                  key={i}
                  className="text-purple-600 dark:text-purple-300 font-black text-[10px] bg-purple-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mx-1 inline-block border border-purple-500/10"
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
      <DialogContent className="max-w-3xl rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Music className="h-5 w-5 text-indigo-500" />
              {song.title}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Live chord visualizer
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close details popup"
            className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          {/* Lyrics and chords main display */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              <BookOpen className="h-4 w-4 text-indigo-500" /> Lyrics & Chord Matrix
            </div>
            <div className="max-h-[50vh] overflow-y-auto rounded-[24px] bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 p-5 shadow-inner space-y-1">
              {formatLyricsWithMarkup(transposedLyrics)}
            </div>
          </div>

          {/* Quick Stats, Properties & Transposer Panel */}
          <div className="space-y-5">
            {/* Real-time transposer widget */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/10 rounded-[24px] p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5" /> Performance Key
                </span>
                <div className="text-xl font-black text-foreground mt-1">Key of {currentKey}</div>
                {currentKey !== song.originalKey && (
                  <div className="text-[9px] text-muted-foreground mt-0.5">Transposed from {song.originalKey}</div>
                )}
              </div>
              <div className="flex flex-col gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
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

            {/* Properties widget */}
            <div className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-[24px] p-4 space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Properties</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-card p-2 rounded-xl border border-black/5 text-center">
                  <div className="text-[9px] font-bold text-muted-foreground">Original Key</div>
                  <div className="text-sm font-black text-foreground mt-0.5">{song.originalKey || "—"}</div>
                </div>
                <div className="bg-white dark:bg-card p-2 rounded-xl border border-black/5 text-center">
                  <div className="text-[9px] font-bold text-muted-foreground">Tempo</div>
                  <div className="text-sm font-black text-foreground mt-0.5">{song.tempo || "—"}</div>
                </div>
              </div>
            </div>

            {/* Performance Notes widget */}
            {song.notes && (
              <div className="bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-[24px] p-4 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block flex items-center gap-1">
                  <Tags className="h-3.5 w-3.5 text-indigo-500" /> Notes
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed italic bg-white dark:bg-card p-3 rounded-xl border border-black/5">
                  "{song.notes}"
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}