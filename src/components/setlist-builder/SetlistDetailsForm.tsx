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
import { Plus } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle>Setlist Details</CardTitle>
        <CardDescription>
          Add the service information before building your song order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="setlist-name">Setlist Name *</Label>
            <Input
              id="setlist-name"
              name="name"
              value={setlist.name}
              onChange={onSetlistChange}
              placeholder="e.g., Sunday Worship"
            />
          </div>

          <div>
            <Label htmlFor="setlist-date">Date *</Label>
            <Input
              id="setlist-date"
              name="date"
              type="date"
              value={setlist.date}
              onChange={onSetlistChange}
            />
          </div>

          <div>
            <Label htmlFor="service-type">Service Type *</Label>
            <Select
              value={setlist.serviceType}
              onValueChange={onServiceTypeChange}
            >
              <SelectTrigger id="service-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((serviceType) => (
                  <SelectItem key={serviceType} value={serviceType}>
                    {serviceType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={onToggleAddingSong}
        >
          <Plus className="mr-2 h-4 w-4" />
          {isAddingSong ? "Hide Song Form" : "Add Song to Setlist"}
        </Button>
      </CardContent>
    </Card>
  );
}