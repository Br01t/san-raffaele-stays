import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";

// Public pages
const Index = React.lazy(() => import("./pages/Index"));
const Alloggi = React.lazy(() => import("./pages/Alloggi"));
const ComeRaggiungerci = React.lazy(() => import("./pages/ComeRaggiungerci"));
const GuidaZona = React.lazy(() => import("./pages/GuidaZona"));
const Contatti = React.lazy(() => import("./pages/Contatti"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Admin (tutto caricato solo entrando in /admin: il sito pubblico non scarica Supabase)
const AdminShell = React.lazy(() => import("./components/admin/AdminShell"));
const AdminArea = React.lazy(() => import("./components/admin/AdminArea"));
const AdminLogin = React.lazy(() =>
  import("./pages/admin/AdminLogin").then((m) => ({ default: m.AdminLogin }))
);
const AdminDashboard = React.lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const AdminApartments = React.lazy(() =>
  import("./pages/admin/AdminApartments").then((m) => ({ default: m.AdminApartments }))
);
const AdminCalendar = React.lazy(() =>
  import("./pages/admin/AdminCalendar").then((m) => ({ default: m.AdminCalendar }))
);
const AdminMonthlyData = React.lazy(() =>
  import("./pages/admin/AdminMonthlyData").then((m) => ({ default: m.AdminMonthlyData }))
);
const AdminAgenda = React.lazy(() =>
  import("./pages/admin/AdminAgenda").then((m) => ({ default: m.AdminAgenda }))
);
const AdminApartmentAccounting = React.lazy(() =>
  import("./pages/admin/AdminApartmentAccounting").then((m) => ({ default: m.AdminApartmentAccounting }))
);
const AdminPersonalFinance = React.lazy(() =>
  import("./pages/admin/AdminPersonalFinance").then((m) => ({ default: m.AdminPersonalFinance }))
);
const AdminPersonalBalance = React.lazy(() =>
  import("./pages/admin/AdminPersonalBalance").then((m) => ({ default: m.AdminPersonalBalance }))
);
const AdminEventsNotes = React.lazy(() =>
  import("./pages/admin/AdminEventsNotes").then((m) => ({ default: m.AdminEventsNotes }))
);
const AdminAnalytics = React.lazy(() =>
  import("./pages/admin/AdminAnalytics").then((m) => ({ default: m.AdminAnalytics }))
);
const AdminSettings = React.lazy(() =>
  import("./pages/admin/AdminSettings").then((m) => ({ default: m.AdminSettings }))
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <React.Suspense
            fallback={
              <div className="h-screen w-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            }
          >
            <Routes>
              {/* Public Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/alloggi" element={<Alloggi />} />
                <Route path="/come-raggiungerci" element={<ComeRaggiungerci />} />
                <Route path="/guida-zona" element={<GuidaZona />} />
                <Route path="/contatti" element={<Contatti />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
              </Route>

              {/* Area admin: login + rotte protette, dentro il provider di autenticazione */}
              <Route element={<AdminShell />}>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminArea />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="appartamenti" element={<AdminApartments />} />
                  <Route path="calendario" element={<AdminCalendar />} />
                  <Route path="dati-mensili" element={<AdminMonthlyData />} />
                  <Route path="agenda" element={<AdminAgenda />} />
                  <Route path="contabilita" element={<AdminApartmentAccounting />} />
                  <Route path="finanze-personali" element={<AdminPersonalFinance />} />
                  <Route path="bilancio" element={<AdminPersonalBalance />} />
                  <Route path="eventi" element={<AdminEventsNotes />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="impostazioni" element={<AdminSettings />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
