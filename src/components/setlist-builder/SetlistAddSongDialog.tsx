"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AddSetlistSongForm from "./AddSetlistSongForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: any;
  recommendedKey: string;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSongChange: (value: string) => void;
  onSingerChange: (value: string) => void;
  onAddSong: () => void;
  onCancel: () => void;
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
}: Props) {
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

        <AddSetlistSongForm
          formData={formData}
          recommendedKey={recommendedKey}
          onFormChange={onFormChange}
          onSongChange={onSongChange}
          onSingerChange={onSingerChange}
          onAddSong={() => {
            onAddSong();
            onOpenChange(false);
          }}
          onCancel={() => {
            onCancel();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}