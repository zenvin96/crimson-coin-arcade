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
    <Card className="bg-gray-950/60 backdrop-blur-2xl border-gray-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-gray-950/40 to-purple-950/20" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="relative p-2 sm:p-3 md:p-4 flex flex-col items-center justify-center min-h-[320px] sm:min-h-[420px] md:min-h-[500px] space-y-2 sm:space-y-3 md:space-y-4">
        <div className="w-full max-w-2xl space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6 relative px-2 sm:px-1 md:px-0">
          {dicePosition !== null && (
            <div
              className="absolute -top-10 sm:-top-14 md:-top-20 z-20"
              style={{
                left: `${dicePosition}%`,
                transform: "translateX(-50%)",
                transition: 'left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className={cn(
                "relative w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20",
                isAnimating && "animate-bounce"
              )}>
                <img
                  src={DiceSvg}
                  alt="Dice"
                  className="w-full h-full drop-shadow-2xl"
                  style={{
                    filter: isWin === true
                      ? 'drop-shadow(0 0 20px rgba(20,241,149,0.8))'
                      : isWin === false
                      ? 'drop-shadow(0 0 20px rgba(244,63,94,0.8))'
                      : 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                    transition: 'filter 0.3s ease-out',
                  }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center text-xs sm:text-base md:text-xl font-bold"
                  style={{
                    color: isWin === true
                      ? '#14F195'
                      : isWin === false
                      ? '#F43F5E'
                      : '#FBBF24',
                    textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.8)',
                    transition: 'color 0.3s ease-out',
                  }}
                >
                  {currentResult?.toFixed(2)}
                </div>
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
                "text-center py-1.5 px-2 sm:py-2 sm:px-4 md:py-4 md:px-6 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm md:text-lg lg:text-2xl",
                "animate-in fade-in slide-in-from-bottom-4 duration-500",
                isWin
                  ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50"
                  : "bg-rose-500/20 text-rose-400 border-2 border-rose-500/50"
              )}
              style={{
                boxShadow: isWin
                  ? '0 0 16px rgba(16,185,129,0.2)'
                  : '0 0 16px rgba(244,63,94,0.2)',
              }}
              role="status"
              aria-live="polite"
            >
              {isWin ? t("dice.dialog.winTitle") : t("dice.dialog.loseTitle")}
              <span className="ml-1 sm:ml-2 text-sm sm:text-base md:text-xl lg:text-3xl">{currentResult.toFixed(2)}</span>
            </div>
          )}

          <div className="w-full max-w-lg space-y-2">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div
                className="text-center bg-gradient-to-br from-amber-500/20 via-yellow-600/15 to-amber-700/10 border border-amber-500/50 rounded-md p-1.5 sm:p-2 backdrop-blur"
                style={{ boxShadow: '0 0 12px rgba(245,158,11,0.15)' }}
              >
                <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wider">{t("dice.multiplier")}</p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-amber-400">
                  {multiplier.toFixed(2)}x
                </p>
              </div>
              <div
                className="text-center bg-gradient-to-br from-rose-500/20 via-pink-600/15 to-fuchsia-700/10 border border-rose-500/50 rounded-md p-1.5 sm:p-2 backdrop-blur"
                style={{ boxShadow: '0 0 12px rgba(244,63,94,0.15)' }}
              >
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5">
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">
                    {isRollOver ? t("dice.rollOver") : t("dice.rollUnder")}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-3 w-3 sm:h-4 sm:w-4 p-0 hover:bg-rose-500/20"
                    onClick={onToggleRollType}
                    aria-label={`Toggle between roll over and roll under. Currently: ${isRollOver ? t("dice.rollOver") : t("dice.rollUnder")}`}
                  >
                    <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-rose-400">
                  {target.toFixed(2)}
                </p>
              </div>
              <div
                className="text-center bg-gradient-to-br from-emerald-500/20 via-teal-600/15 to-emerald-700/10 border border-emerald-500/50 rounded-md p-1.5 sm:p-2 backdrop-blur"
                style={{ boxShadow: '0 0 12px rgba(16,185,129,0.15)' }}
              >
                <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 uppercase tracking-wider">{t("dice.winChance")}</p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-emerald-400">
                  {winChance.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};