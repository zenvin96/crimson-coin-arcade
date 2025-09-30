import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DiceSlider } from "./DiceSlider";
import DiceSvg from "@/assets/dice.svg";

type DiceGameAreaProps = {
  target: number;
  isRollOver: boolean;
  multiplier: number;
  winChance: number;
  currentResult: number | null;
  dicePosition: number | null;
  isAnimating: boolean;
  isWin: boolean | undefined;
  onTargetChange: (value: number) => void;
  onToggleRollType: () => void;
};

export const DiceGameArea = ({
  target,
  isRollOver,
  multiplier,
  winChance,
  currentResult,
  dicePosition,
  isAnimating,
  isWin,
  onTargetChange,
  onToggleRollType,
}: DiceGameAreaProps) => {
  const { t } = useTranslation();

  return (
    <Card className="p-3 sm:p-6 lg:p-8 lg:col-span-2 bg-gradient-to-br from-muted/50 via-background to-muted/30 relative overflow-hidden min-w-0">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center h-full min-h-[280px] sm:min-h-[450px] space-y-4 sm:space-y-8">
        <div className="w-full max-w-2xl space-y-3 sm:space-y-6 relative px-1 sm:px-0">
          {dicePosition !== null && (
            <div
              className={cn(
                "absolute -top-12 sm:-top-20 z-20 transition-all duration-500",
                "animate-in fade-in zoom-in",
                isAnimating && "animate-bounce"
              )}
              style={{
                left: `${dicePosition}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="relative w-12 h-12 sm:w-20 sm:h-20">
                <img
                  src={DiceSvg}
                  alt="Dice"
                  className={cn(
                    "w-full h-full drop-shadow-2xl transition-all duration-300",
                    isWin && "filter drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]",
                    !isWin && isWin !== undefined && "filter drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center text-sm sm:text-xl font-bold text-white",
                    "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  )}
                >
                  {currentResult?.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DiceSlider
            target={target}
            isRollOver={isRollOver}
            onTargetChange={onTargetChange}
          />

          {currentResult !== null && (
            <div
              className={cn(
                "text-center py-2 px-3 sm:py-4 sm:px-6 rounded-lg font-bold text-sm sm:text-lg lg:text-2xl",
                "animate-in fade-in slide-in-from-bottom-4 duration-500",
                isWin
                  ? "bg-success/20 text-success border-2 border-success/40"
                  : "bg-destructive/20 text-destructive border-2 border-destructive/40"
              )}
              role="status"
              aria-live="polite"
            >
              {isWin ? t("dice.dialog.winTitle") : t("dice.dialog.loseTitle")}
              <span className="ml-2 text-base sm:text-xl lg:text-3xl">{currentResult.toFixed(2)}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-1 sm:gap-4 text-center pt-1 sm:pt-4">
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-[9px] sm:text-xs text-muted-foreground font-medium">
                {t("dice.multiplier")}
              </div>
              <div className="text-sm sm:text-xl lg:text-2xl font-bold text-accent">
                {multiplier.toFixed(2)}x
              </div>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-[9px] sm:text-xs text-muted-foreground font-medium flex items-center justify-center gap-0.5 sm:gap-1">
                <span className="hidden sm:inline">{isRollOver ? t("dice.rollOver") : t("dice.rollUnder")}</span>
                <span className="sm:hidden">{isRollOver ? ">" : "<"}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 sm:h-6 sm:w-6 p-0 hover:bg-primary/20"
                  onClick={onToggleRollType}
                  aria-label={`Toggle between roll over and roll under. Currently: ${isRollOver ? t("dice.rollOver") : t("dice.rollUnder")}`}
                >
                  <RefreshCw className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
              <div className="text-sm sm:text-xl lg:text-2xl font-bold text-primary">
                {target.toFixed(2)}
              </div>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-[9px] sm:text-xs text-muted-foreground font-medium">
                {t("dice.winChance")}
              </div>
              <div className="text-sm sm:text-xl lg:text-2xl font-bold text-success">
                {winChance.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};