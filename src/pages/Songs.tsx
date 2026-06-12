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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Music, Plus, Search, Sparkles } from "lucide-react";
import { SongCard, type Song } from "@/components/SongCard";
import { supabase } from "@/lib/supabaseClient";
import SongPreviewDialog from "@/components/SongPreviewDialog";

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
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [form, setForm] = useState({
    title: "",
    originalKey: "",
    tempo: "",
    tags: "",
    notes: "",
    lyrics: "",
  });

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
      const matchesKey =
        selectedKey === "all" || (song.originalKey || "").trim() === selectedKey;
      return matchesSearch && matchesKey;
    });
  }, [songs, searchTerm, selectedKey]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((c) => ({
      ...c,
      [name]: value,
    }));
  };

  const handleAddOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.title.trim() || !form.originalKey.trim()) {
      toast({
        title: "Song not saved",
        description: "Title and original key are required.",
      });
      return;
    }

    const parsedTags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      original_key: form.originalKey.trim(),
      originalKey: form.originalKey.trim(),
      tempo: form.tempo.trim(),
      tags: parsedTags,
      notes: form.notes.trim(),
      lyrics: form.lyrics.trim(),
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
          s.id === editingSong.id ? { ...s, ...payload, originalKey: form.originalKey, addedAt: s.addedAt } : s,
        ),
      );
      toast({ title: "Song updated", description: `${payload.title} updated.` });
    } else {
      const { data, error } = await supabase.from("songs").insert(payload).select();

      if (error) {
        toast({ title: "Add failed", description: error.message });
        return;
      }

      setSongs((cur) => [mapSong(data?.[0]), ...cur]);
      toast({ title: "Song added", description: `${payload.title} added.` });
    }

    setForm({
      title: "",
      originalKey: "",
      tempo: "",
      tags: "",
      notes: "",
      lyrics: "",
    });
    setIsAddingSong(false);
    setEditingSong(null);
  };

  const handleDeleteSong = async (songId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this song? This action cannot be undone.",
    );
    if (!confirmed) return;

    const { error } = await supabase.from("songs").delete().eq("id", songId);
    if (error) {
      toast({ title: "Delete failed", description: error.message });
      return;
    }

    setSongs((cur) => cur.filter((s) => s.id !== songId));
    toast({ title: "Song deleted", description: "Song removed from library." });
  };

  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    const tagsArray = Array.isArray(song.tags) ? song.tags : [];

    setForm({
      title: song.title,
      originalKey: song.originalKey || "",
      tempo: song.tempo ?? "",
      tags: tagsArray.join(", "),
      notes: song.notes ?? "",
      lyrics: (song as any).lyrics ?? "",
    });
    setIsAddingSong(true);

    window.scrollTo({ top: 0, behavior: "smooth" });

    toast({
      title: "Editing mode active",
      description: `Editing "${song.title}" record in the form above.`,
    });
  };

  const [previewSong, setPreviewSong] = useState<Song | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (song: Song) => {
    setPreviewSong(song);
    setIsPreviewOpen(true);
  };
  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewSong(null);
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
            Search songs, edit chord profiles, and update performance indices.
          </p>
        </div>

        <Button 
          onClick={() => {
            setIsAddingSong((c) => !c);
            if (isAddingSong) {
              setEditingSong(null);
              setForm({
                title: "",
                originalKey: "",
                tempo: "",
                tags: "",
                notes: "",
                lyrics: "",
              });
            }
          }}
          className="h-11 rounded-[18px] bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] font-bold px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          {isAddingSong ? (editingSong ? "Switch to Upload" : "Hide Form") : "Upload New Song"}
        </Button>
      </header>

      {/* Upload/Edit Form */}
      {isAddingSong && (
        <Card className="neu-card border-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:bg-card/75">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
              <div>
                <CardTitle className="text-lg font-bold">{editingSong ? `Edit Song: ${editingSong.title}` : "Upload Song Record"}</CardTitle>
                <CardDescription>
                  Configure song attributes, original keys, and lyrics/chords.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="song-title" className="text-xs font-bold text-muted-foreground uppercase">Song Title *</Label>
                  <Input
                    id="song-title"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Way Maker"
                    className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="song-key" className="text-xs font-bold text-muted-foreground uppercase">Original Key *</Label>
                  <Input
                    id="song-key"
                    name="originalKey"
                    value={form.originalKey}
                    onChange={handleInputChange}
                    placeholder="e.g., C, D, Bb, Eb"
                    className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="song-tempo" className="text-xs font-bold text-muted-foreground uppercase">Tempo</Label>
                  <Input
                    id="song-tempo"
                    name="tempo"
                    value={form.tempo}
                    onChange={handleInputChange}
                    placeholder="e.g., 72 BPM"
                    className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="song-tags" className="text-xs font-bold text-muted-foreground uppercase">Tags</Label>
                  <Input
                    id="song-tags"
                    name="tags"
                    value={form.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., Praise, Worship"
                    className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="song-notes" className="text-xs font-bold text-muted-foreground uppercase">Performance Notes</Label>
                <Textarea
                  id="song-notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  placeholder="Any structural notes about this song..."
                  className="rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="song-lyrics" className="text-xs font-bold text-muted-foreground uppercase">Lyrics & Chord Matrix</Label>
                <Textarea
                  id="song-lyrics"
                  name="lyrics"
                  value={form.lyrics}
                  onChange={handleInputChange}
                  placeholder="Paste lyrics with chords wrapped like: [C] Amazing [G] grace..."
                  className="rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 font-mono text-xs"
                  rows={6}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingSong(false);
                    setEditingSong(null);
                    setForm({
                      title: "",
                      originalKey: "",
                      tempo: "",
                      tags: "",
                      notes: "",
                      lyrics: "",
                    });
                  }}
                  className="rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] font-bold px-5"
                >
                  {editingSong ? "Update Record" : "Save Record"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Song List Frame */}
      <Card className="neu-card border-0 bg-white/75 dark:bg-card/75">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Browse Tracks</CardTitle>
          <CardDescription>
            Search, filter by comfortably assigned keys, and manage properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search active tracks..."
                className="pl-10 h-11 rounded-full bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
              />
            </div>

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
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="rounded-full bg-indigo-500/10 text-indigo-500 px-3 py-1 font-bold border-0 text-[10px]">
              {songs.length} total tracks
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-[10px] border-black/10 dark:border-white/10">
              {filteredSongs.length} matching criteria
            </Badge>
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
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPreview={handlePreview}
                  onDelete={handleDeleteSong}
                  onEdit={handleEditSong}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <SongPreviewDialog
        song={previewSong}
        open={isPreviewOpen}
        onClose={closePreview}
      />
    </div>
  );
}