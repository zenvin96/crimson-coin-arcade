
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  Joystick, 
  TableProperties, 
  Users, 
  Coins, 
  Star, 
  Trophy
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
  onClick
}: { 
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-soft p-6 flex flex-col items-center text-center transition-all duration-300 hover-scale hover:shadow-medium cursor-pointer"
      onClick={onClick}
    >
      <div className="mb-4 bg-primary-light/20 p-4 rounded-full">
        {getCategoryIcon(icon)}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <Button className="bg-primary hover:bg-primary-hover">
        Browse Games
      </Button>
    </div>
  );
};

const CategoryCards = () => {
  const { categories, isLoading, filterGames } = useApp();

  const handleCategoryClick = (categoryId: string) => {
    filterGames(categoryId);
    // Scroll to game section
    const gameSection = document.getElementById('game-section');
    if (gameSection) {
      gameSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="w-full mb-12">
      <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading 
          ? Array(6).fill(null).map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-lg shadow-soft p-6">
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
            ))
        }
      </div>
    </section>
  );
};

export default CategoryCards;
