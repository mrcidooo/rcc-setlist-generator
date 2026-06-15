"use client";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Songs from "./pages/Songs";
import Singers from "./pages/Singers";
import Setlists from "./pages/Setlists";
import SingerKeyList from "./pages/SingerKeyList";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";
import { BottomNavigation } from "@/components/BottomNavigation";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/singers" element={<Singers />} />
          <Route path="/setlists" element={<Setlists />} />
          <Route path="/singer-keys" element={<SingerKeyList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation className="z-20" />
      </BrowserRouter>
    </ThemeProvider>
  );
}