"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function Songs() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold mb-4">Song Library</h1>

      {/* Upload Section */}
      <div className="mb-6">
        <Button variant="ghost" size="lg">
          <Plus className="h-6 w-6" />
          Upload New Song
        </Button>
        <Input placeholder="Search songs..." className="mt-2 w-full" />
      </div>

      {/* Song List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Add SongCard components here */}
      </div>
    </div>
  );
}