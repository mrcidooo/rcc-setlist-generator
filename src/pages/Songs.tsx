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
  const [form, setForm] = useState({
    title: "",
    originalKey: "",
    tempo: "",
    tags: "",
    notes: "",
    lyrics: "", // new field for lyrics with chords
  });

  const { toast } = useToast();

  // -----------------------------------------------------------------
  // Load songs from Supabase and localStorage (real‑time)
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase.from("songs").select("*");
      if (error) {
        console.error("Error loading songs:", error);
        toast({
          title: "Failed to load songs",
          description: error.message,
        });
        return;
      }

      const supabaseSongs = (data as Song[]) ?? [];

      // Load uploaded songs from localStorage
      const stored = localStorage.getItem("uploadedSongs");
      const uploadedSongs: Song[] = stored ? JSON.parse(stored) : [];

      // Merge, giving precedence to uploaded songs (they have unique IDs)
      setSongs([...uploadedSongs, ...supabaseSongs]);
    };

    fetchSongs();

    const subscription = supabase
      .channel("public:songs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "songs" },
        () => {
          fetchSongs();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // -----------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------
  const availableKeys = useMemo(() => {
    const keys = Array.from(new Set(songs.map((song) => song.originalKey))).sort();
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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  // -----------------------------------------------------------------
  // Add new song (writes to Supabase)
  // -----------------------------------------------------------------
  const handleAddSong = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.originalKey.trim()) {
      toast({
        title: "Song not added",
        description: "Please enter at least a song title and original key.",
      });
      return;
    }

    const parsedTags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const newSong: Omit<Song, "id"> = {
      title: form.title.trim(),
      originalKey: form.originalKey.trim().toUpperCase(),
      tempo: form.tempo.trim(),
      tags: parsedTags,
      addedAt: "Just now",
      notes: form.notes.trim(),
      lyrics: form.lyrics.trim(),
    };

    const { data, error } = await supabase.from("songs").insert(newSong).select();

    if (error) {
      console.error("Error adding song:", error);
      toast({
        title: "Failed to add song",
        description: error.message,
      });
    } else {
      setSongs((current) => [...(data as Song[]), ...current]);
      toast({
        title: "Song added",
        description: `${newSong.title} was added to your library.`,
      });
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
  };

  // -----------------------------------------------------------------
  // Delete song (writes to Supabase)
  // -----------------------------------------------------------------
  const handleDeleteSong = async (songId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this song? This action cannot be undone.",
    );
    if (!confirmed) return;

    const { error } = await supabase.from("songs").delete().eq("id", songId);

    if (error) {
      console.error("Error deleting song:", error);
      toast({
        title: "Failed to delete song",
        description: error.message,
      });
    } else {
      setSongs((current) => current.filter((s) => s.id !== songId));
      toast({
        title: "Song deleted",
        description: "The song has been removed from your library.",
      });
    }
  };

  // -----------------------------------------------------------------
  // Preview – open dialog with lyrics/chords
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
              Add, search, filter, and preview worship songs.
            </p>
          </div>

          <Button onClick={() => setIsAddingSong((current) => !current)}>
            <Plus className="mr-2 h-4 w-4" />
            {isAddingSong ? "Hide Form" : "Upload New Song"}
          </Button>
        </header>

        {isAddingSong && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Song</CardTitle>
              <CardDescription>
                Enter the song details that will be used in setlists and key
                recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSong} className="space-y-4">
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
                      placeholder="e.g., Praise, Worship, Upbeat"
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

                {/* New lyrics textarea */}
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
                    onClick={() => setIsAddingSong(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Song</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Browse Songs</CardTitle>
            <CardDescription>
              Search by title or filter by original key.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
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