"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Music,
  Pause,
  Play,
  Sliders,
  Sparkles,
  Volume2,
  VolumeOff,
  X,
} from "lucide-react";
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
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
};

type YouTubeWindow = Window & {
  YT?: {
    PlayerState: {
      PLAYING: number;
      PAUSED: number;
      ENDED: number;
      BUFFERING: number;
    };
    Player: new (elementId: HTMLDivElement, config: Record<string, any>) => YouTubePlayer;
  };
  onYouTubeIframeAPIReady?: () => void;
};

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  const apiWindow = window as YouTubeWindow;

  if (apiWindow.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<void>((resolve) => {
    const existingCallback = apiWindow.onYouTubeIframeAPIReady;

    apiWindow.onYouTubeIframeAPIReady = () => {
      existingCallback?.();
      resolve();
    };

    if (document.getElementById("youtube-iframe-api")) {
      return;
    }

    const tag = document.createElement("script");
    tag.id = "youtube-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;

    tag.onerror = () => {
      youtubeApiPromise = null;
      resolve();
    };

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript.parentNode) {
      firstScript.parentNode.insertBefore(tag, firstScript);
    } else {
      document.head.appendChild(tag);
    }
  });

  return youtubeApiPromise;
}

function getYouTubeVideoId(rawUrl: string): string | null {
  const cleanUrl = rawUrl
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/[),.]+$/, "");

  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

