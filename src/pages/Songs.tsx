"use client";

import { useMemo, useState } from "react";
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
import { Music, Plus, Search } from "lucide-react";
import { SongCard, type Song } from "@/components/SongCard";

const initialSongs: Song[] = [
  {
    id: "1",
    title: "Way Maker",
    originalKey: "D",
    tempo: "72 BPM",
    tags: ["Worship", "Mid Tempo"],
    addedAt: "2 days ago",
    notes: "Great opener with a strong congregational chorus.",
  },
  {
    id: "2",
    title: "Goodness of God",
    originalKey: "G",
    tempo: "68 BPM",
    tags: ["Worship", "Slow"],
    addedAt: "5 days ago",
  },
  {
    id: "3",
    title: "What A Beautiful Name",
    originalKey: "D",
    tempo: "70 BPM",
    tags: ["Worship", "Ballad"],
    addedAt: "1 week ago",
  },
  {
    id: "4",
    title: "Reckless Love",
    originalKey: "G",
    tempo: "74 BPM",
    tags: ["Worship", "Mid Tempo"],
    addedAt: "2 weeks ago",
  },
  {
    id: "5",
    title: "Gratitude",
    originalKey: "A",
    tempo: "64 BPM",
    tags: ["Worship", "Slow"],
    addedAt: "3 weeks ago",
  },
];

export default function Songs() {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKey, setSelectedKey] = useState("all");
  const [isAddingSong, setIsAddingSong] = useState(false);
  const [form, setForm] = useState({
    title: "",
    originalKey: "",
    tempo: "",
    tags: "",
    notes: "",
  });

  const { toast } = useToast();

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

  const handleAddSong = (event: React.FormEvent<HTMLFormElement>) => {
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

    const newSong: Song = {
      id: Date.now().toString(),
      title: form.title.trim(),
      originalKey: form.originalKey.trim().toUpperCase(),
      tempo: form.tempo.trim(),
      tags: parsedTags,
      addedAt: "Just now",
      notes: form.notes.trim(),
    };

    setSongs((current) => [newSong, ...current]);
    setForm({
      title: "",
      originalKey: "",
      tempo: "",
      tags: "",
      notes: "",
    });
    setIsAddingSong(false);

    toast({
      title: "Song added",
      description: `${newSong.title} was added to your library.`,
    });
  };

  const handlePreview = (song: Song) => {
    toast({
      title: song.title,
      description: `Original key: ${song.originalKey}${song.tempo ? ` • ${song.tempo}` : ""}`,
    });
  };

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
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}