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

  // 2. Initialize a clean direct-download jsPDF Document (A4 portrait)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // 0.5 inch margin on all sides = 12.7 mm
  const margin = 12.7;
  const pageHeight = 297;
  const limitY = 280; // slightly extended considering smaller bottom margins
  let y = margin + 10;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > limitY) {
      doc.addPage();
      y = margin + 10;
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
    // Each song starts on a new page except potentially the very first
    if (idx > 0) {
      doc.addPage();
      y = margin + 10;
    }

    const rawLyrics = lyricsMap[song.songId] || "";
    const transposedLyrics = transposeLyrics(rawLyrics, song.originalKey, song.selectedKey);
    const isTransposed = song.selectedKey.trim() !== song.originalKey.trim();
    
    // Key info in Sentence Case: "Key of G (transposed from D)" or "Key of D"
    const keyInfo = isTransposed 
      ? `Key of ${song.selectedKey} (transposed from ${song.originalKey})   |   Lead vocal: ${song.singerName}` 
      : `Key of ${song.originalKey}   |   Lead vocal: ${song.singerName}`;

    // Titles: 16pt, Bold, UPPERCASE
    const titleText = song.songTitle.toUpperCase();

    // --- RENDER HIGH-CONTRAST INDIVIDUAL TEXT HIGHLIGHTS ---
    // Instead of a giant full-width block, draw yellow boxes behind the exact width of text parts only
    checkPageBreak(35);

    // Get text widths
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    const titleWidth = doc.getTextWidth(titleText);
    const keyInfoWidth = doc.getTextWidth(keyInfo);

    // 1. Draw yellow highlight behind Title
    doc.setFillColor(254, 240, 138); // Yellow highlight #FEF08A
    doc.rect(margin, y - 6, titleWidth + 4, 8, "F");

    // 2. Render Title text
    doc.setTextColor(17, 24, 39);
    doc.text(titleText, margin + 2, y);
    y += 10;

    // 3. Draw yellow highlight behind Key Information
    doc.setFillColor(254, 240, 138); // Yellow highlight #FEF08A
    doc.rect(margin, y - 6, keyInfoWidth + 4, 8, "F");

    // 4. Render Key Information text
    doc.text(keyInfo, margin + 2, y);
    y += 15;

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
          // Song Segment label -> Bold uppercase
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
          // Normal lyric text -> Regular font weight, 11pt
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