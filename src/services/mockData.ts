
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

  // Mock winners with diverse data
  const mockWinners: Winner[] = Array(20).fill(null).map((_, index) => {
    const usernames = [
      "scarav***", "Slelusj***", "Hidden", "Melting***", "Hidden",
      "Mtrwnf***", "JobyBo***", "Uldilixl***", "scarav***", "Player123",
      "CryptoKing", "LuckyGambler", "BitHunter", "WinnerPro", "GamerX"
    ];
    
    const games = [
      { title: "Plinko", category: "originals" },
      { title: "Lucky Ace Casino", category: "live" },
      { title: "Eye Of Spartania", category: "slots" },
      { title: "PIGGY OUTSOURCED", category: "slots" },
      { title: "Keno", category: "originals" },
      { title: "Sugar Rush 1000", category: "slots" },
      { title: "Shellsy's Megaways", category: "slots" },
      { title: "Duck Hunters", category: "slots" },
      { title: "Video Poker", category: "table" },
      { title: "Live Roulette", category: "live" },
      { title: "Lion's Fortune", category: "jackpot" },
      { title: "Bonanza", category: "slots" },
      { title: "Chicken Rush", category: "originals" },
    ];
    
    const currencies = ["BTC", "USDT", "ETH", "USDT", "BTC", "ETH", "USDT", "BTC"];
    const currency = currencies[index % currencies.length];
    
    // Different amounts based on currency
    let amount: number;
    if (currency === "BTC") {
      amount = parseFloat((Math.random() * 2 + 0.1).toFixed(4)); // 0.1 - 2.1 BTC
    } else if (currency === "ETH") {
      amount = parseFloat((Math.random() * 50 + 1).toFixed(4)); // 1 - 51 ETH
    } else {
      amount = parseFloat((Math.random() * 5000 + 100).toFixed(2)); // 100 - 5100 USDT
    }
    
    const gameIndex = index % games.length;
    const isHidden = index % 3 === 2; // Every third winner is hidden

    return {
      id: `win-${index + 1}`,
      username: isHidden ? "Hidden" : usernames[index % usernames.length],
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${index}`,
      game: {
        id: `game-${gameIndex + 1}`,
        title: games[gameIndex].title,
        image: `https://picsum.photos/seed/${gameIndex + 200}/300/200`,
        category: games[gameIndex].category,
      },
      amount: amount,
      currency: currency,
      timestamp: new Date(Date.now() - 1000 * 60 * (index + 1)),
      isHidden: isHidden,
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
