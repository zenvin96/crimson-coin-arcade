
import { Game, Winner, Category, TokenPrice } from "@/types/game";

export const generateMockData = () => {
  // Mock token prices
  const mockTokenPrices: TokenPrice[] = [
    { id: "btc", name: "Bitcoin", symbol: "BTC", price: 63245.78, change24h: 2.4, icon: "bitcoin" },
    { id: "eth", name: "Ethereum", symbol: "ETH", price: 3089.42, change24h: -1.2, icon: "ethereum" },
    { id: "bnb", name: "Binance Coin", symbol: "BNB", price: 564.23, change24h: 0.8, icon: "bnb" },
    { id: "xrp", name: "Ripple", symbol: "XRP", price: 0.5642, change24h: -2.3, icon: "xrp" },
    { id: "usdt", name: "Tether", symbol: "USDT", price: 1.00, change24h: 0.01, icon: "usdt" },
  ];

  // Mock games
  const mockGames: Game[] = Array(24).fill(null).map((_, index) => {
    const categories = ["slots", "originals", "table", "live", "jackpot"];
    const providers = ["NetEnt", "Microgaming", "Playtech", "Evolution", "Pragmatic Play"];
    
    return {
      id: `game-${index + 1}`,
      title: `Game ${index + 1}`,
      image: `https://picsum.photos/seed/${index + 100}/300/200`,
      category: categories[index % categories.length],
      provider: providers[index % providers.length],
      isHot: index % 5 === 0,
      isNew: index % 7 === 0,
      isFavorite: false,
    };
  });

  // Mock winners
  const mockWinners: Winner[] = Array(10).fill(null).map((_, index) => {
    const usernames = ["Player1", "CryptoWin", "GamerPro", "LuckyGamer", "BitHunter"];
    const amounts = [1250.75, 489.50, 2570.25, 860.30, 1025.40];
    const timestamps = [
      new Date(Date.now() - 1000 * 60),
      new Date(Date.now() - 1000 * 60 * 5),
      new Date(Date.now() - 1000 * 60 * 15),
      new Date(Date.now() - 1000 * 60 * 30),
      new Date(Date.now() - 1000 * 60 * 60),
    ];

    return {
      id: `win-${index + 1}`,
      username: usernames[index % usernames.length],
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${index}`,
      game: {
        id: `game-${(index % 5) + 1}`,
        title: `Game ${(index % 5) + 1}`,
        image: `https://picsum.photos/seed/${(index % 5) + 200}/300/200`,
      },
      amount: amounts[index % amounts.length],
      currency: "MYR",
      timestamp: timestamps[index % timestamps.length],
    };
  });

  // Mock categories
  const mockCategories: Category[] = [
    { id: "slots", title: "Slots", description: "Classic and video slots with exciting themes", icon: "slots", slug: "slots" },
    { id: "table", title: "Table Games", description: "Poker, Blackjack, Roulette and more", icon: "table", slug: "table" },
    { id: "live", title: "Live Casino", description: "Real-time games with live dealers", icon: "live", slug: "live" },
    { id: "jackpot", title: "Jackpots", description: "Progressive jackpot games with huge prizes", icon: "jackpot", slug: "jackpot" },
    { id: "originals", title: "Originals", description: "Exclusive games only found on our platform", icon: "originals", slug: "originals" },
    { id: "sports", title: "Sports", description: "Sports betting with competitive odds", icon: "sports", slug: "sports" }
  ];

  return {
    tokenPrices: mockTokenPrices,
    games: mockGames,
    winners: mockWinners,
    categories: mockCategories,
  };
};

// Data previously in AppContext.tsx
export const mockGames = [
  {
    id: "game1",
    title: "Lucky Fortune",
    image: "https://picsum.photos/seed/game1/300/200",
    category: "slots",
    provider: "CrimsonGames",
    isHot: true,
    isNew: false,
  },
  {
    id: "game2",
    title: "Dragon's Treasure",
    image: "https://picsum.photos/seed/game2/300/200",
    category: "slots",
    provider: "AzurePlay",
    isHot: false,
    isNew: true,
  },
  {
    id: "game3",
    title: "Golden Poker",
    image: "https://picsum.photos/seed/game3/300/200",
    category: "table",
    provider: "RoyalGaming",
    isHot: true,
    isNew: false,
  },
  {
    id: "game4",
    title: "Live Roulette",
    image: "https://picsum.photos/seed/game4/300/200",
    category: "live",
    provider: "LuxuryLive",
    isHot: false,
    isNew: false,
  },
  {
    id: "game5",
    title: "Mega Jackpot",
    image: "https://picsum.photos/seed/game5/300/200",
    category: "jackpot",
    provider: "JackpotKings",
    isHot: true,
    isNew: false,
  },
  {
    id: "game6",
    title: "Crimson Spin",
    image: "https://picsum.photos/seed/game6/300/200",
    category: "originals",
    provider: "CrimsonGames",
    isHot: false,
    isNew: true,
  },
  {
    id: "game7",
    title: "Sports Betting Pro",
    image: "https://picsum.photos/seed/game7/300/200",
    category: "sports",
    provider: "BetMasters",
    isHot: true,
    isNew: true,
  },
  {
    id: "game8",
    title: "Classic Blackjack",
    image: "https://picsum.photos/seed/game8/300/200",
    category: "table",
    provider: "RoyalGaming",
    isHot: false,
    isNew: false,
  },
  {
    id: "game9",
    title: "Fortune Wheel",
    image: "https://picsum.photos/seed/game9/300/200",
    category: "originals",
    provider: "CrimsonGames",
    isHot: true,
    isNew: false,
  },
  {
    id: "game10",
    title: "Crypto Slots",
    image: "https://picsum.photos/seed/game10/300/200",
    category: "slots",
    provider: "BitPlay",
    isHot: false,
    isNew: true,
  },
  {
    id: "game11",
    title: "VIP Baccarat",
    image: "https://picsum.photos/seed/game11/300/200",
    category: "live",
    provider: "LuxuryLive",
    isHot: true,
    isNew: false,
  },
  {
    id: "game12",
    title: "Progressive Jackpot",
    image: "https://picsum.photos/seed/game12/300/200",
    category: "jackpot",
    provider: "JackpotKings",
    isHot: false,
    isNew: false,
  },
  {
    id: "game13",
    title: "Sports Live Betting",
    image: "https://picsum.photos/seed/game13/300/200",
    category: "sports",
    provider: "BetMasters",
    isHot: true,
    isNew: false,
  },
  {
    id: "game14",
    title: "Mystery Slots",
    image: "https://picsum.photos/seed/game14/300/200",
    category: "slots",
    provider: "AzurePlay",
    isHot: false,
    isNew: true,
  },
  {
    id: "game15",
    title: "Live Dealer Holdem",
    image: "https://picsum.photos/seed/game15/300/200",
    category: "live",
    provider: "LuxuryLive",
    isHot: false,
    isNew: false,
  },
];

