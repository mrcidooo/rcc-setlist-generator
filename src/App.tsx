import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Songs from "./pages/Songs";
import Singers from "./pages/Singers";
import Setlists from "./pages/Setlists";
import SingerKeyList from "./pages/SingerKeyList";
import SongDetails from "./pages/SongDetails";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";
import { BottomNavigation } from "@/components/BottomNavigation";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BrowserRouter>
            {/* faster and smoother transition for theme changes */}
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ease-out relative">
              <main className="flex-1 pb-28">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/songs" element={<Songs />} />
                  <Route path="/songs/:id" element={<SongDetails />} />
                  <Route path="/singers" element={<Singers />} />
                  <Route path="/setlists" element={<Setlists />} />
                  <Route path="/singer-keys" element={<SingerKeyList />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <BottomNavigation className="z-20" />
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}