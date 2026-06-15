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
import { Music, Plus, Search, Sparkles, Play, Pause, MoreHorizontal, Clock } from "lucide-react";
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

  // New state for chord detection
  const [detectedChords, setDetectedChords] = useState<string[]>([]);

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

  // -----------------------------------------------------------------
  // Helper: extract unique chords from lyrics (anything inside [])
  // -----------------------------------------------------------------
  const extractChords = (text: string): string[] => {
    const matches = text.match(/\[([^\]\s]+)\]/g);
    if (!matches) return [];
    const cleaned = matches.map((m) => m.replace(/[\[\]]/g, "").trim());
    // Keep order of first appearance, remove duplicates
    return Array.from(new Set(cleaned));
  };

  // Run detection whenever the lyrics field changes
  useEffect(() => {
    const chords = extractChords(form.lyrics);
    setDetectedChords(chords);
  }, [form.lyrics]);

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
    <div className="min-h-screen bg-black text-white p-4 pb-32 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-green-500/10 text-green-500 border border-green-500/10">
              <Music className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Your Library <Sparkles className="h-4 w-4 text-green-400 animate-pulse" />
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Manage your song collection with chord charts and vocal arrangements.
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
          className="h-11 rounded-[18px] bg-green-500 text-black shadow-[0_4px_15px_rgba(34,197,94,0.35)] font-bold px-6 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isAddingSong ? "Hide Form" : "Upload New Song"}
        </Button>
      </header>

      {/* Upload/Edit Form */}
      {isAddingSong && (
        <Card className="neu-card border-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:bg-card/75">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500 animate-pulse" />
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
                  <Label htmlFor="song-title" className="text-xs font-bold text-gray-400 uppercase">Song Title *</Label>
                  <Input
                    id="song-title"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Way Maker"
                    className="h-11 rounded-[18px] bg-gray-900/50 border border-gray-700 text-white focus:border-green-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="song-key" className="text-xs font-bold text-gray-400 uppercase">Original Key *</Label>
                  <Input
                    id="song-key"
                    name="originalKey"
                    value={form.originalKey}
                    onChange={handleInputChange}
                    placeholder="e.g., C, D, Bb, Eb"
                    className="h-11 rounded-[18px] bg-gray-900/50 border border-gray-700 text-white focus:border-green-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="song-tempo" className="text-xs font-bold text-gray-400 uppercase">Tempo</Label>
                  <Input
                    id="song-tempo"
                    name="tempo"
                    value={form.tempo}
                    onChange={handleInputChange}
                    placeholder="e.g., 72 BPM"
                    className="h-11 rounded-[18px] bg-gray-900/50 border border-gray-700 text-white focus:border-green-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="song-tags" className="text-xs font-bold text-gray-400 uppercase">Tags</Label>
                  <Input
                    id="song-tags"
                    name="tags"
                    value={form.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., Praise, Worship"
                    className="h-11 rounded-[18px] bg-gray-900/50 border border-gray-700 text-white focus:border-green-500"
                  />
                </div>
              </div>

              {/* ---- NEW UI: Detected chords preview ---- */}
              {detectedChords.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                  <span className="text-sm font-medium text-gray-400">
                    Detected chords:
                  </span>
                  {detectedChords.map((chord) => (
                    <Badge
                      key={chord}
                      variant="secondary"
                      className="rounded-[10px] bg-green-500/10 text-green-400 border-0 text-[10px] font-bold"
                    >
                      {chord}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="song-notes" className="text-xs font-bold text-gray-400 uppercase">Performance Notes</Label>
                <Textarea
                  id="song-notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  placeholder="Any structural notes about this song..."
                  className="rounded-[18px] bg-gray-900/50 border border-gray-700 text-white focus:border-green-500"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="song-lyrics" className="text-xs font-bold text-gray-400 uppercase">Lyrics & Chord Matrix</Label>
                <Textarea
                  id="song-lyrics"
                  name="lyrics"
                  value={form.lyrics}
                  onChange={handleInputChange}
                  placeholder="Paste lyrics with chords wrapped like: [C] Amazing [G] grace..."
                  className="rounded-[18px] bg-gray-900/50 border border-gray-700 text-white font-mono text-xs focus:border-green-500"
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
                  className="rounded-xl font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="rounded-xl bg-green-500 text-black shadow-[0_4px_12px_rgba(34,197,94,0.3)] font-bold px-5"
                >
                  {editingSong ? "Update Record" : "Save Record"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Spotify-style song list */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search songs..."
                className="pl-10 h-10 rounded-full bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
              />
            </div>

            <Select value={selectedKey} onValueChange={setSelectedKey}>
              <SelectTrigger className="h-10 rounded-full bg-gray-900 border-gray-700 text-white px-4 min-w-[140px]">
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

          <div className="flex gap-2">
            <Badge variant="secondary" className="rounded-full bg-gray-800 text-gray-300 px-3 py-1 font-bold text-[10px]">
              {songs.length} total tracks
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-[10px] border-gray-700 text-gray-400">
              {filteredSongs.length} matching
            </Badge>
          </div>
        </div>

        {/* Song list - Spotify style */}
        <div className="space-y-2">
          {filteredSongs.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-gray-800 p-12 text-center bg-gray-900/20">
              <Music className="mx-auto mb-3 h-10 w-10 text-gray-600 animate-pulse" />
              <p className="font-bold text-gray-400">No tracks matched query</p>
              <p className="text-xs text-gray-500 mt-1">
                Try querying another title or upload a new chord matrix above.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredSongs.map((song, index) => {
                const tagsArray = Array.isArray(song.tags) ? song.tags : [];
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={song.id}
                    className={`flex items-center gap-4 rounded-xl p-3 transition-all duration-200 group ${
                      isEven ? "bg-gray-900/30" : "bg-gray-800/20"
                    } hover:bg-gray-800/40`}
                  >
                    {/* Album art placeholder */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 flex-shrink-0">
                      <Music className="h-6 w-6" />
                    </div>

                    {/* Song info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm tracking-tight truncate">
                          {song.title}
                        </h3>
                        <Badge variant="secondary" className="rounded-lg bg-gray-800 text-gray-400 text-[10px] font-bold border-0">
                          {song.originalKey}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tagsArray.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[11px] text-gray-500 font-medium">
                            {tag}
                          </span>
                        ))}
                        {song.tempo && (
                          <span className="text-[11px] text-gray-500 font-medium">• {song.tempo}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(song)}
                        className="h-8 w-8 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSong(song)}
                        className="h-8 w-8 rounded-full text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <SongPreviewDialog
        song={previewSong}
        open={isPreviewOpen}
        onClose={closePreview}
      />
    </div>
  );
}</arg_value>
<description="Redesigned Songs page with Spotify-inspired aesthetic featuring dark theme, album art placeholders, and clean track listings">