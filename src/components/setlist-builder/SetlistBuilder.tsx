"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AddSetlistSongForm from "./AddSetlistSongForm";
import SetlistBuilderActions from "./SetlistBuilderActions";
import SetlistDetailsForm from "./SetlistDetailsForm";
import SetlistSongList from "./SetlistSongList";
import { useSetlistBuilder } from "./useSetlistBuilder";
import { Sparkles, Library, Plus } from "lucide-react";

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

  // Local state is no longer needed for a dialog
  // The floating button will simply toggle the inline form via `toggleSongForm`

  return (
    <div className="min-h-screen bg-transparent p-4 pb-32 max-w-4xl mx-auto space-y-6 relative">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-1">
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

      {/* Inline form appears directly when `isAddingSong` is true */}
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

      {/* Floating “Add Song” button – now just toggles the inline form */}
      {!isAddingSong && (
        <button
          onClick={toggleSongForm}
          className="fixed bottom-20 right-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 transition-transform duration-200 p-3"
          aria-label="Add Song to Setlist"
        >
          <Plus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}