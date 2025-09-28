import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GameCard from "@/components/games/GameCard";
import { useNavigate } from "react-router-dom";

const OriginalGamesPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  const originalGames = [
    { id: 1, name: "CRASH", players: 2740, color: "bg-purple-500" },
    { id: 2, name: "HILO", players: 856, color: "bg-green-500" },
    { id: 3, name: "MINES", players: 1204, color: "bg-orange-500" },
    { id: 4, name: "DICE", players: 948, color: "bg-blue-500" },
  ];

  const filters = [
    { id: "all", label: t("originalGamesPage.all") },
    { id: "popular", label: t("originalGamesPage.popular") },
    { id: "new", label: t("originalGamesPage.new") },
  ];

  const filteredGames = originalGames.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("originalGamesPage.title")}</h1>
        <p className="text-muted-foreground">{t("originalGamesPage.description")}</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("originalGamesPage.searchPlaceholder")}
          className="pl-10 bg-card border border-border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-6">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="transform transition-transform hover:scale-105"
            onClick={() => {
              if (game.name.toLowerCase() === "mines") {
                navigate("/original-games/mines");
              } else if (game.name.toLowerCase() === "crash") {
                navigate("/original-games/crash");
              } else if (game.name.toLowerCase() === "dice") {
                navigate("/original-games/dice");
              }
            }}
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("originalGamesPage.noGamesFound")}</p>
        </div>
      )}
    </div>
  );
};

export default OriginalGamesPage;