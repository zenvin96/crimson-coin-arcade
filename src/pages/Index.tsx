import HeroSection from "@/components/sections/HeroSection";
import GameShowcase from "@/components/sections/GameShowcase";
import CategoryCards from "@/components/sections/CategoryCards";
import MouseGlow from "@/components/ui/MouseGlow";

const Index = () => {
  return (
    <>
      <MouseGlow />
      <HeroSection />
      <CategoryCards />
      <div id="game-section">
        <GameShowcase />
      </div>
    </>
  );
};

export default Index;
