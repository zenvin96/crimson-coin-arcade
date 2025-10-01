import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Trophy, TrendingUp, Target, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DiceConfig, DiceBetResult } from "@/services/api/dice";
import type { AutoBetState } from "@/hooks/useDiceAutobet";

type DiceControlsProps = {
  betAmount: number;
  balance: number;
  profitOnWin: number;
  config: DiceConfig | undefined;
  isPlacingBet: boolean;
  autoBetState: AutoBetState;
  activeTab: "manual" | "auto";
  history: DiceBetResult[];
  onTabChange: (tab: "manual" | "auto") => void;
  onBetAmountChange: (amount: number) => void;
  onQuickAmount: (multiplier: number) => void;
  onPlaceBet: () => void;
  onStartAutoBet: () => void;
  onStopAutoBet: () => void;
  onAutoBetConfigChange: (updates: Partial<AutoBetState>) => void;
};

export const DiceControls = ({
  betAmount,
  balance,
  profitOnWin,
  config,
  isPlacingBet,
  autoBetState,
  activeTab,
  history,
  onTabChange,
  onBetAmountChange,
  onQuickAmount,
  onPlaceBet,
  onStartAutoBet,
  onStopAutoBet,
  onAutoBetConfigChange,
}: DiceControlsProps) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const stats = useMemo(() => {
    const totalProfit = history.reduce((sum, bet) => sum + bet.profit, 0);
    const wins = history.filter(bet => bet.isWin).length;
    const winRate = history.length > 0 ? (wins / history.length * 100) : 0;
    const bestStreak = history.length > 0 ? Math.max(...history.map((_, idx, arr) => {
      let streak = 0;
      for (let i = idx; i < arr.length && arr[i].isWin; i++) streak++;
      return streak;
    })) : 0;
    const highestMultiplier = history.length > 0 ? Math.max(...history.map(bet =>
      (100 / (bet.isRollOver ? (100 - bet.target) : bet.target)) * 0.975
    )) : 0;

    return {
      totalProfit,
      winRate: winRate.toFixed(1),
      bestStreak,
      highestMultiplier: highestMultiplier.toFixed(2),
      totalGames: history.length,
    };
  }, [history]);

  return (
    <>
      <Card className="bg-gray-900/70 backdrop-blur-2xl border-gray-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <CardContent className="p-2 sm:p-3 space-y-2 sm:space-y-3">
          <div
            className="flex items-center justify-between py-1.5 px-2 sm:py-2 sm:px-3 bg-gradient-to-br from-amber-950/40 via-gray-900/30 to-amber-950/40 border border-amber-700/30 rounded-md"
            style={{ boxShadow: 'inset 0 1px 2px rgba(251,191,36,0.05)' }}
          >
            <span className="text-[10px] sm:text-xs text-gray-400">{t("dice.balance")}</span>
            <span className="text-xs sm:text-sm font-bold text-amber-400">${balance.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-gray-400">{t("dice.profit")}</p>
              <p className={cn("text-sm sm:text-lg font-bold", stats.totalProfit >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {stats.totalProfit >= 0 ? "+" : ""}${stats.totalProfit.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs text-gray-400">{t("dice.winRate")}</p>
              <p className="text-sm sm:text-lg font-bold">{stats.winRate}%</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "manual" | "auto")}>
            <TabsList className="grid w-full grid-cols-2 mb-2 sm:mb-3 h-8 sm:h-9">
              <TabsTrigger value="manual" className="text-[10px] sm:text-xs md:text-sm">{t("dice.manual")}</TabsTrigger>
              <TabsTrigger value="auto" className="text-[10px] sm:text-xs md:text-sm">{t("dice.auto")}</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-2 sm:space-y-3 mt-0">
              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <label className="text-[10px] sm:text-xs font-medium" htmlFor="bet-amount-manual">
                    {t("dice.betAmount")}
                  </label>
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    {t("dice.profitOnWin")}: <span className="text-emerald-400 font-medium">${profitOnWin.toFixed(2)}</span>
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="bet-amount-manual"
                    type="number"
                    value={betAmount}
                    onChange={(e) => onBetAmountChange(parseFloat(e.target.value) || 0)}
                    min={config?.minBet || 0.01}
                    max={config?.maxBet || 10000}
                    step="0.01"
                    className="w-full h-8 sm:h-9 pr-28 sm:pr-32 text-xs sm:text-sm"
                    aria-label={t("dice.betAmount")}
                  />
                  <div className="absolute right-0.5 sm:right-1 top-0.5 sm:top-1 flex gap-0.5 sm:gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onQuickAmount(0.5)}
                      className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                      aria-label={t("dice.presets.half")}
                    >
                      ½
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onQuickAmount(2)}
                      className="h-6 sm:h-7 px-1 sm:px-1.5 text-[10px] sm:text-xs"
                      aria-label={t("dice.presets.double")}
                    >
                      2×
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onQuickAmount(balance / betAmount)}
                      className="h-6 sm:h-7 px-1 sm:px-1.5 text-[10px] sm:text-xs"
                      aria-label={t("dice.presets.max")}
                    >
                      MAX
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 hover:from-rose-500 hover:via-pink-500 hover:to-purple-600 hover:scale-[1.02] active:scale-95 transition-all duration-200 h-9 sm:h-10 text-sm sm:text-base font-bold"
                style={{
                  boxShadow: '0 4px 16px rgba(236,72,153,0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(236,72,153,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(236,72,153,0.4)';
                }}
                size="default"
                onClick={onPlaceBet}
                disabled={isPlacingBet || betAmount > balance || betAmount <= 0}
                aria-label={t("dice.bet")}
              >
                {isPlacingBet ? t("dice.betting") : t("dice.bet")}
              </Button>
            </TabsContent>

            <TabsContent value="auto" className="space-y-2 sm:space-y-3 mt-0">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] sm:text-xs font-medium mb-1 block" htmlFor="bet-amount-auto">
                {t("dice.betAmount")}
              </label>
              <Input
                id="bet-amount-auto"
                type="number"
                value={betAmount}
                onChange={(e) => onBetAmountChange(parseFloat(e.target.value) || 0)}
                min={config?.minBet || 0.01}
                max={config?.maxBet || 10000}
                step="0.01"
                disabled={autoBetState.isActive}
                className="h-8 sm:h-9 text-xs sm:text-sm"
                aria-label={t("dice.betAmount")}
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-medium mb-1 block" htmlFor="number-of-bets">
                {t("dice.numberOfBets")}
              </label>
              <Input
                id="number-of-bets"
                type="number"
                value={autoBetState.numberOfBets}
                onChange={(e) => onAutoBetConfigChange({ numberOfBets: parseInt(e.target.value) || 1 })}
                min={1}
                max={1000}
                disabled={autoBetState.isActive}
                className="h-8 sm:h-9 text-xs sm:text-sm"
                aria-label={t("dice.numberOfBets")}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] sm:text-xs font-medium mb-1 block">
              {t("dice.speed")}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(["slow", "normal", "fast", "turbo"] as const).map(speed => (
                <Button
                  key={speed}
                  size="sm"
                  variant={autoBetState.speed === speed ? "default" : "outline"}
                  onClick={() => onAutoBetConfigChange({ speed })}
                  disabled={autoBetState.isActive}
                  className="h-7 sm:h-8 px-0.5 sm:px-1 text-[10px] sm:text-xs"
                  aria-label={t(`dice.${speed}`)}
                  aria-pressed={autoBetState.speed === speed}
                >
                  {t(`dice.${speed}`).slice(0, 1).toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full py-1.5 px-2 sm:py-2 sm:px-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
            disabled={autoBetState.isActive}
          >
            <span className="text-[10px] sm:text-xs font-medium">高级设置 / Advanced</span>
            {showAdvanced ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />}
          </button>

          {showAdvanced && (
            <div className="space-y-1.5 sm:space-y-2 p-2 sm:p-3 bg-muted/30 rounded-md border animate-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 block">
                    {t("dice.onWin")}
                  </label>
                  <Select
                    value={autoBetState.onWinAction}
                    onValueChange={(v) => onAutoBetConfigChange({ onWinAction: v as typeof autoBetState.onWinAction })}
                    disabled={autoBetState.isActive}
                  >
                    <SelectTrigger className="h-7 sm:h-8 text-[10px] sm:text-xs" aria-label={t("dice.onWin")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reset" className="text-xs">{t("dice.resetToBase")}</SelectItem>
                      <SelectItem value="increase" className="text-xs">{t("dice.increaseBy")}</SelectItem>
                      <SelectItem value="decrease" className="text-xs">{t("dice.decreaseBy")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {autoBetState.onWinAction !== "reset" && (
                    <Input
                      type="number"
                      value={autoBetState.onWinValue}
                      onChange={(e) => onAutoBetConfigChange({ onWinValue: parseFloat(e.target.value) || 0 })}
                      className="h-7 sm:h-8 mt-1 text-[10px] sm:text-xs"
                      min={0}
                      step="0.01"
                      disabled={autoBetState.isActive}
                      placeholder="Amount"
                      aria-label={`${t("dice.onWin")} value`}
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 block">
                    {t("dice.onLoss")}
                  </label>
                  <Select
                    value={autoBetState.onLossAction}
                    onValueChange={(v) => onAutoBetConfigChange({ onLossAction: v as typeof autoBetState.onLossAction })}
                    disabled={autoBetState.isActive}
                  >
                    <SelectTrigger className="h-7 sm:h-8 text-[10px] sm:text-xs" aria-label={t("dice.onLoss")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reset" className="text-xs">{t("dice.resetToBase")}</SelectItem>
                      <SelectItem value="increase" className="text-xs">{t("dice.increaseBy")}</SelectItem>
                      <SelectItem value="decrease" className="text-xs">{t("dice.decreaseBy")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {autoBetState.onLossAction !== "reset" && (
                    <Input
                      type="number"
                      value={autoBetState.onLossValue}
                      onChange={(e) => onAutoBetConfigChange({ onLossValue: parseFloat(e.target.value) || 0 })}
                      className="h-7 sm:h-8 mt-1 text-[10px] sm:text-xs"
                      min={0}
                      step="0.01"
                      disabled={autoBetState.isActive}
                      placeholder="Amount"
                      aria-label={`${t("dice.onLoss")} value`}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 block" htmlFor="stop-profit">
                    {t("dice.stopOnProfit")}
                  </label>
                  <Input
                    id="stop-profit"
                    type="number"
                    value={autoBetState.stopOnProfit}
                    onChange={(e) => onAutoBetConfigChange({ stopOnProfit: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step="0.01"
                    disabled={autoBetState.isActive}
                    className="h-7 sm:h-8 text-[10px] sm:text-xs"
                    placeholder="0 = disabled"
                    aria-label={t("dice.stopOnProfit")}
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 block" htmlFor="stop-loss">
                    {t("dice.stopOnLoss")}
                  </label>
                  <Input
                    id="stop-loss"
                    type="number"
                    value={autoBetState.stopOnLoss}
                    onChange={(e) => onAutoBetConfigChange({ stopOnLoss: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step="0.01"
                    disabled={autoBetState.isActive}
                    className="h-7 sm:h-8 text-[10px] sm:text-xs"
                    placeholder="0 = disabled"
                    aria-label={t("dice.stopOnLoss")}
                  />
                </div>
              </div>
            </div>
          )}

          {autoBetState.isActive && (
            <div className="p-2 sm:p-2.5 bg-primary/10 rounded-md border border-primary/30" role="status" aria-live="polite">
              <div className="flex items-center justify-between text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                <span className="text-muted-foreground">{t("dice.numberOfBets")}</span>
                <span className="font-semibold">{autoBetState.currentBetCount}/{autoBetState.numberOfBets}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-muted-foreground">{t("dice.profit")}</span>
                <span className={cn("font-bold", autoBetState.totalProfit >= 0 ? "text-success" : "text-destructive")}>
                  {autoBetState.totalProfit >= 0 ? "+" : ""}${autoBetState.totalProfit.toFixed(2)}
                </span>
              </div>
            </div>
          )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={onStartAutoBet}
                  disabled={autoBetState.isActive || betAmount > balance || betAmount <= 0}
                  className="h-9 sm:h-10 text-sm sm:text-base bg-gradient-to-br from-rose-600 via-pink-600 to-purple-700 hover:from-rose-500 hover:via-pink-500 hover:to-purple-600"
                  style={{ boxShadow: '0 4px 16px rgba(236,72,153,0.4)' }}
                  aria-label={t("dice.start")}
                >
                  {t("dice.start")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={onStopAutoBet}
                  disabled={!autoBetState.isActive}
                  className="h-9 sm:h-10 text-sm sm:text-base"
                  aria-label={t("dice.stop")}
                >
                  {t("dice.stop")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/70 backdrop-blur-2xl border-gray-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <CardContent className="p-3">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats">{t("dice.stats")}</TabsTrigger>
              <TabsTrigger value="history">{t("dice.betHistory")}</TabsTrigger>
            </TabsList>
            <TabsContent value="stats" className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="bg-gradient-to-br from-gray-800/60 via-gray-900/50 to-gray-800/60 border border-gray-700/40 rounded-md p-2"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Trophy className="w-3 h-3" />
                    {t("dice.winRate")}
                  </div>
                  <p className="text-base font-bold">{stats.winRate}%</p>
                </div>
                <div
                  className="bg-gradient-to-br from-gray-800/60 via-gray-900/50 to-gray-800/60 border border-gray-700/40 rounded-md p-2"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    {t("dice.bestStreak")}
                  </div>
                  <p className="text-base font-bold">{stats.bestStreak}</p>
                </div>
                <div
                  className="bg-gradient-to-br from-gray-800/60 via-gray-900/50 to-gray-800/60 border border-gray-700/40 rounded-md p-2"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <Target className="w-3 h-3" />
                    {t("dice.highestMultiplier")}
                  </div>
                  <p className="text-base font-bold">{stats.highestMultiplier}x</p>
                </div>
                <div
                  className="bg-gradient-to-br from-gray-800/60 via-gray-900/50 to-gray-800/60 border border-gray-700/40 rounded-md p-2"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                    <CreditCard className="w-3 h-3" />
                    {t("dice.totalGames")}
                  </div>
                  <p className="text-base font-bold">{stats.totalGames}</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="history">
              <div className="max-h-64 overflow-y-auto space-y-1">
                {history.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">{t("dice.noHistory")}</p>
                ) : (
                  history.slice(0, 10).map((bet, index) => (
                    <div
                      key={`${bet.timestamp}-${index}`}
                      className="flex items-center justify-between p-2 rounded-md bg-gradient-to-br from-gray-800/40 via-gray-900/30 to-gray-800/40 border border-gray-700/30 text-xs"
                      style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)' }}
                    >
                      <span className="font-medium">${bet.betAmount.toFixed(2)}</span>
                      <span className="text-gray-400">
                        {bet.isRollOver ? ">" : "<"} {bet.target.toFixed(2)}
                      </span>
                      <span className={cn("font-bold", bet.isWin ? "text-emerald-400" : "text-rose-400")}>
                        {bet.profit >= 0 ? "+" : ""}${bet.profit.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};