import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AllGames from "./pages/AllGames";
import TouchPrevent from "./components/ui/TouchPrevent";
import AppLayout from "./components/layout/AppLayout";
import TournamentsPage from "./pages/TournamentsPage";
import OriginalGamesPage from "./pages/OriginalGamesPage";
import SlotMachinesPage from "./pages/SlotMachinesPage";
import TableGamesPage from "./pages/TableGamesPage";
import LiveCasinoPage from "./pages/LiveCasinoPage";
import VipPage from "./pages/VipPage";
import BonusesPage from "./pages/BonusesPage";
import ReferFriendsPage from "./pages/ReferFriendsPage";
import PromotionsPage from "./pages/PromotionsPage";
import SupportPage from "./pages/SupportPage";
import SettingsPage from "./pages/SettingsPage";
import LogoutPage from "./pages/LogoutPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TouchPrevent />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/all-games" element={<AllGames />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/original-games" element={<OriginalGamesPage />} />
            <Route path="/slot-machines" element={<SlotMachinesPage />} />
            <Route path="/table-games" element={<TableGamesPage />} />
            <Route path="/live-casino" element={<LiveCasinoPage />} />
            <Route path="/vip" element={<VipPage />} />
            <Route path="/bonuses" element={<BonusesPage />} />
            <Route path="/refer-friends" element={<ReferFriendsPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/logout" element={<LogoutPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
