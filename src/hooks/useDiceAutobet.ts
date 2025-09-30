import { useCallback, useEffect, useRef, useState } from "react";
import type { DiceBetResult, DiceConfig } from "@/services/api/dice";
import type { GameState } from "./useDiceGame";

export type AutoBetState = {
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

const SPEED_DELAYS = {
  slow: 2000,
  normal: 1000,
  fast: 300,
  turbo: 50,
};

const INITIAL_AUTOBET_STATE: AutoBetState = {
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
};

type UseDiceAutobetParams = {
  gameState: GameState;
  config: DiceConfig | undefined;
  placeBet: () => void;
  setBetAmount: (amount: number) => void;
  resetDice: () => void;
};

export const useDiceAutobet = ({
  gameState,
  config,
  placeBet,
  setBetAmount,
  resetDice,
}: UseDiceAutobetParams) => {
  const [autoBetState, setAutoBetState] = useState<AutoBetState>(INITIAL_AUTOBET_STATE);
  const autoBetTimeoutRef = useRef<NodeJS.Timeout>();
  const placeBetRef = useRef(placeBet);
  const setBetAmountRef = useRef(setBetAmount);
  const resetDiceRef = useRef(resetDice);

  useEffect(() => {
    placeBetRef.current = placeBet;
    setBetAmountRef.current = setBetAmount;
    resetDiceRef.current = resetDice;
  }, [placeBet, setBetAmount, resetDice]);

  const stopAutoBet = useCallback(() => {
    if (autoBetTimeoutRef.current) {
      clearTimeout(autoBetTimeoutRef.current);
    }
    setAutoBetState(prev => ({
      ...prev,
      isActive: false,
    }));
    setTimeout(() => {
      resetDiceRef.current();
    }, 1000);
  }, []);

  const handleAutoBetResult = useCallback((result: DiceBetResult) => {
    setAutoBetState(prev => {
      const newTotalProfit = prev.totalProfit + result.profit;
      const newBetCount = prev.currentBetCount + 1;

      let shouldStop = false;
      let newBetAmount = gameState.betAmount;

      if (prev.stopOnProfit > 0 && newTotalProfit >= prev.stopOnProfit) {
        shouldStop = true;
      }

      if (prev.stopOnLoss > 0 && Math.abs(newTotalProfit) >= prev.stopOnLoss && newTotalProfit < 0) {
        shouldStop = true;
      }

      if (newBetCount >= prev.numberOfBets) {
        shouldStop = true;
      }

      if (gameState.balance <= 0 || gameState.balance < gameState.betAmount) {
        shouldStop = true;
      }

      if (!shouldStop) {
        if (result.isWin) {
          switch (prev.onWinAction) {
            case "reset":
              newBetAmount = prev.baseBetAmount;
              break;
            case "increase":
              newBetAmount = Math.min(gameState.betAmount + prev.onWinValue, config?.maxBet || 10000);
              break;
            case "decrease":
              newBetAmount = Math.max(gameState.betAmount - prev.onWinValue, config?.minBet || 0.01);
              break;
          }
        } else {
          switch (prev.onLossAction) {
            case "reset":
              newBetAmount = prev.baseBetAmount;
              break;
            case "increase":
              newBetAmount = Math.min(gameState.betAmount + prev.onLossValue, config?.maxBet || 10000);
              break;
            case "decrease":
              newBetAmount = Math.max(gameState.betAmount - prev.onLossValue, config?.minBet || 0.01);
              break;
          }
        }

        setBetAmountRef.current(newBetAmount);

        autoBetTimeoutRef.current = setTimeout(() => {
          placeBetRef.current();
        }, SPEED_DELAYS[prev.speed]);
      } else {
        setTimeout(() => {
          stopAutoBet();
        }, 100);
      }

      return {
        ...prev,
        currentBetCount: newBetCount,
        totalProfit: newTotalProfit,
      };
    });
  }, [gameState.betAmount, gameState.balance, config, stopAutoBet]);

  const startAutoBet = useCallback(() => {
    setAutoBetState(prev => ({
      ...prev,
      isActive: true,
      currentBetCount: 0,
      totalProfit: 0,
      baseBetAmount: gameState.betAmount,
    }));
    placeBetRef.current();
  }, [gameState.betAmount]);

  const updateAutoBetConfig = useCallback((updates: Partial<AutoBetState>) => {
    setAutoBetState(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    return () => {
      if (autoBetTimeoutRef.current) {
        clearTimeout(autoBetTimeoutRef.current);
      }
    };
  }, []);

  return {
    autoBetState,
    startAutoBet,
    stopAutoBet,
    handleAutoBetResult,
    updateAutoBetConfig,
  };
};