
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type TokenItemProps = {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  compact?: boolean;
};

const TokenItem = ({ name, symbol, price, change24h, compact = false }: TokenItemProps) => {
  const isPositive = change24h >= 0;
  
  return (
    <div className={cn(
      "flex items-center justify-between py-2",
      !compact && "border-b border-gray-100 last:border-0",
      compact && "flex-col items-start gap-1"
    )}>
      <div className="flex items-center">
        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mr-2">
          <span className="text-xs font-mono">{symbol.charAt(0)}</span>
        </div>
        <span className={compact ? "text-xs font-medium" : "text-sm"}>{compact ? symbol : name}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className={cn(
          compact ? "text-xs font-medium" : "text-sm font-medium",
        )}>
          ${price.toLocaleString()}
        </span>
        <div className={cn(
          "flex items-center text-xs",
          isPositive ? "token-price-up" : "token-price-down"
        )}>
          {isPositive 
            ? <ArrowUp className="h-3 w-3 mr-0.5" /> 
            : <ArrowDown className="h-3 w-3 mr-0.5" />
          }
          {Math.abs(change24h)}%
        </div>
      </div>
    </div>
  );
};

const TokenPriceTracker = ({ compact = false }: { compact?: boolean }) => {
  const { tokenPrices, isLoading } = useApp();
  
  return (
    <div className="w-full">
      {!compact && (
        <h3 className="font-medium text-sm mb-2">Token Prices</h3>
      )}
      <div className={cn(
        "flex",
        compact ? "flex-row gap-3" : "flex-col"
      )}>
        {isLoading 
          ? Array(compact ? 3 : 5).fill(null).map((_, i) => (
              <div 
                key={`skeleton-${i}`} 
                className={cn(
                  "py-2",
                  !compact && "border-b border-gray-100 last:border-0",
                  compact && "w-1/3"
                )}
              >
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 rounded-full mr-2" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex flex-col items-end mt-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-10 mt-1" />
                </div>
              </div>
            ))
          : tokenPrices.slice(0, compact ? 3 : 5).map(token => (
              <TokenItem 
                key={token.id}
                name={token.name}
                symbol={token.symbol}
                price={token.price}
                change24h={token.change24h}
                compact={compact}
              />
            ))
        }
      </div>
    </div>
  );
};

export default TokenPriceTracker;
