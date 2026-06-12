import { useState, type ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  availableSongs,
  availableSingers,
  emptySetlistSongForm,
  getRecommendedKey,
  initialSetlist,
} from "./constants";
import type { MoveDirection, Setlist, SetlistFormData } from "./types";

export function useSetlistBuilder() {
  const [setlist, setSetlist] = useState<Setlist>(initialSetlist);
  const [formData, setFormData] = useState<SetlistFormData>(
    emptySetlistSongForm,
  );
  const [isAddingSong, setIsAddingSong] = useState(false);
  const { toast } = useToast();

  const recommendedKey = getRecommendedKey(
    formData.songId,
    formData.singerId,
  );

  const handleSetlistChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSetlist((current) => ({ ...current, [name]: value }));
  };

  const handleSongFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSongChange = (value: string) => {
    const song = availableSongs.find((item) => item.id === value);
    const recommendedSongKey = getRecommendedKey(value, formData.singerId);

    setFormData((current) => ({
      ...current,
      songId: value,
      selectedKey: recommendedSongKey || song?.originalKey || "",
    }));
  };

  const handleSingerChange = (value: string) => {
    const recommendedSingerKey = getRecommendedKey(formData.songId, value);

    setFormData((current) => ({
      ...current,
      singerId: value,
      selectedKey: recommendedSingerKey || current.selectedKey,
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
    const singer = availableSingers.find(
      (item) => item.id === formData.singerId,
    );

    if (!song || !singer) return;

    const recommendedSongKey = getRecommendedKey(song.id, singer.id);

    const newSongEntry = {
      id: Date.now().toString(),
      songId: song.id,
      songTitle: song.title,
      singerId: singer.id,
      singerName: singer.name,
      selectedKey:
        formData.selectedKey || recommendedSongKey || song.originalKey,
      originalKey: song.originalKey,
      notes: formData.notes.trim(),
      order: setlist.songs.length + 1,
    };

    setSetlist((current) => ({
      ...current,
      songs: [...current.songs, newSongEntry],
    }));

    setFormData(emptySetlistSongForm);
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

  const moveSong = (id: string, direction: MoveDirection) => {
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

  const toggleSongForm = () => {
    setIsAddingSong((current) => !current);
  };

  return {
    setlist,
    formData,
    recommendedKey,
    isAddingSong,
    handleSetlistChange,
    handleSongFormChange,
    handleSongChange,
    handleSingerChange,
    handleAddSong,
    handleRemoveSong,
    moveSong,
    handleSaveSetlist,
    handleGeneratePDF,
    toggleSongForm,
  };
}