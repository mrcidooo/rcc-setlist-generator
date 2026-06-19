"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Music, Sliders, Volume2 } from "lucide-react";
import { Sparkles } from "lucide-react";
import { transposeLyrics } from "@/utils/transposer";

type SongPreviewData = {
  title: string;
  originalKey: string;
  lyrics?: string;
  youtubeLink?: string;
};

type SetlistSongVideoDialogProps = {
  songId: string;
  song: SongPreviewData | null;
  open: boolean;
  onClose: () => void;
};

type YouTubePlayer = {
  setPlaybackQuality: (quality: string) => void;
  setPlaybackRate: (rate: number) => void;
};

type YouTubeWindow = Window &
  typeof globalThis & {
    YT: {
      Player: new (
        elementId: HTMLDivElement,
        config: {
          height: string;
          width: string;
          videoId: string;
          playerVars: Record<string, number>;
          events: {
            onReady: (event: { target: YouTubePlayer }) => void;
            onError: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  };

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

function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function getSemitoneDifference(a: string, b: string): number {
  const idxA = keysArray.indexOf(a);
  const idxB = keysArray.indexOf(b);
  return idxB - idxA;
}

export default function SetlistSongVideoDialog({ songId, song, open, onClose, }: SetlistSongVideoDialogProps) {
  if (!song) return null;
  const [currentKey, setCurrentKey] = useState<string>(song.originalKey);
  const [selectedKey, setSelectedKey] = useState<string>(song.originalKey);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract YouTube video ID and load IFrame API
  useEffect(() => {
    if (song.youtubeLink) {
      const videoId = getYouTubeVideoId(song.youtubeLink);
      setYoutubeVideoId(videoId);
      
      // Load YouTube IFrame API script
      if (!(window as YouTubeWindow).YT) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
        
        (window as YouTubeWindow).onYouTubeIframeAPIReady = () => {
          setIsPlayerReady(true);
          createPlayer();
        };
      } else {
        setIsPlayerReady(true);
        createPlayer();
      }
    }
  }, [song.youtubeLink]);

  const createPlayer = () => {
    if ((window as YouTubeWindow).YT && youtubeVideoId && containerRef.current) {
      playerRef.current = new (window as YouTubeWindow).YT.Player(containerRef.current, {
        height: "0",
        width: "0",
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event) => {
            event.target.setPlaybackQuality("hd1080");
            setIsPlayerReady(true);
          },
          onError: (event) => {
            console.error("YouTube player error:", event.data);
          },
        },
      });
    }
  };

  // Keep currentKey in sync with selectedKey
  useEffect(() => {
    setCurrentKey(selectedKey);
    if (playerRef.current && isPlayerReady) {
      const diff = getSemitoneDifference(currentKey, selectedKey);
      const rate = Math.pow(2, diff / 12);
      playerRef.current.setPlaybackRate(rate);
    }
  }, [selectedKey, currentKey, isPlayerReady]);

  // Handle key change from dropdown
  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = e.target.value;
    setSelectedKey(newKey);
    setCurrentKey(newKey);
  };

  const handleShiftKey = (direction: "up" | "down") => {
    const idx = keysArray.indexOf(currentKey);
    let nextIdx = direction === "up" ? idx + 1 : idx - 1;
    if (nextIdx >= keysArray.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = keysArray.length - 1;
    setCurrentKey(keysArray[nextIdx]);
  };

  const transposedLyrics = song.lyrics ? transposeLyrics(song.lyrics, song.originalKey, currentKey) : "";

  const formatLyricsWithMarkup = (lyricsText: string) => {
    if (!lyricsText.trim()) {
      return (
        <p className="text-xs text-muted-foreground italic text-center py-6">
          No lyrics available for this song.
        </p>
      );
    }
    return lyricsText
      .split("\\n")
      .map((line, idx) => (
        <p key={idx} className="min-h-[1.5rem] leading-relaxed whitespace-pre-wrap font-mono text-sm">
          {line
            .split(/(\[[^\]]+\]|<[^>]+>)/g)
            .map((part, i) => {
              if (/^\[[^\]]+\]$/.test(part)) {
                return (
                  <span key={i} className="text-indigo-500 dark:text-indigo-400 font-extrabold text-[12px] bg-indigo-500/10 px-1.5 py-0.5 rounded-[6px] mx-0.5 inline-block">
                    {part.replace(/[\[\]]/g, "")}
                  </span>
                );
              }
              if (/^<[^>]+>$/.test(part)) {
                return (
                  <span key={i} className="text-purple-600 dark:text-purple-300 font-black text-[11px] bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider mx-1 inline-block border border-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.15)]">
                    {part.replace(/[<>]/g, "")}
                  </span>
                );
              }
              return <React.Fragment key={i}>{part}</React.Fragment>;
            })}
        </p>
      ));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl">
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <Music className="h-5 w-5 text-indigo-500" />
              {song.title}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Audio & Lyrics
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key selector */}
          <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-[20px]">
            <div>
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5" /> Performance Key
              </span>
              <div className="text-lg font-black text-foreground mt-1">Key of {currentKey}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {currentKey !== song.originalKey && (
                  <div>Transposed from {song.originalKey}</div>
                )}
              </div>
            </div>

            {/* Key dropdown */}
            <select
              value={selectedKey}
              onChange={handleKeyChange}
              className="ml-2 rounded-[18px] border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm"
            >
              {keysArray.map((k) => (
                <option key={k} value={k}>
                  Key of {k}
                </option>
              ))}
            </select>
          </div>

          {/* YouTube Audio Player */}
          <div className="rounded-[24px] border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] p-4">
            <div ref={containerRef} className="w-full aspect-video bg-black rounded-[16px] overflow-hidden">
              {!youtubeVideoId && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Volume2 className="h-8 w-8 mb-2" />
                  <p>No YouTube link available for this song</p>
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {isPlayerReady ? (
                <span className="text-green-500">✓ YouTube audio loaded and ready</span>
              ) : (
                <span>Loading YouTube audio...</span>
              )}
            </div>
          </div>

          {/* Lyrics section */}
          <div className="mt-4">
            <div className="mb-2 font-semibold text-foreground">Lyrics</div>
            <div className="max-h-[60vh] overflow-y-auto rounded-[24px] bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 p-4">
              {formatLyricsWithMarkup(transposedLyrics)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}