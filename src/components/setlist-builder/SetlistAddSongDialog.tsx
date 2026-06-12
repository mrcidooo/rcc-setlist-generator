"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AddSetlistSongForm from "./AddSetlistSongForm";
import { supabase } from "@/lib/supabaseClient";
import type { AvailableSong, AvailableSinger, SetlistFormData } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: SetlistFormData;
  recommendedKey: string;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSongChange: (value: string) => void;
  onSingerChange: (value: string) => void;
  onAddSong: () => void;
  onCancel: () => void;
  /** Real data from Supabase */
  songs: AvailableSong[];
  singers: AvailableSinger[];
};

export default function SetlistAddSongDialog({
  open,
  onOpenChange,
  formData,
  recommendedKey,
  onFormChange,
  onSongChange,
  onSingerChange,
  onAddSong,
  onCancel,
  songs,
  singers,
}: Props) {
  const [localSongs, setLocalSongs] = useState<AvailableSong[]>([]);
  const [localSingers, setLocalSingers] = useState<AvailableSinger[]>([]);

  // Load real data from Supabase when dialog opens (fallback to passed props)
  useEffect(() => {
    const loadData = async () => {
      const { data: songData, error: songErr } = await supabase
        .from("songs")
        .select("id, title, original_key")
        .order("title");

      if (!songErr && songData) {
        const mapped = (songData as any[]).map((r) => ({
          id: r.id,
          title: r.title,
          originalKey: r.original_key,
        }));
        setLocalSongs(mapped);
      } else {
        setLocalSongs(songs);
      }

      const { data: singerData, error: singerErr } = await supabase
        .from("singers")
        .select("id, name")
        .order("name");

      if (!singerErr && singerData) {
        const mapped = (singerData as any[]).map((r) => ({
          id: r.id,
          name: r.name,
        }));
        setLocalSingers(mapped);
      } else {
        setLocalSingers(singers);
      }
    };

    if (open) loadData();
  }, [open, songs, singers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl">
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <DialogTitle className="text-lg font-black tracking-tight text-foreground">
            Add Song to Setlist
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
            aria-label="Close add song dialog"
            className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Pass real songs & singers to the form */}
        <AddSetlistSongForm
          formData={formData}
          recommendedKey={recommendedKey}
          onFormChange={onFormChange}
          onSongChange={onSongChange}
          onSingerChange={onSingerChange}
          onAddSong={onAddSong}
          onCancel={onCancel}
          songs={localSongs}
          singers={localSingers}
        />
      </DialogContent>
    </Dialog>
  );
}