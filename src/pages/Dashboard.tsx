"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, Calendar, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [totalSongs, setTotalSongs] = useState<number>(0);
  const [totalSingers, setTotalSingers] = useState<number>(0);
  const [upcomingSetlists, setUpcomingSetlists] = useState<number>(0);
  const [pdfsGenerated, setPdfsGenerated] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      // Songs
      const { count: songCount } = await supabase
        .from("songs")
        .select("*", { count: "exact", head: true });
      setTotalSongs(songCount ?? 0);

      // Singers
      const { count: singerCount } = await supabase
        .from("singers")
        .select("*", { count: "exact", head: true });
      setTotalSingers(singerCount ?? 0);

      // Setlists (upcoming)
      const { data: setlists } = await supabase
        .from("setlists")
        .select("id, date")
        .gte("date", new Date().toISOString().split("T")[0]); // future dates
      setUpcomingSetlists(setlists?.length ?? 0);

      // PDFs generated – using setlists count as a placeholder
      const { count: pdfCount } = await supabase
        .from("setlists")
        .select("*", { count: "exact", head: true });
      setPdfsGenerated(pdfCount ?? 0);
    };

    fetchStats();
  }, []);

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

        {/* Stats – now dynamic */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Songs</p>
                  <p className="text-3xl font-bold">{totalSongs}</p>
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
                  <p className="text-3xl font-bold">{totalSingers}</p>
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
                  <p className="text-3xl font-bold">{upcomingSetlists}</p>
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
                  <p className="text-3xl font-bold">{pdfsGenerated}</p>
                </div>
                <FileText className="h-10 w-10 rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-950 dark:text-orange-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions – unchanged */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Add Singer", icon: Users, description: "Manage your team members" },
            { title: "Create Setlist", icon: Calendar, description: "Build a service plan" },
            { title: "Generate PDF", icon: FileText, description: "Export a printable setlist" },
          ].map((action) => (
            <button
              key={action.title}
              className="h-auto justify-start gap-3 rounded-xl p-4 text-left bg-primary/10 hover:bg-primary/20 transition"
            >
              <action.icon className="h-5 w-5 text-foreground" />
              <div className="flex flex-col items-start">
                <span className="font-semibold">{action.title}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </div>
            </button>
          ))}
        </section>

        {/* Recent Activity – unchanged */}
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