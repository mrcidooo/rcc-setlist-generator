"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type ChangeEvent } from "react";
import { availableSingers, availableSongs } from "./constants";
import type { SetlistFormData } from "./types";
import { Sparkles } from "lucide-react";

type AddSetlistSongFormProps = {
  formData: SetlistFormData;
  recommendedKey: string;
  onFormChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSongChange: (value: string) => void;
  onSingerChange: (value: string) => void;
  onAddSong: () => void;
  onCancel: () => void;
};

export default function AddSetlistSongForm({
  formData,
  recommendedKey,
  onFormChange,
  onSongChange,
  onSingerChange,
  onAddSong,
  onCancel,
}: AddSetlistSongFormProps) {
  return (
    <Card className="neu-card border-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:bg-card/75">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500 animate-spin" style={{ animationDuration: '8s' }} />
          <div>
            <CardTitle className="text-lg font-bold">Assign Song Details</CardTitle>
            <CardDescription>
              Assign vocalists. Recommended comfort keys are pulled instantly.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="setlist-song" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Song *</Label>
            <Select value={formData.songId} onValueChange={onSongChange}>
              <SelectTrigger id="setlist-song" className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <SelectValue placeholder="Select a song" />
              </SelectTrigger>
              <SelectContent className="rounded-[18px]">
                {availableSongs.map((song) => (
                  <SelectItem key={song.id} value={song.id} className="rounded-xl">
                    {song.title} ({song.originalKey})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setlist-singer" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Singer *</Label>
            <Select value={formData.singerId} onValueChange={onSingerChange}>
              <SelectTrigger id="setlist-singer" className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <SelectValue placeholder="Select a singer" />
              </SelectTrigger>
              <SelectContent className="rounded-[18px]">
                {availableSingers.map((singer) => (
                  <SelectItem key={singer.id} value={singer.id} className="rounded-xl">
                    {singer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setlist-key" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selected Key</Label>
            <Input
              id="setlist-key"
              name="selectedKey"
              value={formData.selectedKey}
              onChange={onFormChange}
              placeholder="Recommended or custom key"
              className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
            />
            {recommendedKey && (
              <p className="mt-1 text-xs font-bold text-indigo-500 flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse" /> Comfort zone key detected: {recommendedKey}
              </p>
            )}
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="setlist-notes" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Performance Notes</Label>
            <Textarea
              id="setlist-notes"
              name="notes"
              value={formData.notes}
              onChange={onFormChange}
              placeholder="e.g., Extended bridge, start a cappella..."
              className="rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 min-h-[80px]"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl font-semibold">
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onAddSong}
            className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] font-bold px-5"
          >
            Add Track
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}