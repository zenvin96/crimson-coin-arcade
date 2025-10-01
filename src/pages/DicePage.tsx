import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDiceGame } from "@/hooks/useDiceGame";
import { useDiceAutobet } from "@/hooks/useDiceAutobet";
import { DiceHistoryBar } from "@/components/games/dice/DiceHistoryBar";
import { DiceControls } from "@/components/games/dice/DiceControls";
import { DiceGameArea } from "@/components/games/dice/DiceGameArea";
import { DiceBetHistory } from "@/components/games/dice/DiceBetHistory";
import type { DiceBetResult } from "@/services/api/dice";

const DicePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"manual" | "auto">("manual");
  const autoBetResultHandlerRef = useRef<((result: DiceBetResult) => void) | null>(null);
  const isAutoBetActiveRef = useRef(false);

  const {
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
    isPlacingBet,
  } = useDiceGame({
    onBetSuccess: (result) => {
      if (isAutoBetActiveRef.current && autoBetResultHandlerRef.current) {
        autoBetResultHandlerRef.current(result);
      }
    },
  });

  const {
    autoBetState,
    startAutoBet,
    stopAutoBet,
    handleAutoBetResult,
    updateAutoBetConfig,
  } = useDiceAutobet({
    gameState: state,
    config,
    placeBet,
    setBetAmount,
    resetDice,
  });

  useEffect(() => {
    autoBetResultHandlerRef.current = handleAutoBetResult;
    isAutoBetActiveRef.current = autoBetState.isActive;
  }, [handleAutoBetResult, autoBetState.isActive]);

  return (
    <div className="container mx-auto p-2 sm:p-3 lg:p-4 space-y-3 sm:space-y-4">
      <div className="text-center space-y-1 px-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
          {t("dice.title")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto px-2">
          {t("dice.description")}
        </p>
      </div>

      <DiceHistoryBar history={state.history} maxItems={window.innerWidth < 640 ? 5 : 10} />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-3 sm:gap-4">
        <div className="space-y-2 sm:space-y-3 order-2 lg:order-1">
          <DiceControls
            betAmount={state.betAmount}
            balance={state.balance}
            profitOnWin={profitOnWin}
            config={config}
            isPlacingBet={isPlacingBet}
            autoBetState={autoBetState}
            activeTab={activeTab}
            history={state.history}
            onTabChange={setActiveTab}
            onBetAmountChange={setBetAmount}
            onQuickAmount={handleQuickAmount}
            onPlaceBet={placeBet}
            onStartAutoBet={startAutoBet}
            onStopAutoBet={stopAutoBet}
            onAutoBetConfigChange={updateAutoBetConfig}
          />
        </div>

        <div className="order-1 lg:order-2">
          <DiceGameArea
              target={state.target}
              isRollOver={state.isRollOver}
              multiplier={multiplier}
              winChance={winChance}
              currentResult={state.currentResult}
              dicePosition={state.dicePosition}
              isAnimating={state.isAnimating}
              isWin={state.history[0]?.isWin}
              onTargetChange={setTarget}
              onToggleRollType={toggleRollType}
            />
        </div>
      </div>

      <DiceBetHistory history={state.history} />
    </div>
  );
};

export default DicePage;