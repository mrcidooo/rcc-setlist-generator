"use client";

import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";

type SetlistBuilderActionsProps = {
  onSaveSetlist: () => void;
  onGeneratePDF: () => void;
};

export default function SetlistBuilderActions({
  onSaveSetlist,
  onGeneratePDF,
}: SetlistBuilderActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={onGeneratePDF}>
        <FileText className="mr-2 h-4 w-4" />
        Generate PDF
      </Button>
      <Button onClick={onSaveSetlist}>
        <Calendar className="mr-2 h-4 w-4" />
        Save Setlist
      </Button>
    </div>
  );
}