"use client";

const scaleSharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const scaleFlats = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function getSemitone(key: string): number {
  if (!key) return 0;
  const normalized = key.trim().substring(0, 2); // e.g., "C#", "Bb", "A"
  if (normalized.startsWith("C#") || normalized.startsWith("Db")) return 1;
  if (normalized.startsWith("D#") || normalized.startsWith("Eb")) return 3;
  if (normalized.startsWith("F#") || normalized.startsWith("Gb")) return 6;
  if (normalized.startsWith("G#") || normalized.startsWith("Ab")) return 8;
  if (normalized.startsWith("A#") || normalized.startsWith("Bb")) return 10;
  
  const single = key.trim().substring(0, 1);
  if (single === "C") return 0;
  if (single === "D") return 2;
  if (single === "E") return 4;
  if (single === "F") return 5;
  if (single === "G") return 7;
  if (single === "A") return 9;
  if (single === "B") return 11;
  return 0;
}

function getScale(targetKey: string): string[] {
  const flatKeys = ["F", "Bb", "Eb", "Ab", "Db", "Gb", "d", "g", "c", "f", "bb", "eb"];
  const isFlat = flatKeys.some(fk => targetKey.trim().startsWith(fk));
  return isFlat ? scaleFlats : scaleSharps;
}

export function transposeChord(chord: string, semitones: number, targetKey: string): string {
  if (!chord) return "";
  if (chord.includes("/")) {
    const parts = chord.split("/");
    return parts.map(p => transposeChord(p, semitones, targetKey)).join("/");
  }
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord; // Return unchanged if non-standard
  const root = match[1];
  const suffix = match[2];
  const scale = getScale(targetKey);
  const currentSemitone = getSemitone(root);
  const targetSemitone = (currentSemitone + semitones + 12) % 12;
  return scale[targetSemitone] + suffix;
}

export function transposeLyrics(lyrics: string, originalKey: string, targetKey: string): string {
  if (!lyrics || !originalKey || !targetKey) return lyrics || "";
  const semitones = getSemitone(targetKey) - getSemitone(originalKey);
  if (semitones === 0) return lyrics;

  return lyrics.replace(/\[([^\]]+)\]/g, (match, chordInside) => {
    const transposed = transposeChord(chordInside.trim(), semitones, targetKey);
    return `[${transposed}]`;
  });
}