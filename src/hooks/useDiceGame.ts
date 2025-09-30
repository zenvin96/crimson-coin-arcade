import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchDiceConfig,
  placeDiceBet,
  addToMockHistory,
  type DiceConfig,
  type DiceBetResult,
} from "@/services/api/dice";

export type GameState = {
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

const INITIAL_STATE: GameState = {
  betAmount: 100,
  target: 50.5,
  isRollOver: true,
  balance: 10000,
  history: [],
  currentResult: null,
  isAnimating: false,
  dicePosition: null,
  isFirstRoll: true,
};

type UseDiceGameOptions = {
  onBetSuccess?: (result: DiceBetResult) => void;
};

export const useDiceGame = (options?: UseDiceGameOptions) => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);

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

      setState(prev => ({
        ...prev,
        dicePosition: result.result,
        currentResult: result.result,
        isAnimating: true,
        isFirstRoll: false,
        balance: prev.balance + result.profit,
        history: [result, ...prev.history.slice(0, 49)],
      }));

      setTimeout(() => {
        setState(prev => ({ ...prev, isAnimating: false }));
      }, 1000);

      if (options?.onBetSuccess) {
        setTimeout(() => {
          options.onBetSuccess?.(result);
        }, 500);
      }
    },
  });

  const placeBet = useCallback(() => {
    if (state.betAmount > state.balance || state.betAmount <= 0) return;
    if (betMutation.isPending) return;

    betMutation.mutate({
      betAmount: state.betAmount,
      target: state.target,
      isRollOver: state.isRollOver,
    });
  }, [state.betAmount, state.target, state.isRollOver, state.balance]);

  const setBetAmount = useCallback((amount: number) => {
    setState(prev => ({ ...prev, betAmount: amount }));
  }, []);

  const setTarget = useCallback((target: number) => {
    setState(prev => ({ ...prev, target }));
  }, []);

  const toggleRollType = useCallback(() => {
    setState(prev => ({ ...prev, isRollOver: !prev.isRollOver }));
  }, []);

  const handleQuickAmount = useCallback((multiplier: number) => {
    const newAmount = Math.min(
      Math.max(state.betAmount * multiplier, config?.minBet || 0.01),
      Math.min(config?.maxBet || 10000, state.balance)
    );
    setBetAmount(newAmount);
  }, [state.betAmount, state.balance, config, setBetAmount]);

  const resetDice = useCallback(() => {
    setState(prev => ({
      ...prev,
      isFirstRoll: true,
      dicePosition: null,
      currentResult: null,
    }));
  }, []);

  return {
    state,
    config,
    winChance,
    multiplier,
    profitOnWin,
    placeBet,
    setBetAmount,
    setTarget,
    toggleRollType,
    handleQuickAmount,
    resetDice,
    isPlacingBet: betMutation.isPending,
  };
};