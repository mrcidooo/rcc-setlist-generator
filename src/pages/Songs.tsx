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
import { Music, Plus, Search, Trash2 } from "lucide-react";
import { SongCard, type Song } from "@/components/SongCard";
import { supabase } from "@/lib/supabaseClient";
import SongPreviewDialog from "@/components/SongPreviewDialog";

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

  // -----------------------------------------------------------------
  // Load songs (real‑time)
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase.from("songs").select("*");
      if (error) {
        console.error("Error loading songs:", error);
        toast({ title: "Failed to load songs", description: error.message });
        return;
      }

      const supabaseSongs = (data as Song[]) ?? [];

      const stored = localStorage.getItem("uploadedSongs");
      const uploadedSongs: Song[] = stored ? JSON.parse(stored) : [];

      setSongs([...uploadedSongs, ...supabaseSongs]);
    };

    fetchSongs();

    const subscription = supabase
      .channel("public:songs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "songs" },
        () => fetchSongs(),
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  // -----------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------
  const availableKeys = useMemo(() => {
    const keys = Array.from(new Set(songs.map((s) => s.originalKey))).sort();
    return ["all", ...keys];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesSearch = song.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesKey =
        selectedKey === "all" || song.originalKey === selectedKey;
      return matchesSearch && matchesKey;
    });
  }, [songs, searchTerm, selectedKey]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
  };

  // -----------------------------------------------------------------
  // Add / Update song
  // -----------------------------------------------------------------
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
      originalKey: form.originalKey.trim().toUpperCase(),
      tempo: form.tempo.trim(),
      tags: parsedTags,
      notes: form.notes.trim(),
      lyrics: form.lyrics.trim(),
    };

    if (editingSong) {
      // UPDATE
      const { error } = await supabase
        .from("songs")
        .update(payload)
        .eq("id", editingSong.id);

      if (error) {
        toast({ title: "Update failed", description: error.message });
        return;
      }

      setSongs((cur) =>
        cur.map((s) => (s.id === editingSong.id ? { ...s, ...payload, addedAt: s.addedAt } : s)),
      );
      toast({ title: "Song updated", description: `${payload.title} updated.` });
    } else {
      // INSERT
      const { data, error } = await supabase.from("songs").insert(payload).select();

      if (error) {
        toast({ title: "Add failed", description: error.message });
        return;
      }

      setSongs((cur) => [...(data as Song[]), ...cur]);
      toast({ title: "Song added", description: `${payload.title} added.` });
    }

    // Reset form
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

  // -----------------------------------------------------------------
  // Delete song
  // -----------------------------------------------------------------
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

  // -----------------------------------------------------------------
  // Edit flow
  // -----------------------------------------------------------------
  const handleEditSong = (song: Song) => {
    setEditingSong(song);
    setForm({
      title: song.title,
      originalKey: song.originalKey,
      tempo: song.tempo ?? "",
      tags: song.tags.join(", "),
      notes: song.notes ?? "",
      lyrics: (song as any).lyrics ?? "",
    });
    setIsAddingSong(true);
  };

  // -----------------------------------------------------------------
  // Preview dialog
  // -----------------------------------------------------------------
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

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background p-4 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Song Library
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add, search, filter, preview and edit songs.
            </p>
          </div>

          <Button onClick={() => setIsAddingSong((c) => !c)}>
            <Plus className="mr-2 h-4 w-4" />
            {isAddingSong ? "Hide Form" : "Upload New Song"}
          </Button>
        </header>

        {/* Add / Edit Form */}
        {isAddingSong && (
          <Card>
            <CardHeader>
              <CardTitle>{editingSong ? "Edit Song" : "Add New Song"}</CardTitle>
              <CardDescription>
                {editingSong
                  ? "Update the song details."
                  : "Enter details for a new song."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddOrUpdate} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="song-title">Song Title *</Label>
                    <Input
                      id="song-title"
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Way Maker"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="song-key">Original Key *</Label>
                    <Input
                      id="song-key"
                      name="originalKey"
                      value={form.originalKey}
                      onChange={handleInputChange}
                      placeholder="e.g., C, D, G"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="song-tempo">Tempo</Label>
                    <Input
                      id="song-tempo"
                      name="tempo"
                      value={form.tempo}
                      onChange={handleInputChange}
                      placeholder="e.g., 72 BPM"
                    />
                  </div>

                  <div>
                    <Label htmlFor="song-tags">Tags</Label>
                    <Input
                      id="song-tags"
                      name="tags"
                      value={form.tags}
                      onChange={handleInputChange}
                      placeholder="e.g., Praise, Worship"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="song-notes">Notes</Label>
                  <Textarea
                    id="song-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleInputChange}
                    placeholder="Any notes about this song"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="song-lyrics">Lyrics & Chords</Label>
                  <Textarea
                    id="song-lyrics"
                    name="lyrics"
                    value={form.lyrics}
                    onChange={handleInputChange}
                    placeholder="Paste lyrics with chord markings here…"
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-3">
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
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSong ? "Update Song" : "Add Song"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Song list */}
        <Card>
          <CardHeader>
            <CardTitle>Browse Songs</CardTitle>
            <CardDescription>
              Search, filter, preview and edit songs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search songs..."
                  className="pl-9"
                />
              </div>

              <Select value={selectedKey} onValueChange={setSelectedKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by key" />
                </SelectTrigger>
                <SelectContent>
                  {availableKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key === "all" ? "All Keys" : key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{songs.length} total songs</Badge>
              <Badge variant="outline">{filteredSongs.length} shown</Badge>
            </div>

            {filteredSongs.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <Music className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">No songs found</p>
                <p className="text-sm text-muted-foreground">
                  Try a different search term or key filter.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}