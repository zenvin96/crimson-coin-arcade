import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronLeft,
  Trophy,
  Flame,
  ArrowRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type TabType = {
  id: string;
  labelKey: string;
  icon?: React.ReactNode;
};

const getTabs = (t): TabType[] => [
  { id: "all", labelKey: "gameShowcase.allGames" },
  {
    id: "originals",
    labelKey: "gameShowcase.originals",
    icon: <Trophy className="h-4 w-4" />,
  },
  { id: "slots", labelKey: "gameShowcase.slots" },
  { id: "table", labelKey: "gameShowcase.tableGames" },
  { id: "live", labelKey: "gameShowcase.liveCasino" },
  { id: "jackpot", labelKey: "gameShowcase.jackpots" },
];

// Game Card component
const GameCard = ({
  image,
  title,
  provider,
  isHot = false,
  isNew = false,
}: {
  image: string;
  title: string;
  provider: string;
  isHot?: boolean;
  isNew?: boolean;
}) => {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="game-card relative group border border-border/30">
      {!imageLoaded && <Skeleton className="h-40 w-full rounded-t-lg" />}
      <img
        src={image}
        alt={title}
        className={cn(
          "w-full h-40 object-cover rounded-t-lg transition-all",
          !imageLoaded && "hidden"
        )}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1">
        {isHot && (
          <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {t("gameShowcase.hotBadge")}
          </div>
        )}
        {isNew && (
          <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Flame className="h-3 w-3" />
            {t("gameShowcase.newBadge")}
          </div>
        )}
      </div>

      {/* Play button overlay */}
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg">
        <Button className="gradient-button hover:scale-105 transition-all">
          {t("gameShowcase.playNow")}
        </Button>
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{provider}</p>
      </div>
    </div>
  );
};

// Winner Card component
const WinnerCard = ({
  username,
  avatar,
  game,
  amount,
  currency,
  timestamp,
}: {
  username: string;
  avatar: string;
  game: {
    title: string;
    image: string;
  };
  amount: number;
  currency: string;
  timestamp: Date;
}) => {
  const { t } = useTranslation();
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="flex flex-col bg-card rounded-lg shadow-card p-3 min-w-[280px] border border-border/30 hover:border-border/50 transition-colors">
      <div className="flex gap-3 items-center mb-3">
        <img
          src={avatar}
          alt={username}
          className="h-10 w-10 rounded-full border-2 border-primary/20"
        />
        <div>
          <p className="font-medium text-sm">{username}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(timestamp)}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <img
          src={game.image}
          alt={game.title}
          className="h-12 w-12 rounded-md object-cover"
        />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">
            {t("gameShowcase.wonOn", { gameTitle: game.title })}
          </p>
          <p className="font-bold text-primary">
            {currency} {amount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const TabNavigation = () => {
  const { t } = useTranslation();
  const { currentFilter, filterGames } = useApp();
  const tabs = getTabs(t);
  const [visibleTabs, setVisibleTabs] = useState<TabType[]>([]);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Function to check if scrolling is needed
  const checkScrollButtons = () => {
    if (tabsRef.current) {
      setShowLeftScroll(tabsRef.current.scrollLeft > 0);
      setShowRightScroll(
        tabsRef.current.scrollLeft <
          tabsRef.current.scrollWidth - tabsRef.current.clientWidth
      );
    }
  };

  useEffect(() => {
    const tabsElement = tabsRef.current;
    // Set initial tabs
    setVisibleTabs(tabs);

    // Check for scroll buttons
    checkScrollButtons();

    // Add scroll event listener
    if (tabsElement) {
      tabsElement.addEventListener("scroll", checkScrollButtons);
    }

    // Clean up
    return () => {
      if (tabsElement) {
        tabsElement.removeEventListener("scroll", checkScrollButtons);
      }
    };
  }, []);

  const handleTabClick = (tabId: string) => {
    filterGames(tabId);
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex items-center mb-6">
      {showLeftScroll && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 z-10 bg-card shadow-md rounded-full border border-border/40"
          onClick={() => scrollTabs("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <div
        className="overflow-x-auto scrollbar-hide py-2 px-6 flex items-center gap-2"
        ref={tabsRef}
      >
        {visibleTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={currentFilter === tab.id ? "default" : "outline"}
            className={cn(
              "whitespace-nowrap transition-all",
              currentFilter === tab.id
                ? "bg-primary text-white hover:bg-primary/90"
                : "hover:bg-muted"
            )}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon && <span className="mr-1">{tab.icon}</span>}
            {t(tab.labelKey)}
          </Button>
        ))}
      </div>

      {showRightScroll && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 z-10 bg-card shadow-md rounded-full border border-border/40"
          onClick={() => scrollTabs("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const RecentWinners = () => {
  const { t } = useTranslation();
  const { recentWinners } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="w-full mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {t("gameShowcase.recentWinners")}
        </h2>
        <Button variant="link" className="text-primary">
          {t("gameShowcase.viewAll")}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div
        className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide"
        ref={scrollRef}
      >
        {recentWinners.map((winner) => (
          <WinnerCard
            key={winner.id}
            username={winner.username}
            avatar={winner.avatar}
            game={winner.game}
            amount={winner.amount}
            currency={winner.currency}
            timestamp={winner.timestamp}
          />
        ))}
      </div>
    </section>
  );
};

const GameShowcase = () => {
  const { filteredGames, isLoading } = useApp();

  return (
    <section className="w-full">
      <TabNavigation />

      <Separator className="my-12 bg-border/50" />

      <RecentWinners />

      <Separator className="my-8" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array(12)
              .fill(null)
              .map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-card rounded-lg shadow-card border border-border/30"
                >
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
          : filteredGames
              .slice(0, 12)
              .map((game) => (
                <GameCard
                  key={game.id}
                  image={game.image}
                  title={game.title}
                  provider={game.provider}
                  isHot={game.isHot}
                  isNew={game.isNew}
                />
              ))}
      </div>

      <div className="flex justify-center mt-6">
        <Button size="lg" className="gradient-button hover-scale">
          Load More Games
        </Button>
      </div>
    </section>
  );
};

export default GameShowcase;
