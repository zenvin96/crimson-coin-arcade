import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { DiceBetResult } from "@/services/api/dice";

type DiceHistoryBarProps = {
  history: DiceBetResult[];
  maxItems?: number;
};

export const DiceHistoryBar = ({ history, maxItems = 10 }: DiceHistoryBarProps) => {
  const { t } = useTranslation();

  const displayHistory = history.slice(0, maxItems).reverse();

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 px-4 bg-muted/50 rounded-t-lg border-b">
        <p className="text-sm text-muted-foreground">{t("dice.noHistory")}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg w-full">
      <div className="flex gap-2 overflow-x-auto py-3 px-2 sm:px-4 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 border-b scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

        {displayHistory.map((result, i) => (
          <div
            key={`${result.timestamp}-${i}`}
            className={cn(
              "flex-shrink-0 min-w-[56px] sm:min-w-[64px] h-10 rounded-md flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md",
              result.isWin
                ? "bg-success/20 text-success border border-success/40 shadow-sm shadow-success/20"
                : "bg-destructive/20 text-destructive border border-destructive/40 shadow-sm shadow-destructive/20",
              i === displayHistory.length - 1 && "scale-110 ring-2 ring-primary/50"
            )}
            aria-label={`${t("dice.result")}: ${result.result.toFixed(2)}, ${result.isWin ? t("dice.dialog.winTitle") : t("dice.dialog.loseTitle")}`}
          >
            {result.result.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
};