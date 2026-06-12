"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, Edit, Trash2 } from "lucide-react";

export default function Singers() {
  const [singers, setSingers] = useState<Array<{
    id: string;
    name: string;
    nickname?: string;
    voiceType: "male" | "female";
    notes?: string;
  }>>([
    { id: "1", name: "John Smith", nickname: "Johnny", voiceType: "male", notes: "Tenor" },
    { id: "2", name: "Sarah Johnson", nickname: "Sara", voiceType: "female", notes: "Alto" },
    { id: "3", name: "Mike Davis", voiceType: "male", notes: "Bass" }
  ]);

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    voiceType: "male" as "male" | "female",
    notes: ""
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      // Update existing singer
      setSingers(prev => prev.map(singer => 
        singer.id === editingId ? { ...singer, ...formData } : singer
      ));
      setEditingId(null);
    } else {
      // Add new singer
      const newSinger = {
        id: Date.now().toString(),
        ...formData
      };
      setSingers(prev => [...prev, newSinger]);
    }
    
    setFormData({
      name: "",
      nickname: "",
      voiceType: "male",
      notes: ""
    });
    setIsFormOpen(false);
  };

  const handleEdit = (singer: typeof singers[0]) => {
    setEditingId(singer.id);
    setFormData({
      name: singer.name,
      nickname: singer.nickname || "",
      voiceType: singer.voiceType,
      notes: singer.notes || ""
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setSingers(prev => prev.filter(singer => singer.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Singers Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your worship team members and their vocal profiles
        </p>
        <Button 
          variant="outline" 
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: "",
              nickname: "",
              voiceType: "male",
              notes: ""
            });
            setIsFormOpen(true);
          }}
          className="mb-4"
        >
          <Plus className="mr-2" /> Add New Singer
        </Button>
      </div>

      {/* Singer Form */}
      {isFormOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit Singer" : "Add New Singer"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nickname (Optional)</label>
                <Input
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  placeholder="Enter nickname"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Voice Type *</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice type">
                      {formData.voiceType === "male" ? "Male" : "Female"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional notes about the singer"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  isLoading={false}
                >
                  {editingId ? "Update Singer" : "Add Singer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Singers List */}
      <div className="space-y-4">
        {singers.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            No singers added yet. Click "Add New Singer" to get started.
          </p>
        ) : (
          <>
            {singers.map(singer => (
              <Card key={singer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {singer.name}
                        </h3>
                        {singer.nickname && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            "{singer.nickname}"
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {singer.voiceType === "male" ? "Male" : "Female"} • 
                          {singer.notes || "No notes"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(singer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive"
                      ghost
                      size="sm"
                      onClick={() => handleDelete(singer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}