function formatTime(seconds: number): string {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const keysArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const sharpKeyIndex: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

function getSemitoneDifference(originalKey: string, targetKey: string): number {
  const from = sharpKeyIndex[originalKey.trim()] ?? 0;
  const to = sharpKeyIndex[targetKey.trim()] ?? 0;
  return to - from;
}

export default function SetlistSongVideoDialog({
  songId,
  song,
  open,
  onClose,
}: SetlistSongVideoDialogProps) {
  const title = song?.title ?? "Song";
  const originalKey = song?.originalKey.trim() || "C";
  const lyrics = song?.lyrics ?? "";
  const youtubeLink = song?.youtubeLink ?? "";

  const [currentKey, setCurrentKey] = useState(originalKey);
  const [selectedKey, setSelectedKey] = useState(originalKey);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof window.setInterval> | null>(null);

  useEffect(() => {
    const nextVideoId = getYouTubeVideoId(youtubeLink);

    if (nextVideoId === videoId) {
      if (!nextVideoId) {
        setPlayerError("No YouTube link has been added for this song.");
      }
      return;
    }

    setVideoId(nextVideoId);
    setPlayerError(nextVideoId ? null : "This YouTube link is not valid.");
    setIsPlayerReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [videoId, youtubeLink]);

  useEffect(() => {
    setSelectedKey(originalKey);
    setCurrentKey(originalKey);
  }, [originalKey, videoId]);

  useEffect(() => {
    if (!videoId || !open) return;

    let isMounted = true;

    const createPlayer = async () => {
      setIsLoading(true);
      setPlayerError(null);

      await loadYouTubeIframeAPI();

      if (!isMounted) return;

      const apiWindow = window as YouTubeWindow;

      if (!apiWindow.YT?.Player || !playerContainerRef.current) {
        setIsLoading(false);
        setIsPlayerReady(false);
        setPlayerError("YouTube player could not load.");
        return;
      }

      playerRef.current = new apiWindow.YT.Player(playerContainerRef.current, {
        height: "200",
        width: "300",
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;

            const nextDuration = event.target.getDuration();

            if (Number.isFinite(nextDuration) && nextDuration > 0) {
              setDuration(nextDuration);
            }

            setIsPlayerReady(true);
            setIsLoading(false);
          },
          onError: () => {
            if (!isMounted) return;

            setIsLoading(false);
            setIsPlayerReady(false);
            setPlayerError("YouTube could not play this video.");
          },
          onStateChange: (event) => {
            if (!isMounted) return;

            if (event.data === apiWindow.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startInterval();
              return;
            }

            if (
              event.data === apiWindow.YT.PlayerState.PAUSED ||
              event.data === apiWindow.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
              stopInterval();
              return;
            }

            if (event.data === apiWindow.YT.PlayerState.BUFFERING) {
              setIsPlaying(true);
            }
          },
        },
      });
    };

    createPlayer();

    return () => {
      isMounted = false;
      stopInterval();

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, open]);

  useEffect(() => {
    if (!playerRef.current || !isPlayerReady) return;

    setCurrentKey(selectedKey);

    const diff = getSemitoneDifference(originalKey, selectedKey);
    const playbackRate = Math.pow(2, diff / 12);
    playerRef.current.setPlaybackRate(playbackRate);
  }, [isPlayerReady, originalKey, selectedKey]);

  const startInterval = () => {
    stopInterval();

    intervalRef.current = window.setInterval(() => {
      if (!playerRef.current) return;

      const nextCurrentTime = playerRef.current.getCurrentTime();
      const nextDuration = playerRef.current.getDuration();

      if (Number.isFinite(nextCurrentTime)) {
        setCurrentTime(nextCurrentTime);
      }

      if (Number.isFinite(nextDuration) && nextDuration > 0) {
        setDuration(nextDuration);
      }
    }, 500);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleKeyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedKey(event.target.value);
  };

  const togglePlay = () => {
    if (!isPlayerReady || !playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      stopInterval();
      return;
    }

    playerRef.current.playVideo();
    setIsPlaying(true);
    startInterval();
  };

  const seekBy = (seconds: number) => {
    if (!playerRef.current) return;

    const current = playerRef.current.getCurrentTime() || 0;
    const totalDuration = playerRef.current.getDuration() || duration;
    playerRef.current.seekTo(Math.max(0, Math.min(totalDuration, current + seconds)), true);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }

    setIsMuted(!isMuted);
  };

  const transposedLyrics = transposeLyrics(lyrics, originalKey, currentKey);

  const formatLyricsWithMarkup = (lyricsText: string) => {
    if (!lyricsText.trim()) {
      return (
        <p className="text-xs text-muted-foreground italic text-center py-6">
          No lyrics available for this song.
        </p>
      );
    }

    const normalizedLyrics = lyricsText.replace(/\\n/g, "\n");

    return normalizedLyrics.split("\n").map((line, idx) => {
      const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);

      return (
        <p
          key={idx}
          className="min-h-[1.5rem] leading-relaxed whitespace-pre-wrap font-mono text-sm"
        >
          {parts.map((part, partIndex) => {
            if (/^\[[^\]]+\]$/.test(part)) {
              return (
                <span
                  key={`${idx}-${partIndex}-chord`}
                  className="text-indigo-500 dark:text-indigo-400 font-extrabold text-[12px] bg-indigo-500/10 px-1.5 py-0.5 rounded-[6px] mx-0.5 inline-block"
                >
                  {part.replace(/[\[\]]/g, "")}
                </span>
              );
            }

            if (/^<[^>]+>$/.test(part)) {
              return (
                <span
                  key={`${idx}-${partIndex}-section`}
                  className="text-purple-600 dark:text-purple-300 font-black text-[11px] bg-purple-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider mx-1 inline-block border border-purple-500/10 shadow-[0_0_8px_rgba(168,85,247,0.15)]"
                >
                  {part.replace(/[<>]/g, "")}
                </span>
              );
            }

            return <span key={`${idx}-${partIndex}`}>{part}</span>;
          })}
        </p>
      );
    });
  };

  if (!song) return null;

  const controlsDisabled = !isPlayerReady || !videoId || Boolean(playerError);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        data-song-id={songId}
        className="max-w-3xl rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <Music className="h-5 w-5 text-indigo-500" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> YouTube audio source
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
          <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-[20px]">
            <div>
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5" /> Performance Key
              </span>
              <div className="text-lg font-black text-foreground mt-1">Key of {currentKey}</div>
              {currentKey !== originalKey && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  Transposed from {originalKey}
                </div>
              )}
            </div>

            <select
              value={selectedKey}
              onChange={handleKeyChange}
              className="ml-2 rounded-[18px] border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-bold text-indigo-500 dark:text-indigo-400 px-3 py-2"
            >
              {keysArray.map((key) => (
                <option key={key} value={key}>
                  Key of {key}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="relative h-24 overflow-hidden rounded-[24px] bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <div
                ref={playerContainerRef}
                className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            {isLoading && (
              <p className="text-xs text-muted-foreground text-center">
                Loading YouTube audio source...
              </p>
            )}

            {!isLoading && !isPlayerReady && videoId && !playerError && (
              <p className="text-xs text-muted-foreground text-center">
                Player is preparing. Press play once it is ready.
              </p>
            )}

            {playerError && (
              <p className="text-xs text-destructive text-center">
                {playerError}
              </p>
            )}

            {videoId && (
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs font-bold text-indigo-500 hover:underline"
              >
                Open source video in YouTube
              </a>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  disabled={controlsDisabled}
                  className="h-10 w-10 rounded-full disabled:opacity-50"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => seekBy(-5)}
                  disabled={controlsDisabled}
                  className="h-10 w-10 rounded-full disabled:opacity-50"
                  title="Back 5s"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => seekBy(5)}
                  disabled={controlsDisabled}
                  className="h-10 w-10 rounded-full disabled:opacity-50"
                  title="Forward 5s"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  disabled={controlsDisabled}
                  className="h-10 w-10 rounded-full disabled:opacity-50"
                >
                  {isMuted ? <VolumeOff className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="relative h-2 bg-black/20 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-2 bg-indigo-500"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
              <div
                className="absolute left-0 top-0 h-2 w-full cursor-pointer"
                onClick={(event) => {
                  if (!playerRef.current || duration <= 0) return;

                  const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
                  playerRef.current.seekTo(percent * duration, true);
                }}
              />
            </div>
          </div>

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