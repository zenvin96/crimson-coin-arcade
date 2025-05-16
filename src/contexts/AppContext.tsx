import { createContext, useState, useContext, useEffect } from "react";
import { AppContextType } from "./AppContextType";
import {
  ThemeType,
  CurrencyType,
  LanguageType,
  DisplayModeType,
} from "@/types/settings";
import { Game, Winner, Category, TokenPrice } from "@/types/game";

// Mock data for the application
const mockGames: Game[] = [
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

const mockWinners: Winner[] = [
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

const mockCategories: Category[] = [
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

const mockTokenPrices: TokenPrice[] = [
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

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 添加USDT图标链接和汇率对象
const USDT_ICON = "https://cryptologos.cc/logos/tether-usdt-logo.svg";

// 添加汇率数据 (USDT到其他货币的汇率)
const exchangeRates = {
  USD: 1, // 1 USDT = 1 USD
  EUR: 0.92, // 1 USDT = 0.92 EUR
  MYR: 4.35, // 1 USDT = 4.35 MYR
  BTC: 0.000017, // 1 USDT = 0.000017 BTC
  ETH: 0.00032, // 1 USDT = 0.00032 ETH
};

// Provider Component
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // Theme state
  const [theme, setTheme] = useState<ThemeType>("dark");
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Settings state
  const [currency, setCurrency] = useState<CurrencyType>("USDT");
  const [language, setLanguage] = useState<LanguageType>("EN");

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Game filtering state
  const [games] = useState<Game[]>(mockGames);
  const [filteredGames, setFilteredGames] = useState<Game[]>(mockGames);
  const [currentFilter, setCurrentFilter] = useState("all");

  // Mock data
  const [recentWinners] = useState<Winner[]>(mockWinners);
  const [categories] = useState<Category[]>(mockCategories);
  const [tokenPrices] = useState<TokenPrice[]>(mockTokenPrices);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Notification count
  const [notificationCount, _setNotificationCount] = useState(2);

  // 余额显示相关
  const [balance, setBalance] = useState<number>(1250.75); // 默认USDT余额
  const [displayMode, setDisplayMode] = useState<DisplayModeType>("crypto");

  // Filter games by category
  const filterGames = (category: string) => {
    setCurrentFilter(category);
    if (category === "all") {
      setFilteredGames(games);
    } else {
      setFilteredGames(games.filter((game) => game.category === category));
    }
  };

  // Mock login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          setIsAuthenticated(true);
          // 设置一个默认余额
          setBalance(1250.75);
          setIsLoading(false);
          resolve();
        } else {
          setIsLoading(false);
          reject(new Error("Invalid credentials"));
        }
      }, 1000);
    });
  };

  // Mock logout function
  const logout = () => {
    setIsAuthenticated(false);
    setBalance(0); // 清除余额
  };

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Apply theme to body
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Context value
  const value: AppContextType = {
    theme,
    toggleTheme,
    isSidebarOpen,
    toggleSidebar,
    currency,
    setCurrency,
    language,
    setLanguage,
    isAuthenticated,
    login,
    logout,
    games,
    filteredGames,
    filterGames,
    currentFilter,
    tokenPrices,
    recentWinners,
    categories,
    notificationCount,
    isLoading,

    // 余额相关
    balance,
    displayMode,
    setDisplayMode,
    exchangeRates,
    usdtIcon: USDT_ICON,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
