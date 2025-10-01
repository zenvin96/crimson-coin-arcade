import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BigWinCardProps {
  username: string;
  isHidden: boolean;
  amount: number;
  currency: string;
  gameTitle: string;
  gameCategory: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  slots: "from-purple-600 to-purple-800",
  originals: "from-orange-500 to-orange-700",
  table: "from-green-600 to-green-800",
  live: "from-blue-600 to-blue-800",
  jackpot: "from-yellow-500 to-yellow-700",
  sports: "from-red-600 to-red-800",
};

const BigWinCard = ({
  username,
  isHidden,
  amount,
  currency,
  gameTitle,
  gameCategory,
  className,
}: BigWinCardProps) => {
  const displayName = isHidden ? "Hidden" : username;
  const gradientClass = categoryColors[gameCategory] || categoryColors.slots;

  // Format amount based on currency
  const formatAmount = (value: number, curr: string) => {
    if (curr === "BTC" || curr === "ETH") {
      return value.toFixed(4);
    }
    return value.toFixed(2);
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 w-[160px] md:w-[180px] bg-neutral-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer",
        className
      )}
    >
      {/* Game Thumbnail Placeholder */}
      <div
        className={cn(
          "h-20 md:h-24 bg-gradient-to-br flex items-center justify-center relative",
          gradientClass
        )}
      >
        <div className="text-white/20 text-xl md:text-2xl font-bold uppercase">
          {gameCategory.slice(0, 3)}
        </div>
        {/* Game title overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 md:px-2 py-0.5 md:py-1">
          <p className="text-white text-[10px] md:text-xs truncate">{gameTitle}</p>
        </div>
      </div>

      {/* Win Info */}
      <div className="p-2 md:p-3">
        {/* Username */}
        <div className="flex items-center gap-1 mb-1 md:mb-2">
          <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-500 flex-shrink-0" />
          <span className={cn(
            "text-xs md:text-sm truncate",
            isHidden ? "text-neutral-500" : "text-neutral-300"
          )}>
            {displayName}
          </span>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-1">
          <span className={cn(
            "text-[10px] md:text-xs font-medium",
            isHidden ? "text-neutral-500" : "text-neutral-400"
          )}>
            {isHidden ? "Hidden" : currency}
          </span>
          <span className={cn(
            "text-xs md:text-sm font-bold",
            isHidden ? "text-neutral-500" : "text-green-500"
          )}>
            {isHidden ? "***" : formatAmount(amount, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BigWinCard;