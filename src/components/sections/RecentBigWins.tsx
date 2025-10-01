import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import BigWinCard from "@/components/games/BigWinCard";
import { Winner } from "@/types/game";
import { generateMockData } from "@/services/mockData";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "all", label: "All" },
  { id: "originals", label: "BC Originals" },
  { id: "slots", label: "Slots" },
  { id: "live", label: "Live Casino" },
];

const RecentBigWins = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("all");
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const { winners: mockWinners } = generateMockData();
    // Duplicate winners for infinite scroll effect
    setWinners([...mockWinners, ...mockWinners]);
  }, []);

  return (
    <section className="w-full bg-background py-4 md:py-8 overflow-x-hidden">
      <div className="max-w-[1920px] mx-auto px-0 md:px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 md:mb-6 gap-2 md:gap-3 px-3 md:px-0">
          <h2 className="text-base md:text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {t("recentBigWins.title", "Recent Big Wins")}
          </h2>

          {/* Tabs - Scrollable on mobile */}
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-2.5 py-1 md:px-4 md:py-2 text-[11px] md:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Infinite Slider Container */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient Masks - smaller on mobile */}
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Scrolling Container */}
          <div
            className={cn(
              "flex gap-2 md:gap-4 pl-3 md:pl-0",
              isPaused ? "" : "animate-infinite-scroll"
            )}
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {winners.map((winner, index) => (
              <BigWinCard
                key={`${winner.id}-${index}`}
                username={winner.username}
                isHidden={winner.isHidden || false}
                amount={winner.amount}
                currency={winner.currency}
                gameTitle={winner.game.title}
                gameCategory={winner.game.category}
              />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};

export default RecentBigWins;