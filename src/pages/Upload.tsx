import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: In a real app you would upload to Supabase storage here
    console.log("File to upload:", file);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400">Upload Song</h1>
        <Button onClick={() => navigate("/")}>Back</Button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="bg-gray-800 text-gray-100 border-gray-600"
          />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
            Upload
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Upload;