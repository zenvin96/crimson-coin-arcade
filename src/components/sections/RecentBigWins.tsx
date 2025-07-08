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
    <section className="w-full bg-background py-8">
      <div className="max-w-[1920px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {t("recentBigWins.title", "Recent Big Wins")}
          </h2>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
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
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Scrolling Container */}
          <div
            className={cn(
              "flex gap-4",
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

      <style jsx>{`
        @keyframes infinite-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-infinite-scroll {
          animation: infinite-scroll 5s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default RecentBigWins;