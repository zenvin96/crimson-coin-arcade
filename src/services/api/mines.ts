// Mocked Mines API for demo purposes
// This file simulates backend endpoints with small delays

export type MinesConfig = {
  gridSize: number; // total tiles, e.g., 25 for 5x5
  minMines: number;
  maxMines: number;
  defaultBet: number;
  maxBet: number;
};

export type StartMinesRequest = {
  betAmount: number;
  minesCount: number;
};

export type StartMinesResponse = {
  sessionId: string;
  minePositions: number[]; // indices in [0, gridSize)
};

export type CashoutMinesRequest = {
  sessionId: string;
  revealedSafeTiles: number; // count
};

export type CashoutMinesResponse = {
  profit: number;
  multiplier: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchMinesConfig(): Promise<MinesConfig> {
  await delay(200);
  return {
    gridSize: 25,
    minMines: 1,
    maxMines: 24,
    defaultBet: 100,
    maxBet: 1000,
  };
}

export async function startMinesSession(
  payload: StartMinesRequest
): Promise<StartMinesResponse> {
  const { betAmount, minesCount } = payload;
  if (betAmount <= 0) throw new Error("Invalid bet amount");
  if (minesCount < 1 || minesCount > 24) throw new Error("Invalid mines count");

  await delay(250);

  const gridSize = 25;
  const minePositions = new Set<number>();
  while (minePositions.size < minesCount) {
    minePositions.add(Math.floor(Math.random() * gridSize));
  }

  return {
    sessionId: `sess_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    minePositions: Array.from(minePositions),
  };
}

export async function cashoutMines(
  payload: CashoutMinesRequest & { betAmount: number; minesCount: number }
): Promise<CashoutMinesResponse> {
  await delay(180);

  const { revealedSafeTiles, betAmount, minesCount } = payload;
  const gridSize = 25;
  const safeSquares = gridSize - minesCount;

  let multiplier = 1;
  for (let i = 0; i < revealedSafeTiles; i++) {
    const remainingSafe = safeSquares - i;
    const remainingTotal = gridSize - i;
    if (remainingSafe <= 0) break;
    const probability = remainingSafe / remainingTotal;
    multiplier *= 1 / probability;
  }

  const houseEdge = 0.97;
  multiplier *= houseEdge;

  const profit = Math.max(0, betAmount * (multiplier - 1));

  return {
    profit,
    multiplier,
  };
}



