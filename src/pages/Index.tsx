"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Music, Users, Calendar, FileText, Upload, UserPlus, Library, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const dashboardStats = [
  { title: "Total Songs", value: "42", icon: Music, color: "text-blue-600" },
  { title: "Total Singers", value: "18", icon: Users, color: "text-green-600" },
  { title: "Upcoming Setlists", value: "5", icon: Calendar, color: "text-purple-600" },
  { title: "Recently Added", value: "3", icon: FileText, color: "text-orange-600" },
];

const quickActions = [
  { title: "Upload Song", icon: Upload, color: "bg-blue-500", action: "upload" },
  { title: "Add Singer", icon: UserPlus, color: "bg-green-500", action: "singer" },
  { title: "Create Setlist", icon: Library, color: "bg-purple-500", action: "setlist" },
  { title: "Generate PDF", icon: FileText, color: "bg-orange-500", action: "pdf" },
];

export default function Index() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSingerDialogOpen, setIsSingerDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "upload":
        setIsUploadDialogOpen(true);
        break;
      case "singer":
        setIsSingerDialogOpen(true);
        break;
      default:
        toast({
          title: "Feature Coming Soon",
          description: `This feature will be available soon.`,
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Worship Setlist Generator</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Church Worship Team</p>
      </header>

      {/* Dashboard Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              className={`${action.color} text-white h-20 flex-col gap-2`}
              onClick={() => handleQuickAction(action.action)}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.title}</span>
            </Button>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-400">Recent Songs</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">Amazing Grace</div>
                  <div className="text-sm text-gray-600">Key: C • Added: 2 days ago</div>
                </div>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload Song Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Song</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Song Title</Label>
              <Input placeholder="Enter song title" />
            </div>
            <div>
              <Label>Original Key</Label>
              <Input placeholder="e.g., C, D, G" />
            </div>
            <div>
              <Label>Tags</Label>
              <Input placeholder="e.g., Praise, Worship, Upbeat" />
            </div>
            <div>
              <Label>PDF File</Label>
              <Input type="file" accept="application/pdf" />
            </div>
            <Button className="w-full">Upload Song</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Singer Dialog */}
      <Dialog open={isSingerDialogOpen} onOpenChange={setIsSingerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Singer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input placeholder="Enter full name" />
            </div>
            <div>
              <Label>Nickname (Optional)</Label>
              <Input placeholder="Enter nickname" />
            </div>
            <div>
              <Label>Voice Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Add Singer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
</tool_call>
<dyad-write path="src/pages/Index.tsx" description="Creating the main dashboard page">
"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Music, Users, Calendar, FileText, Upload, UserPlus, Library, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const dashboardStats = [
  { title: "Total Songs", value: "42", icon: Music, color: "text-blue-600" },
  { title: "Total Singers", value: "18", icon: Users, color: "text-green-600" },
  { title: "Upcoming Setlists", value: "5", icon: Calendar, color: "text-purple-600" },
  { title: "Recently Added", value: "3", icon: FileText, color: "text-orange-600" },
];

const quickActions = [
  { title: "Upload Song", icon: Upload, color: "bg-blue-500", action: "upload" },
  { title: "Add Singer", icon: UserPlus, color: "bg-green-500", action: "singer" },
  { title: "Create Setlist", icon: Library, color: "bg-purple-500", action: "setlist" },
  { title: "Generate PDF", icon: FileText, color: "bg-orange-500", action: "pdf" },
];

export default function Index() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSingerDialogOpen, setIsSingerDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "upload":
        setIsUploadDialogOpen(true);
        break;
      case "singer":
        setIsSingerDialogOpen(true);
        break;
      default:
        toast({
          title: "Feature Coming Soon",
          description: `This feature will be available soon.`,
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Worship Setlist Generator</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Church Worship Team</p>
      </header>

      {/* Dashboard Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              className={`${action.color} text-white h-20 flex-col gap-2`}
              onClick={() => handleQuickAction(action.action)}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{action.title}</span>
            </Button>
          ))}
        </div>

        {/* Recent Activity */}
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-400">Recent Songs</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">Amazing Grace</div>
                  <div className="text-sm text-gray-600">Key: C • Added: 2 days ago</div>
                </div>
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload Song Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New Song</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Song Title</Label>
              <Input placeholder="Enter song title" />
            </div>
            <div>
              <Label>Original Key</Label>
              <Input placeholder="e.g., C, D, G" />
            </div>
            <div>
              <Label>Tags</Label>
              <Input placeholder="e.g., Praise, Worship, Upbeat" />
            </div>
            <div>
              <Label>PDF File</Label>
              <Input type="file" accept="application/pdf" />
            </div>
            <Button className="w-full">Upload Song</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Singer Dialog */}
      <Dialog open={isSingerDialogOpen} onOpenChange={setIsSingerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Singer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input placeholder="Enter full name" />
            </div>
            <div>
              <Label>Nickname (Optional)</Label>
              <Input placeholder="Enter nickname" />
            </div>
            <div>
              <Label>Voice Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Add Singer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}