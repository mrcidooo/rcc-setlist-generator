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
      <Button 
        variant="outline" 
        onClick={onGeneratePDF}
        className="h-11 rounded-[18px] border-indigo-500/30 hover:bg-indigo-500/5 hover:text-indigo-500 font-semibold"
      >
        <FileText className="mr-2 h-4 w-4 text-indigo-500" />
        Generate PDF
      </Button>
      <Button 
        onClick={onSaveSetlist}
        className="h-11 rounded-[18px] bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] font-bold px-6"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Save Setlist
      </Button>
    </div>
  );
}