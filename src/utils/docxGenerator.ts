"use client";

import { SetlistSong } from "@/components/setlist-builder/types";
import { transposeLyrics } from "./transposer";

function formatLyricsDOCX(lyrics: string): string {
  if (!lyrics) return '<p style="font-style: italic; color: #666; font-family: Arial, sans-serif; font-size: 11pt;">No lyrics available.</p>';
  
  const lines = lyrics.split("\n");
  return lines
    .map((line) => {
      const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);
      const formattedParts = parts.map((part) => {
        if (/^\[[^\]]+\]$/.test(part)) {
          // Stripped brackets, rendered bold, 11pt
          return `<strong style="color: #4f46e5; font-weight: bold; font-family: Arial, sans-serif; font-size: 11pt;">${part.slice(1, -1)}</strong>`;
        }
        if (/^<[^>]+>$/.test(part)) {
          // Segment label in bold uppercase, 11pt
          return `<strong style="color: #7c3aed; font-weight: bold; text-transform: uppercase; font-family: Arial, sans-serif; font-size: 11pt;">${part.slice(1, -1)}</strong>`;
        }
        return `<span style="font-family: Arial, sans-serif; font-size: 11pt;">${part}</span>`;
      });
      return `<p style="margin: 4px 0; font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.4;">${formattedParts.join("")}</p>`;
    })
    .join("");
}

export function generateSetlistDOCX(
  setlistName: string,
  serviceDate: string,
  songs: SetlistSong[],
  lyricsMap: Record<string, string>
) {
  let songsHTML = "";

  songs.forEach((song, idx) => {
    const rawLyrics = lyricsMap[song.songId] || "";
    const transposedLyrics = transposeLyrics(rawLyrics, song.originalKey, song.selectedKey);
    const isTransposed = song.selectedKey.trim() !== song.originalKey.trim();
    
    // Key Information: 16pt, Bold, Sentence Case
    const keyInfoText = isTransposed 
      ? `Key of ${song.selectedKey} (transposed from ${song.originalKey})   |   Lead vocal: ${song.singerName}` 
      : `Key of ${song.originalKey}   |   Lead vocal: ${song.singerName}`;

    // Song titles: 16pt, Bold, UPPERCASE
    const titleText = song.songTitle.toUpperCase();

    songsHTML += `
      <div style="${idx > 0 ? "page-break-before: always; margin-top: 30px;" : ""}">
        <!-- Song Title: 16pt, Bold, UPPERCASE with inline yellow highlight only -->
        <h2 style="margin: 0 0 8px 0; font-size: 16pt; font-weight: bold; color: #111827; font-family: Arial, sans-serif;">
          <span style="background-color: #fef08a; padding: 2px 6px;">${titleText}</span>
        </h2>
        
        <!-- Key Information: 16pt, Bold, Sentence Case with inline yellow highlight only -->
        <h3 style="margin: 0 0 16px 0; font-size: 16pt; font-weight: bold; color: #4b5563; font-family: Arial, sans-serif;">
          <span style="background-color: #fef08a; padding: 2px 6px;">${keyInfoText}</span>
        </h3>

        <!-- Performance Notes -->
        ${
          song.notes
            ? `<p style="font-style: italic; color: #4b5563; font-size: 11pt; margin-bottom: 12px; font-family: Arial, sans-serif;">
                Performance Notes: ${song.notes}
               </p>`
            : ""
        }

        <!-- Lyrics/Chords: 11pt regular, Arial -->
        <div style="margin-bottom: 30px; line-height: 1.5;">
          ${formatLyricsDOCX(transposedLyrics)}
        </div>
      </div>
    `;
  });

  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${setlistName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <!-- 0.5 inch margins: top, right, bottom, left are 720 dxa (1 inch = 1440 dxa) -->
            <w:PageMargins w:top="720" w:right="720" w:bottom="720" w:left="720" />
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: A4 portrait;
            margin: 0.5in;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0.5in;
            color: #111827;
          }
        </style>
      </head>
      <body>
        <div style="margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
          <h1 style="margin: 0; font-size: 22pt; font-weight: bold; text-transform: uppercase;">${setlistName}</h1>
          <p style="margin: 4px 0 0; font-size: 11pt; color: #4b5563;">Service Date: ${new Date(serviceDate).toLocaleDateString()}</p>
        </div>
        ${songsHTML}
      </body>
    </html>
  `;

  const blob = new Blob([content], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${setlistName.replace(/\s+/g, "_")}_Setlist.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}