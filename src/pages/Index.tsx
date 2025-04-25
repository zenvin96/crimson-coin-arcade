
import { AppProvider } from "@/contexts/AppContext";
import AppLayout from "@/components/layout/AppLayout";
import HeroSection from "@/components/sections/HeroSection";
import GameShowcase from "@/components/sections/GameShowcase";
import CategoryCards from "@/components/sections/CategoryCards";

const Index = () => {
  return (
    <AppProvider>
      <AppLayout>
        <HeroSection />
        <CategoryCards />
        <div id="game-section">
          <GameShowcase />
        </div>
      </AppLayout>
    </AppProvider>
  );
};

export default Index;
