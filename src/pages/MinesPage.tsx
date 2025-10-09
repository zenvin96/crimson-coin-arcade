import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchMinesConfig,
  startMinesSession,
  cashoutMines,
  type MinesConfig,
} from "@/services/api/mines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import GameResultDialog from "@/components/ui/GameResultDialog";

const styles = `
@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.8; transform: scale(1.1) rotate(180deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

@keyframes tileReveal {
  0% { transform: scale(0.8) rotateY(0deg); opacity: 0; }
  50% { transform: scale(1.05) rotateY(90deg); }
  100% { transform: scale(1) rotateY(180deg); opacity: 1; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
}

@keyframes pulse-soft {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes breathe {
  0%, 100% { box-shadow: 0 0 40px 0 rgba(236, 72, 153, 0.25); }
  50% { box-shadow: 0 0 60px 0 rgba(236, 72, 153, 0.4); }
}

@keyframes counter-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes tile-entrance {
  from { opacity: 0; transform: scale(0.8) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.sparkle-effect {
  animation: sparkle 0.6s ease-in-out;
}

.shake-effect {
  animation: shake 0.5s ease-in-out;
}

.tile-reveal-animation {
  animation: tileReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pulse-glow-animation {
  animation: pulse-glow 2s ease-in-out infinite;
}

.pulse-soft-animation {
  animation: pulse-soft 2s ease-in-out infinite;
}

.breathe-animation {
  animation: breathe 3s ease-in-out infinite;
}

.counter-up-animation {
  animation: counter-up 0.3s ease-out;
}

.tile-entrance-stagger {
  animation: tile-entrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
`;

type GameState = {
  sessionId: string | null;
  minePositions: Set<number>;
  revealedTiles: Set<number>;
  betAmount: number;
  minesCount: number;
  multiplier: number;
  isActive: boolean;
};

type TileAnimationState = {
  [key: number]: {
    revealing?: boolean;
    sparkle?: boolean;
    shake?: boolean;
  };
};

const initialState: GameState = {
  sessionId: null,
  minePositions: new Set(),
  revealedTiles: new Set(),
  betAmount: 100,
  minesCount: 3,
  multiplier: 1,
  isActive: false,
};

