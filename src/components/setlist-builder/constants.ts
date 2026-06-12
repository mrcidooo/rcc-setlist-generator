import type {
  AvailableSinger,
  AvailableSong,
  ServiceType,
  Setlist,
  SetlistFormData,
} from "./types";

export const availableSongs: AvailableSong[] = [
  { id: "1", title: "Way Maker", originalKey: "D" },
  { id: "2", title: "Goodness of God", originalKey: "G" },
  { id: "3", title: "What A Beautiful Name", originalKey: "D" },
  { id: "4", title: "Reckless Love", originalKey: "G" },
  { id: "5", title: "Gratitude", originalKey: "A" },
];

export const availableSingers: AvailableSinger[] = [
  { id: "1", name: "John Smith" },
  { id: "2", name: "Sarah Johnson" },
  { id: "3", name: "Mike Davis" },
];

export const serviceTypes: ServiceType[] = [
  "Sunday Worship",
  "Wednesday Prayer Meeting",
  "Special Event",
  "Youth Service",
];

export const keyMatrix: Record<string, Record<string, string>> = {
  "1": { "1": "D", "2": "F", "3": "C" },
  "2": { "1": "G", "2": "B", "3": "E" },
  "3": { "1": "D", "2": "F#", "3": "B" },
  "4": { "1": "G", "2": "B", "3": "D" },
  "5": { "1": "A", "2": "C#", "3": "F#" },
};

export const initialSetlist: Setlist = {
  id: "1",
  name: "",
  date: "",
  serviceType: "Sunday Worship",
  songs: [],
};

export const emptySetlistSongForm: SetlistFormData = {
  songId: "",
  singerId: "",
  selectedKey: "",
  notes: "",
};

export const getRecommendedKey = (songId: string, singerId: string) => {
  return keyMatrix[songId]?.[singerId] ?? "";
};