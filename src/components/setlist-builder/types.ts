export type ServiceType =
  | "Sunday Worship"
  | "Wednesday Prayer Meeting"
  | "Special Event"
  | "Youth Service";

export type SetlistSong = {
  id: string;
  songId: string;
  songTitle: string;
  singerId: string;
  singerName: string;
  selectedKey: string;
  originalKey: string;
  notes: string;
  order: number;
};

export type Setlist = {
  id: string;
  name: string;
  date: string;
  serviceType: ServiceType;
  songs: SetlistSong[];
};

export type AvailableSong = {
  id: string;
  title: string;
  originalKey: string;
};

export type AvailableSinger = {
  id: string;
  name: string;
};

export type SetlistFormData = {
  songId: string;
  singerId: string;
  selectedKey: string;
  notes: string;
};

export type MoveDirection = "up" | "down";