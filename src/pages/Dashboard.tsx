"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Music, Users, Calendar, FileText } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <div className="text-center">
              <Music className="h-12 w-12 mb-2 text-blue-600" />
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm">Total Songs</div>
            </div>
          </CardContent>
        </Card>
        {/* Add other stats cards similarly */}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <Button variant="ghost" size="lg">
          <Plus className="h-6 w-6" />
          Upload Song
        </Button>
        <Button variant="ghost" size="lg">
          <Users className="h-6 w-6" />
          Add Singer
        </Button>
        <Button variant="ghost" size="lg">
          <Library className="h-6 w-6" />
          Create Setlist
        </Button>
        <Button variant="ghost" size="lg">
          <FileText className="h-6 w-6" />
          Generate PDF
        </Button>
      </div>
    </div>
  );
}