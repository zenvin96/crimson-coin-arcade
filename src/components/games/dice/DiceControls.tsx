import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DiceConfig } from "@/services/api/dice";
import type { AutoBetState } from "@/hooks/useDiceAutobet";

type DiceControlsProps = {
  betAmount: number;
  balance: number;
  profitOnWin: number;
  config: DiceConfig | undefined;
  isPlacingBet: boolean;
  autoBetState: AutoBetState;
  activeTab: "manual" | "auto";
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

  return (
    <Card className="p-3 sm:p-4 min-w-0">
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "manual" | "auto")}>
        <TabsList className="grid w-full grid-cols-2 mb-3 h-9">
          <TabsTrigger value="manual" className="text-xs sm:text-sm">{t("dice.manual")}</TabsTrigger>
          <TabsTrigger value="auto" className="text-xs sm:text-sm">{t("dice.auto")}</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-3 mt-0">
          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground">{t("dice.balance")}</span>
            <span className="text-sm font-bold text-primary">${balance.toFixed(2)}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium" htmlFor="bet-amount-manual">
                {t("dice.betAmount")}
              </label>
              <span className="text-xs text-muted-foreground">
                {t("dice.profitOnWin")}: <span className="text-success font-medium">${profitOnWin.toFixed(2)}</span>
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
                className="w-full h-9 pr-32"
                aria-label={t("dice.betAmount")}
              />
              <div className="absolute right-1 top-1 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuickAmount(0.5)}
                  className="h-7 px-2 text-xs"
                  aria-label={t("dice.presets.half")}
                >
                  ½
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuickAmount(2)}
                  className="h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                  aria-label={t("dice.presets.double")}
                >
                  2×
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onQuickAmount(balance / betAmount)}
                  className="h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                  aria-label={t("dice.presets.max")}
                >
                  MAX
                </Button>
              </div>
            </div>
          </div>

          <Button
            className="w-full h-9 sm:h-11 text-sm sm:text-base font-bold"
            size="lg"
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
              className="h-9 sm:h-10 text-sm sm:text-base"
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
    </Card>
  );
};