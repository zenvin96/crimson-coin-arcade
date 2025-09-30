import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUp, ChevronDown, TrendingUp, CreditCard, Trophy, Target, ArrowRight } from 'lucide-react';
import { hiloService, type Card as HiloCard, type HiloPrediction, type HiloGameResult, type OddsCalculation } from '@/services/api/hilo';

type HiloGameState = {
  sessionId: string | null;
  currentCard: HiloCard | null;
  previousCards: HiloCard[];
  streak: number;
  multiplier: number;
  betAmount: number;
  balance: number;
  isActive: boolean;
  potentialProfit: number;
  isProcessing: boolean;
  autoCashout: number;
  showCardFlip: boolean;
  currentOdds: OddsCalculation | null;
  showComparison: boolean;
  comparisonOldCard: HiloCard | null;
  comparisonNewCard: HiloCard | null;
  comparisonPrediction: 'higher' | 'lower' | 'skip' | null;
  comparisonResult: boolean | null;
  showWinToast: boolean;
  winToastData: { profit: number; streak: number } | null;
  showSettlement: boolean;
  settlementData: { betAmount: number; streak: number } | null;
};

const CARD_SUITS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
} as const;

const CARD_DISPLAY_VALUES = {
  'A': 'A',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  'J': 'J',
  'Q': 'Q',
  'K': 'K'
} as const;

