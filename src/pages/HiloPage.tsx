import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUp, ChevronDown, TrendingUp, CreditCard, Trophy, Target } from 'lucide-react';
import GameResultDialog from '@/components/ui/GameResultDialog';
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
    currentOdds: null
  });

  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{ win: boolean; amount: number; prediction?: string; oldCard?: HiloCard; newCard?: HiloCard } | null>(null);
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
      }, 500);
    } catch (error) {
      setGameState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const makePrediction = async (prediction: 'higher' | 'lower') => {
    if (!gameState.sessionId || gameState.isProcessing || !gameState.currentCard) return;

    const oldCard = gameState.currentCard;
    setGameState(prev => ({ ...prev, isProcessing: true, showCardFlip: true }));

    try {
      const predictionData: HiloPrediction = {
        sessionId: gameState.sessionId,
        prediction
      };

      const result = await hiloService.makePrediction(predictionData);

      if (result.correct) {
        const newOdds = hiloService.calculateOdds(result.newCard);

        setGameState(prev => ({
          ...prev,
          currentCard: result.newCard,
          previousCards: [...prev.previousCards, prev.currentCard!],
          streak: result.streak,
          multiplier: result.multiplier,
          potentialProfit: prev.betAmount * result.multiplier - prev.betAmount,
          isProcessing: false,
          showCardFlip: false,
          currentOdds: newOdds
        }));

        // Show win popup for each successful prediction
        setLastResult({
          win: true,
          amount: result.payout || 0,
          prediction,
          oldCard,
          newCard: result.newCard
        });
        setShowResult(true);
        setTimeout(() => setShowResult(false), 2000);

        setTimeout(() => {
          setGameState(prev => ({ ...prev, showCardFlip: false }));
        }, 500);
      } else {
        const finalResult = await hiloService.cashout(gameState.sessionId);

        setGameState(prev => ({
          ...prev,
          currentCard: result.newCard,
          previousCards: [...prev.previousCards, prev.currentCard!],
          sessionId: null,
          isActive: false,
          isProcessing: false,
          showCardFlip: false,
          currentOdds: null
        }));

        setLastResult({
          win: false,
          amount: 0,
          prediction,
          oldCard,
          newCard: result.newCard
        });
        setShowResult(true);

        setGameHistory(prev => [...prev, {
          id: Date.now(),
          betAmount: gameState.betAmount,
          multiplier: gameState.multiplier,
          profit: -gameState.betAmount,
          streak: gameState.streak
        }]);

        setTimeout(() => {
          setShowResult(false);
          setGameState(prev => ({
            ...prev,
            currentCard: null,
            previousCards: [],
            streak: 0,
            multiplier: 1.0,
            potentialProfit: 0
          }));
        }, 3000);
      }
    } catch (error) {
      setGameState(prev => ({ ...prev, isProcessing: false, showCardFlip: false }));
    }
  };

  const handleCashout = async () => {
    if (!gameState.sessionId || gameState.isProcessing) return;

    setGameState(prev => ({ ...prev, isProcessing: true }));

    try {
      const result = await hiloService.cashout(gameState.sessionId);

      const profit = result.totalPayout - gameState.betAmount;

      setGameState(prev => ({
        ...prev,
        sessionId: null,
        isActive: false,
        balance: prev.balance + result.totalPayout,
        isProcessing: false
      }));

      setLastResult({ win: true, amount: result.totalPayout });
      setShowResult(true);

      setGameHistory(prev => [...prev, {
        id: Date.now(),
        betAmount: gameState.betAmount,
        multiplier: result.multiplier,
        profit: profit,
        streak: gameState.streak
      }]);

      setTimeout(() => {
        setShowResult(false);
        setGameState(prev => ({
          ...prev,
          currentCard: null,
          previousCards: [],
          streak: 0,
          multiplier: 1.0,
          potentialProfit: 0
        }));
      }, 3000);
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
        <div className="w-32 h-44 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg border-2 border-gray-600 flex items-center justify-center">
          <span className="text-4xl text-gray-500">?</span>
        </div>
      );
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

    return (
      <div className={`relative w-32 h-44 ${isFlipping ? 'animate-flip' : ''}`}>
        <div className="absolute inset-0 bg-white rounded-lg border-2 border-gray-800 shadow-xl p-2">
          <div className="flex flex-col h-full">
            <div className="flex justify-between">
              <span className={`text-3xl font-bold ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
                {CARD_DISPLAY_VALUES[card.rank]}
              </span>
              <span className={`text-3xl ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
                {CARD_SUITS[card.suit]}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className={`text-6xl ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
                {CARD_SUITS[card.suit]}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const totalProfit = gameHistory.reduce((sum, game) => sum + game.profit, 0);
  const winRate = gameHistory.length > 0
    ? (gameHistory.filter(g => g.profit > 0).length / gameHistory.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
          {t('hilo.title')}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {t('hilo.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-4">
          <Card className="bg-card/40 backdrop-blur border-border/40">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('hilo.betAmount')}</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={gameState.betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    disabled={gameState.isActive}
                    className="pr-16"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <img src="/usdt-logo.svg" alt="USDT" className="w-4 h-4" />
                    <span className="text-sm text-gray-400">USDT</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(gameState.betAmount / 2)}
                    disabled={gameState.isActive}
                  >
                    ½
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(gameState.betAmount * 2)}
                    disabled={gameState.isActive}
                  >
                    2x
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(gameState.balance)}
                    disabled={gameState.isActive}
                  >
                    MAX
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
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
                />
              </div>

              {!gameState.isActive ? (
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                  size="lg"
                  onClick={startGame}
                  disabled={gameState.isProcessing || gameState.betAmount > gameState.balance}
                >
                  {t('hilo.startGame')}
                </Button>
              ) : (
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  size="lg"
                  onClick={handleCashout}
                  disabled={gameState.isProcessing || gameState.streak === 0}
                >
                  {t('hilo.cashout')} ({(gameState.betAmount * gameState.multiplier).toFixed(2)} USDT)
                </Button>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
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

          <Card className="bg-card/40 backdrop-blur border-border/40">
            <CardContent className="p-4">
              <Tabs defaultValue="stats" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stats">{t('hilo.stats')}</TabsTrigger>
                  <TabsTrigger value="history">{t('hilo.history')}</TabsTrigger>
                </TabsList>
                <TabsContent value="stats" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <Trophy className="w-3 h-3" />
                        {t('hilo.winRate')}
                      </div>
                      <p className="text-lg font-bold">{winRate}%</p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <TrendingUp className="w-3 h-3" />
                        {t('hilo.bestStreak')}
                      </div>
                      <p className="text-lg font-bold">
                        {gameHistory.length > 0 ? Math.max(...gameHistory.map(g => g.streak)) : 0}
                      </p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <Target className="w-3 h-3" />
                        {t('hilo.highestMultiplier')}
                      </div>
                      <p className="text-lg font-bold">
                        {gameHistory.length > 0 ? Math.max(...gameHistory.map(g => g.multiplier)).toFixed(2) : '0.00'}x
                      </p>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <CreditCard className="w-3 h-3" />
                        {t('hilo.totalGames')}
                      </div>
                      <p className="text-lg font-bold">{gameHistory.length}</p>
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

        <Card className="bg-card/40 backdrop-blur border-border/40">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
              {gameState.previousCards.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {gameState.previousCards.slice(-5).map((card, index) => (
                    <div key={index} className="scale-75 opacity-60">
                      {renderCard(card)}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                {renderCard(gameState.currentCard, gameState.showCardFlip)}

                {gameState.currentCard && (
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">{t('hilo.currentCard')}</p>
                    <p className="text-2xl font-bold">
                      {CARD_DISPLAY_VALUES[gameState.currentCard.rank]} {CARD_SUITS[gameState.currentCard.suit]}
                    </p>
                  </div>
                )}
              </div>

              {gameState.isActive && (
                <>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="space-y-2">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-green-500/50 hover:bg-green-500/10 hover:border-green-500 relative overflow-hidden"
                        onClick={() => makePrediction('higher')}
                        disabled={gameState.isProcessing || !gameState.currentCard}
                      >
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <ChevronUp className="w-5 h-5 mr-1" />
                            {t('hilo.higher')}
                          </div>
                          {gameState.currentOdds && (
                            <div className="text-xs mt-1">
                              <span className="text-green-400">{gameState.currentOdds.higherPayout.toFixed(2)}x</span>
                              <span className="text-gray-400 ml-1">({gameState.currentOdds.higherChance.toFixed(0)}%)</span>
                            </div>
                          )}
                        </div>
                      </Button>
                      {gameState.currentOdds && (
                        <div className="text-center text-xs text-gray-400">
                          {t('hilo.winPayout')}: {(gameState.betAmount * gameState.multiplier * gameState.currentOdds.higherPayout).toFixed(2)} USDT
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-red-500/50 hover:bg-red-500/10 hover:border-red-500 relative overflow-hidden"
                        onClick={() => makePrediction('lower')}
                        disabled={gameState.isProcessing || !gameState.currentCard}
                      >
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <ChevronDown className="w-5 h-5 mr-1" />
                            {t('hilo.lower')}
                          </div>
                          {gameState.currentOdds && (
                            <div className="text-xs mt-1">
                              <span className="text-red-400">{gameState.currentOdds.lowerPayout.toFixed(2)}x</span>
                              <span className="text-gray-400 ml-1">({gameState.currentOdds.lowerChance.toFixed(0)}%)</span>
                            </div>
                          )}
                        </div>
                      </Button>
                      {gameState.currentOdds && (
                        <div className="text-center text-xs text-gray-400">
                          {t('hilo.winPayout')}: {(gameState.betAmount * gameState.multiplier * gameState.currentOdds.lowerPayout).toFixed(2)} USDT
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 w-full max-w-md">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">{t('hilo.streak')}</p>
                      <p className="text-2xl font-bold text-orange-500">{gameState.streak}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">{t('hilo.multiplier')}</p>
                      <p className="text-2xl font-bold text-green-500">{gameState.multiplier.toFixed(2)}x</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">{t('hilo.potentialProfit')}</p>
                      <p className="text-2xl font-bold text-blue-500">
                        +{gameState.potentialProfit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {!gameState.isActive && !gameState.currentCard && (
                <div className="text-center">
                  <p className="text-gray-400">{t('hilo.placeBetToStart')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <GameResultDialog
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        result={lastResult ? (lastResult.win ? 'win' : 'lose') : 'lose'}
        amount={lastResult?.amount || 0}
        currency="USDT"
        title={lastResult?.win ? t('hilo.correctPrediction') : t('hilo.wrongPrediction')}
        description={
          lastResult ? (
            <div className="text-center">
              <p className="mb-2">
                {lastResult.oldCard && lastResult.newCard && (
                  <>
                    {CARD_DISPLAY_VALUES[lastResult.oldCard.rank]}
                    {CARD_SUITS[lastResult.oldCard.suit]}
                    {' → '}
                    <span className={lastResult.win ? 'text-green-500' : 'text-red-500'}>
                      {CARD_DISPLAY_VALUES[lastResult.newCard.rank]}
                      {CARD_SUITS[lastResult.newCard.suit]}
                    </span>
                  </>
                )}
              </p>
              <p className="text-sm text-gray-400">
                {t('hilo.youPredicted')} <strong>{lastResult.prediction === 'higher' ? t('hilo.higher') : t('hilo.lower')}</strong>
              </p>
              {lastResult.win && gameState.isActive && (
                <p className="text-sm text-green-400 mt-2">
                  {t('hilo.currentMultiplier')}: {gameState.multiplier.toFixed(2)}x
                </p>
              )}
            </div>
          ) : undefined
        }
      />

      <style jsx>{`
        @keyframes flip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(90deg); }
          100% { transform: rotateY(0deg); }
        }

        .animate-flip {
          animation: flip 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}