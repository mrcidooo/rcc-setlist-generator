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
import { X, Play, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { transposeLyrics } from "@/utils/transposer";

type SetlistSongDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: string;
  songTitle: string;
  originalKey: string;
  selectedKey: string;
};

export default function SetlistSongDetailDialog({
  open,
  onOpenChange,
  songId,
  songTitle,
  originalKey,
  selectedKey,
}: SetlistSongDetailDialogProps) {
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [lyrics, setLyrics] = useState<string>("");
  const [currentKey, setCurrentKey] = useState<string>(selectedKey);
  const keysArray = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  // Load YouTube link and lyrics when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("youtube_link, lyrics")
        .eq("id", songId)
        .single();

      if (!error && data) {
        setYoutubeLink(data.youtube_link || "");
        setLyrics(data.lyrics || "");
      }
    };

    fetchData();
    setCurrentKey(selectedKey);
  }, [open, songId, selectedKey]);

  const handleShiftKey = (direction: "up"<dyad-write path="src/components/setlist-builder/SetlistSongDetailDialog.tsx" description="Dialog that shows a YouTube video (audio-only) and transposable lyrics for a selected setlist song">
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
import { X, Play, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { transposeLyrics } from "@/utils/transposer";

type SetlistSongDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: string;
  songTitle: string;
  originalKey: string;
  selectedKey: string;
};

export default function SetlistSongDetailDialog({
  open,
  onOpenChange,
  songId,
  songTitle,
  originalKey,
  selectedKey,
}: SetlistSongDetailDialogProps) {
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [lyrics, setLyrics] = useState<string>("");
  const [currentKey, setCurrentKey] = useState<string>(selectedKey);
  const keysArray = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  // Load YouTube link and lyrics when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("youtube_link, lyrics")
        .eq("id", songId)
        .single();

      if (!error && data) {
        setYoutubeLink(data.youtube_link || "");
        setLyrics(data.lyrics || "");
      }
    };

    fetchData();
    setCurrentKey(selectedKey);
  }, [open, songId, selectedKey]);

  const handleShiftKey = (direction: "up" | "down") => {
    const currentIndex = keysArray.indexOf(currentKey);
    if (currentIndex < 0) return;

    let nextIndex = direction === "up" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= keysArray.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = keysArray.length - 1;

    setCurrentKey(keysArray[nextIndex]);
  };

  const getYouTubeEmbedUrl = () => {
    if (!youtubeLink) return "";

    const match = youtubeLink.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1` : "";
  };

  const transposedLyrics = transposeLyrics(lyrics, originalKey, currentKey);

  const formatLyricsWithMarkup = (lyricsText: string) => {
    if (!lyricsText.trim()) {
      return <p className="text-xs text-muted-foreground italic text-center py-6">No lyrics or chord markings mapped for this song.</p>;
    }

    return lyricsText.split("\n").map((line, idx) => {
      const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);
      return (
        <p key={idx} className="min-h-[1.5rem] leading-relaxed whitespace-pre-wrap font-mono text-xs text-foreground">
          {parts.map((part, i) => {
            if (/^\[[^\]]+\]$/.test(part)) {
              return (
                <span
                  key={i}
                  className="text-indigo-500 dark:text-indigo-400 font-extrabold text-[11px] bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded-[6px] mx-0.5 inline-block select-all"
                >
                  {part.replace(/[\[\]]/g, "")}
                </span>
              );
            }
            if (/^<[^>]+>$/.test(part)) {
              return (
                <span
                  key={i}
                  className="text-purple-600 dark:text-purple-300 font-black text-[10px] bg-purple-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mx-1 inline-block border border-purple-500/10"
                >
                  {part.replace(/[<>]/g, "")}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const embedUrl = getYouTubeEmbedUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <DialogTitle className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Play className="h-5 w-5 text-indigo-500" />
              {songTitle}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Audio playback + transposable lyrics
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close song detail"
            className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="aspect-video rounded-[24px] overflow-hidden border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={songTitle}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6">
                <Play className="h-10 w-10 text-indigo-500 mb-3" />
                <p className="font-bold text-foreground">No audio link mapped</p>
                <p className="text-xs text-muted-foreground mt-1">Add a YouTube URL to this song to enable audio playback here.</p>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 rounded-[24px] border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lyrics & Chords</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">Transposed to {currentKey}</div>
                </div>
              </div>
              <div className="max-h-[42vh] overflow-y-auto pr-1 space-y-1">
                {formatLyricsWithMarkup(transposedLyrics)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-indigo-500/10 bg-indigo-500/5 p-4">
                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Performance Key</div>
                <div className="text-2xl font-black text-foreground mt-1">Key of {currentKey}</div>
                {currentKey !== originalKey && (
                  <div className="text-[9px] text-muted-foreground mt-0.5">Transposed from {originalKey}</div>
                )}
              </div>

              <div className="rounded-[24px] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4">
                <div className="flex flex-col gap-2">
                  <Button onClick={() => handleShiftKey("up")} className="h-10 rounded-[16px] font-bold">
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Key Up
                  </Button>
                  <Button onClick={() => handleShiftKey("down")} variant="outline" className="h-10 rounded-[16px] font-bold">
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Key Down
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}