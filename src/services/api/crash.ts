export interface CrashConfig {
  minBet: number;
  maxBet: number;
  defaultBet: number;
  houseEdge: number;
  bettingCountdownMs: number;
  postCrashDelayMs: number;
  growthRate: number;
}

export interface CrashSession {
  sessionId: string;
  crashPoint: number;
  startTime: number;
}

export interface CrashCashoutResponse {
  multiplier: number;
  profit: number;
  balance: number;
}

export interface SimulatedPlayer {
  name: string;
  bet: number;
  targetMultiplier?: number;
  cashedOut: boolean;
  profit: number;
}

export const fetchCrashConfig = async (): Promise<CrashConfig> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    minBet: 1,
    maxBet: 1000,
    defaultBet: 10,
    houseEdge: 0.03,
    bettingCountdownMs: 5000,
    postCrashDelayMs: 3000,
    growthRate: 0.12,
  };
};

export const startCrashSession = async (betAmount: number): Promise<CrashSession> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const r = Math.random();
  let crashPoint: number;

  if (r < 0.03) {
    crashPoint = 1.00;
  } else {
    const raw = (1 - 0.03) / (1 - r);
    crashPoint = Math.max(1.01, Number(raw.toFixed(2)));
  }

  return {
    sessionId: `crash-${Date.now()}`,
    crashPoint,
    startTime: Date.now(),
  };
};

export const cashoutCrash = async ({
  sessionId,
  betAmount,
  multiplier,
}: {
  sessionId: string;
  betAmount: number;
  multiplier: number;
}): Promise<CrashCashoutResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const profit = betAmount * (multiplier - 1);

  return {
    multiplier,
    profit,
    balance: 1000 + profit,
  };
};

export const getSimulatedPlayers = (): SimulatedPlayer[] => {
  const playerNames = [
    'CryptoKing', 'MoonShot', 'DiamondHands', 'RocketMan', 'Lucky777',
    'ProGamer', 'BetMaster', 'CashKing', 'HighRoller', 'SafeBet'
  ];

  const count = 3 + Math.floor(Math.random() * 7);
  const shuffledNames = [...playerNames].sort(() => Math.random() - 0.5);

  return shuffledNames.slice(0, count).map(name => ({
    name,
    bet: Math.floor(5 + Math.random() * 500),
    targetMultiplier: 1.5 + Math.random() * 8,
    cashedOut: false,
    profit: 0,
  }));
};