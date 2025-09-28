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

type GameState = {
  sessionId: string | null;
  minePositions: Set<number>;
  revealedTiles: Set<number>;
  betAmount: number;
  minesCount: number;
  multiplier: number;
  isActive: boolean;
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
    if (hitMine) {
      // End game: loss
      setState((prev) => ({
        ...prev,
        revealedTiles: new Set(prev.revealedTiles).add(index),
        multiplier: 0,
        isActive: false,
      }));
      setResultDialog({ open: true, type: "lose" });
      return;
    }

    // Safe tile: update multiplier similar to demo
    setState((prev) => {
      const newRevealed = new Set(prev.revealedTiles);
      newRevealed.add(index);

      const safeSquares = gridSize - prev.minesCount;
      const remainingSafeSquares = Math.max(1, safeSquares - newRevealed.size);
      const remainingSquares = Math.max(1, gridSize - newRevealed.size);
      let newMultiplier = prev.multiplier;
      const riskFactor = remainingSquares / remainingSafeSquares;
      newMultiplier *= 0.99 * riskFactor;

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
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">MINES</h1>
        <p className="text-muted-foreground">{t("originalGamesPage.description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-stretch">
        {/* Left Controls */}
        <div className="bg-card/40 rounded-lg p-4 border border-border/40 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{t("mines.panel.betLabel")}</div>
              <div className="text-[10px] text-muted-foreground">{t("mines.panel.betHint")}</div>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="relative w-full">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <img src="/tether-usdt-logo.svg" alt="USDT" className="h-4 w-4" />
                  <span className="hidden sm:inline">USDT</span>
                </span>
                <Input
                  type="number"
                  className="pl-12 text-right font-semibold"
                  value={state.betAmount}
                  min={1}
                  max={config?.maxBet ?? 1000}
                  onChange={(e) => onSetBet(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">{t("mines.panel.quickSet")}</div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => onAdjustBet(0.5)}>{t("mines.presets.half")}</Button>
              <Button variant="outline" onClick={() => onAdjustBet(2)}>{t("mines.presets.double")}</Button>
              <Button variant="outline" onClick={() => onSetBet(config?.maxBet ?? 1000)}>{t("mines.presets.max")}</Button>
              <Button variant="outline" onClick={() => onSetBet(config?.defaultBet ?? 100)}>{t("mines.presets.default")}</Button>
              <Button variant="outline" onClick={() => onSetBet(500)}>{t("mines.presets.mid")}</Button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{t("mines.panel.riskLabel")}</div>
              <div className="text-[10px] text-muted-foreground">{t("mines.panel.riskHint")}</div>
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
                className="w-20 text-center font-semibold"
                onChange={(e) => onChangeMines(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              {t("mines.panel.safeChance")}: {safeChancePct.toFixed(0)}%
            </div>
          </div>

          {/* Live Stats: Multiplier & Cashout */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="bg-card/60 border border-border/40 rounded-lg p-3 text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("mines.stats.currentMultiplier")}</div>
              <div className="text-xl font-bold">{state.multiplier.toFixed(2)}x</div>
            </div>
            <div className="bg-card/60 border border-border/40 rounded-lg p-3 text-center">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("mines.stats.cashout")}</div>
              <div className="text-xl font-bold">${cashoutValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <Button className="flex-1" onClick={onStart} disabled={!canStart || state.isActive}>
              {startMutation.isPending ? t("mines.panel.starting") : t("mines.panel.start")}
            </Button>
            <Button
              className="flex-1"
              variant="secondary"
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
        <div className="flex flex-col min-w-0">
          <div className="flex justify-center items-start h-full">
            <div
              className="grid grid-cols-5 gap-2 p-3 rounded-xl border border-border/40 h-[70vh] max-h-[760px] min-h-[520px] aspect-square w-auto bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-500/15 via-card/40 to-transparent shadow-[0_0_40px_0_rgba(236,72,153,0.25)]"
            >
              {tiles.map((i) => {
                const revealed = state.revealedTiles.has(i);
                const isMine = state.minePositions.has(i);
                const isGem = revealed && !isMine;
                const classes = [
                  "relative flex items-center justify-center text-white text-3xl lg:text-5xl",
                  "aspect-square w-full p-0 leading-none overflow-hidden",
                  "transform-gpu transition-[transform,box-shadow,background] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                  "shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_12px_0_rgba(236,72,153,0.45)]",
                  revealed
                    ? isMine
                      ? "bg-gradient-to-br from-rose-500 to-pink-600 shadow-[0_0_22px_0_rgba(244,63,94,0.55)]"
                      : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_0_18px_0_rgba(16,185,129,0.45)]"
                    : "bg-muted/30 hover:bg-muted/40",
                ].join(" ");
                const tileStyle: React.CSSProperties = {
                  transition: "box-shadow 300ms",
                  borderRadius: "0.75rem",
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
                        "select-none pointer-events-none transition-all duration-300",
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


