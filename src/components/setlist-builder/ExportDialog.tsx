"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, FileCode, Download, X } from "lucide-react";

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
};

export default function ExportDialog({
  open,
  onOpenChange,
  onExportPDF,
  onExportDOCX,
}: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[32px] border-0 bg-white/95 dark:bg-card/95 shadow-2xl p-6 backdrop-blur-3xl">
        <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground">
              Export Setlist Format
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select your preferred worship sheet file format.
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close export dialog"
            className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* PDF Choice */}
          <Button
            onClick={() => {
              onExportPDF();
              onOpenChange(false);
            }}
            variant="outline"
            className="flex flex-col items-center justify-center gap-3 h-32 rounded-[24px] border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-indigo-500/5 hover:border-indigo-500 hover:text-indigo-500 duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm text-foreground">PDF Document</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">High readability sheet</div>
            </div>
          </Button>

          {/* Word Choice */}
          <Button
            onClick={() => {
              onExportDOCX();
              onOpenChange(false);
            }}
            variant="outline"
            className="flex flex-col items-center justify-center gap-3 h-32 rounded-[24px] border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-blue-500/5 hover:border-blue-500 hover:text-blue-500 duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
              <FileCode className="h-6 w-6" />
            </div>
            <div className="text-center">
              <div className="font-bold text-sm text-foreground">Word DOCX</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Editable text document</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}