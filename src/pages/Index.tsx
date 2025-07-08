import HeroSection from "@/components/sections/HeroSection";
import GameShowcase from "@/components/sections/GameShowcase";
import CategoryCards from "@/components/sections/CategoryCards";
import RecentBigWins from "@/components/sections/RecentBigWins";
import MouseGlow from "@/components/ui/MouseGlow";

const Index = () => {
  return (
    <>
      <MouseGlow />
      <HeroSection />
      <RecentBigWins />
      <CategoryCards />
      <div id="game-section">
        <GameShowcase />
      </div>
    </>
  );
};

export default Index;
