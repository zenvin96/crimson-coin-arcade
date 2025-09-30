import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DiceSliderProps = {
  target: number;
  isRollOver: boolean;
  onTargetChange: (value: number) => void;
  disabled?: boolean;
};

export const DiceSlider = ({
  target,
  isRollOver,
  onTargetChange,
  disabled = false,
}: DiceSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = useCallback((clientX: number) => {
    if (!trackRef.current || disabled) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0.01, Math.min(99.99, (x / rect.width) * 100));
    onTargetChange(percent);
  }, [disabled, onTargetChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  }, [disabled, handleMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  }, [disabled, handleMove]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    let newTarget = target;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        newTarget = Math.max(0.01, target - 1);
        break;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        newTarget = Math.min(99.99, target + 1);
        break;
      case "Home":
        e.preventDefault();
        newTarget = 0.01;
        break;
      case "End":
        e.preventDefault();
        newTarget = 99.99;
        break;
      default:
        return;
    }
    onTargetChange(newTarget);
  }, [target, onTargetChange, disabled]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>

      <div
        ref={trackRef}
        className={cn(
          "relative h-8 sm:h-10 rounded-full border-2 overflow-hidden transition-all",
          "bg-gradient-to-r from-destructive/10 via-muted/50 to-success/10",
          disabled ? "opacity-50 cursor-not-allowed border-muted" : "cursor-pointer border-primary/30 hover:border-primary/50",
          isDragging && "scale-[1.02]"
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-label="Dice target value"
        aria-valuenow={target}
        aria-valuemin={0.01}
        aria-valuemax={99.99}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <div
          className={cn(
            "absolute h-full transition-all duration-300",
            isRollOver ? "left-0" : "right-0",
            "bg-gradient-to-r from-destructive/40 to-destructive/20"
          )}
          style={{
            width: isRollOver ? `${target}%` : `${100 - target}%`,
          }}
        />

        <div
          className={cn(
            "absolute h-full transition-all duration-300",
            isRollOver ? "right-0" : "left-0",
            "bg-gradient-to-r from-success/20 to-success/40"
          )}
          style={{
            width: isRollOver ? `${100 - target}%` : `${target}%`,
          }}
        />

        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10",
            "w-10 h-10 sm:w-12 sm:h-12 rounded-full",
            "bg-gradient-to-br from-primary to-primary/80",
            "border-4 border-background shadow-lg",
            "transition-all duration-200",
            disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing hover:scale-110",
            isDragging && "scale-95 shadow-xl ring-4 ring-primary/30"
          )}
          style={{ left: `${target}%` }}
        />

        <div
          className="absolute top-full mt-2 w-0.5 h-4 bg-primary/50"
          style={{ left: `${target}%`, transform: "translateX(-50%)" }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <button
          type="button"
          onClick={() => onTargetChange(25)}
          disabled={disabled}
          className="px-2 py-1 text-xs sm:text-sm font-medium rounded border border-muted hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          25
        </button>
        <button
          type="button"
          onClick={() => onTargetChange(50)}
          disabled={disabled}
          className="px-2 py-1 text-xs sm:text-sm font-medium rounded border border-muted hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          50
        </button>
        <button
          type="button"
          onClick={() => onTargetChange(75)}
          disabled={disabled}
          className="px-2 py-1 text-xs sm:text-sm font-medium rounded border border-muted hover:border-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          75
        </button>
      </div>
    </div>
  );
};