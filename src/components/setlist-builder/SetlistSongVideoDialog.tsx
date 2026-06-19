"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Music, 
  Sliders, 
  Volume2, 
  VolumeOff, 
  Pause, 
  Play, 
  ArrowLeft,   ArrowRight 
} from "lucide-react";
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

/* ---------- GLOBAL TYPE DECLARATIONS ---------- */
declare global {
  interface Window {
    YT?: {
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
      Player: new (
        elementId: HTMLDivElement,
        config: {
          height: string;
          width: string;
          videoId: string;
          playerVars: Record<string, number>;
          events: {
            onReady: (event: { target: any }) => void;
            onError: (event: { data: number }) => void;
            onStateChange: (event: { data: number }) => void;
          };
        }
      ) => {
        playVideo: () => void;
        pauseVideo: () => void;
        seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
        mute: () => void;
        unMute: () => void;
        isMuted: () => boolean;
        getCurrentTime: () => number;
        getDuration: () => number;
        setPlaybackQuality: (quality: string) => void;
        setPlaybackRate: (rate: number) => void;
        destroy: () => void; // Add destroy method
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

/* ---------- HELPER FUNCTIONS ---------- */
function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/* ---------- COMPONENT ---------- */
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null); // YT.Player type is any
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract YouTube video ID and load IFrame API
  useEffect(() => {
    if (song.youtubeLink) {
      const videoId = getYouTubeVideoId(song.youtubeLink);
      setYoutubeVideoId(videoId);
      
      // Load YouTube IFrame API script
      if (!window.YT) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
        
        window.onYouTubeIframeAPIReady = () => {
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
    if (window.YT && youtubeVideoId && containerRef.current) {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "0",
        width: "0",
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            event.target.setPlaybackQuality("hd1080");
            setIsPlayerReady(true);
            // Get duration after ready
            const dur = event.target.getDuration();
            if (dur > 0) {
              setDuration(dur);
            }
          },
          onError: (event: any) => {
            console.error("YouTube player error:", event.data);
          },
          onStateChange: (event: any) => {
            // Update play state based on player state
            switch (event.data) {
              case window.YT.PlayerState.PLAYING:
                setIsPlaying(true);
                startInterval();
                break;
              case window.YT.PlayerState.PAUSED:
              case window.YT.PlayerState.ENDED:
                setIsPlaying(false);
                stopInterval();
                break;
              case window.YT.PlayerState.BUFFERING:
                setIsPlaying(true);
                break;
              default:
                break;
            }
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

  // Update current time from player
  useEffect(() => {
    if (isPlayerReady && playerRef.current && isPlaying) {
      const current = playerRef.current.getCurrentTime();
      setCurrentTime(current);
    }
  }, [isPlayerReady, isPlaying]);

  // Start interval to update current time
  const startInterval = () => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const current = playerRef.current.getCurrentTime();
        setCurrentTime(current);
      }
    }, 500);
  };

  // Stop interval
  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopInterval();
      if (playerRef.current) {
        playerRef.current.destroy(); // Safe because destroy exists on YT.Player
      }
    };
  }, []);

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
          <Button            variant="ghost"
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

          {/* Audio Controls */}
          <div className="space-y-4">
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (isPlaying) {
                      playerRef.current?.pauseVideo();
                    } else {
                      playerRef.current?.playVideo();
                    }
                  }}
                  className="h-10 w-10 rounded-full"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                {/* Backward 5s Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const current = playerRef.current?.getCurrentTime() || 0;
                    playerRef.current?.seekTo(Math.max(0, current - 5));
                  }}
                  className="h-10 w-10 rounded-full"
                  title="Back 5s"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                {/* Forward 5s Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const current = playerRef.current?.getCurrentTime() || 0;
                    const dur = playerRef.current?.getDuration() || 0;
                    playerRef.current?.seekTo(Math.min(dur, current + 5));
                  }}
                  className="h-10 w-10 rounded-full"
                  title="Forward 5s"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>

                {/* Volume Toggle Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (isMuted) {
                      playerRef.current?.unMute();
                    } else {
                      playerRef.current?.mute();
                    }
                    setIsMuted(!isMuted);
                  }}
                  className="h-10 w-10 rounded-full"
                >
                  {isMuted ? <VolumeOff className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>

              {/* Time Display */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-black/20 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-2 bg-indigo-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
              <div
                className="absolute left-0 top-0 h-2 w-full cursor-pointer"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  playerRef.current?.seekTo(percent * duration);
                }}
              ></div>
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