const MinesPage = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<GameState>(initialState);
  const [tileAnimations, setTileAnimations] = useState<TileAnimationState>({});
  const [boardMounted, setBoardMounted] = useState(false);
  const [prevMultiplier, setPrevMultiplier] = useState(1);
  const [resultDialog, setResultDialog] = useState<
    | { open: true; type: "win" | "lose"; amount?: number; multiplier?: number }
    | { open: false }
  >({ open: false });

  const { data: config } = useQuery<MinesConfig>({
    queryKey: ["mines-config"],
    queryFn: fetchMinesConfig,
  });

  // Derived values
  const gridSize = config?.gridSize ?? 25;
  const tiles = useMemo(() => Array.from({ length: gridSize }, (_, i) => i), [gridSize]);

  const startMutation = useMutation({
    mutationFn: startMinesSession,
    onSuccess: (res) => {
      setState((prev) => ({
        ...prev,
        sessionId: res.sessionId,
        minePositions: new Set(res.minePositions),
        revealedTiles: new Set(),
        multiplier: 1,
        isActive: true,
      }));
    },
  });

  const cashoutMutation = useMutation({
    mutationFn: cashoutMines,
    onSuccess: (res) => {
      setState((prev) => ({
        ...prev,
        multiplier: res.multiplier,
        isActive: false,
      }));
    },
  });

  const canStart = useMemo(() => {
    if (!config) return false;
    return (
      state.betAmount > 0 &&
      state.betAmount <= (config.maxBet ?? 1000) &&
      state.minesCount >= (config.minMines ?? 1) &&
      state.minesCount <= (config.maxMines ?? 24)
    );
  }, [config, state.betAmount, state.minesCount]);

  // UI helpers
  const profit = useMemo(() => {
    return Math.max(0, state.betAmount * (state.multiplier - 1));
  }, [state.betAmount, state.multiplier]);

  const cashoutValue = useMemo(() => {
    return Math.max(0, state.betAmount * state.multiplier);
  }, [state.betAmount, state.multiplier]);

  const safeChancePct = useMemo(() => {
    const safeSquares = gridSize - state.minesCount;
    const revealedSafe = state.isActive ? state.revealedTiles.size : 0;
    const remainingSquares = Math.max(1, gridSize - revealedSafe);
    const remainingSafe = Math.max(0, safeSquares - revealedSafe);
    return Math.max(0, Math.min(100, (remainingSafe / remainingSquares) * 100));
  }, [gridSize, state.minesCount, state.revealedTiles, state.isActive]);

  useEffect(() => {
    if (config) {
      setState((s) => ({
        ...s,
        betAmount: config.defaultBet,
      }));
    }
  }, [config]);

  useEffect(() => {
    setBoardMounted(true);
  }, []);

  useEffect(() => {
    if (state.multiplier !== prevMultiplier) {
      setPrevMultiplier(state.multiplier);
    }
  }, [state.multiplier, prevMultiplier]);

  const onStart = () => {
    if (!canStart || !config) return;
    startMutation.mutate({
      betAmount: state.betAmount,
      minesCount: state.minesCount,
    });
  };

  const onReveal = (index: number) => {
    if (!state.isActive || state.revealedTiles.has(index)) return;

    const hitMine = state.minePositions.has(index);

    setTileAnimations((prev) => ({
      ...prev,
      [index]: { revealing: true, shake: hitMine, sparkle: !hitMine },
    }));

    setTimeout(() => {
      setTileAnimations((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }, 600);

    if (hitMine) {
      setTimeout(() => {
        setState((prev) => {
          const allTiles = new Set<number>();
          for (let i = 0; i < gridSize; i++) {
            allTiles.add(i);
          }
          return {
            ...prev,
            revealedTiles: allTiles,
            multiplier: 0,
            isActive: false,
          };
        });
      }, 300);

      setTimeout(() => {
        setResultDialog({ open: true, type: "lose" });
      }, 800);
      return;
    }

    setState((prev) => {
      const newRevealed = new Set(prev.revealedTiles);
      newRevealed.add(index);

      const safeSquares = gridSize - prev.minesCount;
      let newMultiplier = 1;
      for (let i = 0; i < newRevealed.size; i++) {
        const remainingSafe = safeSquares - i;
        const remainingTotal = gridSize - i;
        if (remainingSafe <= 0) break;
        const probability = remainingSafe / remainingTotal;
        newMultiplier *= 1 / probability;
      }

      const houseEdge = 0.97;
      newMultiplier *= houseEdge;

      return {
        ...prev,
        revealedTiles: newRevealed,
        multiplier: newMultiplier,
      };
    });
  };

  const onCashout = () => {
    if (!state.isActive || state.revealedTiles.size === 0) return;
    if (!state.sessionId) return;
    cashoutMutation.mutate({
      sessionId: state.sessionId,
      revealedSafeTiles: state.revealedTiles.size,
      betAmount: state.betAmount,
      minesCount: state.minesCount,
    }, {
      onSuccess: (res) => {
        setResultDialog({ open: true, type: "win", amount: res.profit, multiplier: res.multiplier });
      },
    });
  };

  const onAdjustBet = (factor: number) => {
    setState((prev) => {
      const maxBet = config?.maxBet ?? 1000;
      const next = Math.min(maxBet, Math.max(1, prev.betAmount * factor));
      return { ...prev, betAmount: parseFloat(next.toFixed(2)) };
    });
  };

  const onSetBet = (amount: number) => {
    setState((prev) => {
      const maxBet = config?.maxBet ?? 1000;
      const next = Math.min(maxBet, Math.max(1, amount));
      return { ...prev, betAmount: parseFloat(next.toFixed(2)) };
    });
  };

  const onChangeMines = (value: number) => {
    setState((prev) => ({ ...prev, minesCount: value }));
  };

  const isCashoutEnabled = state.isActive && state.revealedTiles.size > 0;

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: styles }} />
    <div className="min-h-screen animate-in fade-in duration-500 pb-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">MINES</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{t("originalGamesPage.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-stretch">
        {/* Left Controls */}
        <div className="bg-card/40 rounded-lg p-3 sm:p-4 border border-border/40 flex flex-col">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("mines.panel.betLabel")}</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <img src="/tether-usdt-logo.svg" alt="USDT" className="h-4 w-4" />
                <span className="hidden sm:inline">USDT</span>
              </span>
              <Input
                type="number"
                className="pl-12 text-right font-semibold h-10"
                value={state.betAmount}
                min={1}
                max={config?.maxBet ?? 1000}
                onChange={(e) => onSetBet(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onSetBet(10)}>10</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onSetBet(50)}>50</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onSetBet(100)}>100</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onSetBet(500)}>500</Button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onAdjustBet(0.5)}>½</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => onAdjustBet(2)}>2×</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => onSetBet(config?.maxBet ?? 1000)}>MAX</Button>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{t("mines.panel.riskLabel")}: {state.minesCount}</div>
              <div className="text-[11px] text-muted-foreground">
                {t("mines.panel.safeChance")}: {safeChancePct.toFixed(0)}%
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[state.minesCount]}
                min={config?.minMines ?? 1}
                max={config?.maxMines ?? 24}
                step={1}
                onValueChange={(v) => onChangeMines(v[0] ?? state.minesCount)}
              />
              <Input
                type="number"
                value={state.minesCount}
                min={config?.minMines ?? 1}
                max={config?.maxMines ?? 24}
                className="w-16 text-center font-semibold text-sm"
                onChange={(e) => onChangeMines(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Live Stats: Multiplier & Cashout */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className={`bg-card/60 border border-border/40 rounded-lg p-2 text-center transition-all duration-300 ${state.multiplier > 1 && state.isActive ? "pulse-glow-animation" : ""}`}>
              <div className={`text-xl sm:text-lg font-bold transition-all duration-300 ${state.multiplier > prevMultiplier ? "counter-up-animation" : ""}`} style={{
                color: state.multiplier > 2 ? "rgb(16, 185, 129)" : state.multiplier > 1.5 ? "rgb(34, 197, 94)" : undefined
              }}>{state.multiplier.toFixed(2)}x</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("mines.stats.currentMultiplier")}</div>
            </div>
            <div className="bg-card/60 border border-border/40 rounded-lg p-2 text-center transition-all duration-300">
              <div className="text-xl sm:text-lg font-bold transition-colors duration-300">${cashoutValue.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("mines.stats.cashout")}</div>
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <Button
              className={`flex-1 h-12 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl transition-all duration-200 font-bold text-base ${canStart && !state.isActive ? "pulse-soft-animation" : ""}`}
              onClick={onStart}
              disabled={!canStart || state.isActive}
            >
              {startMutation.isPending ? t("mines.panel.starting") : t("mines.panel.start")}
            </Button>
            <Button
              className={`flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-green-500/50 transition-all duration-200 font-bold text-base ${isCashoutEnabled ? "pulse-soft-animation" : ""}`}
              onClick={onCashout}
              disabled={!isCashoutEnabled}
            >
              {cashoutMutation.isPending
                ? t("mines.panel.cashingOut")
                : t("mines.panel.cashoutWithValue", { value: cashoutValue.toFixed(2) })}
            </Button>
          </div>
        </div>

        {/* Right Board + Info */}
        <div className="flex flex-col min-w-0 w-full">
          <div className="flex justify-center items-center w-full">
            <div
              className={`grid grid-cols-5 gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl border border-border/40 w-full max-w-[min(100vw-2rem,600px)] sm:max-w-[600px] lg:max-w-[760px] aspect-square bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-500/15 via-card/40 to-transparent shadow-[0_0_40px_0_rgba(236,72,153,0.25)] transition-all duration-500 ${state.isActive ? "breathe-animation" : ""} ${boardMounted ? "animate-in fade-in zoom-in-95 duration-700" : ""}`}
            >
              {tiles.map((i) => {
                const revealed = state.revealedTiles.has(i);
                const isMine = state.minePositions.has(i);
                const isGem = revealed && !isMine;
                const animation = tileAnimations[i];
                const animationClasses = [
                  animation?.revealing ? "tile-reveal-animation" : "",
                  animation?.shake ? "shake-effect" : "",
                  animation?.sparkle ? "sparkle-effect" : "",
                ].filter(Boolean).join(" ");

                const classes = [
                  "relative flex items-center justify-center text-white text-4xl sm:text-3xl lg:text-5xl",
                  "aspect-square w-full p-0 leading-none overflow-hidden",
                  "transform-gpu transition-[transform,box-shadow,background] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_16px_0_rgba(236,72,153,0.5)] hover:scale-105",
                  "active:scale-95",
                  animationClasses,
                  revealed
                    ? isMine
                      ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-[0_0_22px_0_rgba(244,63,94,0.55)]"
                      : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_0_18px_0_rgba(16,185,129,0.45)]"
                    : "bg-muted/30 hover:bg-muted/40",
                  state.isActive && !revealed ? "tile-entrance-stagger" : "",
                ].join(" ");

                const tileStyle: React.CSSProperties = {
                  transition: "box-shadow 300ms, transform 200ms",
                  borderRadius: "0.75rem",
                  animationDelay: state.isActive && !revealed ? `${i * 20}ms` : "0ms",
                };

                const emojiStyle: React.CSSProperties = {
                  fontSize: "inherit",
                  lineHeight: 1,
                };

                return (
                  <button
                    key={i}
                    disabled={!state.isActive || revealed}
                    onClick={() => onReveal(i)}
                    className={classes}
                    style={tileStyle}
                    aria-label={revealed ? (isMine ? "Mine" : "Gem") : "Hidden tile"}
                  >
                    <span
                      className={[
                        "select-none pointer-events-none transition-all duration-400",
                        revealed ? "opacity-100 scale-100" : "opacity-0 scale-75",
                      ].join(" ")}
                      style={emojiStyle}
                    >
                      {isMine ? "💣" : "💎"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    <GameResultDialog
      open={resultDialog.open}
      onOpenChange={(open) => setResultDialog(open ? resultDialog : { open: false })}
      type={resultDialog.open ? resultDialog.type : "win"}
      title={
        resultDialog.open && resultDialog.type === "win"
          ? t("mines.dialog.winTitle")
          : t("mines.dialog.loseTitle")
      }
      description={
        resultDialog.open && resultDialog.type === "win"
          ? t("mines.dialog.winDesc")
          : t("mines.dialog.loseDesc")
      }
      amountText={
        resultDialog.open && resultDialog.amount !== undefined
          ? `$${resultDialog.amount.toFixed(2)}`
          : undefined
      }
      multiplierText={
        resultDialog.open && resultDialog.multiplier !== undefined
          ? `${resultDialog.multiplier.toFixed(2)}x`
          : undefined
      }
      autoCloseMs={1800}
    />
  </>
  );
};

export default MinesPage;


