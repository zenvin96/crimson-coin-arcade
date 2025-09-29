export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
}

export interface HiloConfig {
  minBet: number;
  maxBet: number;
  maxStreak: number;
  multipliers: number[];
}

export interface HiloGameStart {
  sessionId: string;
  currentCard: Card;
  multiplier: number;
}

export interface HiloPrediction {
  sessionId: string;
  prediction: 'higher' | 'lower';
}

export interface HiloGameResult {
  correct: boolean;
  newCard: Card;
  multiplier: number;
  streak: number;
  payout?: number;
}

export interface OddsCalculation {
  higherOdds: number;
  lowerOdds: number;
  higherPayout: number;
  lowerPayout: number;
  higherChance: number;
  lowerChance: number;
}

export interface HiloCashoutResult {
  totalPayout: number;
  multiplier: number;
  finalStreak: number;
}

const CARD_VALUES: { [key: string]: number } = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13
};

const MULTIPLIERS = [
  1.0, 1.2, 1.5, 1.9, 2.4, 3.0, 3.7, 4.5, 5.4, 6.5,
  7.8, 9.3, 11.1, 13.3, 16.0, 19.2, 23.0, 27.6, 33.1, 39.7
];

class HiloService {
  private activeSessions: Map<string, {
    betAmount: number;
    currentCard: Card;
    streak: number;
    multiplier: number;
  }> = new Map();

  calculateOdds(currentCard: Card): OddsCalculation {
    const currentValue = currentCard.value;
    const totalCards = 13;

    // Calculate chances
    const higherCards = totalCards - currentValue;
    const lowerCards = currentValue - 1;
    const equalCards = 1;

    // Basic probability (considering 4 suits)
    const higherChance = (higherCards / totalCards) * 100;
    const lowerChance = (lowerCards / totalCards) * 100;

    // Calculate payouts based on probability (inverse relationship)
    // Lower chance = higher payout
    const basePayout = 2.0;
    const higherPayout = higherChance > 0 ? (95 / higherChance) * 1.0 : basePayout;
    const lowerPayout = lowerChance > 0 ? (95 / lowerChance) * 1.0 : basePayout;

    // Calculate odds (simplified)
    const higherOdds = higherChance / 100;
    const lowerOdds = lowerChance / 100;

    return {
      higherOdds,
      lowerOdds,
      higherPayout: Math.min(Math.max(higherPayout, 1.1), 10.0), // Cap between 1.1x and 10x
      lowerPayout: Math.min(Math.max(lowerPayout, 1.1), 10.0),
      higherChance,
      lowerChance
    };
  }

  private createCard(): Card {
    const suits: Array<Card['suit']> = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Array<Card['rank']> = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];

    return {
      suit,
      rank,
      value: CARD_VALUES[rank]
    };
  }

  async getConfig(): Promise<HiloConfig> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      minBet: 10,
      maxBet: 10000,
      maxStreak: 20,
      multipliers: MULTIPLIERS
    };
  }

  async startGame(betAmount: number): Promise<HiloGameStart> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const sessionId = `hilo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const currentCard = this.createCard();

    this.activeSessions.set(sessionId, {
      betAmount,
      currentCard,
      streak: 0,
      multiplier: 1.0
    });

    return {
      sessionId,
      currentCard,
      multiplier: 1.0
    };
  }

  async makePrediction(prediction: HiloPrediction): Promise<HiloGameResult> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const session = this.activeSessions.get(prediction.sessionId);
    if (!session) {
      throw new Error('Invalid session');
    }

    const odds = this.calculateOdds(session.currentCard);
    const newCard = this.createCard();
    const oldValue = session.currentCard.value;
    const newValue = newCard.value;

    let correct = false;
    if (prediction.prediction === 'higher') {
      correct = newValue > oldValue || (newValue === oldValue && Math.random() > 0.5);
    } else {
      correct = newValue < oldValue || (newValue === oldValue && Math.random() > 0.5);
    }

    if (correct) {
      // Apply dynamic payout based on odds
      const payoutMultiplier = prediction.prediction === 'higher' ? odds.higherPayout : odds.lowerPayout;
      session.streak++;
      session.multiplier = session.multiplier * payoutMultiplier;
      session.currentCard = newCard;

      this.activeSessions.set(prediction.sessionId, session);

      return {
        correct: true,
        newCard,
        multiplier: session.multiplier,
        streak: session.streak,
        payout: session.betAmount * session.multiplier
      };
    } else {
      this.activeSessions.delete(prediction.sessionId);

      return {
        correct: false,
        newCard,
        multiplier: 0,
        streak: session.streak,
        payout: 0
      };
    }
  }

  async cashout(sessionId: string): Promise<HiloCashoutResult> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return {
        totalPayout: 0,
        multiplier: 0,
        finalStreak: 0
      };
    }

    const totalPayout = session.betAmount * session.multiplier;

    this.activeSessions.delete(sessionId);

    return {
      totalPayout,
      multiplier: session.multiplier,
      finalStreak: session.streak
    };
  }
}

export const hiloService = new HiloService();