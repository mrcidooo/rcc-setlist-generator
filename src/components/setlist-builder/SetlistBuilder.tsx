"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import SetlistAddSongDialog from "./SetlistAddSongDialog";
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

  // Dialog visibility state
  const [dialogOpen, setDialogOpen] = useState(false);

  // Ref to the song‑order list so we can scroll to it after adding a track
  const songListRef = useRef<HTMLDivElement>(null);

  // Open dialog when the user clicks the “Add Song to Setlist” button in the details form
  const openAddSongDialog = () => {
    setDialogOpen(true);
    // Ensure internal flag is true so the form data is ready
    if (!isAddingSong) toggleSongForm();
  };

  const closeAddSongDialog = () => {
    setDialogOpen(false);
    if (isAddingSong) toggleSongForm();
  };

  // Wrap the add‑song handler so we can close the dialog **and** scroll to the list
  const handleAddSongAndScroll = () => {
    handleAddSong();          // adds the track to the setlist state
    closeAddSongDialog();     // closes the modal
    // Give React a tick before scrolling (state updates are async)
    setTimeout(() => {
      songListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

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
        // Replace the inline toggle with opening the dialog
        onToggleAddingSong={openAddSongDialog}
      />

      {/* Dialog that contains the searchable song picker and the rest of the form */}
      <SetlistAddSongDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open && isAddingSong) toggleSongForm();
        }}
        formData={formData}
        recommendedKey={recommendedKey}
        onFormChange={handleSongFormChange}
        onSongChange={handleSongChange}
        onSingerChange={handleSingerChange}
        onAddSong={handleAddSongAndScroll}
        onCancel={closeAddSongDialog}
      />

      {/* Song‑order list – wrapped with a ref for scrolling */}
      <div ref={songListRef}>
        <SetlistSongList
          songs={setlist.songs}
          onRemoveSong={handleRemoveSong}
          onMoveSong={moveSong}
        />
      </div>

      <div className="pt-2">
        <SetlistBuilderActions
          onSaveSetlist={handleSaveSetlist}
          onGeneratePDF={handleGeneratePDF}
        />
      </div>
    </div>
  );
}