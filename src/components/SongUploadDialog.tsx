"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Music, Tags, FileText, Link } from "lucide-react";

type SongForm = {
  title: string;
  artist: string;
  originalKey: string;
  tempo: string;
  notes: string;
  lyrics: string;
  youtubeLink: string;
};

type SongUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SongForm) => void;
  initialData?: Partial<SongForm>;
  isEditing?: boolean;
}

export default function SongUploadDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData = {},
  isEditing = false,
}: SongUploadDialogProps) {
  const [form, setForm] = useState<SongForm>({
    title: initialData.title || "",
    artist: initialData.artist || "",
    originalKey: initialData.originalKey || "",
    tempo: initialData.tempo || "",
    notes: initialData.notes || "",
    lyrics: initialData.lyrics || "",
    youtubeLink: initialData.youtubeLink || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Music className="h-5 w-5 text-indigo-500" />
              {isEditing ? "Edit Song" : "Upload New Song"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEditing ? "Update song details and lyrics." : "Add a new worship song to your library."}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close upload dialog"
            className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="song-title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Song Title *
              </Label>
              <Input
                id="song-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Way Maker"
                className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="song-artist" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Artist
              </Label>
              <Input
                id="song-artist"
                name="artist"
                value={form.artist}
                onChange={handleChange}
                placeholder="e.g., Bethel Music"
                className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="song-key" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Original Key *
              </Label>
              <Input
                id="song-key"
                name="originalKey"
                value={form.originalKey}
                onChange={handleChange}
                placeholder="e.g., C, D, Bb, Eb"
                className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="song-tempo" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tempo
              </Label>
              <Input
                id="song-tempo"
                name="tempo"
                value={form.tempo}
                onChange={handleChange}
                placeholder="e.g., 72 BPM"
                className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="song-notes" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Tags className="h-3.5 w-3.5 text-indigo-500" />
              Performance Notes
            </Label>
            <Textarea
              id="song-notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any structural notes about this song..."
              className="rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="song-youtube" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Link className="h-3.5 w-3.5 text-indigo-500" />
              YouTube Link
            </Label>
            <Input
              id="song-youtube"
              name="youtubeLink"
              value={form.youtubeLink}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
              className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="song-lyrics" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
              Lyrics & Chord Matrix
            </Label>
            <Textarea
              id="song-lyrics"
              name="lyrics"
              value={form.lyrics}
              onChange={handleChange}
              placeholder="Paste lyrics with chords wrapped like: [C] Amazing [G] grace..."
              className="rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 font-mono text-xs"
              rows={8}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] font-bold px-5"
            >
              {isEditing ? "Update Song" : "Save Song"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}