"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Music, Trash2, Edit, Sparkles } from "lucide-react";

export type Song = {
  id: string;
  title: string;
  originalKey: string;
  tempo?: string;
  tags: string[];
  addedAt: string;
  notes?: string;
  lyrics?: string;
};

type SongCardProps = {
  song: Song;
  onPreview: (song: Song) => void;
  onDelete: (songId: string) => void;
  onEdit: (song: Song) => void;
  className?: string;
};

export const SongCard = ({
  song,
  onPreview,
  onDelete,
  onEdit,
  className,
}: SongCardProps) => {
  const tagsArray = Array.isArray(song.tags) ? song.tags : [];

  return (
    <Card
      className={`neu-card border-0 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 overflow-hidden ${className ?? ""}`}
    >
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[18px] bg-white/10 text-white border border-white/10 shadow-[0_4px_12px_rgba(99,102,241,0.2)]">
            <Music className="h-5 w-5" />
          </div>

          <div className="flex gap-1 bg-black/20 dark:bg-white/10 rounded-[18px] p-1 backdrop-blur-sm">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPreview(song)}
              className="h-8 rounded-[14px] text-xs font-semibold hover:bg-white/20 dark:hover:bg-white/10 text-white"
            >
              Preview
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Edit ${song.title}`}
              onClick={() => onEdit(song)}
              className="h-8 w-8 rounded-[14px] hover:bg-white/20 dark:hover:bg-white/10 text-white"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Delete ${song.title}`}
              onClick={() => onDelete(song.id)}
              className="h-8 w-8 rounded-[14px] hover:bg-red-500/20 text-white hover:text-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <CardTitle className="text-base font-bold text-white leading-snug tracking-tight">
          {song.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 pb-4 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-[18px] bg-black/15 border border-white/10 p-2.5 text-center">
            <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
              Orig. Key
            </div>
            <div className="font-extrabold text-white text-sm mt-0.5">
              {song.originalKey}
            </div>
          </div>

          <div className="rounded-[18px] bg-black/15 border border-white/10 p-2.5 text-center">
            <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
              Tempo
            </div>
            <div className="font-extrabold text-white text-sm mt-0.5">
              {song.tempo || "—"}
            </div>
          </div>
        </div>

        {tagsArray.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tagsArray.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-[10px] bg-white/15 text-white border-0 text-[10px] font-bold"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-white/50 italic">No tags listed</div>
        )}

        {song.notes && (
          <p className="rounded-[16px] border border-white/10 bg-black/10 p-3 text-xs text-white/70 leading-relaxed">
            {song.notes}
          </p>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/60">
        <span className="flex items-center gap-1 font-medium">
          <FileText className="h-3.5 w-3.5 text-indigo-300" />
          Added {song.addedAt || "recently"}
        </span>
        <span className="flex items-center gap-1 font-bold text-indigo-200 uppercase tracking-wide">
          <Sparkles className="h-3 w-3 animate-pulse" />
          Ready
        </span>
      </CardFooter>
    </Card>
  );
};