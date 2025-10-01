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
      <div className="flex items-center justify-center py-3 sm:py-4 px-3 sm:px-4 bg-muted/50 rounded-md sm:rounded-lg border-b">
        <p className="text-xs sm:text-sm text-muted-foreground">{t("dice.noHistory")}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md sm:rounded-lg w-full">
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto py-2 sm:py-3 px-2 sm:px-4 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 border-b scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        <div className="absolute left-0 top-0 bottom-0 w-3 sm:w-4 md:w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-3 sm:w-4 md:w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

        {displayHistory.map((result, i) => (
          <div
            key={`${result.timestamp}-${i}`}
            className={cn(
              "flex-shrink-0 min-w-[48px] sm:min-w-[56px] md:min-w-[64px] h-8 sm:h-9 md:h-10 rounded-md flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-semibold transition-all duration-300",
              result.isWin
                ? "bg-gradient-to-br from-emerald-500/25 via-emerald-600/20 to-teal-600/15 text-emerald-400 border border-emerald-500/50"
                : "bg-gradient-to-br from-rose-500/25 via-red-600/20 to-rose-700/15 text-rose-400 border border-rose-500/50",
              i === displayHistory.length - 1 && "scale-105 sm:scale-110 ring-1 sm:ring-2 ring-amber-500/50"
            )}
            style={{
              boxShadow: result.isWin
                ? '0 0 8px rgba(16,185,129,0.2)'
                : '0 0 8px rgba(244,63,94,0.2)',
            }}
            aria-label={`${t("dice.result")}: ${result.result.toFixed(2)}, ${result.isWin ? t("dice.dialog.winTitle") : t("dice.dialog.loseTitle")}`}
          >
            {result.result.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
};