"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Search, Edit, Trash2 } from "lucide-react";

export default function SingerKeyList() {
  // Sample data - in real app this would come from Supabase
  const [singerKeyData, setSingerKeyData] = useState<Record<string, Record<string, string>>>({
    "1": { "1": "D", "2": "F", "3": "C" }, // Way Maker: John->D, Sarah->F, Mike->C
    "2": { "1": "G", "2": "B", "3": "E" }, // Goodness of God: John->G, Sarah->B, Mike->E
    "3": { "1": "D", "2": "F#", "3": "B" }, // What A Beautiful Name: John->D, Sarah->F#, Mike->B
    "4": { "1": "G", "2": "B", "3": "D" }, // Reckless Love: John->G, Sarah->B, Mike->D
    "5": { "1": "A", "2": "C#", "3": "F#" } // Gratitude: John->A, Sarah->C#, Mike->F#
  });

  const [singers, setSingers] = useState([
    { id: "1", name: "John Smith" },
    { id: "2", name: "Sarah Johnson" },
    { id: "3", name: "Mike Davis" }
  ]);

  const [songs, setSongs] = useState([
    { id: "1", title: "Way Maker" },
    { id: "2", title: "Goodness of God" },
    { id: "3", title: "What A Beautiful Name" },
    { id: "4", title: "Reckless Love" },
    { id: "5", title: "Gratitude" }
  ]);

  const [newSingerName, setNewSingerName] = useState("");
  const [newSongTitle, setNewSongTitle] = useState("");

  const getKeyForSinger = (songId: string, singerId: string): string => {
    return singerKeyData[songId]?.[singerId] || "";
  };

  const handleAddSinger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSingerName.trim()) return;

    const singerId = Date.now().toString();
    const newSinger = { id: singerId, name: newSingerName };

    setSingers(prev => [...prev, newSinger]);
    
    // Initialize key data for new singer for all existing songs
    setSingerKeyData(prev => {
      const newData = { ...prev };
      songs.forEach(song => {
        if (!newData[song.id]) {
          newData[song.id] = {};
        }
        newData[song.id][singerId] = "";
      });
      return newData;
    });

    setNewSingerName("");
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongTitle.trim()) return;

    const songId = Date.now().toString();
    const newSong = { id: songId, title: newSongTitle };

    setSongs(prev => [...prev, newSong]);
    
    // Initialize key data for new song for all existing singers
    setSingerKeyData(prev => {
      const newData = { ...prev };
      newData[songId] = {};
      singers.forEach(singer => {
        newData[songId][singer.id] = "";
      });
      return newData;
    });

    setNewSongTitle("");
  };

  const handleDeleteSinger = (singerId: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this singer? This will remove all their key preferences.`);
    if (confirmDelete) {
      setSingers(prev => prev.filter(s => s.id !== singerId));
      setSingerKeyData(prev => {
        const newData = { ...prev };
        // Remove singer from all songs
        Object.keys(newData).forEach(songId => {
          delete newData[songId][singerId];
        });
        return newData;
      });
    }
  };

  const handleDeleteSong = (songId: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this song? This will remove all key preferences for this song.`);
    if (confirmDelete) {
      setSongs(prev => prev.filter(s => s.id !== songId));
      setSingerKeyData(prev => {
        const newData = { ...prev };
        delete newData[songId];
        return newData;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Singer Key Preferences</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage each singer's comfortable keys for different songs
        </p>
      </div>

      {/* Section 1: Key Preferences Matrix */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Preferences Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Song
                  </th>
                  {singers.map(singer => (
                    <th key={singer.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {singer.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {songs.map((song) => (
                  <tr key={song.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {song.title}
                    </td>
                    {singers.map((singer) => (
                      <td key={`${song.id}-${singer.id}`} className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center">
                          <span className="mr-2">Key:</span>
                          <Input
                            type="text"
                            value={getKeyForSinger(song.id, singer.id)}
                            onChange={(e) => {
                              const newKey = e.target.value;
                              setSingerKeyData(prev => ({
                                ...prev,
                                [song.id]: {
                                  ...prev[song.id],
                                  [singer.id]: newKey
                                }
                              }));
                            }}
                            className="w-16 text-center"
                            placeholder="-"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Manage Singers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Manage Singers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Singer List */}
          <div className="space-y-2">
            {singers.map(singer => (
              <div key={singer.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                <span className="font-medium">{singer.name}</span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteSinger(singer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Add Singer Form */}
          <form onSubmit={handleAddSinger} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Singer Name</label>
              <Input
                value={newSingerName}
                onChange={(e) => setNewSingerName(e.target.value)}
                placeholder="Enter singer name"
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Add Singer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section 3: Manage Songs */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Songs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Song List */}
          <div className="space-y-2">
            {songs.map(song => (
              <div key={song.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded">
                <span className="font-medium">{song.title}</span>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteSong(song.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Add Song Form */}
          <form onSubmit={handleAddSong} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Song Title</label>
              <Input
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                placeholder="Enter song title"
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Add Song
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}