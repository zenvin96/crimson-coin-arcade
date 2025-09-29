import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import DiceSvg from "@/assets/dice.svg";
import {
  fetchDiceConfig,
  placeDiceBet,
  addToMockHistory,
  type DiceConfig,
  type DiceBetResult,
} from "@/services/api/dice";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

      // Update state with new result - dice appears directly at result position
      setState(prev => ({
        ...prev,
        dicePosition: result.result,
        currentResult: result.result,
        isAnimating: false, // No entrance animation
        isFirstRoll: false,
        balance: prev.balance + result.profit,
        history: [result, ...prev.history.slice(0, 49)],
      }));

      // For auto betting, proceed after a short delay
      if (autoBetState.isActive) {
        setTimeout(() => {
          handleAutoBetResult(result);
        }, 500);
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

    betMutation.mutate({
      betAmount: state.betAmount,
      target: state.target,
      isRollOver: state.isRollOver,
    });
  }, [state.betAmount, state.target, state.isRollOver, state.balance, betMutation]);

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

        <Card className="lg:col-span-2 p-8 pt-16 relative bg-[#1e2c39]">
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-full max-w-lg space-y-4 relative">
              {/* Dice Container - positioned relative to slider */}
              {state.dicePosition !== null && (
                <div
                  className={cn(
                    "dice visible absolute", // Always visible, no entrance animation
                    state.history[0]?.isWin ? "win" : "loss"
                  )}
                  style={{
                    left: `${state.dicePosition}%`,
                    top: '-40px',
                    transform: 'translateX(-50%)',
                    transition: state.dicePosition !== null ? 'left 0.5s ease' : 'none',
                    zIndex: 20
                  }}
                >
                  <img src={DiceSvg} alt="Dice" className="dice-svg" />
                  <span className="dice-value">{state.currentResult?.toFixed(2)}</span>
                </div>
              )}

              {/* Slider Container */}
              <div className="slider-container">
                {/* Scale Values */}
                <div className="scale-values">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>

                {/* Slider Track */}
                <div className="slider-track">
                  <div
                    className="slider-fill-red"
                    style={{
                      width: state.isRollOver ? `${state.target}%` : `${100 - state.target}%`,
                      left: state.isRollOver ? '0%' : 'auto',
                      right: state.isRollOver ? 'auto' : '0%'
                    }}
                  />
                  <div
                    className="slider-thumb"
                    style={{ left: `${state.target}%` }}
                    onMouseDown={(e) => {
                      const track = e.currentTarget.parentElement;
                      if (!track) return;

                      const handleMouseMove = (event: MouseEvent) => {
                        const rect = track.getBoundingClientRect();
                        const x = event.clientX - rect.left;
                        const percent = Math.max(0.01, Math.min(99.99, (x / rect.width) * 100));
                        handleTargetChange([percent]);
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };

                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                  <div
                    className="slider-fill-green"
                    style={{
                      width: state.isRollOver ? `${100 - state.target}%` : `${state.target}%`,
                      right: state.isRollOver ? '0%' : 'auto',
                      left: state.isRollOver ? 'auto' : '0%'
                    }}
                  />
                  <div className="vertical-line" style={{ left: `${state.target}%` }} />
                </div>
              </div>

              {/* Result Display */}
              <div className="result-display">
                {state.currentResult !== null && (
                  <span className={cn(
                    "font-bold",
                    state.history[0]?.isWin ? "text-[#2ecc71]" : "text-[#e74c3c]"
                  )}>
                    {state.history[0]?.isWin ? "You Won!" : "You Lost!"}
                    <span className="ml-2">{state.currentResult.toFixed(2)}</span>
                  </span>
                )}
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

      <Card className="mt-6 p-6">
        <h2 className="text-2xl font-bold mb-4">{t("dice.betHistory")}</h2>
        {state.history.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t("dice.noHistory")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dice.time")}</TableHead>
                  <TableHead>{t("dice.betAmount")}</TableHead>
                  <TableHead>{t("dice.target")}</TableHead>
                  <TableHead>{t("dice.result")}</TableHead>
                  <TableHead>{t("dice.profit")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.history.map((bet, index) => {
                  const timeAgo = bet.timestamp ? getTimeAgo(bet.timestamp) : `${index + 1}m ago`;
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-muted-foreground">
                        {timeAgo}
                      </TableCell>
                      <TableCell>${bet.betAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        {bet.isRollOver ? ">" : "<"} {bet.target.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-medium",
                            bet.isWin ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {bet.result.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-medium",
                            bet.profit >= 0 ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {bet.profit >= 0 ? "+" : ""}
                          ${bet.profit.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

const getTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return `${seconds}s ago`;
  }
};

export default DicePage;