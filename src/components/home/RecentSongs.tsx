"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

type Props = {
  // In a real app you would pass actual recent songs; placeholder for now
};

export const RecentSongs = (props: Props) => (
  <section className="mb-6">
    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
      Recent Songs
    </h2>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">Amazing Grace</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Key: C • Added: 2 days ago
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
);