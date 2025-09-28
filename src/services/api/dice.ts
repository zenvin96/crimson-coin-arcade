export interface DiceConfig {
  minBet: number;
  maxBet: number;
  minWinChance: number;
  maxWinChance: number;
  houseEdge: number;
  currency: string;
}

export interface DiceBetRequest {
  betAmount: number;
  target: number;
  isRollOver: boolean;
}

export interface DiceBetResult {
  id: string;
  result: number;
  target: number;
  isRollOver: boolean;
  isWin: boolean;
  betAmount: number;
  payout: number;
  profit: number;
  multiplier: number;
  timestamp: number;
}

export interface DiceHistory {
  results: DiceBetResult[];
  totalBets: number;
  totalWins: number;
  totalProfit: number;
}

const mockConfig: DiceConfig = {
  minBet: 0.01,
  maxBet: 10000,
  minWinChance: 0.01,
  maxWinChance: 99.99,
  houseEdge: 2.5,
  currency: "USD",
};

const generateDiceResult = (target: number, isRollOver: boolean): number => {
  const result = Math.random() * 100;
  return Math.round(result * 100) / 100;
};

export const fetchDiceConfig = async (): Promise<DiceConfig> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockConfig;
};

export const placeDiceBet = async (request: DiceBetRequest): Promise<DiceBetResult> => {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

  const result = generateDiceResult(request.target, request.isRollOver);
  const isWin = request.isRollOver ? result > request.target : result < request.target;

  const winChance = request.isRollOver ? (100 - request.target) : request.target;
  const multiplier = (100 / winChance) * ((100 - mockConfig.houseEdge) / 100);

  const payout = isWin ? request.betAmount * multiplier : 0;
  const profit = payout - request.betAmount;

  return {
    id: `dice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    result,
    target: request.target,
    isRollOver: request.isRollOver,
    isWin,
    betAmount: request.betAmount,
    payout,
    profit,
    multiplier,
    timestamp: Date.now(),
  };
};

let mockHistory: DiceBetResult[] = [];

export const getDiceHistory = async (): Promise<DiceHistory> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const totalWins = mockHistory.filter(r => r.isWin).length;
  const totalProfit = mockHistory.reduce((sum, r) => sum + r.profit, 0);

  return {
    results: [...mockHistory].reverse().slice(0, 50),
    totalBets: mockHistory.length,
    totalWins,
    totalProfit,
  };
};

export const addToMockHistory = (result: DiceBetResult) => {
  mockHistory.push(result);
  if (mockHistory.length > 100) {
    mockHistory = mockHistory.slice(-100);
  }
};