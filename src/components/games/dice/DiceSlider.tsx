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
    e.preventDefault();
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
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="w-full space-y-2 sm:space-y-3">
      <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 font-medium px-0.5 sm:px-1">
        <span className="text-gray-500">0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span className="text-gray-500">100</span>
      </div>

      <div
        ref={trackRef}
        className={cn(
          "relative h-5 sm:h-6 md:h-8 rounded-md sm:rounded-lg border overflow-hidden",
          "bg-gradient-to-r from-red-950/30 via-gray-900/40 to-emerald-950/30",
          "shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]",
          "touch-none",
          disabled ? "opacity-50 cursor-not-allowed border-gray-800/40" : "cursor-pointer border-gray-800/60 hover:border-amber-500/40 transition-colors duration-300"
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
            "absolute h-full",
            isRollOver ? "left-0" : "right-0",
            "bg-gradient-to-br from-red-600/40 via-red-500/30 to-red-800/20"
          )}
          style={{
            width: isRollOver ? `${target}%` : `${100 - target}%`,
            transition: isDragging ? 'none' : 'width 0.15s ease-out',
            boxShadow: '0 0 8px rgba(220,38,38,0.15)',
          }}
        />

        <div
          className={cn(
            "absolute h-full",
            isRollOver ? "right-0" : "left-0",
            "bg-gradient-to-br from-emerald-600/40 via-emerald-500/30 to-teal-600/20"
          )}
          style={{
            width: isRollOver ? `${100 - target}%` : `${target}%`,
            transition: isDragging ? 'none' : 'width 0.15s ease-out',
            boxShadow: '0 0 8px rgba(16,185,129,0.15)',
          }}
        />

        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10",
            "w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full",
            "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600",
            "border-[3px] sm:border-4 border-amber-200/20",
            "flex items-center justify-center",
            disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing hover:scale-105",
            isDragging && "scale-105"
          )}
          style={{
            left: `${target}%`,
            transition: isDragging ? 'none' : 'left 0.15s ease-out, transform 0.1s ease-out',
            boxShadow: isDragging
              ? '0 0 20px rgba(251,191,36,0.5), 0 3px 10px rgba(0,0,0,0.4)'
              : '0 0 14px rgba(251,191,36,0.4), 0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent" />
          <span
            className="text-[9px] sm:text-[10px] md:text-xs font-bold relative z-10"
            style={{
              color: '#18181B',
              textShadow: '0 1px 2px rgba(255,255,255,0.5)',
            }}
          >
            {target.toFixed(0)}
          </span>
        </div>

        <div
          className="absolute top-full mt-1 sm:mt-1.5 w-0.5 h-2 sm:h-3 bg-amber-500/60 rounded-full"
          style={{
            left: `${target}%`,
            transform: "translateX(-50%)",
            boxShadow: '0 0 4px rgba(251,191,36,0.4)',
          }}
        />
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
        <button
          type="button"
          onClick={() => onTargetChange(25)}
          disabled={disabled}
          className={cn(
            "px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-md sm:rounded-lg",
            "border-2 transition-all duration-200",
            "active:scale-95",
            disabled
              ? "opacity-50 cursor-not-allowed border-gray-800/40"
              : "border-gray-800/60 hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-[0_0_8px_rgba(251,191,36,0.2)]"
          )}
        >
          25
        </button>
        <button
          type="button"
          onClick={() => onTargetChange(50)}
          disabled={disabled}
          className={cn(
            "px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-md sm:rounded-lg",
            "border-2 transition-all duration-200",
            "active:scale-95",
            disabled
              ? "opacity-50 cursor-not-allowed border-gray-800/40"
              : "border-gray-800/60 hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-[0_0_8px_rgba(251,191,36,0.2)]"
          )}
        >
          50
        </button>
        <button
          type="button"
          onClick={() => onTargetChange(75)}
          disabled={disabled}
          className={cn(
            "px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-md sm:rounded-lg",
            "border-2 transition-all duration-200",
            "active:scale-95",
            disabled
              ? "opacity-50 cursor-not-allowed border-gray-800/40"
              : "border-gray-800/60 hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-[0_0_8px_rgba(251,191,36,0.2)]"
          )}
        >
          75
        </button>
      </div>
    </div>
  );
};