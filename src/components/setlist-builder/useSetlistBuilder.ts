"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  availableSongs,
  availableSingers,
  emptySetlistSongForm,
  getRecommendedKey,
  initialSetlist,
} from "./constants";
import type { MoveDirection, Setlist, SetlistFormData, AvailableSong, AvailableSinger } from "./types";
import { supabase } from "@/lib/supabaseClient";
import { generateSetlistPDF } from "@/utils/pdfGenerator";
import { generateSetlistDOCX } from "@/utils/docxGenerator";

const SETLIST_DRAFT_STORAGE_KEY = "rcc_setlist_builder_draft";

const getStoredSetlist = (): Setlist | null => {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(SETLIST_DRAFT_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Setlist;

    if (!parsed || typeof parsed !== "object") return null;

    return {
      id: parsed.id || initialSetlist.id,
      name: parsed.name || "",
      date: parsed.date || "",
      serviceType: parsed.serviceType || "Sunday Worship",
      songs: Array.isArray(parsed.songs) ? parsed.songs : [],
    };
  } catch {
    return null;
  }
};

export function useSetlistBuilder() {
  const [setlist, setSetlist] = useState<Setlist>(() => {
    return getStoredSetlist() || initialSetlist;
  });
  const [formData, setFormData] = useState<SetlistFormData>(emptySetlistSongForm);
  const [isAddingSong, setIsAddingSong] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    window.localStorage.setItem(SETLIST_DRAFT_STORAGE_KEY, JSON.stringify(setlist));
  }, [setlist]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== SETLIST_DRAFT_STORAGE_KEY || !event.newValue) return;

      try {
        const parsed = JSON.parse(event.newValue) as Setlist;

        setSetlist({
          id: parsed.id || initialSetlist.id,
          name: parsed.name || "",
          date: parsed.date || "",
          serviceType: parsed.serviceType || "Sunday Worship",
          songs: Array.isArray(parsed.songs) ? parsed.songs : [],
        });
      } catch {
        return;
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // -----------------------------------------------------------------
  // Load the most recent setlist (or keep the empty starter)
  // -----------------------------------------------------------------
  useEffect(() => {
    const loadSetlist = async () => {
      const { data, error } = await supabase
        .from("setlists")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Failed to load setlist:", error);
        toast({ title: "Unable to load setlist", description: error.message });
        return;
      }

      if (data) {
        setSetlist(data as Setlist);
      }
    };

    loadSetlist();
  }, [toast]);

  // -----------------------------------------------------------------
  // Load the interactive key‑matrix for the current user (or anonymous)
  // -----------------------------------------------------------------
  const [keyMatrix, setKeyMatrix] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    const loadMatrix = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      let userId = authUser?.user?.id;

      if (!userId) {
        const storageKey = "vocal_key_user";
        let anonId = localStorage.getItem(storageKey);
        if (!anonId) {
          anonId = crypto.randomUUID();
          localStorage.setItem(storageKey, anonId);
        }
        userId = anonId;
      }

      const { data: matrixData, error } = await supabase
        .from("key_matrix")
        .select("matrix")
        .eq("user_id", userId)
        .single();

      if (!error && matrixData?.matrix) {
        setKeyMatrix(matrixData.matrix as Record<string, Record<string, string>>);
      } else {
        setKeyMatrix({});
      }
    };

    loadMatrix();
  }, []);

  // -----------------------------------------------------------------
  // Load real songs & singers from Supabase (used for adding tracks)
  // -----------------------------------------------------------------
  const [songs, setSongs] = useState<AvailableSong[]>([]);
  const [singers, setSingers] = useState<AvailableSinger[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: songData, error: songErr } = await supabase
        .from("songs")
        .select("id, title, original_key")
        .order("title");

      if (!songErr && songData) {
        const mapped = (songData as any[]).map((r) => ({
          id: r.id,
          title: r.title,
          originalKey: r.original_key,
        }));
        setSongs(mapped);
      } else {
        // fallback to static list if Supabase fails
        setSongs(availableSongs);
      }

      const { data: singerData, error: singerErr } = await supabase
        .from("singers")
        .select("id, name")
        .order("name");

      if (!singerErr && singerData) {
        const mapped = (singerData as any[]).map((r) => ({
          id: r.id,
          name: r.name,
        }));
        setSingers(mapped);
      } else {
        setSingers(availableSingers);
      }
    };

    loadData();
  }, []);

  // -----------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------
  const recommendedKey =
    keyMatrix[formData.songId]?.[formData.singerId] ??
    getRecommendedKey(formData.songId, formData.singerId);

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
    const song = songs.find((s) => s.id === value);
    const recommendedSongKey = keyMatrix[value]?.[formData.singerId] ?? getRecommendedKey(value, formData.singerId);

    setFormData((current) => ({
      ...current,
      songId: value,
      selectedKey: recommendedSongKey || song?.originalKey || "",
    }));
  };

  const handleSingerChange = (value: string) => {
    const recommendedSingerKey = keyMatrix[formData.songId]?.[value] ?? getRecommendedKey(formData.songId, value);

    setFormData((current) => ({
      ...current,
      singerId: value,
      selectedKey: recommendedSingerKey || current.selectedKey,
    }));
  };

  // -----------------------------------------------------------------
  // Add song (uses real songs & singers)
  // -----------------------------------------------------------------
  const handleAddSong = () => {
    if (!formData.songId || !formData.singerId) {
      toast({
        title: "Song not added",
        description: "Please select both a song and a singer.",
      });
      return;
    }

    const song = songs.find((s) => s.id === formData.songId);
    const singer = singers.find((s) => s.id === formData.singerId);

    if (!song || !singer) {
      toast({ title: "Song not added", description: "Selected song or singer not found." });
      return;
    }

    const recommendedSongKey = keyMatrix[song.id]?.[singer.id] ?? getRecommendedKey(song.id, singer.id);

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

  // -----------------------------------------------------------------
  // Remove / move songs
  // -----------------------------------------------------------------
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
      const songsCopy = [...current.songs];
      const index = songsCopy.findIndex((song) => song.id === id);
      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || nextIndex < 0 || nextIndex >= songsCopy.length) {
        return current;
      }

      [songsCopy[index], songsCopy[nextIndex]] = [songsCopy[nextIndex], songsCopy[index]];

      return {
        ...current,
        songs: songsCopy.map((song, songIndex) => ({
          ...song,
          order: songIndex + 1,
        })),
      };
    });
  };

  // -----------------------------------------------------------------
  // Save setlist → Supabase (upsert)
  // -----------------------------------------------------------------
  const handleSaveSetlist = async () => {
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

    const payload = {
      ...setlist,
      songs: setlist.songs,
    };

    const { error } = await supabase.from("setlists").upsert(payload, {
      onConflict: "id",
    });

    if (error) {
      toast({ title: "Save failed", description: error.message });
      return;
    }

    toast({
      title: "Setlist saved",
      description: `${setlist.name} was saved with ${setlist.songs.length} songs.`,
    });
  };

  // -----------------------------------------------------------------
  // PDF / DOCX Generation with Custom Transposed Layout & Markups
  // -----------------------------------------------------------------
  const handleGeneratePDF = () => {
    if (!setlist.name.trim() || !setlist.date || setlist.songs.length === 0) {
      toast({
        title: "Export failed",
        description: "Complete the setlist details and add songs first.",
      });
      return;
    }
    generateSetlistPDF(setlist.name, setlist.date, setlist.songs);
    toast({
      title: "PDF generated successfully",
      description: "Direct PDF download triggered.",
    });
  };

  const handleGenerateDOCX = async () => {
    if (!setlist.name.trim() || !setlist.date || setlist.songs.length === 0) {
      toast({
        title: "Export failed",
        description: "Complete the setlist details and add songs first.",
      });
      return;
    }

    const songIds = setlist.songs.map((s) => s.songId);
    const { data, error } = await supabase
      .from("songs")
      .select("id, lyrics")
      .in("id", songIds);

    const lyricsMap: Record<string, string> = {};
    if (!error && data) {
      data.forEach((r) => {
        lyricsMap[String(r.id)] = r.lyrics || "";
      });
    }

    generateSetlistDOCX(setlist.name, setlist.date, setlist.songs, lyricsMap);
    toast({
      title: "DOCX generated successfully",
      description: "Word document download triggered.",
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
    songs,
    singers,
    handleSetlistChange,
    handleSongFormChange,
    handleSongChange,
    handleSingerChange,
    handleAddSong,
    handleRemoveSong,
    moveSong,
    handleSaveSetlist,
    handleGeneratePDF,
    handleGenerateDOCX,
    toggleSongForm,
  };
}