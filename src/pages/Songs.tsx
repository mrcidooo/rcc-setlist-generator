"use client";

import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Music, Plus, Search, Sparkles, Play, Edit2, Trash2, Eye } from "lucide-react";
import { type Song } from "@/components/SongCard";
import { supabase } from "@/lib/supabaseClient";
import SongPreviewDialog from "@/components/SongPreviewDialog";
import SongDetailsDialog from "@/components/SongDetailsDialog";
import SongUploadDialog from "@/components/SongUploadDialog";

type SongForm = {
  title: string;
  artist: string;
  originalKey: string;
  tempo: string;
  notes: string;
  lyrics: string;
  youtubeLink: string;
};

const mapSong = (record: any): Song => ({
  id: record.id,
  title: record.title,
  originalKey: record.original_key || record.originalKey || "",
  tempo: record.tempo ?? "",
  tags: record.tags || [],
  addedAt: record.created_at || record.added_at || record.addedAt || "",
  notes: record.notes ?? "",
  lyrics: record.lyrics ?? "",
});

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKey, setSelectedKey] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const { toast } = useToast();

  const fetchSongs = async () => {
    const { data, error } = await supabase.from("songs").select("*");
    if (error) {
      toast({ title: "Failed to load songs", description: error.message });
      return;
    }
    const supabaseSongs = (data ?? []).map(mapSong);
    const stored = localStorage.getItem("uploadedSongs");
    const uploadedSongs: Song[] = stored ? JSON.parse(stored) : [];
    setSongs([...uploadedSongs, ...supabaseSongs]);
  };

  useEffect(() => {
    fetchSongs();
    const subscription = supabase
      .channel("public:songs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "songs" },
        () => fetchSongs(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const availableKeys = useMemo(() => {
    const keys = Array.from(new Set(songs.map((s) => (s.originalKey || "").trim()))).sort();
    return ["all", ...keys];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesSearch = song.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesKey = selectedKey === "all" || (song.originalKey || "").trim() === selectedKey;
      return matchesSearch && matchesKey;
    });
  }, [songs, searchTerm, selectedKey]);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingSong(null);
  };

  const handleUploadSubmit = async (data: SongForm) => {
    if (!data.title.trim() || !data.originalKey.trim()) {
      toast({
        title: "Song not saved",
        description: "Title and original key are required.",
      });
      return;
    }

    const payload = {
      title: data.title.trim(),
      original_key: data.originalKey.trim(),
      artist: data.artist.trim(),
      tempo: data.tempo.trim(),
      tags: [],
      notes: data.notes.trim(),
      lyrics: data.lyrics.trim(),
      youtube_link: data.youtubeLink.trim(),
    };

    if (editingSong) {
      const { error } = await supabase
        .from("songs")
        .update(payload)
        .eq("id", editingSong.id);

      if (error) {
        toast({ title: "Update failed", description: error.message });
        return;
      }

      setSongs((cur) =>
        cur.map((s) =>
          s.id === editingSong.id
            ? {
                ...s,
                title: payload.title,
                originalKey: payload.original_key,
                tempo: payload.tempo,
                notes: payload.notes,
                lyrics: payload.lyrics,
              }
            : s,
        ),
      );
      toast({ title: "Song updated", description: `${payload.title} updated.` });
    } else {
      const { data: insertData, error } = await supabase.from("songs").insert(payload).select();
      if (error) {
        toast({ title: "Add failed", description: error.message });
        return;
      }
      setSongs((cur) => [mapSong(insertData?.[0]), ...cur]);
      toast({ title: "Song added", description: `${payload.title} added.` });
    }

    handleDialogClose();
  };

  const handleDeleteSong = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      "Are you sure you want to delete this song? This action cannot be undone.",
    );
    if (!confirmed) return;

    supabase.from("songs").delete().eq("id", songId).then(({ error }) => {
      if (error) {
        toast({ title: "Delete failed", description: error.message });
        return;
      }
      setSongs((cur) => cur.filter((s) => s.id !== songId));
      toast({ title: "Song deleted", description: "Song removed from library." });
    });
  };

  const handleEditSong = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setEditingSong(song);
    setIsDialogOpen(true);
  };

  const [previewSong, setPreviewSong] = useState<Song | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setPreviewSong(song);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewSong(null);
  };

  const handleRowClick = (song: Song) => {
    // Open details dialog instead of new tab
    setDetailsSong(song);
    setIsDetailsOpen(true);
  };

  // Floating Details Dialog state
  const [detailsSong, setDetailsSong] = useState<Song | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setDetailsSong(null);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 pb-32 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
              <Music className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Song Library
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            View tracks, transpose live chords, and manage your church's repertoire list.
          </p>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="h-11 rounded-[18px] bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] font-bold px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload New Song
        </Button>
      </header>

      {/* Upload/Edit Dialog */}
      <SongUploadDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={handleUploadSubmit}
        initialData={
          editingSong
            ? {
                title: editingSong.title,
                artist: "",
                originalKey: editingSong.originalKey,
                tempo: editingSong.tempo ?? "",
                notes: editingSong.notes ?? "",
                lyrics: editingSong.lyrics ?? "",
                youtubeLink: "",
              }
            : undefined
        }
        isEditing={!!editingSong}
      />

      {/* MP3 Player Style Tracklist Frame */}
      <Card className="neu-card border-0 bg-white/75 dark:bg-card/75">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Worship Playlists</CardTitle>
          <CardDescription>
            Click any track row to open full live performance views and real‑time transpose controls in an elegant overlay.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tracks by title, lyrics..."
                className="pl-10 h-11 rounded-full bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <Select value={selectedKey} onValueChange={setSelectedKey}>
                <SelectTrigger className="h-11 rounded-full bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 px-4 min-w-[140px]">
                  <SelectValue placeholder="Filter key" />
                </SelectTrigger>
                <SelectContent className="rounded-[18px]">
                  {availableKeys.map((key) => (
                    <SelectItem key={key} value={key} className="rounded-xl">
                      {key === "all" ? "All Keys" : `Key of ${key}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Badge variant="secondary" className="rounded-full bg-indigo-500/10 text-indigo-500 px-3 py-1.5 font-bold border-0 text-[10px]">
                {filteredSongs.length} Songs Loaded
              </Badge>
            </div>
          </div>

          {filteredSongs.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-black/10 dark:border-white/10 p-12 text-center bg-black/[0.01]">
              <Music className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60 animate-pulse" />
              <p className="font-bold">No tracks matched query</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try querying another title or upload a new chord matrix above.
              </p>
            </div>
          ) : (
            /* MP3 Player List */
            <div className="rounded-[24px] border border-black/5 dark:border-white/5 overflow-hidden divide-y divide-black/5 dark:divide-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
              {filteredSongs.map((song, index) => {
                const tagsArray = Array.isArray(song.tags) ? song.tags : [];
                return (
                  <div
                    key={song.id}
                    onClick={() => handleRowClick(song)}
                    className="group flex items-center justify-between p-3.5 hover:bg-indigo-500/5 cursor-pointer transition-colors duration-300"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Play/Index indicator */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[16px] bg-black/5 dark:bg-white/5 text-muted-foreground group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <span className="text-xs font-bold group-hover:hidden">{index + 1}</span>
                        <Play className="h-3.5 w-3.5 hidden group-hover:block" />
                      </div>

                      {/* Song Title & Tags */}
                      <div className="min-w-0">
                        <div className="font-bold text-foreground text-sm tracking-tight truncate group-hover:text-indigo-500 transition-colors">
                          {song.title}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {tagsArray.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded-[6px] bg-black/5 dark:bg-white/5 text-muted-foreground text-[8px] font-bold uppercase tracking-wider"
                            >
                              {tag}
                            </span>
                          ))}
                          {song.tempo && (
                            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                              • {song.tempo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meta stats & Quick Action buttons */}
                    <div className="flex items-center gap-6">
                      {/* Original Key Indicator */}
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Key</div>
                        <div className="font-black text-indigo-500 dark:text-indigo-400 text-sm">{song.originalKey || "C"}</div>
                      </div>

                      {/* Audio Controls row */}
                      <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-[14px]">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handlePreview(e, song)}
                          className="h-8 w-8 rounded-[10px] hover:bg-white/50 dark:hover:bg-white/10"
                        >
                          <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEditSong(e, song)}
                          className="h-8 w-8 rounded-[10px] hover:bg-white/50 dark:hover:bg-white/10"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-indigo-400 hover:text-indigo-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteSong(e, song.id)}
                          className="h-8 w-8 rounded-[10px] hover:bg-red-500/10 text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <SongPreviewDialog song={previewSong} open={isPreviewOpen} onClose={closePreview} />

      {/* Floating Interactive Details Dialog with Real-time Transposer */}
      <SongDetailsDialog song={detailsSong} open={isDetailsOpen} onClose={closeDetails} />
    </div>
  );
}