export const mockWinners: Winner[] = [
  {
    id: "win1",
    username: "CryptoKing",
    avatar: "https://picsum.photos/seed/avatar1/100",
    game: {
      id: "game1",
      title: "Lucky Fortune",
      image: "https://picsum.photos/seed/game1/100",
    },
    amount: 12500,
    currency: "MYR",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "win2",
    username: "BTCBaron",
    avatar: "https://picsum.photos/seed/avatar2/100",
    game: {
      id: "game5",
      title: "Mega Jackpot",
      image: "https://picsum.photos/seed/game5/100",
    },
    amount: 45750,
    currency: "MYR",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: "win3",
    username: "EtherQueen",
    avatar: "https://picsum.photos/seed/avatar3/100",
    game: {
      id: "game3",
      title: "Golden Poker",
      image: "https://picsum.photos/seed/game3/100",
    },
    amount: 8900,
    currency: "MYR",
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
  },
  {
    id: "win4",
    username: "CoinCollector",
    avatar: "https://picsum.photos/seed/avatar4/100",
    game: {
      id: "game9",
      title: "Fortune Wheel",
      image: "https://picsum.photos/seed/game9/100",
    },
    amount: 23100,
    currency: "MYR",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
  },
  {
    id: "win5",
    username: "TokenTiger",
    avatar: "https://picsum.photos/seed/avatar5/100",
    game: {
      id: "game7",
      title: "Sports Betting Pro",
      image: "https://picsum.photos/seed/game7/100",
    },
    amount: 35000,
    currency: "MYR",
    timestamp: new Date(Date.now() - 1000 * 60 * 32),
  },
];

export const mockCategories: Category[] = [
  {
    id: "slots",
    title: "Slot Games",
    description: "Spin to win on hundreds of exciting slot machines",
    icon: "slots",
    slug: "slots",
  },
  {
    id: "table",
    title: "Table Games",
    description: "Classic casino favorites like Blackjack and Roulette",
    icon: "table",
    slug: "table-games",
  },
  {
    id: "live",
    title: "Live Casino",
    description: "Real-time games with professional live dealers",
    icon: "live",
    slug: "live-casino",
  },
  {
    id: "jackpot",
    title: "Jackpot Games",
    description: "Massive progressive jackpots waiting to be won",
    icon: "jackpot",
    slug: "jackpots",
  },
  {
    id: "originals",
    title: "Our Originals",
    description: "Exclusive games you won't find anywhere else",
    icon: "originals",
    slug: "exclusive-games",
  },
  {
    id: "sports",
    title: "Sports Betting",
    description: "Bet on your favorite teams and sports events",
    icon: "sports",
    slug: "sports",
  },
];

export const mockTokenPrices: TokenPrice[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    price: 58432.21,
    change24h: 2.5,
    icon: "bitcoin",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    price: 3201.45,
    change24h: 1.8,
    icon: "ethereum",
  },
  {
    id: "bnb",
    name: "Binance Coin",
    symbol: "BNB",
    price: 502.36,
    change24h: -0.7,
    icon: "binance",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    price: 143.82,
    change24h: 5.2,
    icon: "solana",
  },
  {
    id: "ada",
    name: "Cardano",
    symbol: "ADA",
    price: 0.56,
    change24h: -1.2,
    icon: "cardano",
  },
];

export const USDT_ICON = "https://cryptologos.cc/logos/tether-usdt-logo.svg";

export const exchangeRates = {
  USD: 1, // 1 USDT = 1 USD
  EUR: 0.92, // 1 USDT = 0.92 EUR
  MYR: 4.35, // 1 USDT = 4.35 MYR
  BTC: 0.000017, // 1 USDT = 0.000017 BTC
  ETH: 0.00032, // 1 USDT = 0.00032 ETH
};
