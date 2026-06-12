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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Search, Trash2, Users } from "lucide-react";
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
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

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

  // Load singers from Supabase
  useEffect(() => {
    const fetchSingers = async () => {
      const { data, error } = await supabase.from("singers").select("*");
      if (error) {
        console.error("Error loading singers:", error);
        toast({
          title: "Failed to load singers",
          description: error.message,
        });
        return;
      }
      setSingers(data as Singer[]);
    };
    fetchSingers();
  }, []);

  const filteredSingers = useMemo(() => {
    return singers.filter((singer) =>
      singer.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [singers, searchTerm]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      nickname: "",
      voiceType: "male",
      notes: "",
    });
  };

  const openNewSingerForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleVoiceTypeChange = (value: VoiceType) => {
    setFormData((current) => ({ ...current, voiceType: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Singer not added",
        description: "Please enter a singer name first.",
      });
      return;
    }

    if (editingId) {
      // Update existing singer
      const { error } = await supabase
        .from("singers")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast({ title: "Update failed", description: error.message });
        return;
      }

      setSingers((current) =>
        current.map((s) => (s.id === editingId ? { ...s, ...formData } : s)),
      );

      toast({
        title: "Singer updated",
        description: `${formData.name.trim()} was updated.`,
      });
    } else {
      // Insert new singer
      const { data, error } = await supabase
        .from("singers")
        .insert({ ...formData })
        .select();

      if (error) {
        toast({ title: "Add failed", description: error.message });
        return;
      }

      const newSinger = data?.[0] as Singer;
      setSingers((current) => [newSinger, ...current]);

      toast({
        title: "Singer added",
        description: `${newSinger.name} was added to your team.`,
      });
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

    setSingers((current) => current.filter((s) => s.id !== singer.id));
    toast({
      title: "Singer removed",
      description: `${singer.name} was removed from your team.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-28">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Singers
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage worship team members and their vocal profiles.
            </p>
          </div>

          <Button onClick={openNewSingerForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Singer
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total Singers</p>
              <p className="text-3xl font-bold">{singers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Male Voices</p>
              <p className="text-3xl font-bold">
                {singers.filter((s) => s.voiceType === "male").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Female Voices</p>
              <p className="text-3xl font-bold">
                {singers.filter((s) => s.voiceType === "female").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Singer" : "Add New Singer"}</CardTitle>
              <CardDescription>
                Add the singer profile used for setlist recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="singer-name">Full Name *</Label>
                    <Input
                      id="singer-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="singer-nickname">Nickname</Label>
                    <Input
                      id="singer-nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="Enter nickname"
                    />
                  </div>

                  <div>
                    <Label htmlFor="singer-voice-type">Voice Type *</Label>
                    <Select
                      value={formData.voiceType}
                      onValueChange={handleVoiceTypeChange}
                    >
                      <SelectTrigger id="singer-voice-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceTypes.map((vt) => (
                          <SelectItem key={vt.value} value={vt.value}>
                            {vt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="singer-notes">Vocal Notes</Label>
                    <Input
                      id="singer-notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="e.g., Tenor, Alto, Lead"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      resetForm();
                      setIsFormOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingId ? "Update Singer" : "Add Singer"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Search and manage your worship singers.
                </CardDescription>
              </div>

              <div className="w-full sm:w-72">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search singers..."
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredSingers.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-medium">No singers found</p>
                <p className="text-sm text-muted-foreground">
                  Try a different search term or add a new singer.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSingers.map((singer) => (
                  <div
                    key={singer.id}
                    className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {singer.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">
                            {singer.voiceType === "male" ? "Male" : "Female"}
                          </Badge>
                          {singer.nickname && <span>“{singer.nickname}”</span>}
                          {singer.notes && <span>{singer.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(singer)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(singer)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}