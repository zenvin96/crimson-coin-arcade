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
    <div className="w-full min-h-screen">
      <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
        <div className="flex flex-col gap-1 mb-2 sm:gap-2 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold">{t("dice.title")}</h1>
          <p className="text-xs sm:text-base text-muted-foreground">{t("dice.description")}</p>
        </div>

        <div className="space-y-2 sm:space-y-6">
          <DiceHistoryBar history={state.history} maxItems={window.innerWidth < 640 ? 5 : 10} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-6 min-w-0">
          <div className="order-2 lg:order-1">
            <DiceControls
              betAmount={state.betAmount}
              balance={state.balance}
              profitOnWin={profitOnWin}
              config={config}
              isPlacingBet={isPlacingBet}
              autoBetState={autoBetState}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onBetAmountChange={setBetAmount}
              onQuickAmount={handleQuickAmount}
              onPlaceBet={placeBet}
              onStartAutoBet={startAutoBet}
              onStopAutoBet={stopAutoBet}
              onAutoBetConfigChange={updateAutoBetConfig}
            />
          </div>

          <div className="order-1 lg:order-2 lg:col-span-2">
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
      </div>
    </div>
  );
};

export default DicePage;