export default function HiloPage() {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<HiloGameState>({
    sessionId: null,
    currentCard: null,
    previousCards: [],
    streak: 0,
    multiplier: 1.0,
    betAmount: 10,
    balance: 10000,
    isActive: false,
    potentialProfit: 0,
    isProcessing: false,
    autoCashout: 10,
    showCardFlip: false,
    currentOdds: null,
    showComparison: false,
    comparisonOldCard: null,
    comparisonNewCard: null,
    comparisonPrediction: null,
    comparisonResult: null,
    showWinToast: false,
    winToastData: null,
    showSettlement: false,
    settlementData: null
  });

  const [gameHistory, setGameHistory] = useState<Array<{
    id: number;
    betAmount: number;
    multiplier: number;
    profit: number;
    streak: number;
  }>>([]);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await hiloService.getConfig();
      setGameState(prev => ({
        ...prev,
        betAmount: config.minBet
      }));
    };
    loadConfig();
  }, []);

  useEffect(() => {
    if (gameState.isActive && gameState.multiplier >= gameState.autoCashout) {
      handleCashout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.multiplier, gameState.autoCashout, gameState.isActive]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.isActive || gameState.isProcessing || !gameState.currentCard) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        makePrediction('higher');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        makePrediction('lower');
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        makePrediction('skip');
      } else if (e.key === 'Escape' && gameState.streak > 0) {
        e.preventDefault();
        handleCashout();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.isActive, gameState.isProcessing, gameState.currentCard, gameState.streak]);

  const startGame = async () => {
    if (gameState.betAmount > gameState.balance) return;

    setGameState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = await hiloService.startGame(gameState.betAmount);
      const odds = hiloService.calculateOdds(result.currentCard);

      setGameState(prev => ({
        ...prev,
        sessionId: result.sessionId,
        currentCard: result.currentCard,
        previousCards: [],
        streak: 0,
        multiplier: 1.0,
        balance: prev.balance - gameState.betAmount,
        isActive: true,
        potentialProfit: 0,
        isProcessing: false,
        showCardFlip: true,
        currentOdds: odds
      }));

      setTimeout(() => {
        setGameState(prev => ({ ...prev, showCardFlip: false }));
      }, 300);
    } catch (error) {
      setGameState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const makePrediction = async (prediction: 'higher' | 'lower' | 'skip') => {
    if (!gameState.sessionId || gameState.isProcessing || !gameState.currentCard) return;

    const oldCard = gameState.currentCard;
    setGameState(prev => ({ ...prev, isProcessing: true, showCardFlip: true }));

    try {
      const predictionData: HiloPrediction = {
        sessionId: gameState.sessionId,
        prediction
      };

      const result = await hiloService.makePrediction(predictionData);

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          showComparison: true,
          comparisonOldCard: oldCard,
          comparisonNewCard: result.newCard,
          comparisonPrediction: prediction,
          comparisonResult: result.correct,
          showCardFlip: false
        }));
      }, 300);

      if (result.correct) {
        const newOdds = hiloService.calculateOdds(result.newCard);
        const profit = result.payout || 0;
        const isSkip = prediction === 'skip';

        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentCard: result.newCard,
            previousCards: [...prev.previousCards, oldCard],
            streak: result.streak,
            multiplier: result.multiplier,
            potentialProfit: prev.betAmount * result.multiplier - prev.betAmount,
            isProcessing: false,
            showComparison: false,
            comparisonOldCard: null,
            comparisonNewCard: null,
            comparisonPrediction: null,
            comparisonResult: null,
            currentOdds: newOdds,
            showWinToast: !isSkip,
            winToastData: !isSkip ? { profit, streak: result.streak } : null
          }));

          if (!isSkip) {
            setTimeout(() => {
              setGameState(prev => ({
                ...prev,
                showWinToast: false,
                winToastData: null
              }));
            }, 2000);
          }
        }, 1200);
      } else {
        const finalResult = await hiloService.cashout(gameState.sessionId);

        setGameHistory(prev => [...prev, {
          id: Date.now(),
          betAmount: gameState.betAmount,
          multiplier: gameState.multiplier,
          profit: -gameState.betAmount,
          streak: gameState.streak
        }]);

        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentCard: result.newCard,
            previousCards: [...prev.previousCards, oldCard],
            showSettlement: true,
            settlementData: { betAmount: gameState.betAmount, streak: gameState.streak }
          }));

          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              sessionId: null,
              isActive: false,
              isProcessing: false,
              showComparison: false,
              comparisonOldCard: null,
              comparisonNewCard: null,
              comparisonPrediction: null,
              comparisonResult: null,
              currentOdds: null,
              showSettlement: false,
              settlementData: null,
              currentCard: null,
              previousCards: [],
              streak: 0,
              multiplier: 1.0,
              potentialProfit: 0
            }));
          }, 3000);
        }, 1200);
      }
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        isProcessing: false,
        showCardFlip: false,
        showComparison: false,
        comparisonOldCard: null,
        comparisonNewCard: null,
        comparisonPrediction: null,
        comparisonResult: null
      }));
    }
  };

  const handleCashout = async () => {
    if (!gameState.sessionId || gameState.isProcessing) return;

    setGameState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = await hiloService.cashout(gameState.sessionId);

      const profit = result.totalPayout - gameState.betAmount;

      setGameHistory(prev => [...prev, {
        id: Date.now(),
        betAmount: gameState.betAmount,
        multiplier: result.multiplier,
        profit: profit,
        streak: gameState.streak
      }]);

      setGameState(prev => ({
        ...prev,
        balance: prev.balance + result.totalPayout,
        showWinToast: true,
        winToastData: { profit, streak: prev.streak }
      }));

      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          sessionId: null,
          isActive: false,
          isProcessing: false,
          currentCard: null,
          previousCards: [],
          streak: 0,
          multiplier: 1.0,
          potentialProfit: 0,
          showWinToast: false,
          winToastData: null
        }));
      }, 2000);
    } catch (error) {
      setGameState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const setBetAmount = (amount: number) => {
    const validAmount = Math.max(1, Math.min(amount, gameState.balance));
    setGameState(prev => ({ ...prev, betAmount: validAmount }));
  };

  const renderCard = (card: HiloCard | null, isFlipping: boolean = false) => {
    if (!card) {
      return (
        <div className="card-3d w-32 h-48 sm:w-36 sm:h-52">
          <div className="card-back rounded-lg border-2 border-gray-600 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-gray-800 to-gray-900"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.1),transparent_50%)]"></div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="text-4xl text-gray-400">?</span>
              <div className="w-10 h-10 rounded-full border-4 border-gray-600 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-500">HC</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

    return (
      <div className={`card-3d w-32 h-48 sm:w-36 sm:h-52 ${isFlipping ? 'animate-flip-3d' : ''}`}>
        <div className="card-face rounded-xl border-2 border-gray-300 dark:border-gray-700 shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 dark:from-transparent dark:via-white/5 dark:to-white/10 rounded-xl"></div>

          <div className="relative z-10 flex flex-col justify-between h-full p-2 sm:p-3">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold leading-none ${isRed ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {CARD_DISPLAY_VALUES[card.rank]}
                </span>
                <span className={`text-lg sm:text-xl leading-none ${isRed ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {CARD_SUITS[card.suit]}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold leading-none ${isRed ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {CARD_DISPLAY_VALUES[card.rank]}
                </span>
                <span className={`text-lg sm:text-xl leading-none ${isRed ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {CARD_SUITS[card.suit]}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <span className={`text-5xl sm:text-6xl ${isRed ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'} drop-shadow-lg`}>
                {CARD_SUITS[card.suit]}
              </span>
            </div>
            <div className="flex justify-between items-start rotate-180">
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold leading-none ${isRed ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {CARD_DISPLAY_VALUES[card.rank]}
                </span>
                <span className={`text-lg sm:text-xl leading-none ${isRed ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {CARD_SUITS[card.suit]}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className={`text-xl sm:text-2xl font-bold leading-none ${isRed ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {CARD_DISPLAY_VALUES[card.rank]}
                </span>
                <span className={`text-lg sm:text-xl leading-none ${isRed ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {CARD_SUITS[card.suit]}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 rounded-xl border border-white/20 pointer-events-none"></div>
        </div>
      </div>
    );
  };

  const totalProfit = gameHistory.reduce((sum, game) => sum + game.profit, 0);
  const winRate = gameHistory.length > 0
    ? (gameHistory.filter(g => g.profit > 0).length / gameHistory.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="container mx-auto p-3 lg:p-4 space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
          {t('hilo.title')}
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto">
          {t('hilo.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <div className="space-y-3 order-2 lg:order-1">
          <Card className="bg-card/40 backdrop-blur-xl border-border/40 shadow-xl">
            <CardContent className="p-3 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">{t('hilo.betAmount')}</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={gameState.betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    disabled={gameState.isActive}
                    className="pr-16 h-9"
                    aria-label="Bet amount in USDT"
                    min="1"
                    max={gameState.balance}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <img src="/usdt-logo.svg" alt="USDT" className="w-4 h-4" />
                    <span className="text-xs text-gray-400">USDT</span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(10)}
                    disabled={gameState.isActive}
                    className="hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    10
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(50)}
                    disabled={gameState.isActive}
                    className="hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(100)}
                    disabled={gameState.isActive}
                    className="hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(500)}
                    disabled={gameState.isActive}
                    className="hover:bg-primary/10 hover:border-primary transition-colors"
                  >
                    500
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(gameState.balance)}
                    disabled={gameState.isActive}
                    className="hover:bg-primary/10 hover:border-primary transition-colors font-bold"
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{t('hilo.autoCashout')}</span>
                  <span className="font-medium">{gameState.autoCashout}x</span>
                </div>
                <Slider
                  value={[gameState.autoCashout]}
                  onValueChange={([value]) => setGameState(prev => ({ ...prev, autoCashout: value }))}
                  min={2}
                  max={50}
                  step={1}
                  disabled={gameState.isActive}
                  className="w-full"
                  aria-label="Auto cashout multiplier"
                />
              </div>

              {!gameState.isActive ? (
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 h-10"
                  size="default"
                  onClick={startGame}
                  disabled={gameState.isProcessing || gameState.betAmount > gameState.balance}
                  aria-label={`Start game with ${gameState.betAmount} USDT`}
                >
                  {t('hilo.startGame')}
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl hover:shadow-green-500/50 hover:scale-105 active:scale-95 transition-all duration-200 font-semibold h-10"
                  size="default"
                  onClick={handleCashout}
                  disabled={gameState.isProcessing || gameState.streak === 0}
                  aria-label={`Cashout ${(gameState.betAmount * gameState.multiplier).toFixed(2)} USDT`}
                >
                  <span className="flex items-center gap-2">
                    <span>{t('hilo.cashout')}</span>
                    <span className="text-sm font-bold">
                      {(gameState.betAmount * gameState.multiplier).toFixed(2)} USDT
                    </span>
                  </span>
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="text-center">
                  <p className="text-xs text-gray-400">{t('hilo.balance')}</p>
                  <p className="text-lg font-bold">{gameState.balance.toFixed(2)} USDT</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">{t('hilo.profit')}</p>
                  <p className={`text-lg font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} USDT
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-xl border-border/40 shadow-xl">
            <CardContent className="p-3">
              <Tabs defaultValue="stats" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stats">{t('hilo.stats')}</TabsTrigger>
                  <TabsTrigger value="history">{t('hilo.history')}</TabsTrigger>
                </TabsList>
                <TabsContent value="stats" className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-background/50 rounded-md p-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <Trophy className="w-3 h-3" />
                        {t('hilo.winRate')}
                      </div>
                      <p className="text-base font-bold">{winRate}%</p>
                    </div>
                    <div className="bg-background/50 rounded-md p-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        {t('hilo.bestStreak')}
                      </div>
                      <p className="text-base font-bold">
                        {gameHistory.length > 0 ? Math.max(...gameHistory.map(g => g.streak)) : 0}
                      </p>
                    </div>
                    <div className="bg-background/50 rounded-md p-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <Target className="w-3 h-3" />
                        {t('hilo.highestMultiplier')}
                      </div>
                      <p className="text-base font-bold">
                        {gameHistory.length > 0 ? Math.max(...gameHistory.map(g => g.multiplier)).toFixed(2) : '0.00'}x
                      </p>
                    </div>
                    <div className="bg-background/50 rounded-md p-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <CreditCard className="w-3 h-3" />
                        {t('hilo.totalGames')}
                      </div>
                      <p className="text-base font-bold">{gameHistory.length}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  <div className="max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-xs">
                          <TableHead>{t('hilo.bet')}</TableHead>
                          <TableHead>{t('hilo.multiplier')}</TableHead>
                          <TableHead>{t('hilo.profit')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gameHistory.slice().reverse().slice(0, 10).map((game) => (
                          <TableRow key={game.id} className="text-xs">
                            <TableCell>{game.betAmount} USDT</TableCell>
                            <TableCell>{game.multiplier.toFixed(2)}x</TableCell>
                            <TableCell className={game.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {game.profit >= 0 ? '+' : ''}{game.profit.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/40 backdrop-blur-xl border-border/40 shadow-2xl order-1 lg:order-2">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-2 sm:space-y-3">
              <div className="h-10 flex items-center justify-center">
                {gameState.previousCards.length > 0 && (
                  <div className="flex gap-2 items-center">
                    {gameState.previousCards.map((card, index) => {
                      const scale = 0.25 + (index * 0.03);
                      const opacity = 0.4 + (index * 0.1);
                      return (
                        <div
                          key={index}
                          className="transition-all duration-300"
                          style={{
                            transform: `scale(${scale})`,
                            opacity: opacity
                          }}
                        >
                          {renderCard(card)}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 sm:gap-3">
                {gameState.showComparison ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 animate-comparison" role="alert" aria-live="polite">
                    <div className={`comparison-card ${gameState.comparisonPrediction === 'skip' ? 'skip-glow' : gameState.comparisonResult ? 'win-glow' : 'lose-glow'}`}>
                      {renderCard(gameState.comparisonOldCard)}
                      <div className="text-center mt-2">
                        <p className="text-xs font-semibold text-gray-300">Previous Card</p>
                      </div>
                    </div>

                    <div className={`flex flex-col items-center gap-2 ${gameState.comparisonPrediction === 'skip' ? 'text-yellow-500' : gameState.comparisonResult ? 'text-green-500' : 'text-red-500'} animate-pulse`}>
                      {gameState.comparisonPrediction === 'skip' ? (
                        <>
                          <ArrowRight className="w-10 h-10 sm:w-12 sm:h-12" />
                          <span className="text-xl sm:text-2xl font-bold">
                            SKIPPED
                          </span>
                        </>
                      ) : gameState.comparisonPrediction === 'higher' ? (
                        <>
                          <ChevronUp className="w-10 h-10 sm:w-12 sm:h-12" />
                          <span className="text-xl sm:text-2xl font-bold">
                            {gameState.comparisonResult ? '✓ HIGHER' : '✗ HIGHER'}
                          </span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-10 h-10 sm:w-12 sm:h-12" />
                          <span className="text-xl sm:text-2xl font-bold">
                            {gameState.comparisonResult ? '✓ LOWER' : '✗ LOWER'}
                          </span>
                        </>
                      )}
                    </div>

                    <div className={`comparison-card ${gameState.comparisonPrediction === 'skip' ? 'skip-glow' : gameState.comparisonResult ? 'win-glow' : 'lose-glow'}`}>
                      {renderCard(gameState.comparisonNewCard)}
                      <div className="text-center mt-2">
                        <p className="text-xs font-semibold text-gray-300">New Card</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {renderCard(gameState.currentCard, gameState.showCardFlip)}

                    {gameState.currentCard && (
                      <div className="text-center">
                        <p className="text-xs text-gray-400">{t('hilo.currentCard')}</p>
                        <p className="text-xl font-bold">
                          {CARD_DISPLAY_VALUES[gameState.currentCard.rank]} {CARD_SUITS[gameState.currentCard.suit]}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {gameState.isActive && !gameState.showComparison && (
                <>
                  <div className="w-full max-w-lg px-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <Button
                      size="lg"
                      variant="outline"
                      className="relative h-auto min-h-[110px] sm:min-h-[120px] p-3 border-2 border-green-500/50 hover:bg-green-500/10 hover:border-green-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden transition-all duration-200 shadow-xl hover:shadow-green-500/30 group"
                      onClick={() => makePrediction('higher')}
                      disabled={gameState.isProcessing || !gameState.currentCard || gameState.showComparison}
                      aria-label="Predict higher card"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent"></div>
                      <div className="absolute top-1.5 right-1.5 bg-green-500/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-mono text-green-300 border border-green-500/30">
                        ↑
                      </div>

                      <div className="relative z-10 flex flex-col items-center gap-1.5 w-full">
                        <ChevronUp className="w-6 h-6 sm:w-7 sm:h-7 text-green-500 group-hover:scale-110 transition-transform" />
                        <div className="text-lg sm:text-xl font-bold">{t('hilo.higher')}</div>

                        {gameState.currentOdds && (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl sm:text-2xl font-bold text-green-400">
                                {gameState.currentOdds.higherPayout.toFixed(2)}x
                              </span>
                              <span className="text-xs text-gray-400">
                                {gameState.currentOdds.higherChance.toFixed(0)}%
                              </span>
                            </div>

                            <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                                style={{ width: `${gameState.currentOdds.higherChance}%` }}
                              ></div>
                            </div>

                            <div className="text-xs font-semibold text-green-300">
                              +{(gameState.betAmount * gameState.multiplier * gameState.currentOdds.higherPayout - gameState.betAmount * gameState.multiplier).toFixed(2)} USDT
                            </div>
                          </>
                        )}
                      </div>
                    </Button>

                    <Button
                      size="lg"
                      variant="outline"
                      className="relative h-auto min-h-[110px] sm:min-h-[120px] p-3 border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden transition-all duration-200 shadow-xl hover:shadow-red-500/30 group"
                      onClick={() => makePrediction('lower')}
                      disabled={gameState.isProcessing || !gameState.currentCard || gameState.showComparison}
                      aria-label="Predict lower card"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent"></div>
                      <div className="absolute top-1.5 right-1.5 bg-red-500/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-mono text-red-300 border border-red-500/30">
                        ↓
                      </div>

                      <div className="relative z-10 flex flex-col items-center gap-1.5 w-full">
                        <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7 text-red-500 group-hover:scale-110 transition-transform" />
                        <div className="text-lg sm:text-xl font-bold">{t('hilo.lower')}</div>

                        {gameState.currentOdds && (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl sm:text-2xl font-bold text-red-400">
                                {gameState.currentOdds.lowerPayout.toFixed(2)}x
                              </span>
                              <span className="text-xs text-gray-400">
                                {gameState.currentOdds.lowerChance.toFixed(0)}%
                              </span>
                            </div>

                            <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                                style={{ width: `${gameState.currentOdds.lowerChance}%` }}
                              ></div>
                            </div>

                            <div className="text-xs font-semibold text-red-300">
                              +{(gameState.betAmount * gameState.multiplier * gameState.currentOdds.lowerPayout - gameState.betAmount * gameState.multiplier).toFixed(2)} USDT
                            </div>
                          </>
                        )}
                      </div>
                    </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="relative w-full h-auto min-h-[44px] p-2 border border-yellow-500/40 hover:bg-yellow-500/10 hover:border-yellow-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden transition-all duration-200 shadow-md hover:shadow-yellow-500/20 group"
                      onClick={() => makePrediction('skip')}
                      disabled={gameState.isProcessing || !gameState.currentCard || gameState.showComparison}
                      aria-label="Skip current card"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5"></div>
                      <div className="absolute top-1 right-1 bg-yellow-500/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-mono text-yellow-300 border border-yellow-500/30">
                        →
                      </div>

                      <div className="relative z-10 flex items-center justify-center gap-2">
                        <ArrowRight className="w-5 h-5 text-yellow-500 group-hover:scale-110 group-hover:translate-x-1 transition-all" />
                        <span className="text-sm font-bold">Skip Card</span>
                        <span className="text-xs text-gray-400 hidden sm:inline">· Draw next without betting</span>
                      </div>
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 text-center flex flex-wrap items-center justify-center gap-2">
                    <span className="hidden sm:inline">💡 Keyboard:</span>
                    <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-green-400">↑</kbd>
                    <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-red-400">↓</kbd>
                    <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-yellow-400">→ or Space</kbd>
                    <span className="hidden sm:inline text-gray-600">|</span>
                    <kbd className="hidden sm:inline px-2 py-1 bg-gray-700/50 border border-gray-600 rounded">ESC</kbd>
                    <span className="hidden sm:inline text-gray-500">cashout</span>
                  </div>

                  <div className="w-full max-w-lg space-y-2">
                    {gameState.multiplier >= gameState.autoCashout * 0.8 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-2 animate-pulse">
                        <p className="text-xs text-yellow-400 text-center font-semibold">
                          ⚠️ Approaching Auto-Cashout at {gameState.autoCashout}x
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/30 rounded-md p-2 backdrop-blur">
                        <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wider">{t('hilo.streak')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-orange-500">
                          {gameState.streak > 5 && '🔥 '}
                          {gameState.streak}
                        </p>
                      </div>
                      <div className="text-center bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-md p-2 backdrop-blur">
                        <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wider">{t('hilo.multiplier')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-500 transition-all duration-300">
                          {gameState.multiplier.toFixed(2)}x
                        </p>
                      </div>
                      <div className="text-center bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 rounded-md p-2 backdrop-blur">
                        <p className="text-xs text-gray-400 mb-0.5 uppercase tracking-wider">{t('hilo.potentialProfit')}</p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-500">
                          +{gameState.potentialProfit.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!gameState.isActive && !gameState.currentCard && (
                <div className="text-center space-y-4 py-8">
                  <div className="relative">
                    <div className="flex justify-center gap-2 animate-shuffle">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-20 h-28 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg border-2 border-gray-600 transform transition-all duration-500"
                          style={{
                            animation: `shuffle-${i} 2s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-300 mb-2">
                      {t('hilo.placeBetToStart')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Guess if the next card will be higher or lower
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {gameState.showWinToast && gameState.winToastData && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-toast-slide-down">
          <div className="bg-gradient-to-r from-green-500/95 to-emerald-500/95 backdrop-blur-md px-6 py-3 rounded-lg shadow-2xl border border-green-400/50">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <div className="text-white font-bold text-lg">
                  +{gameState.winToastData.profit.toFixed(2)} USDT
                </div>
                <div className="text-green-100 text-sm">
                  {t('hilo.streak')}: {gameState.winToastData.streak}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState.showSettlement && gameState.settlementData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-red-500/50 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="text-center space-y-2">
              <div className="text-6xl">💔</div>
              <h2 className="text-2xl font-bold text-red-500">{t('hilo.gameOver')}</h2>
            </div>

            <div className="space-y-3 bg-black/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('hilo.lost')}</span>
                <span className="text-red-500 font-bold text-lg">
                  -{gameState.settlementData.betAmount.toFixed(2)} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('hilo.streak')}</span>
                <span className="text-orange-500 font-bold">
                  {gameState.settlementData.streak}
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 h-12 text-lg font-bold"
              onClick={() => {
                setGameState(prev => ({
                  ...prev,
                  showSettlement: false,
                  settlementData: null,
                  sessionId: null,
                  isActive: false,
                  isProcessing: false,
                  showComparison: false,
                  comparisonOldCard: null,
                  comparisonNewCard: null,
                  comparisonPrediction: null,
                  comparisonResult: null,
                  currentOdds: null,
                  currentCard: null,
                  previousCards: [],
                  streak: 0,
                  multiplier: 1.0,
                  potentialProfit: 0
                }));
              }}
            >
              {t('hilo.playAgain')}
            </Button>
          </div>
        </div>
      )}

      <style jsx>{`
        .card-3d {
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .card-face, .card-back {
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }

        @keyframes flip-3d {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(90deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        .animate-flip-3d {
          animation: flip-3d 0.4s ease-out;
        }

        @keyframes shuffle-0 {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) translateX(-5px) rotate(-5deg);
          }
        }

        @keyframes shuffle-1 {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) translateX(0) rotate(0deg);
          }
        }

        @keyframes shuffle-2 {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) translateX(5px) rotate(5deg);
          }
        }

        @keyframes win-pulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.2);
          }
        }

        .win-animation {
          animation: win-pulse 0.5s ease-in-out;
        }

        @keyframes lose-shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        .lose-animation {
          animation: lose-shake 0.4s ease-in-out;
        }

        @keyframes slide-in-comparison {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-comparison {
          animation: slide-in-comparison 0.3s ease-out;
        }

        .comparison-card {
          transition: all 0.3s ease;
        }

        @keyframes win-glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 0px rgba(34, 197, 94, 0));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.8));
          }
        }

        @keyframes lose-glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 0px rgba(239, 68, 68, 0));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.8));
          }
        }

        .win-glow {
          animation: win-glow-pulse 1s ease-in-out infinite;
        }

        .lose-glow {
          animation: lose-glow-pulse 1s ease-in-out infinite;
        }

        @keyframes skip-glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 0px rgba(234, 179, 8, 0));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(234, 179, 8, 0.8));
          }
        }

        .skip-glow {
          animation: skip-glow-pulse 1s ease-in-out infinite;
        }

        @keyframes toast-slide-down {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-toast-slide-down {
          animation: toast-slide-down 0.3s ease-out;
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}