"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
}: SongCardProps) => {
  const tagsArray = Array.isArray(song.tags) ? song.tags : [];

  return (
    <Card className="neu-card border-0 bg-gradient-to-br from-indigo-950/90 to-purple-950/90 dark:from-gray-900 dark:to-gray-800 rounded-[28px] shadow-lg p-5 hover:translate-y-[-2px] transition-all duration-300 flex flex-col h-full min-h-[320px] text-white">
      <CardHeader className="space-y-3 pb-3 p-0">
        <div className="flex items-start justify-between w-full">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 shadow-inner"
          >
            <Music className="h-5 w-5" />
          </div>
          <div className="flex gap-1.5 bg-black/20 dark:bg-white/5 rounded-[18px] p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPreview(song)}
              className="h-8 rounded-[14px] text-xs font-bold hover:bg-white/20 dark:hover:bg-white/10 text-white"
            >
              Preview
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Edit ${song.title}`}
              onClick={() => onEdit(song)}
              className="h-8 w-8 rounded-[14px] hover:bg-white/20 dark:hover:bg-white/10 text-indigo-300 hover:text-white"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Delete ${song.title}`}
              onClick={() => onDelete(song.id)}
              className="h-8 w-8 rounded-[14px] hover:bg-red-500/20 text-red-300 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg font-black tracking-tight text-white leading-snug">
          {song.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-3 pb-4 p-0 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-[18px] bg-black/25 dark:bg-black/40 border border-white/5 p-2.5 text-center">
            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Orig. Key</div>
            <div className="font-black text-white text-sm mt-0.5">{song.originalKey || "—"}</div>
          </div>
          <div className="rounded-[18px] bg-black/25 dark:bg-black/40 border border-white/5 p-2.5 text-center">
            <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Tempo</div>
            <div className="font-black text-white text-sm mt-0.5">{song.tempo || "—"}</div>
          </div>
        </div>

        {tagsArray.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tagsArray.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 text-[9px] font-bold tracking-wider"
              >
                {tag.toUpperCase()}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-indigo-300/60 italic mt-1">No tags assigned</div>
        )}

        {song.notes && (
          <p className="rounded-[16px] border border-white/5 bg-black/20 p-3 text-xs text-indigo-100/80 leading-relaxed max-h-[80px] overflow-y-auto">
            {song.notes}
          </p>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between border-t border-white/5 pt-3 p-0 text-[10px] text-indigo-200/60">
        <span className="flex items-center gap-1 font-medium">
          <FileText className="h-3.5 w-3.5 text-indigo-400" />
          Added {song.addedAt ? new Date(song.addedAt).toLocaleDateString() : "recently"}
        </span>
        <span className="flex items-center gap-1 font-black text-indigo-400 uppercase tracking-widest">
          <Sparkles className="h-3 w-3 animate-pulse" /> Ready
        </span>
      </CardFooter>
    </Card>
  );
};