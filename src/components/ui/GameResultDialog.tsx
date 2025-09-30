import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const dialogStyles = `
@keyframes bounce-in {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes confetti {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

@keyframes shake-dialog {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px) rotate(-1deg); }
  20%, 40%, 60%, 80% { transform: translateX(3px) rotate(1deg); }
}

@keyframes count-up {
  from { transform: translateY(20px) scale(0.8); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.bounce-in-animation {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.shake-dialog-animation {
  animation: shake-dialog 0.5s ease-in-out;
}

.count-up-animation {
  animation: count-up 0.4s ease-out forwards;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  animation: confetti 3s ease-out forwards;
}
`;

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

  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (open && isWin) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open, isWin]);

  React.useEffect(() => {
    if (!open) return;
    if (!autoCloseMs || autoCloseMs <= 0) return;
    const timer = setTimeout(() => onOpenChange(false), autoCloseMs);
    return () => clearTimeout(timer);
  }, [open, autoCloseMs, onOpenChange]);

  const confettiColors = [
    "bg-yellow-400",
    "bg-pink-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-purple-400",
    "bg-red-400",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style dangerouslySetInnerHTML={{ __html: dialogStyles }} />
      <DialogContent className={`max-w-[420px] sm:max-w-[480px] p-6 text-center border-border/50 animate-in slide-in-from-bottom-4 fade-in duration-300 ${!isWin ? "shake-dialog-animation" : ""}`}>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className={`confetti-piece ${confettiColors[i % confettiColors.length]}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 1}s`,
                }}
              />
            ))}
          </div>
        )}
        <div className="mx-auto mb-3 h-16 w-16 rounded-full grid place-items-center text-white shadow-[0_0_24px_rgba(236,72,153,0.45)] bounce-in-animation"
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
              <div className={(isWin ? "text-emerald-400" : "text-rose-400") + " px-4 py-2 rounded-lg bg-card/60 border border-border/50 text-3xl font-extrabold tracking-tight text-center count-up-animation"}>
                {amountText}
              </div>
            )}
            {multiplierText && (
              <div className={(isWin ? "text-emerald-300" : "text-rose-300") + " px-4 py-2 rounded-lg bg-card/60 border border-border/50 text-2xl font-bold text-center count-up-animation"} style={{ animationDelay: "0.1s" }}>
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


