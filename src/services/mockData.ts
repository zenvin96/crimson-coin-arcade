
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
