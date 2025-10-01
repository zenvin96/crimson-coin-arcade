import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DiceBetResult } from "@/services/api/dice";

type DiceBetHistoryProps = {
  history: DiceBetResult[];
};

const getTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return `${seconds}s ago`;
  }
};

export const DiceBetHistory = ({ history }: DiceBetHistoryProps) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-gray-900/70 backdrop-blur-2xl border-gray-800/60 shadow-[0_4px_24px_rgba(0,0,0,0.3)] p-0 sm:p-4 md:p-6 min-w-0">
      <h2 className="text-sm sm:text-base md:text-xl font-bold mb-2 sm:mb-3 md:mb-4 px-2 pt-2 sm:px-0 sm:pt-0">{t("dice.betHistory")}</h2>
      {history.length === 0 ? (
        <p className="text-center text-xs sm:text-sm text-muted-foreground py-8 sm:py-12">
          {t("dice.noHistory")}
        </p>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">{t("dice.time")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("dice.betAmount")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("dice.target")}</TableHead>
                  <TableHead className="whitespace-nowrap">{t("dice.result")}</TableHead>
                  <TableHead className="whitespace-nowrap text-right">{t("dice.profit")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((bet, index) => {
                  const timeAgo = bet.timestamp ? getTimeAgo(bet.timestamp) : `${index + 1}m ago`;
                  return (
                    <TableRow
                      key={`${bet.timestamp}-${index}`}
                      className={cn(
                        "transition-colors",
                        index === 0 && "bg-muted/50"
                      )}
                    >
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {timeAgo}
                      </TableCell>
                      <TableCell className="font-medium text-sm whitespace-nowrap">
                        ${bet.betAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {bet.isRollOver ? ">" : "<"} {bet.target.toFixed(2)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            bet.isWin ? "text-success" : "text-destructive"
                          )}
                        >
                          {bet.result.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            bet.profit >= 0 ? "text-success" : "text-destructive"
                          )}
                        >
                          {bet.profit >= 0 ? "+" : ""}
                          ${bet.profit.toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="block sm:hidden space-y-1.5 px-2 pb-2">
            {history.map((bet, index) => {
              const timeAgo = bet.timestamp ? getTimeAgo(bet.timestamp) : `${index + 1}m ago`;
              return (
                <div
                  key={`${bet.timestamp}-${index}`}
                  className={cn(
                    "p-2 rounded-md border transition-all duration-200",
                    index === 0
                      ? "bg-gradient-to-br from-gray-800/60 via-gray-900/50 to-gray-800/60 border-amber-500/40 shadow-md"
                      : "bg-gradient-to-br from-gray-800/40 via-gray-900/30 to-gray-800/40 border-gray-700/30"
                  )}
                  style={{
                    boxShadow: index === 0
                      ? 'inset 0 1px 1px rgba(255,255,255,0.05), 0 0 8px rgba(251,191,36,0.15)'
                      : 'inset 0 1px 1px rgba(255,255,255,0.03)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">{timeAgo}</span>
                    <span
                      className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded",
                        bet.profit >= 0
                          ? "text-emerald-400 bg-emerald-500/15"
                          : "text-rose-400 bg-rose-500/15"
                      )}
                    >
                      {bet.profit >= 0 ? "+" : ""}${bet.profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    <div className="bg-gray-900/50 rounded p-1">
                      <div className="text-gray-500 mb-0.5">{t("dice.betAmount")}</div>
                      <div className="font-semibold text-gray-200">${bet.betAmount.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-1">
                      <div className="text-gray-500 mb-0.5">{t("dice.target")}</div>
                      <div className="font-semibold text-gray-200">{bet.isRollOver ? ">" : "<"} {bet.target.toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-1 text-right">
                      <div className="text-gray-500 mb-0.5">{t("dice.result")}</div>
                      <div className={cn(
                        "font-bold",
                        bet.isWin ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {bet.result.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
};