"use client";

import { SetlistSong } from "@/components/setlist-builder/types";
import { transposeLyrics } from "./transposer";

function formatLyricsDOCX(lyrics: string): string {
  if (!lyrics) return '<p style="font-style: italic; color: #666;">No lyrics available.</p>';
  
  const lines = lyrics.split("\n");
  return lines
    .map((line) => {
      const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);
      const formattedParts = parts.map((part) => {
        if (/^\[[^\]]+\]$/.test(part)) {
          // Stripped brackets, rendered bold for MS Word
          return `<strong style="color: #4f46e5; font-weight: bold; font-family: monospace;">${part.slice(1, -1)}</strong>`;
        }
        if (/^<[^>]+>$/.test(part)) {
          // Segment label in bold uppercase
          return `<strong style="color: #7c3aed; font-weight: bold; text-transform: uppercase;">${part.slice(1, -1)}</strong>`;
        }
        return `<span>${part}</span>`;
      });
      return `<p style="margin: 4px 0; font-family: monospace; font-size: 11pt; color: #1a1a1a;">${formattedParts.join("")}</p>`;
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
    const keyInfo = isTransposed 
      ? `KEY: ${song.selectedKey} (TRANSPOSED FROM ${song.originalKey})` 
      : `KEY: ${song.originalKey} (ORIGINAL KEY)`;

    songsHTML += `
      <div style="${idx > 0 ? "page-break-before: always; margin-top: 30px;" : ""}">
        <!-- Yellow Highlight Header -->
        <div style="background-color: #fef08a; padding: 12px; border: 1px solid #eab308; margin-bottom: 12px;">
          <h2 style="margin: 0; font-size: 16pt; font-weight: bold; color: #111827; text-transform: uppercase; font-family: Arial, sans-serif;">
            ${song.songTitle.toUpperCase()} &mdash; ${keyInfo}
          </h2>
          <p style="margin: 4px 0 0; font-size: 10pt; color: #4b5563; font-weight: bold; font-family: Arial, sans-serif;">
            LEAD VOCAL: ${song.singerName.toUpperCase()}
          </p>
        </div>

        <!-- Performance Notes -->
        ${
          song.notes
            ? `<p style="font-style: italic; color: #4b5563; font-size: 11pt; margin-bottom: 12px; font-family: Arial, sans-serif;">
                Performance Notes: ${song.notes}
               </p>`
            : ""
        }

        <!-- Lyrics/Chords -->
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
          </w:WordDocument>
        </xml>
        <![endif]-->
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; color: #111827;">
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