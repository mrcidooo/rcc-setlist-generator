"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, FileText, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export default function Setlists() {
  const [setlist, setSetlist] = useState({
    id: "1",
    name: "",
    date: "",
    serviceType: "Sunday Worship" as const,
    songs: [] as Array<{
      songId: string;
      songTitle: string;
      singerId: string;
      singerName: string;
      selectedKey: string;
      notes: string;
      order: number;
    }>
  });

  const [availableSongs] = useState<Array<{id: string; title: string; originalKey: string}>>([
    { id: "1", title: "Way Maker", originalKey: "D" },
    { id: "2", title: "Goodness of God", originalKey: "G" },
    { id: "3", title: "What A Beautiful Name", originalKey: "D" },
    { id: "4", title: "Reckless Love", originalKey: "G" },
    { id: "5", title: "Gratitude", originalKey: "A" }
  ]);

  const [availableSingers] = useState<Array<{id: string; name: string}>>([
    { id: "1", name: "John Smith" },
    { id: "2", name: "Sarah Johnson" },
    { id: "3", name: "Mike Davis" }
  ]);

  // Sample key matrix for recommendations
  const keyMatrix: Record<string, Record<string, string>> = {
    "1": { "1": "D", "2": "F", "3": "C" },
    "2": { "1": "G", "2": "B", "3": "E" },
    "3": { "1": "D", "2": "F#", "3": "B" },
    "4": { "1": "G", "2": "B", "3": "D" },
    "5": { "1": "A", "2": "C#", "3": "F#" }
  };

  const [formData, setFormData] = useState({
    songId: "" as string,
    singerId: "" as string,
    notes: ""
  });

  const [isAddingSong, setIsAddingSong] = useState(false);

  const handleSetlistChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSetlist(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSongFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRecommendedKey = (songId: string, singerId: string): string => {
    return keyMatrix[songId]?.[singerId] || "";
  };

  const handleAddSong = () => {
    if (!formData.songId || !formData.singerId) return;

    const song = availableSongs.find(s => s.id === formData.songId);
    const singer = availableSingers.find(s => s.id === formData.singerId);
    
    if (!song || !singer) return;

    const newSongEntry = {
      id: Date.now().toString(),
      songId: song.id,
      songTitle: song.title,
      singerId: singer.id,
      singerName: singer.name,
      selectedKey: getRecommendedKey(song.id, singer.id) || song.originalKey,
      notes: formData.notes,
      order: setlist.songs.length + 1
    };

    setSetlist(prev => ({
      ...prev,
      songs: [...prev.songs, newSongEntry]
    }));

    setFormData({
      songId: "",
      singerId: "",
      notes: ""
    });
    setIsAddingSong(false);
  };

  const handleRemoveSong = (id: string) => {
    setSetlist(prev => ({
      ...prev,
      songs: prev.songs.filter(song => song.id !== id)
    }));
  };

  const handleMoveUp = (id: string) => {
    setSetlist(prev => {
      const songs = [...prev.songs];
      const index = songs.findIndex(song => song.id === id);
      if (index > 0) {
        [songs[index], songs[index-1]] = [songs[index-1], songs[index]];
        // Update order numbers
        songs.forEach((song, idx) => {
          song.order = idx + 1;
        });
      }
      return { ...prev, songs };
    });
  };

  const handleMoveDown = (id: string) => {
    setSetlist(prev => {
      const songs = [...prev.songs];
      const index = songs.findIndex(song => song.id === id);
      if (index < songs.length - 1) {
        [songs[index], songs[index+1]] = [songs[index+1], songs[index]];
        // Update order numbers
        songs.forEach((song, idx) => {
          song.order = idx + 1;
        });
      }
      return { ...prev, songs };
    });
  };

  const handleGeneratePDF = () => {
    // In a real app, this would generate and download a PDF
    alert("PDF generation would happen here in a real implementation!\n\n" +
          `Setlist: ${setlist.name}\n` +
          `Date: ${setlist.date}\n` +
          `Service Type: ${setlist.serviceType}\n` +
          `Songs: ${setlist.songs.length}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Setlist Builder</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage worship setlists with automatic key recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setlist Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Setlist Name *</label>
              <Input
                value={setlist.name}
                onChange={handleSetlistChange}
                name="name"
                placeholder="Enter setlist name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <Input
                type="date"
                value={setlist.date}
                onChange={handleSetlistChange}
                name="date"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Service Type *</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type">
                    {setlist.serviceType}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sunday Worship">Sunday Worship</SelectItem>
                  <SelectItem value="Wednesday Prayer Meeting">Wednesday Prayer Meeting</SelectItem>
                  <SelectItem value="Special Event">Special Event</SelectItem>
                  <SelectItem value="Youth Service">Youth Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Button 
                variant="outline"
                onClick={() => setIsAddingSong(true)}
                className="w-full"
              >
                <Plus className="mr-2" /> Add Song to Setlist
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Song Form */}
      {isAddingSong && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Song to Setlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddSong();
            }}>
              <div>
                <label className="block text-sm font-medium mb-1">Select Song *</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a song">
                      {formData.songId ? 
                        availableSongs.find(s => s.id === formData.songId)?.title || "" : 
                        "Select a song"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableSongs.map(song => (
                      <SelectItem key={song.id} value={song.id}>
                        {song.title} ({song.originalKey})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Select Singer *</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a singer">
                      {formData.singerId ? 
                        availableSingers.find(s => s.id === formData.singerId)?.name || "" : 
                        "Select a singer"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableSingers.map(singer => (
                      <SelectItem key={singer.id} value={singer.id}>
                        {singer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <Textarea
                  value={formData.notes}
                  onChange={handleSongFormChange}
                  name="notes"
                  placeholder="Any special instructions for this song"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsAddingSong(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  isLoading={false}
                >
                  Add Song
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Setlist Songs */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Setlist Songs</h2>
        {setlist.songs.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            No songs added yet. Use the form above to add songs to your setlist.
          </p>
        ) : (
          <div className="space-y-3">
            {setlist.songs.map((songItem) => (
              <Card key={songItem.id} className="hover:shadow-md transition-shadow border-l-4 border-blue-500 dark:border-blue-400">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 w-8 h-8 rounded-full mr-3">
                        {songItem.order}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {songItem.songTitle}
                      </h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>Singer: {songItem.singerName}</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          Key: {songItem.selectedKey}
                        </span>
                        {songItem.selectedKey !== songItem.originalKey && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            (Recommended: {getRecommendedKey(songItem.songId, songItem.singerId)})
                          </span>
                        )}
                      </div>
                      {songItem.notes && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
                          {songItem.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMoveUp(songItem.id)}
                      disabled={songItem.order === 1}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMoveDown(songItem.id)}
                      disabled={songItem.order === setlist.songs.length}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive"
                      ghost
                      size="sm"
                      onClick={() => handleRemoveSong(songItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button 
          variant="outline"
          onClick={handleGeneratePDF}
          className="mr-4"
        >
          <FileText className="mr-2" /> Generate PDF
        </Button>
        <Button 
          variant="default"
          onClick={handleGeneratePDF}
        >
          Save Setlist
        </Button>
      </div>
    </div>
  );
}