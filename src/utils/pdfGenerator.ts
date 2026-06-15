"use client";

import { SetlistSong } from "@/components/setlist-builder/types";
import { transposeLyrics } from "./transposer";
import { supabase } from "@/lib/supabaseClient";

/**
 * Helper to split lyrics by bracket chords [] and angle segments <>
 */
function formatLyricsHTML(lyrics: string): string {
  if (!lyrics) return '<p style="font-style: italic; color: #666;">No lyrics available.</p>';
  
  const lines = lyrics.split("\n");
  return lines
    .map((line) => {
      const parts = line.split(/(\[[^\]]+\]|<[^>]+>)/g);
      const formattedParts = parts.map((part) => {
        if (/^\[[^\]]+\]$/.test(part)) {
          return `<strong style="color: #6366F1; font-weight: bold; font-family: monospace;">${part}</strong>`;
        }
        if (/^<[^>]+>$/.test(part)) {
          return `<strong style="color: #8B5CF6; font-weight: bold; text-transform: uppercase; font-family: sans-serif;">${part}</strong>`;
        }
        return `<span>${part}</span>`;
      });
      return `<p style="margin: 4px 0; min-height: 1.2em; font-family: monospace; font-size: 13px; line-height: 1.5; font-weight: normal; color: #1f2937;">${formattedParts.join("")}</p>`;
    })
    .join("");
}

export async function generateSetlistPDF(setlistName: string, serviceDate: string, songs: SetlistSong[]) {
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

  // 2. Build beautifully formatted HTML document for printing
  let songsHTML = "";

  songs.forEach((song, idx) => {
    const rawLyrics = lyricsMap[song.songId] || "";
    const transposedLyrics = transposeLyrics(rawLyrics, song.originalKey, song.selectedKey);
    const isTransposed = song.selectedKey.trim() !== song.originalKey.trim();
    const keyInfo = isTransposed 
      ? `KEY: ${song.selectedKey} (TRANSPOSED FROM ${song.originalKey})` 
      : `KEY: ${song.originalKey} (ORIGINAL KEY)`;

    songsHTML += `
      <div class="song-block" style="${idx > 0 ? "page-break-before: always; margin-top: 30px;" : ""}">
        <!-- Yellow highlighted bold header -->
        <div style="background-color: #fef08a; padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 5px solid #eab308;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #111827; text-transform: uppercase; font-family: sans-serif;">
            ${song.songTitle.toUpperCase()} &mdash; ${keyInfo}
          </h2>
          <div style="font-size: 12px; color: #4b5563; font-weight: bold; margin-top: 4px; font-family: sans-serif;">
            LEAD VOCAL: ${song.singerName.toUpperCase()}
          </div>
        </div>

        <!-- Performance Notes -->
        ${
          song.notes
            ? `<div style="font-style: italic; color: #4b5563; font-size: 13px; margin-bottom: 16px; padding: 8px 12px; background: #f3f4f6; border-radius: 6px; font-family: sans-serif;">
                Performance Notes: ${song.notes}
               </div>`
            : ""
        }

        <!-- Transposed Lyrics & Chords -->
        <div style="background: #fafafa; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
          ${formatLyricsHTML(transposedLyrics)}
        </div>
      </div>
    `;
  });

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>${setlistName} - Setlist PDF</title>
        <style>
          @media print {
            body {
              background: white;
              color: black;
              margin: 1.5cm;
            }
            .no-print {
              display: none;
            }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background-color: #f9fafb;
          }
          .header-bar {
            border-bottom: 3px double #e5e7eb;
            padding-bottom: 16px;
            margin-bottom: 32px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          button.print-btn {
            background-color: #6366f1;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
            transition: all 0.2s;
          }
          button.print-btn:hover {
            background-color: #4f46e5;
            transform: translateY(-1px);
          }
        </style>
      </head>
      <body>
        <div class="header-bar no-print">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #111827;">Setlist PDF Print Preview</h1>
            <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Press 'Save as PDF' or Print from the system dialog.</p>
          </div>
          <button class="print-btn" onclick="window.print()">Print / Save to PDF</button>
        </div>

        <div style="margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #111827; text-transform: uppercase;">${setlistName}</h1>
          <p style="margin: 4px 0 0; font-size: 14px; color: #4b5563; font-weight: 600;">Service Date: ${new Date(serviceDate).toLocaleDateString()}</p>
        </div>

        ${songsHTML}

        <script>
          // Auto-trigger print dialog for user convenience
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}