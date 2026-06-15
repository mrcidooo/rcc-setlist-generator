"use client";

import { jsPDF } from "jspdf";
import { SetlistSong } from "@/components/setlist-builder/types";
import { transposeLyrics } from "./transposer";
import { supabase } from "@/lib/supabaseClient";

export async function generateSetlistPDF(
  setlistName: string,
  serviceDate: string,
  songs: SetlistSong[]
) {
  if (songs.length === 0) return;

  // 1. Fetch full lyrics for all songs in the setlist
  const songIds = songs.map((s) => s.songId);
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

  // 2. Initialize a clean direct-download jsPDF Document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 20;
  const pageHeight = 297;
  const limitY = 270;
  let y = 20;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > limitY) {
      doc.addPage();
      y = 20;
    }
  };

  // Add Setlist Header on the first page
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39); // Very dark gray #111827
  doc.text(setlistName.toUpperCase(), margin, y);
  y += 8;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128); // #6B7280
  doc.text(`Service Date: ${new Date(serviceDate).toLocaleDateString()}`, margin, y);
  y += 15;

  // 3. Process each song
  songs.forEach((song, idx) => {
    // Each song starts on a new page except potentially the very first if we have enough space
    if (idx > 0) {
      doc.addPage();
      y = 20;
    }

    const rawLyrics = lyricsMap[song.songId] || "";
    const transposedLyrics = transposeLyrics(rawLyrics, song.originalKey, song.selectedKey);
    const isTransposed = song.selectedKey.trim() !== song.originalKey.trim();
    const keyInfo = isTransposed 
      ? `KEY: ${song.selectedKey} (TRANSPOSED FROM ${song.originalKey})` 
      : `KEY: ${song.originalKey} (ORIGINAL KEY)`;

    // --- RENDER YELLOW HIGHLIGHTED HEADER BOX ---
    checkPageBreak(25);
    doc.setFillColor(254, 240, 138); // Yellow highlight #FEF08A
    doc.rect(margin, y, 170, 22, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39); // High contrast dark charcoal
    doc.text(song.songTitle.toUpperCase(), margin + 5, y + 9);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99); // Medium-dark gray
    doc.text(`${keyInfo}   |   VOCAL: ${song.singerName.toUpperCase()}`, margin + 5, y + 16);
    y += 28;

    // --- RENDER LYRICS WITH INLINE CHORDS & SEGMENTS ---
    const lines = transposedLyrics.split("\n");
    doc.setFontSize(11);

    lines.forEach((line) => {
      // Split by bracket chords [] and angle segments <>
      const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);
      
      // Calculate height needed for this line
      checkPageBreak(7);
      
      let currentX = margin;
      doc.setTextColor(26, 26, 26); // Super dark gray for high readability

      parts.forEach((part) => {
        if (!part) return;

        if (part.startsWith("<") && part.endsWith(">")) {
          // Song Segment (Intro, Chorus, Verse etc.) -> Bold
          const segmentName = part.slice(1, -1).toUpperCase();
          doc.setFont("Helvetica", "bold");
          doc.text(segmentName, currentX, y);
          currentX += doc.getTextWidth(segmentName + " ");
        } else if (part.startsWith("[") && part.endsWith("]")) {
          // Chord -> Bold and without the brackets []
          const chordName = part.slice(1, -1);
          doc.setFont("Helvetica", "bold");
          doc.text(chordName, currentX, y);
          currentX += doc.getTextWidth(chordName + " ");
        } else {
          // Normal lyric text -> Regular font weight
          doc.setFont("Helvetica", "normal");
          doc.text(part, currentX, y);
          currentX += doc.getTextWidth(part);
        }
      });

      y += 7; // Increment line spacing
    });

    // --- RENDER PERFORMANCE NOTES (UNDER THE SONG) ---
    if (song.notes) {
      y += 6;
      checkPageBreak(12);
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99);
      doc.text(`Performance Notes: ${song.notes}`, margin, y);
      y += 10;
    }
  });

  // Save/Download PDF Directly
  const fileName = `${setlistName.replace(/\s+/g, "_")}_Setlist.pdf`;
  doc.save(fileName);
}