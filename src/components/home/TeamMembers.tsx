"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { type Singer } from "@/pages/Index";

type Props = {
  singers: Singer[];
  getLabel: (voice: Singer["voiceType"]) => string;
};

export const TeamMembers = ({ singers, getLabel }: Props) => (
  <section className="mb-6">
    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
      Team Members
    </h2>
    <div className="space-y-3">
      {singers.slice(0, 3).map((singer) => (
        <Card key={singer.id} className="border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="font-medium text-gray-900 dark:text-white">
              {singer.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {getLabel(singer.voiceType)}
              {singer.nickname ? ` • ${singer.nickname}` : ""}
              {singer.notes ? ` • ${singer.notes}` : ""}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
);