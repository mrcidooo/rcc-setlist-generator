"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

  const singers = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Sarah Johnson" },
    { id: "3", name: "Mike Davis" }
  ];

  const songs = [
    { id: "1", title: "Way Maker" },
    { id: "2", title: "Goodness of God" },
    { id: "3", title: "What A Beautiful Name" },
    { id: "4", title: "Reckless Love" },
    { id: "5", title: "Gratitude" }
  ];

  const getKeyForSinger = (songId: string, singerId: string): string => {
    return singerKeyData[songId]?.[singerId] || "";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Singer Key Preferences</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage each singer's comfortable keys for different songs
        </p>
      </div>

      <Card>
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

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>How to use:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Each row represents a song</li>
          <li>Each column represents a singer</li>
          <li>Enter the comfortable key for each singer on each song</li>
          <li>These keys will be used for automatic recommendations in the setlist builder</li>
        </ul>
      </div>
    </div>
  );
}