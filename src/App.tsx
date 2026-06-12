import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import SingerKeyList from "./pages/SingerKeyList";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";
import { BottomNavigation } from "@/components/BottomNavigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative">
            <main className="flex-1 pb-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/singer-keys" element={<SingerKeyList />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNavigation className="fixed bottom-0 left-0 right-0 border-t border-border bg-white p-4 dark:bg-gray-800 flex justify-around z-10" />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;