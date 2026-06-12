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
import { FileText, Music } from "lucide-react";

export type Song = {
  id: string;
  title: string;
  originalKey: string;
  tempo?: string;
  tags: string[];
  addedAt: string;
  notes?: string;
};

type SongCardProps = {
  song: Song;
  onPreview: (song: Song) => void;
};

export const SongCard = ({ song, onPreview }: SongCardProps) => {
  return (
    <Card className="flex h-full flex-col overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Music className="h-5 w-5" />
          </div>
          <Button variant="outline" size="sm" onClick={() => onPreview(song)}>
            Preview
          </Button>
        </div>

        <CardTitle className="text-lg leading-tight">{song.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted p-3">
            <div className="text-xs text-muted-foreground">Original Key</div>
            <div className="font-semibold text-foreground">{song.originalKey}</div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="text-xs text-muted-foreground">Tempo</div>
            <div className="font-semibold text-foreground">{song.tempo ?? "—"}</div>
          </div>
        </div>

        {song.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {song.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No tags added yet</div>
        )}

        {song.notes && (
          <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">
            {song.notes}
          </p>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          Added {song.addedAt}
        </span>
      </CardFooter>
    </Card>
  );
};