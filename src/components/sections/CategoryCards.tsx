import { useApp } from "@/contexts/AppContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import {
  Joystick,
  TableProperties,
  Users,
  Coins,
  Star,
  Trophy,
} from "lucide-react";

const getCategoryIcon = (id: string) => {
  switch (id) {
    case "slots":
      return <Joystick className="h-8 w-8 text-primary" />;
    case "table":
      return <TableProperties className="h-8 w-8 text-primary" />;
    case "live":
      return <Users className="h-8 w-8 text-primary" />;
    case "jackpot":
      return <Coins className="h-8 w-8 text-primary" />;
    case "originals":
      return <Star className="h-8 w-8 text-primary" />;
    case "sports":
      return <Trophy className="h-8 w-8 text-primary" />;
    default:
      return <Star className="h-8 w-8 text-primary" />;
  }
};

const CategoryCard = ({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-lg shadow-soft p-6 flex flex-col items-center text-center",
        "hover-scale hover:shadow-medium cursor-pointer relative",
        "border border-primary/30 hover:border-primary/70",
        "after:absolute after:inset-0 after:rounded-lg after:border after:border-primary/10 after:opacity-0 hover:after:opacity-100",
        "before:absolute before:-inset-0.5 before:rounded-lg before:bg-gradient-to-r before:from-primary/10 before:to-primary/5 before:opacity-0 hover:before:opacity-100 before:blur-md before:-z-10"
      )}
    >
      <div className="mb-4 bg-primary-light/10 p-4 rounded-full">
        {getCategoryIcon(icon)}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button className="bg-primary hover:bg-primary-hover">
        {t("games.allGames")}
      </Button>
    </div>
  );
};

const CategoryCards = () => {
  const { t } = useTranslation();
  const { categories, isLoading, filterGames } = useApp();

  const handleCategoryClick = (categoryId: string) => {
    filterGames(categoryId);
  };

  return (
    <section className="w-full mb-12">
      <h2 className="text-2xl font-bold mb-8">{t("categories.title")}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array(6)
              .fill(null)
              .map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="bg-card rounded-lg shadow-soft p-6 border border-primary/20"
                >
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-16 w-16 rounded-full mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              ))
          : categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.title}
                description={category.description}
                icon={category.icon}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
      </div>
    </section>
  );
};

export default CategoryCards;
