"use client";

import { Badge } from "@/components/ui/badge";
import AddSetlistSongForm from "./AddSetlistSongForm";
import SetlistBuilderActions from "./SetlistBuilderActions";
import SetlistDetailsForm from "./SetlistDetailsForm";
import SetlistSongList from "./SetlistSongList";
import { useSetlistBuilder } from "./useSetlistBuilder";

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
    <div className="min-h-screen bg-background p-4 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Setlist Builder
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create worship setlists with singer-specific key recommendations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{setlist.songs.length} songs</Badge>
            <Badge variant="outline">{setlist.serviceType}</Badge>
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

        <SetlistBuilderActions
          onSaveSetlist={handleSaveSetlist}
          onGeneratePDF={handleGeneratePDF}
        />
      </div>
    </div>
  );
}