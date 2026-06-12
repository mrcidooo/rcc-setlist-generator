"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Sliders, CalendarDays } from "lucide-react";
import { type ChangeEvent } from "react";
import { serviceTypes } from "./constants";
import type { ServiceType, Setlist } from "./types";

type SetlistDetailsFormProps = {
  setlist: Setlist;
  isAddingSong: boolean;
  onSetlistChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onServiceTypeChange: (value: ServiceType) => void;
  onToggleAddingSong: () => void;
};

export default function SetlistDetailsForm({
  setlist,
  isAddingSong,
  onSetlistChange,
  onServiceTypeChange,
  onToggleAddingSong,
}: SetlistDetailsFormProps) {
  return (
    <Card className="neu-card border-0 bg-white/75 dark:bg-card/75">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-indigo-500" />
          <div>
            <CardTitle className="text-lg font-bold">Worship Planning</CardTitle>
            <CardDescription>
              Establish service variables before assigning comfortable keys.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="setlist-name" className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Setlist Label *
            </Label>
            <Input
              id="setlist-name"
              name="name"
              value={setlist.name}
              onChange={onSetlistChange}
              placeholder="e.g., Sunday Worship"
              className="h-11 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[18px] focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="setlist-date" className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Service Date *
            </Label>
            <Input
              id="setlist-date"
              name="date"
              type="date"
              value={setlist.date}
              onChange={onSetlistChange}
              className="h-11 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[18px] focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-type" className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Service Context *
            </Label>
            <Select
              value={setlist.serviceType}
              onValueChange={onServiceTypeChange}
            >
              <SelectTrigger id="service-type" className="h-11 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[18px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[18px]">
                {serviceTypes.map((serviceType) => (
                  <SelectItem key={serviceType} value={serviceType} className="rounded-xl">
                    {serviceType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onToggleAddingSong}
          className="w-full h-11 rounded-[18px] border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-500 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4 text-indigo-500" />
          {isAddingSong ? "Hide Song Form" : "Add Song to Setlist"}
        </Button>
      </CardContent>
    </Card>
  );
}