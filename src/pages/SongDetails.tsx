"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Music, 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Tags, 
  Clock, 
  BookOpen, 
  Sliders 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transposeLyrics } from "@/utils/transposer";
import React from "react";

type Song = {
  id: string;
  title: string;
  originalKey: string;
  tempo: string;
  tags: string[];
  notes: string;
  lyrics: string;
};

export default function SongDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [song, setSong] = useState<Song | null>(null);
  const [currentKey, setCurrentKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const keysArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  useEffect(() => {
    const fetchSong = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({ title: "Error loading song", description: error.message });
        setLoading(false);
        return;
      }

      if (data) {
        const mapped: Song = {
          id: String(data.id),
          title: data.title,
          originalKey: data.original_key || data.originalKey || "C",
          tempo: data.tempo || "—",
          tags: data.tags || [],
          notes: data.notes || "",
          lyrics: data.lyrics || "",
        };
        setSong(mapped);
        setCurrentKey(mapped.originalKey.trim());
      }
      setLoading(false);
    };

    fetchSong();
  }, [id, toast]);

  const handleShiftKey = (direction: "up" | "down") => {
    if (!song) return;
    const currentIndex = keysArray.indexOf(currentKey);
    if (currentIndex < 0) return;

    let nextIndex = direction === "up" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= keysArray.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = keysArray.length - 1;

    setCurrentKey(keysArray[nextIndex]);
    toast({
      title: "Key transposed",
      description: `Shifted to Key of ${keysArray[nextIndex]}`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Music className="h-10 w-10 text-indigo-500 animate-spin" />
          <p className="text-sm font-bold text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-lg font-bold">Song details could not be found.</p>
          <Button onClick={() => navigate("/songs")} className="mt-4 rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Library
          </Button>
        </div>
      </div>
    );
  }

  const transposedLyrics = transposeLyrics(song.lyrics, song.originalKey, currentKey);

  const formatLyricsWithMarkup = (lyricsText: string) => {
    if (!lyricsText.trim()) {
      return <p className="text-sm text-muted-foreground italic">No lyrics or chord matrices defined.</p>;
    }

    return lyricsText.split("\n").map((line, idx) => {
      const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);
      return (
        <p key={idx} className="min-h-[1.5rem] leading-relaxed whitespace-pre-wrap font-mono text-sm">
          {parts.map((part, i) => {
            if (/^\[[^\]]+\]$/.test(part)) {
              return (
                <span key={i} className="text-indigo-500 dark:text-indigo-400 font-extrabold text-[12px] bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded-[6px] mx-0.5 inline-block select-all">
                  {part.replace(/[\[\]]/g, "")}
                </span>
              );
            }
            if (/^<[^>]+>$/.test(part)) {
              return (
                <span key={i} className="text-purple-600 dark:text-purple-300 font-black text-[11px] bg-purple-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mx-1 inline-block border border-purple-500/10">
                  {part.replace(/[<>]/g, "")}
                </span>
              );
            }
            return <React.Fragment key={i}>{part}</React.Fragment>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-transparent p-4 pb-32 max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.close()} 
          className="h-10 rounded-[18px] border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 font-semibold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Close Tab
        </Button>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
          <Sparkles className="h-4 w-4 text-indigo-500" /> Live worship view
        </span>
      </div>

      {/* Hero card details */}
      <Card className="neu-card border-0 bg-gradient-to-br from-indigo-950 to-purple-950 text-white rounded-[28px] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/10 text-white border border-white/10">
                <Music className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">{song.title}</h1>
                <p className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mt-0.5">Worship Library Track</p>
              </div>
            </div>
            {song.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {song.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Transposer Dashboard Widget */}
          <div className="flex items-center gap-3 bg-black/35 rounded-[24px] p-4 border border-white/5 self-start md:self-auto min-w-[220px] justify-between">
            <div>
              <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5" /> Performance Key
              </div>
              <div className="text-2xl font-black text-white mt-1">Key of {currentKey}</div>
              {currentKey !== song.originalKey && (
                <div className="text-[9px] text-indigo-200 mt-0.5">Transposed from {song.originalKey}</div>
              )}
            </div>
            <div className="flex flex-col gap-1 bg-white/10 p-1 rounded-xl">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleShiftKey("up")}
                className="h-8 w-8 rounded-[8px] hover:bg-white/15 text-white"
                aria-label="Transpose Up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleShiftKey("down")}
                className="h-8 w-8 rounded-[8px] hover:bg-white/15 text-white"
                aria-label="Transpose Down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Song metadata columns */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="neu-card border-0 bg-white/75 dark:bg-card/75 md:col-span-2">
          <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5">
            <CardTitle className="text-md font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" /> Lyrics & Chords Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 overflow-x-auto">
            <div className="space-y-1 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[20px] p-5">
              {formatLyricsWithMarkup(transposedLyrics)}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="neu-card border-0 bg-white/75 dark:bg-card/75">
            <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5">
              <CardTitle className="text-md font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" /> Track Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Original Key</span>
                <span className="text-sm font-bold text-foreground mt-0.5 inline-block">{song.originalKey}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Tempo</span>
                <span className="text-sm font-bold text-foreground mt-0.5 inline-block">{song.tempo}</span>
              </div>
            </CardContent>
          </Card>

          {song.notes && (
            <Card className="neu-card border-0 bg-white/75 dark:bg-card/75">
              <CardHeader className="pb-3 border-b border-black/5 dark:border-white/5">
                <CardTitle className="text-md font-bold flex items-center gap-2">
                  <Tags className="h-5 w-5 text-indigo-500" /> Performance Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground leading-relaxed italic bg-black/5 dark:bg-white/5 p-3.5 rounded-[16px] border border-black/5">
                  "{song.notes}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}