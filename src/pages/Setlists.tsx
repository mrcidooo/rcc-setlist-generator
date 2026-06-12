"use client";

import { useState } from "react";
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
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  FileText,
  ListMusic,
  Music,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

type SetlistSong = {
  id: string;
  songId: string;
  songTitle: string;
  singerId: string;
  singerName: string;
  selectedKey: string;
  originalKey: string;
  notes: string;
  order: number;
};

type Setlist = {
  id: string;
  name: string;
  date: string;
  serviceType: "Sunday Worship" | "Wednesday Prayer Meeting" | "Special Event" | "Youth Service";
  songs: SetlistSong[];
};

const availableSongs = [
  { id: "1", title: "Way Maker", originalKey: "D" },
  { id: "2", title: "Goodness of God", originalKey: "G" },
  { id: "3", title: "What A Beautiful Name", originalKey: "D" },
  { id: "4", title: "Reckless Love", originalKey: "G" },
  { id: "5", title: "Gratitude", originalKey: "A" },
];

const availableSingers = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Mike Davis" },
];

const serviceTypes = [
  "Sunday Worship",
  "Wednesday Prayer Meeting",
  "Special Event",
  "Youth Service",
] as const;

const keyMatrix: Record<string, Record<string, string>> = {
  "1": { "1": "D", "2": "F", "3": "C" },
  "2": { "1": "G", "2": "B", "3": "E" },
  "3": { "1": "D", "2": "F#", "3": "B" },
  "4": { "1": "G", "2": "B", "3": "D" },
  "5": { "1": "A", "2": "C#", "3": "F#" },
};

