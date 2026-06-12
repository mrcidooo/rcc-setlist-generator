"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const SongCard = ({ song }) => {
  return (
    <Card className="shadow-md">
      <CardContent>
        <CardHeader>
          <CardTitle>{song.title}</CardTitle>
        </CardHeader>
        <div className="text-sm text-gray-600">
          Key: {song.original_key} • Added: {song.created_at}
        </div>
        <div className="flex items-center justify-between">
          <FileText className="h-4 w-4" />
          <Button variant="ghost" size="sm">Preview</Button>
        </div>
      </CardContent>
    </Card>
  );
};