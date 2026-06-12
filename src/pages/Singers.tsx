"use client";

import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Search, Trash2, Users, Sparkles, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type VoiceType = "male" | "female";

type Singer = {
  id: string;
  name: string;
  nickname: string;
  voiceType: VoiceType;
  notes: string;
};

const voiceTypes: { value: VoiceType; label: string }[] = [
  { value: "male", label: "Male vocal profile" },
  { value: "female", label: "Female vocal profile" },
];

const mapSinger = (record: any): Singer => ({
  id: record.id,
  name: record.name,
  nickname: record.nickname,
  voiceType: record.voice_type as VoiceType,
  notes: record.notes,
});

export default function Singers() {
  const [singers, setSingers] = useState<Singer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Singer, "id">>({
    name: "",
    nickname: "",
    voiceType: "male",
    notes: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchSingers = async () => {
      const { data, error } = await supabase
        .from("singers")
        .select("id, name, nickname, voice_type, notes, created_at");

      if (error) {
        console.error("Error loading singers:", error);
        toast({ title: "Failed to load singers", description: error.message });
        return;
      }

      setSingers((data ?? []).map(mapSinger));
    };
    fetchSingers();
  }, []);

  const filteredSingers = useMemo(() => {
    return singers.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [singers, searchTerm]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", nickname: "", voiceType: "male", notes: "" });
  };

  const openNewSingerForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((c) => ({ ...c, [name]: value }));
  };

  const handleVoiceTypeChange = (value: VoiceType) => {
    setFormData((c) => ({ ...c, voiceType: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ title: "Singer not added", description: "Please enter a name." });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      nickname: formData.nickname.trim(),
      voice_type: formData.voiceType,
      notes: formData.notes.trim(),
    };

    if (editingId) {
      const { error } = await supabase
        .from("singers")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Update failed", description: error.message });
        return;
      }

      setSingers((c) =>
        c.map((s) => (s.id === editingId ? { ...s, ...formData } : s)),
      );

      toast({ title: "Singer updated", description: `${formData.name} updated.` });
    } else {
      const { data, error } = await supabase
        .from("singers")
        .insert(payload)
        .select("id, name, nickname, voice_type, notes, created_at");

      if (error) {
        toast({ title: "Add failed", description: error.message });
        return;
      }

      const newSinger = mapSinger(data?.[0]);
      setSingers((c) => [newSinger, ...c]);

      toast({ title: "Singer added", description: `${newSinger.name} added.` });
    }

    resetForm();
    setIsFormOpen(false);
  };

  const handleEdit = (singer: Singer) => {
    setEditingId(singer.id);
    setFormData({
      name: singer.name,
      nickname: singer.nickname,
      voiceType: singer.voiceType,
      notes: singer.notes,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (singer: Singer) => {
    const confirmed = window.confirm(
      `Delete ${singer.name}? This will remove them from your worship team.`,
    );
    if (!confirmed) return;

    const { error } = await supabase.from("singers").delete().eq("id", singer.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message });
      return;
    }

    setSingers((c) => c.filter((s) => s.id !== singer.id));
    toast({ title: "Singer removed", description: `${singer.name} removed.` });
  };

  return (
    <div className="min-h-screen bg-transparent p-4 pb-32 max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/10">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              Singers Directory
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage worship team vocalists and their comfortable performance ranges.
          </p>
        </div>

        <Button 
          onClick={openNewSingerForm}
          className="h-11 rounded-[18px] bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_15px_rgba(99,102,241,0.35)] font-bold px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Singer
        </Button>
      </header>

      {/* Dynamic Summary Cards */}
      <div className="grid gap-4 grid-cols-3">
        <Card className="neu-card border-0 bg-white/70 dark:bg-card/75 p-4 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</p>
          <p className="text-2xl font-black text-foreground mt-1">{singers.length}</p>
        </Card>
        <Card className="neu-card border-0 bg-white/70 dark:bg-card/75 p-4 text-center">
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Male</p>
          <p className="text-2xl font-black text-indigo-500 mt-1">
            {singers.filter((s) => s.voiceType === "male").length}
          </p>
        </Card>
        <Card className="neu-card border-0 bg-white/70 dark:bg-card/75 p-4 text-center">
          <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Female</p>
          <p className="text-2xl font-black text-pink-500 mt-1">
            {singers.filter((s) => s.voiceType === "female").length}
          </p>
        </Card>
      </div>

      {/* Modern sliding popup or inline editor card */}
      {isFormOpen && (
        <Card className="neu-card border-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:bg-card/75">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              <div>
                <CardTitle className="text-lg font-bold">{editingId ? "Edit Profile" : "Register Singer Profile"}</CardTitle>
                <CardDescription>
                  Configure vocal parameters used for automatic matches.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="singer-name" className="text-xs font-bold text-muted-foreground uppercase">Full Name *</Label>
                  <Input
                    id="singer-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="singer-nickname" className="text-xs font-bold text-muted-foreground uppercase">Nickname</Label>
                  <Input
                    id="singer-nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    placeholder="e.g., Johnny"
                    className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="singer-voice-type" className="text-xs font-bold text-muted-foreground uppercase">Voice Range *</Label>
                  <Select
                    value={formData.voiceType}
                    onValueChange={handleVoiceTypeChange}
                  >
                    <SelectTrigger id="singer-voice-type" className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-[18px]">
                      {voiceTypes.map((vt) => (
                        <SelectItem key={vt.value} value={vt.value} className="rounded-xl">
                          {vt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="singer-notes" className="text-xs font-bold text-muted-foreground uppercase">Vocal Description</Label>
                  <Input
                    id="singer-notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g., Soprano, High Tenor..."
                    className="h-11 rounded-[18px] bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    resetForm();
                    setIsFormOpen(false);
                  }}
                  className="rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] font-bold px-5"
                >
                  {editingId ? "Update Singer" : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Main interactive directory table */}
      <Card className="neu-card border-0 bg-white/75 dark:bg-card/75">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Worship Team Directory</CardTitle>
              <CardDescription>Search and update your group's profiles.</CardDescription>
            </div>

            <div className="w-full sm:w-72">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter singer lists..."
                  className="pl-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSingers.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-black/10 dark:border-white/10 p-12 text-center bg-black/[0.01]">
              <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60 animate-pulse" />
              <p className="font-bold">No active singers matches</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try querying another name or add a new profile above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSingers.map((singer) => {
                const initials = singer.name.split(" ").map(n => n[0]).join("").toUpperCase();
                const isFemale = singer.voiceType === "female";

                return (
                  <div
                    key={singer.id}
                    className="flex flex-col gap-4 rounded-[22px] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-indigo-500/5 duration-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[16px] text-xs font-bold ${
                        isFemale 
                          ? "bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/10" 
                          : "bg-blue-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10"
                      }`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm tracking-tight">{singer.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <Badge 
                            variant="secondary"
                            className={`rounded-lg font-bold text-[9px] border-0 ${
                              isFemale ? "bg-pink-500/10 text-pink-600" : "bg-blue-500/10 text-blue-600"
                            }`}
                          >
                            {singer.voiceType === "female" ? "FEMALE" : "MALE"}
                          </Badge>
                          {singer.nickname && <span>“{singer.nickname}”</span>}
                          {singer.notes && <span className="font-medium">• {singer.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl w-fit">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(singer)}
                        className="h-8 rounded-[10px] text-[11px] font-semibold hover:bg-white/50 dark:hover:bg-white/10"
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-[10px] text-[11px] font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleDelete(singer)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}