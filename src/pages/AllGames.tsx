import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameCard from "@/components/games/GameCard";
import GameCarousel from "../components/games/GameCarousel";
import { AppProvider } from "@/contexts/AppContext";
import AppLayout from "@/components/layout/AppLayout";
import MouseGlow from "@/components/ui/MouseGlow";

const AllGamesContent = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("lobby");
  const [activeTab, setActiveTab] = useState("continue-playing");
  const contentRef = useRef<HTMLDivElement>(null);

  // 防止页面初始自动滚动
  useEffect(() => {
    // 如果页面已经滚动，则强制回到顶部
    if (window.scrollY > 0) {
      window.scrollTo(0, 0);
    }
  }, []);

  // 模拟的游戏数据
  const continuePlaying = [
    { id: 1, name: "KENO", players: 144, color: "bg-orange-500" },
    { id: 2, name: "CLASSIC DICE", players: 148, color: "bg-green-500" },
    { id: 3, name: "CRASH", players: 2740, color: "bg-purple-500" },
    { id: 4, name: "WHEEL", players: 124, color: "bg-blue-500" },
    { id: 5, name: "HILO", players: 130, color: "bg-purple-600" },
    { id: 6, name: "COINFLIP", players: 112, color: "bg-orange-400" },
    { id: 7, name: "MINE", players: 304, color: "bg-purple-500" },
    { id: 8, name: "ROULETTE", players: 20, color: "bg-blue-400" },
  ];

  const bcOriginals = [
    { id: 1, name: "CRASH", players: 2740, color: "bg-purple-500" },
    { id: 2, name: "CRASH TRENBALL", players: 182, color: "bg-orange-500" },
    { id: 3, name: "PLINKO", players: 205, color: "bg-blue-500" },
    { id: 4, name: "LIMBO", players: 274, color: "bg-green-600" },
    { id: 5, name: "PERYA COLOR GAME", players: 3, color: "bg-blue-400" },
    { id: 6, name: "MINE", players: 304, color: "bg-purple-500" },
    { id: 7, name: "FAST PARITY", players: 306, color: "bg-blue-300" },
    { id: 8, name: "TWIST", players: 278, color: "bg-purple-600" },
  ];

  // 轮播图数据
  const carouselItems = [
    {
      id: 1,
      title: "WIN A PORSCHE !",
      price: "$1",
      bgColor: "bg-green-600",
      category: "SLOTS",
      image: "/images/carousel/porsche.png",
    },
    {
      id: 2,
      title: "EXTRA 10% REBATE",
      subtitle: "UCL",
      bgColor: "bg-red-800",
      category: "SPORTS",
      image: "/images/carousel/ucl.png",
    },
    {
      id: 3,
      title: "BETSWIN MARBLE RACE",
      price: "€500,000",
      bgColor: "bg-purple-600",
      category: "SLOTS",
      image: "/images/carousel/marble-race.png",
    },
  ];

  const categories = [
    { id: "lobby", labelKey: "allGamesPage.lobby", icon: "🏠" },
    { id: "bc-originals", labelKey: "allGamesPage.bcOriginals", icon: "🎮" },
    { id: "hot-games", labelKey: "allGamesPage.hotGames", icon: "🔥" },
    { id: "slots", labelKey: "allGamesPage.slots", icon: "🎰" },
    { id: "live-casino", labelKey: "allGamesPage.liveCasino", icon: "🎲" },
    { id: "fishing", labelKey: "allGamesPage.fishing", icon: "🎣" },
    { id: "table-games", labelKey: "allGamesPage.tableGames", icon: "♠️" },
    { id: "game-shows", labelKey: "allGamesPage.gameShows", icon: "📺" },
    { id: "new-releases", labelKey: "allGamesPage.newReleases", icon: "✨" },
    { id: "feature-buy-in", labelKey: "allGamesPage.featureBuyIn", icon: "💰" },
    { id: "providers", labelKey: "allGamesPage.providers", icon: "🏢" },
  ];

  return (
    <div ref={contentRef}>
      {/* 轮播图 */}
      <div className="mb-6">
        <GameCarousel items={carouselItems} />
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("allGamesPage.searchPlaceholder")}
          className="pl-10 bg-card border border-border"
        />
      </div>

      {/* 游戏分类 */}
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            className="whitespace-nowrap"
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="mr-2">{category.icon}</span>
            {t(category.labelKey)}
          </Button>
        ))}
      </div>

      {/* 继续玩 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4 items-center">
            <Button
              variant={activeTab === "continue-playing" ? "default" : "ghost"}
              className="px-0 font-semibold"
              onClick={() => setActiveTab("continue-playing")}
            >
              {t("allGamesPage.continuePlaying")}
            </Button>
            <Button
              variant={activeTab === "favorites" ? "default" : "ghost"}
              className="px-0 font-semibold"
              onClick={() => setActiveTab("favorites")}
            >
              {t("allGamesPage.favorites")}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              ‹
            </Button>
            <Button size="sm" variant="outline">
              ›
            </Button>
            <Button size="sm" variant="outline">
              {t("allGamesPage.all")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {continuePlaying.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* BC Originals */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t("allGamesPage.bcOriginals")}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              ‹
            </Button>
            <Button size="sm" variant="outline">
              ›
            </Button>
            <Button size="sm" variant="outline">
              {t("allGamesPage.all")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {bcOriginals.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>
    </div>
  );
};

const AllGames = () => {
  return (
    <AppProvider>
      <AppLayout>
        <MouseGlow />
        <AllGamesContent />
      </AppLayout>
    </AppProvider>
  );
};

export default AllGames;
