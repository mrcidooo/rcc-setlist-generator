"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";

type SongPreviewDialogProps = {
  song: {
    title: string;
    originalKey: string;
    lyrics?: string;
  } | null;
  open: boolean;
  onClose: () => void;
};

const formatLyrics = (raw: string) => {
  const lines = raw.split("\n");
  return lines.map((line, idx) => {
    // Split by both [chords] and <sections>
    const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);
    return (
      <p key={idx} className="whitespace-pre-wrap leading-relaxed min-h-[1.5rem]">
        {parts.map((part, i) => {
          if (/^\[[^\]]+\]$/.test(part)) {
            return (
              <span key={i} className="text-indigo-500 dark:text-indigo-400 font-extrabold text-[12px] bg-indigo-500/10 px-1.5 py-0.5 rounded-[6px] mx-0.5 inline-block">
                {part.replace(/[\[\]]/g, "")}
              </span>
            );
          }
          if (/^<[^>]+>$/.test(part)) {
            return (
              <span key={i} className="text-purple-600 dark:text-purple-300 font-black text-[11px] bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider mx-1 inline-block border border-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.15)]">
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

export default function SongPreviewDialog({
  song,
  open,
  onClose,
}: SongPreviewDialogProps) {
  if (!song) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl">
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground">
              {song.title}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Performance Key: {song.originalKey}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close preview"
            className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4 max-h-[50vh] overflow-y-auto rounded-[24px] bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 p-5 font-mono text-sm text-foreground space-y-1.5 shadow-inner">
          {song.lyrics?.trim()
            ? formatLyrics(song.lyrics)
            : <p className="text-xs text-muted-foreground italic text-center py-6">No performance lyrics or chord markings mapped for this song.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}