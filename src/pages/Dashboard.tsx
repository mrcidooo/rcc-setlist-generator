"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Music,
  Users,
  Calendar,
  FileText,
  Library,
} from "lucide-react";

const quickActions = [
  // Upload action removed – now only three core actions remain
  {
    title: "Add Singer",
    icon: Users,
    description: "Manage your team members",
  },
  {
    title: "Create Setlist",
    icon: Library,
    description: "Build a service plan",
  },
  {
    title: "Generate PDF",
    icon: FileText,
    description: "Export a printable setlist",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-4 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Worship Setlist Generator
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage songs, singers, keys, and service setlists in one place.
          </p>
        </header>

        {/* Stats – now displayed in a 2‑column layout for better spacing */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Songs</p>
                  <p className="text-3xl font-bold">42</p>
                </div>
                <Music className="h-10 w-10 rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Singers</p>
                  <p className="text-3xl font-bold">18</p>
                </div>
                <Users className="h-10 w-10 rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-950 dark:text-green-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Setlists</p>
                  <p className="text-3xl font-bold">5</p>
                </div>
                <Calendar className="h-10 w-10 rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-950 dark:text-purple-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">PDFs Generated</p>
                  <p className="text-3xl font-bold">27</p>
                </div>
                <FileText className="h-10 w-10 rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-950 dark:text-orange-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions – now a three‑item grid with larger buttons */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="secondary"
                className="h-auto justify-start gap-3 rounded-xl p-4 text-left hover:scale-[1.02] transition-transform"
              >
                <Icon className="h-5 w-5 text-foreground" />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{action.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </div>
              </Button>
            );
          })}
        </section>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border p-4">
                <p className="font-medium">Way Maker added to library</p>
                <p className="text-sm text-muted-foreground">Added 2 hours ago</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="font-medium">Sunday Worship setlist updated</p>
                <p className="text-sm text-muted-foreground">Updated yesterday</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="font-medium">Sarah Johnson key preferences saved</p>
                <p className="text-sm text-muted-foreground">Updated yesterday</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}