export default function Setlists() {
  const [setlist, setSetlist] = useState<Setlist>({
    id: "1",
    name: "",
    date: "",
    serviceType: "Sunday Worship",
    songs: [],
  });

  const [formData, setFormData] = useState({
    songId: "",
    singerId: "",
    selectedKey: "",
    notes: "",
  });

  const [isAddingSong, setIsAddingSong] = useState(false);
  const { toast } = useToast();

  const getRecommendedKey = (songId: string, singerId: string) => {
    return keyMatrix[songId]?.[singerId] ?? "";
  };

  const handleSetlistChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;
    setSetlist((current) => ({ ...current, [name]: value }));
  };

  const handleSongFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSongChange = (value: string) => {
    const song = availableSongs.find((item) => item.id === value);
    const recommendedKey = formData.singerId
      ? getRecommendedKey(value, formData.singerId)
      : "";

    setFormData((current) => ({
      ...current,
      songId: value,
      selectedKey: recommendedKey || song?.originalKey || "",
    }));
  };

  const handleSingerChange = (value: string) => {
    const recommendedKey = formData.songId
      ? getRecommendedKey(formData.songId, value)
      : "";

    setFormData((current) => ({
      ...current,
      singerId: value,
      selectedKey: recommendedKey || current.selectedKey,
    }));
  };

  const handleAddSong = () => {
    if (!formData.songId || !formData.singerId) {
      toast({
        title: "Song not added",
        description: "Please select both a song and a singer.",
      });
      return;
    }

    const song = availableSongs.find((item) => item.id === formData.songId);
    const singer = availableSingers.find((item) => item.id === formData.singerId);

    if (!song || !singer) return;

    const newSongEntry: SetlistSong = {
      id: Date.now().toString(),
      songId: song.id,
      songTitle: song.title,
      singerId: singer.id,
      singerName: singer.name,
      selectedKey: formData.selectedKey || getRecommendedKey(song.id, singer.id) || song.originalKey,
      originalKey: song.originalKey,
      notes: formData.notes.trim(),
      order: setlist.songs.length + 1,
    };

    setSetlist((current) => ({
      ...current,
      songs: [...current.songs, newSongEntry],
    }));

    setFormData({
      songId: "",
      singerId: "",
      selectedKey: "",
      notes: "",
    });
    setIsAddingSong(false);

    toast({
      title: "Song added",
      description: `${song.title} was added to the setlist.`,
    });
  };

  const handleRemoveSong = (id: string) => {
    setSetlist((current) => ({
      ...current,
      songs: current.songs
        .filter((song) => song.id !== id)
        .map((song, index) => ({ ...song, order: index + 1 })),
    }));
  };

  const moveSong = (id: string, direction: "up" | "down") => {
    setSetlist((current) => {
      const songs = [...current.songs];
      const index = songs.findIndex((song) => song.id === id);
      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || nextIndex < 0 || nextIndex >= songs.length) {
        return current;
      }

      [songs[index], songs[nextIndex]] = [songs[nextIndex], songs[index]];

      return {
        ...current,
        songs: songs.map((song, songIndex) => ({
          ...song,
          order: songIndex + 1,
        })),
      };
    });
  };

  const handleSaveSetlist = () => {
    if (!setlist.name.trim() || !setlist.date) {
      toast({
        title: "Setlist not saved",
        description: "Please add a setlist name and date.",
      });
      return;
    }

    if (setlist.songs.length === 0) {
      toast({
        title: "Setlist not saved",
        description: "Add at least one song before saving.",
      });
      return;
    }

    toast({
      title: "Setlist saved",
      description: `${setlist.name} was saved with ${setlist.songs.length} songs.`,
    });
  };

  const handleGeneratePDF = () => {
    if (!setlist.name.trim() || !setlist.date || setlist.songs.length === 0) {
      toast({
        title: "PDF not generated",
        description: "Complete the setlist details and add songs first.",
      });
      return;
    }

    toast({
      title: "PDF ready",
      description: "Your setlist PDF would be generated here.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Setlist Builder
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create worship setlists with singer-specific key recommendations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{setlist.songs.length} songs</Badge>
            <Badge variant="outline">{setlist.serviceType}</Badge>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Setlist Details</CardTitle>
            <CardDescription>
              Add the service information before building your song order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="setlist-name">Setlist Name *</Label>
                <Input
                  id="setlist-name"
                  name="name"
                  value={setlist.name}
                  onChange={handleSetlistChange}
                  placeholder="e.g., Sunday Worship"
                />
              </div>

              <div>
                <Label htmlFor="setlist-date">Date *</Label>
                <Input
                  id="setlist-date"
                  name="date"
                  type="date"
                  value={setlist.date}
                  onChange={handleSetlistChange}
                />
              </div>

              <div>
                <Label htmlFor="service-type">Service Type *</Label>
                <Select
                  value={setlist.serviceType}
                  onValueChange={(value) =>
                    setSetlist((current) => ({
                      ...current,
                      serviceType: value as Setlist["serviceType"],
                    }))
                  }
                >
                  <SelectTrigger id="service-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((serviceType) => (
                      <SelectItem key={serviceType} value={serviceType}>
                        {serviceType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAddingSong((current) => !current)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isAddingSong ? "Hide Song Form" : "Add Song to Setlist"}
            </Button>
          </CardContent>
        </Card>

        {isAddingSong && (
          <Card>
            <CardHeader>
              <CardTitle>Add Song to Setlist</CardTitle>
              <CardDescription>
                Select a song and singer. The recommended key will appear
                automatically when available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="setlist-song">Song *</Label>
                  <Select
                    value={formData.songId}
                    onValueChange={handleSongChange}
                  >
                    <SelectTrigger id="setlist-song">
                      <SelectValue placeholder="Select a song" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSongs.map((song) => (
                        <SelectItem key={song.id} value={song.id}>
                          {song.title} ({song.originalKey})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="setlist-singer">Singer *</Label>
                  <Select
                    value={formData.singerId}
                    onValueChange={handleSingerChange}
                  >
                    <SelectTrigger id="setlist-singer">
                      <SelectValue placeholder="Select a singer" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSingers.map((singer) => (
                        <SelectItem key={singer.id} value={singer.id}>
                          {singer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="setlist-key">Selected Key</Label>
                  <Input
                    id="setlist-key"
                    name="selectedKey"
                    value={formData.selectedKey}
                    onChange={handleSongFormChange}
                    placeholder="Recommended or custom key"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="setlist-notes">Notes</Label>
                  <Textarea
                    id="setlist-notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleSongFormChange}
                    placeholder="Special instructions for this song"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddingSong(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddSong}>
                  Add Song
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Song Order</CardTitle>
            <CardDescription>
              Reorder songs, adjust keys, and remove items from the setlist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {setlist.songs.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <ListMusic className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">No songs added yet</p>
                <p className="text-sm text-muted-foreground">
                  Use the form above to add songs to this setlist.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {setlist.songs.map((songItem) => (
                  <div
                    key={songItem.id}
                    className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {songItem.order}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {songItem.songTitle}
                          </h3>
                          <Badge variant="secondary">{songItem.originalKey}</Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {songItem.singerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Music className="h-3.5 w-3.5" />
                            Key: {songItem.selectedKey}
                          </span>
                        </div>
                        {songItem.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {songItem.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSong(songItem.id, "up")}
                        disabled={songItem.order === 1}
                      >
                        <ArrowUp className="mr-1 h-4 w-4" />
                        Up
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveSong(songItem.id, "down")}
                        disabled={songItem.order === setlist.songs.length}
                      >
                        <ArrowDown className="mr-1 h-4 w-4" />
                        Down
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveSong(songItem.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleGeneratePDF}>
            <FileText className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
          <Button onClick={handleSaveSetlist}>
            <Calendar className="mr-2 h-4 w-4" />
            Save Setlist
          </Button>
        </div>
      </div>
    </div>
  );
}