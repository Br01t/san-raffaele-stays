import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Alloggi from "./pages/Alloggi";
import ComeRaggiungerci from "./pages/ComeRaggiungerci";
import IlGestore from "./pages/IlGestore";
import GuidaZona from "./pages/GuidaZona";
import Contatti from "./pages/Contatti";
import Recensioni from "./pages/Recensioni";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/san-raffaele-stays/">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/alloggi" element={<Alloggi />} />
            <Route path="/come-raggiungerci" element={<ComeRaggiungerci />} />
            <Route path="/il-gestore" element={<IlGestore />} />
            <Route path="/guida-zona" element={<GuidaZona />} />
            <Route path="/contatti" element={<Contatti />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
