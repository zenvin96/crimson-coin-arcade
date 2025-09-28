import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RefreshCw } from "lucide-react";
import {
  fetchDiceConfig,
  placeDiceBet,
  addToMockHistory,
  type DiceConfig,
  type DiceBetResult,
} from "@/services/api/dice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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

type GameState = {
  betAmount: number;
  target: number;
  isRollOver: boolean;
  balance: number;
  history: DiceBetResult[];
  currentResult: number | null;
  isAnimating: boolean;
  dicePosition: number | null;
  isFirstRoll: boolean;
};

type AutoBetState = {
  isActive: boolean;
  numberOfBets: number;
  currentBetCount: number;
  totalProfit: number;
  stopOnProfit: number;
  stopOnLoss: number;
  onWinAction: "reset" | "increase" | "decrease";
  onWinValue: number;
  onLossAction: "reset" | "increase" | "decrease";
  onLossValue: number;
  baseBetAmount: number;
  speed: "slow" | "normal" | "fast" | "turbo";
};

const speedDelays = {
  slow: 2000,
  normal: 1000,
  fast: 300,
  turbo: 50,
};

const DiceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

const DicePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const autoBetTimeoutRef = useRef<NodeJS.Timeout>();

  const [state, setState] = useState<GameState>({
    betAmount: 100,
    target: 50.5,
    isRollOver: true,
    balance: 10000,
    history: [],
    currentResult: null,
    isAnimating: false,
    dicePosition: null,
    isFirstRoll: true,
  });

  const [autoBetState, setAutoBetState] = useState<AutoBetState>({
    isActive: false,
    numberOfBets: 10,
    currentBetCount: 0,
    totalProfit: 0,
    stopOnProfit: 0,
    stopOnLoss: 0,
    onWinAction: "reset",
    onWinValue: 0,
    onLossAction: "reset",
    onLossValue: 0,
    baseBetAmount: 100,
    speed: "normal",
  });


  const { data: config } = useQuery<DiceConfig>({
    queryKey: ["dice-config"],
    queryFn: fetchDiceConfig,
  });

  const winChance = state.isRollOver ? (100 - state.target) : state.target;
  const multiplier = (100 / winChance) * ((100 - (config?.houseEdge || 2.5)) / 100);
  const profitOnWin = state.betAmount * (multiplier - 1);

  const betMutation = useMutation({
    mutationFn: placeDiceBet,
    onSuccess: (result) => {
      addToMockHistory(result);

      if (state.isFirstRoll || state.dicePosition === null) {
        // First roll - drop from above
        setState(prev => ({
          ...prev,
          dicePosition: result.result,
          currentResult: result.result,
          isAnimating: true,
          isFirstRoll: false,
          balance: prev.balance + result.profit,
          history: [result, ...prev.history.slice(0, 49)],
        }));

        // End animation after dice settles
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isAnimating: false,
          }));

          if (autoBetState.isActive) {
            handleAutoBetResult(result);
          }
        }, 1000);
      } else {
        // Consecutive rolls - slide to new position
        setState(prev => ({
          ...prev,
          dicePosition: result.result,
          currentResult: result.result,
          isAnimating: false, // Use CSS transition for sliding
          balance: prev.balance + result.profit,
          history: [result, ...prev.history.slice(0, 49)],
        }));

        if (autoBetState.isActive) {
          // For auto betting, trigger next bet after slide animation
          setTimeout(() => {
            handleAutoBetResult(result);
          }, 500);
        }
      }
    },
  });

  const handleAutoBetResult = (result: DiceBetResult) => {
    const newTotalProfit = autoBetState.totalProfit + result.profit;
    const newBetCount = autoBetState.currentBetCount + 1;

    let shouldStop = false;
    let newBetAmount = state.betAmount;

    if (autoBetState.stopOnProfit > 0 && newTotalProfit >= autoBetState.stopOnProfit) {
      shouldStop = true;
    }

    if (autoBetState.stopOnLoss > 0 && Math.abs(newTotalProfit) >= autoBetState.stopOnLoss && newTotalProfit < 0) {
      shouldStop = true;
    }

    if (newBetCount >= autoBetState.numberOfBets) {
      shouldStop = true;
    }

    if (state.balance <= 0 || state.balance < state.betAmount) {
      shouldStop = true;
    }

    if (result.isWin) {
      switch (autoBetState.onWinAction) {
        case "reset":
          newBetAmount = autoBetState.baseBetAmount;
          break;
        case "increase":
          newBetAmount = Math.min(state.betAmount + autoBetState.onWinValue, config?.maxBet || 10000);
          break;
        case "decrease":
          newBetAmount = Math.max(state.betAmount - autoBetState.onWinValue, config?.minBet || 0.01);
          break;
      }
    } else {
      switch (autoBetState.onLossAction) {
        case "reset":
          newBetAmount = autoBetState.baseBetAmount;
          break;
        case "increase":
          newBetAmount = Math.min(state.betAmount + autoBetState.onLossValue, config?.maxBet || 10000);
          break;
        case "decrease":
          newBetAmount = Math.max(state.betAmount - autoBetState.onLossValue, config?.minBet || 0.01);
          break;
      }
    }

    setState(prev => ({ ...prev, betAmount: newBetAmount }));
    setAutoBetState(prev => ({
      ...prev,
      currentBetCount: newBetCount,
      totalProfit: newTotalProfit,
    }));

    if (shouldStop) {
      stopAutoBet();
    } else {
      autoBetTimeoutRef.current = setTimeout(() => {
        placeBet();
      }, speedDelays[autoBetState.speed]);
    }
  };

  const placeBet = useCallback(() => {
    if (state.betAmount > state.balance) return;

    // Don't reset dice for consecutive rolls
    if (!state.dicePosition) {
      setState(prev => ({
        ...prev,
        isAnimating: true,
      }));
    }

    betMutation.mutate({
      betAmount: state.betAmount,
      target: state.target,
      isRollOver: state.isRollOver,
    });
  }, [state.betAmount, state.target, state.isRollOver, state.balance, state.dicePosition, betMutation]);

  const startAutoBet = () => {
    setAutoBetState(prev => ({
      ...prev,
      isActive: true,
      currentBetCount: 0,
      totalProfit: 0,
      baseBetAmount: state.betAmount,
    }));
    placeBet();
  };

  const stopAutoBet = () => {
    if (autoBetTimeoutRef.current) {
      clearTimeout(autoBetTimeoutRef.current);
    }
    setAutoBetState(prev => ({
      ...prev,
      isActive: false,
    }));
    // Reset dice for next session
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        isFirstRoll: true,
        dicePosition: null,
      }));
    }, 1000);
  };

  const toggleRollType = () => {
    setState(prev => ({ ...prev, isRollOver: !prev.isRollOver }));
  };

  const handleTargetChange = (value: number[]) => {
    setState(prev => ({ ...prev, target: value[0] }));
  };

  const handleBetAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setState(prev => ({ ...prev, betAmount: amount }));
  };

  const handleQuickAmount = (multiplier: number) => {
    const newAmount = Math.min(
      Math.max(state.betAmount * multiplier, config?.minBet || 0.01),
      Math.min(config?.maxBet || 10000, state.balance)
    );
    setState(prev => ({ ...prev, betAmount: newAmount }));
  };

  useEffect(() => {
    return () => {
      if (autoBetTimeoutRef.current) {
        clearTimeout(autoBetTimeoutRef.current);
      }
    };
  }, []);

  const RandomDiceIcon = DiceIcons[Math.floor(Math.random() * 6)];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold">{t("dice.title")}</h1>
        <p className="text-muted-foreground">{t("dice.description")}</p>
      </div>

      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="flex gap-2">
          {state.history.slice(0, 10).reverse().map((result, i) => (
            <div
              key={i}
              className={cn(
                "w-12 h-8 rounded flex items-center justify-center text-xs font-medium transition-all",
                result.isWin
                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                  : "bg-red-500/20 text-red-400 border border-red-500/40",
                i === 9 && "scale-110 shadow-lg"
              )}
            >
              {result.result.toFixed(2)}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "auto")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">{t("dice.manual")}</TabsTrigger>
              <TabsTrigger value="auto">{t("dice.auto")}</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("dice.balance")}: ${state.balance.toFixed(2)}
                </label>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("dice.betAmount")}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={state.betAmount}
                    onChange={(e) => handleBetAmountChange(e.target.value)}
                    min={config?.minBet || 0.01}
                    max={config?.maxBet || 10000}
                    step="0.01"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleQuickAmount(0.5)}>
                      {t("dice.presets.half")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleQuickAmount(2)}>
                      {t("dice.presets.double")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleQuickAmount(state.balance / state.betAmount)}>
                      {t("dice.presets.max")}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("dice.profitOnWin")}: ${profitOnWin.toFixed(2)}
                </label>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={placeBet}
                disabled={betMutation.isPending || state.betAmount > state.balance || state.betAmount <= 0}
              >
                {betMutation.isPending ? t("dice.betting") : t("dice.bet")}
              </Button>
            </TabsContent>

            <TabsContent value="auto" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("dice.betAmount")}
                </label>
                <Input
                  type="number"
                  value={state.betAmount}
                  onChange={(e) => handleBetAmountChange(e.target.value)}
                  min={config?.minBet || 0.01}
                  max={config?.maxBet || 10000}
                  step="0.01"
                  disabled={autoBetState.isActive}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("dice.numberOfBets")}
                </label>
                <Input
                  type="number"
                  value={autoBetState.numberOfBets}
                  onChange={(e) => setAutoBetState(prev => ({ ...prev, numberOfBets: parseInt(e.target.value) || 1 }))}
                  min={1}
                  max={1000}
                  disabled={autoBetState.isActive}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("dice.speed")}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(["slow", "normal", "fast", "turbo"] as const).map(speed => (
                    <Button
                      key={speed}
                      size="sm"
                      variant={autoBetState.speed === speed ? "default" : "outline"}
                      onClick={() => setAutoBetState(prev => ({ ...prev, speed }))}
                      disabled={autoBetState.isActive}
                    >
                      {t(`dice.${speed}`)}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("dice.onWin")}
                </label>
                <div className="flex gap-2">
                  <Select
                    value={autoBetState.onWinAction}
                    onValueChange={(v) => setAutoBetState(prev => ({ ...prev, onWinAction: v as typeof prev.onWinAction }))}
                    disabled={autoBetState.isActive}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reset">{t("dice.resetToBase")}</SelectItem>
                      <SelectItem value="increase">{t("dice.increaseBy")}</SelectItem>
                      <SelectItem value="decrease">{t("dice.decreaseBy")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {autoBetState.onWinAction !== "reset" && (
                    <Input
                      type="number"
                      value={autoBetState.onWinValue}
                      onChange={(e) => setAutoBetState(prev => ({ ...prev, onWinValue: parseFloat(e.target.value) || 0 }))}
                      className="w-24"
                      min={0}
                      step="0.01"
                      disabled={autoBetState.isActive}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("dice.onLoss")}
                </label>
                <div className="flex gap-2">
                  <Select
                    value={autoBetState.onLossAction}
                    onValueChange={(v) => setAutoBetState(prev => ({ ...prev, onLossAction: v as typeof prev.onLossAction }))}
                    disabled={autoBetState.isActive}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reset">{t("dice.resetToBase")}</SelectItem>
                      <SelectItem value="increase">{t("dice.increaseBy")}</SelectItem>
                      <SelectItem value="decrease">{t("dice.decreaseBy")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {autoBetState.onLossAction !== "reset" && (
                    <Input
                      type="number"
                      value={autoBetState.onLossValue}
                      onChange={(e) => setAutoBetState(prev => ({ ...prev, onLossValue: parseFloat(e.target.value) || 0 }))}
                      className="w-24"
                      min={0}
                      step="0.01"
                      disabled={autoBetState.isActive}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t("dice.stopOnProfit")}
                  </label>
                  <Input
                    type="number"
                    value={autoBetState.stopOnProfit}
                    onChange={(e) => setAutoBetState(prev => ({ ...prev, stopOnProfit: parseFloat(e.target.value) || 0 }))}
                    min={0}
                    step="0.01"
                    disabled={autoBetState.isActive}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t("dice.stopOnLoss")}
                  </label>
                  <Input
                    type="number"
                    value={autoBetState.stopOnLoss}
                    onChange={(e) => setAutoBetState(prev => ({ ...prev, stopOnLoss: parseFloat(e.target.value) || 0 }))}
                    min={0}
                    step="0.01"
                    disabled={autoBetState.isActive}
                  />
                </div>
              </div>

              {autoBetState.isActive && (
                <div className="text-sm space-y-1 p-3 bg-muted rounded-lg">
                  <div>Bets: {autoBetState.currentBetCount}/{autoBetState.numberOfBets}</div>
                  <div className={cn("font-medium", autoBetState.totalProfit >= 0 ? "text-green-400" : "text-red-400")}>
                    Profit: ${autoBetState.totalProfit.toFixed(2)}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={startAutoBet}
                  disabled={autoBetState.isActive || state.betAmount > state.balance || state.betAmount <= 0}
                >
                  {t("dice.start")}
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={stopAutoBet}
                  disabled={!autoBetState.isActive}
                >
                  {t("dice.stop")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="relative">
              <div className={cn(
                "w-32 h-32 flex items-center justify-center transition-all duration-500",
                state.isAnimating && !state.dicePosition && "animate-bounce"
              )}>
                {state.currentResult !== null ? (
                  <div className={cn(
                    "text-5xl font-bold transition-colors duration-500",
                    state.history[0]?.isWin ? "text-green-400" : "text-red-400"
                  )}>
                    {state.currentResult.toFixed(2)}
                  </div>
                ) : (
                  <RandomDiceIcon className="w-24 h-24 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="w-full max-w-md space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
                <div className="relative h-12">
                  {/* Slider track background */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-muted rounded-full">
                    {/* Red zone (loss area) */}
                    <div
                      className="absolute top-0 h-full bg-red-500/20 rounded-full"
                      style={{
                        left: state.isRollOver ? '0%' : `${state.target}%`,
                        width: state.isRollOver ? `${state.target}%` : `${100 - state.target}%`,
                      }}
                    />
                    {/* Green zone (win area) */}
                    <div
                      className="absolute top-0 h-full bg-green-500/20 rounded-full"
                      style={{
                        left: state.isRollOver ? `${state.target}%` : '0%',
                        width: state.isRollOver ? `${100 - state.target}%` : `${state.target}%`,
                      }}
                    />
                  </div>

                  {/* Target line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 transition-all duration-300"
                    style={{ left: `${state.target}%` }}
                  />

                  {/* Animated dice */}
                  {state.dicePosition !== null && (
                    <div
                      className={cn(
                        "absolute -translate-x-1/2 pointer-events-none z-20",
                        state.isAnimating && state.isFirstRoll ? "animate-dice-drop" : "",
                        !state.isAnimating && !state.isFirstRoll ? "transition-all duration-500 ease-out" : ""
                      )}
                      style={{
                        left: `${state.dicePosition}%`,
                        top: state.isAnimating && state.isFirstRoll ? '-60px' : '50%',
                        transform: state.isAnimating && state.isFirstRoll ? 'translateX(-50%)' : 'translate(-50%, -50%)',
                      }}
                    >
                      <div className={cn(
                        "relative w-14 h-14 flex items-center justify-center rounded-lg",
                        "bg-gradient-to-br transition-all duration-300",
                        state.history[0]?.isWin
                          ? "from-green-500 to-green-600 shadow-[0_4px_20px_rgba(34,197,94,0.6)]"
                          : "from-red-500 to-red-600 shadow-[0_4px_20px_rgba(239,68,68,0.6)]",
                        state.isAnimating && state.isFirstRoll && "animate-dice-roll",
                        !state.isFirstRoll && "hover:scale-110"
                      )}>
                        <span className="text-white font-bold text-lg">
                          {state.currentResult?.toFixed(2)}
                        </span>
                        {/* Add dice dots visual */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <div className="grid grid-cols-2 gap-1">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Slider */}
                  <Slider
                    value={[state.target]}
                    onValueChange={handleTargetChange}
                    min={0.01}
                    max={99.99}
                    step={0.01}
                    className="w-full absolute top-1/2 -translate-y-1/2"
                    disabled={betMutation.isPending || state.isAnimating}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">{t("dice.multiplier")}</div>
                  <div className="text-xl font-bold">{multiplier.toFixed(4)}x</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    {state.isRollOver ? t("dice.rollOver") : t("dice.rollUnder")}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      onClick={toggleRollType}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xl font-bold">{state.target.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t("dice.winChance")}</div>
                  <div className="text-xl font-bold">{winChance.toFixed(4)}%</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DicePage;