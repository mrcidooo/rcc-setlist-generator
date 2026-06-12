"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

export default function SongPreviewDialog({ song, open, onClose }: SongPreviewDialogProps) {
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
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close preview">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-md bg-muted/50 p-4 font-mono text-sm text-foreground">
          {song.lyrics?.trim()
            ? song.lyrics
            : "No lyrics/chords available for this song."}
        </div>
      </DialogContent>
    </Dialog>
  );
}