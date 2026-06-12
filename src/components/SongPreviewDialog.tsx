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
import { X } from "lucide-react";

type SongPreviewDialogProps = {
  song: {
    title: string;
    originalKey: string;
    lyrics?: string;
  } | null;
  open: boolean;
  onClose: () => void;
};

/**
 * Simple formatter:
 * - Keeps line breaks.
 * - Highlights chords wrapped in square brackets: [C], [G], etc.
 */
const formatLyrics = (raw: string) => {
  const lines = raw.split("\n");
  return lines.map((line, idx) => {
    // Replace each [chord] with a styled span
    const parts = line.split(/(\[[^\]]+\])/g); // keep the brackets in the array
    return (
      <p key={idx} className="whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (/^\[[^\]]+\]$/.test(part)) {
            // chord
            return (
              <span key={i} className="text-primary font-semibold">
                {part}
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
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex items-start justify-between">
          <div>
            <DialogTitle>{song.title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Original Key: {song.originalKey}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-md bg-muted/50 p-4 font-mono text-sm text-foreground">
          {song.lyrics?.trim()
            ? formatLyrics(song.lyrics)
            : "No lyrics/chords available for this song."}
        </div>
      </DialogContent>
    </Dialog>
  );
}