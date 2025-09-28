import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type GameResultDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "win" | "lose";
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  amountText?: string; // e.g., "$123.45"
  multiplierText?: string; // e.g., "1.25x"
  autoCloseMs?: number; // auto close after ms when open
};

const GameResultDialog: React.FC<GameResultDialogProps> = ({
  open,
  onOpenChange,
  type,
  title,
  description,
  primaryAction,
  secondaryAction,
  amountText,
  multiplierText,
  autoCloseMs = 1800,
}) => {
  const isWin = type === "win";
  const emoji = isWin ? "💎" : "💥";
  const ringClass = isWin
    ? "ring-4 ring-emerald-400/30 bg-gradient-to-br from-emerald-500 to-emerald-600"
    : "ring-4 ring-rose-400/30 bg-gradient-to-br from-rose-500 to-pink-600";

  React.useEffect(() => {
    if (!open) return;
    if (!autoCloseMs || autoCloseMs <= 0) return;
    const timer = setTimeout(() => onOpenChange(false), autoCloseMs);
    return () => clearTimeout(timer);
  }, [open, autoCloseMs, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] sm:max-w-[480px] p-6 text-center border-border/50">
        <div className="mx-auto mb-3 h-16 w-16 rounded-full grid place-items-center text-white shadow-[0_0_24px_rgba(236,72,153,0.45)] "
             style={{ filter: "drop-shadow(0 0 22px rgba(236,72,153,0.35))" }}
        >
          <div className={ringClass + " rounded-full h-full w-full grid place-items-center text-3xl"}>{emoji}</div>
        </div>
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-2xl font-bold tracking-tight text-center">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-center">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {(amountText || multiplierText) && (
          <div className="mt-3 flex items-center justify-center gap-3 text-center">
            {amountText && (
              <div className={(isWin ? "text-emerald-400" : "text-rose-400") + " px-4 py-2 rounded-lg bg-card/60 border border-border/50 text-3xl font-extrabold tracking-tight text-center"}>
                {amountText}
              </div>
            )}
            {multiplierText && (
              <div className={(isWin ? "text-emerald-300" : "text-rose-300") + " px-4 py-2 rounded-lg bg-card/60 border border-border/50 text-2xl font-bold text-center"}>
                {multiplierText}
              </div>
            )}
          </div>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameResultDialog;


