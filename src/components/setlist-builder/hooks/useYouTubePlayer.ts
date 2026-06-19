"use client";

import { useEffect, useRef, useState } from "react";

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

export function useYouTubePlayer(
  videoId: string | null,
  isOpen: boolean,
  onPlayerReady: (player: YouTubePlayer) => void,
  onStateChange: (state: number) => void,
  onError: (error: string) => void
) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!videoId || !isOpen) return;

    let isMounted = true;

    const createPlayer = async () => {
      setIsLoading(true);

      try {
        await loadYouTubeIframeAPI();

        if (!isMounted) return;

        const apiWindow = window as YouTubeWindow;

        if (!apiWindow.YT?.Player) {
          onError("YouTube player could not load.");
          setIsLoading(false);
          return;
        }

        const container = document.createElement("div");
        document.body.appendChild(container);

        playerRef.current = new apiWindow.YT.Player(container, {
          height: "200",
          width: "100%",
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
              setIsPlayerReady(true);
              setIsLoading(false);
              onPlayerReady(event.target);
            },
            onError: () => {
              if (!isMounted) return;
              onError("YouTube could not play this video.");
              setIsLoading(false);
              setIsPlayerReady(false);
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              onStateChange(event.data);
            },
          },
        });
      } catch (error) {
        if (!isMounted) return;
        onError("Failed to create YouTube player.");
        setIsLoading(false);
        setIsPlayerReady(false);
      }
    };

    createPlayer();

    return () => {
      isMounted = false;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, isOpen, onPlayerReady, onStateChange, onError]);

  return { playerRef, isPlayerReady, isLoading };
}
</tool_call>
<dyad-write path="src/components/setlist-builder/components/KeySelector.tsx" description="Modular key selector component">
"use client";

import { Button } from "@/components/ui/button";
import { Sliders } from "lucide-react";

type KeySelectorProps = {
  currentKey: string;
  originalKey: string;
  selectedKey: string;
  onKeyChange: (key: string) => void;
};

const keysArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function KeySelector({
  currentKey,
  originalKey,
  selectedKey,
  onKeyChange,
}: KeySelectorProps) {
  return (
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
        onChange={(e) => onKeyChange(e.target.value)}
        className="ml-2 rounded-[18px] border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-sm font-bold text-indigo-500 dark:text-indigo-400 px-3 py-2"
      >
        {keysArray.map((key) => (
          <option key={key} value={key}>
            Key of {key}
          </option>
        ))}
      </select>
    </div>
  );
}
<dyad-write path="src/components/setlist-builder/components/YouTubePlayerContainer.tsx" description="Component to host the hidden YouTube player for audio">
"use client";

import { useEffect, useRef } from "react";
import { useYouTubePlayer } from "@/components/setlist-builder/hooks/useYouTubePlayer";

type YouTubePlayerContainerProps = {
  videoId: string | null;
  isOpen: boolean;
  onPlayerReady: (player: any) => void;
  onStateChange: (state: number) => void;
  onError: (error: string) => void;
};

export function YouTubePlayerContainer({
  videoId,
  isOpen,
  onPlayerReady,
  onStateChange,
  onError,
}: YouTubePlayerContainerProps) {
  const playerRef = useRef<any>(null);
  const { isPlayerReady, isLoading } = useYouTubePlayer(
    videoId,
    isOpen,
    onPlayerReady,
    onStateChange,
    onError
  );

  // We don't need to render anything visible for the player itself, but we need a container
  // for the YouTube API to mount into. We'll render a hidden div.
  useEffect(() => {
    if (isPlayerReady && playerRef.current) {
      // The YouTube player is already mounted in the hook, so we just need to ensure
      // the container exists. The hook creates its own container, so we don't need to do anything here.
      // However, we are returning null from this component, so we must rely on the hook's internal container.
      // Alternatively, we can let the hook manage the container and not render anything.
      // We'll return null and let the hook handle the DOM.
    }
  }, [isPlayerReady]);

  // We return null because the YouTube player is created in a separate container by the hook.
  // If we want to have the container in this component, we would adjust the hook to use a ref.
  // For simplicity, we'll keep the hook creating its own container and return null here.
  return null;
}