"use client";

import { Badge } from "@/components/ui/badge";
import AddSetlistSongForm from "./AddSetlistSongForm";
import SetlistBuilderActions from "./SetlistBuilderActions";
import SetlistDetailsForm from "./SetlistDetailsForm";
import SetlistSongList from "./SetlistSongList";
import { useSetlistBuilder } from "./useSetlistBuilder";
import { Sparkles, Library } from "lucide-react";

export default function SetlistBuilder() {
  const {
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
  } = useSetlistBuilder();

  return (
    <div className="min-h-screen bg-transparent p-4 pb-32 max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
              <Library className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              Setlist Builder <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan worship sequences with automated smart key matching.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-[12px] bg-indigo-500/10 text-indigo-500 px-3 py-1 font-bold border-0">
            {setlist.songs.length} active songs
          </Badge>
          <Badge variant="outline" className="rounded-[12px] px-3 py-1 font-semibold border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
            {setlist.serviceType}
          </Badge>
        </div>
      </header>

      <SetlistDetailsForm
        setlist={setlist}
        isAddingSong={isAddingSong}
        onSetlistChange={handleSetlistChange}
        onServiceTypeChange={(value) =>
          handleSetlistChange({
            target: { name: "serviceType", value },
          } as React.ChangeEvent<HTMLInputElement>)
        }
        onToggleAddingSong={toggleSongForm}
      />

      {isAddingSong && (
        <AddSetlistSongForm
          formData={formData}
          recommendedKey={recommendedKey}
          onFormChange={handleSongFormChange}
          onSongChange={handleSongChange}
          onSingerChange={handleSingerChange}
          onAddSong={handleAddSong}
          onCancel={toggleSongForm}
        />
      )}

      <SetlistSongList
        songs={setlist.songs}
        onRemoveSong={handleRemoveSong}
        onMoveSong={moveSong}
      />

      <div className="pt-2">
        <SetlistBuilderActions
          onSaveSetlist={handleSaveSetlist}
          onGeneratePDF={handleGeneratePDF}
        />
      </div>
    </div>
  );
}