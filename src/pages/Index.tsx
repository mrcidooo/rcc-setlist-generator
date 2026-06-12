import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400">SongMatrix</h1>
        <Button onClick={() => navigate("/upload")} className="bg-blue-600 hover:bg-blue-500">
          Upload Song
        </Button>
      </header>

      {/* Main content placeholder */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-4">Welcome to SongMatrix</h2>
          <p className="text-lg text-gray-300">
            Manage your music library with a modern dark interface.
          </p>
        </div>
      </main>

      <MadeWithDyad />
    </div>
  );
};

export default Index;