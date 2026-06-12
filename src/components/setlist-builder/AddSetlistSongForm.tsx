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
    <Card>
      <CardHeader>
        <CardTitle>Add Song to Setlist</CardTitle>
        <CardDescription>
          Select a song and singer. The recommended key will appear
          automatically when available.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="setlist-song">Song *</Label>
            <Select value={formData.songId} onValueChange={onSongChange}>
              <SelectTrigger id="setlist-song">
                <SelectValue placeholder="Select a song" />
              </SelectTrigger>
              <SelectContent>
                {availableSongs.map((song) => (
                  <SelectItem key={song.id} value={song.id}>
                    {song.title} ({song.originalKey})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="setlist-singer">Singer *</Label>
            <Select value={formData.singerId} onValueChange={onSingerChange}>
              <SelectTrigger id="setlist-singer">
                <SelectValue placeholder="Select a singer" />
              </SelectTrigger>
              <SelectContent>
                {availableSingers.map((singer) => (
                  <SelectItem key={singer.id} value={singer.id}>
                    {singer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="setlist-key">Selected Key</Label>
            <Input
              id="setlist-key"
              name="selectedKey"
              value={formData.selectedKey}
              onChange={onFormChange}
              placeholder="Recommended or custom key"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Recommended key: {recommendedKey || "Not available"}
            </p>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="setlist-notes">Notes</Label>
            <Textarea
              id="setlist-notes"
              name="notes"
              value={formData.notes}
              onChange={onFormChange}
              placeholder="Special instructions for this song"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onAddSong}>
            Add Song
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}