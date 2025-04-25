import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types
export type ThemeType = "light" | "dark";
export type CurrencyType = "MYR" | "USD" | "EUR" | "BTC" | "ETH";
export type LanguageType = "EN" | "ZH" | "MS" | "TH";

export type TokenPrice = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: string;
};

export type Game = {
  id: string;
  title: string;
  image: string;
  category: string;
  provider: string;
  isHot?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
};

export type Winner = {
  id: string;
  username: string;
  avatar: string;
  game: {
    id: string;
    title: string;
    image: string;
  };
  amount: number;
  currency: string;
  timestamp: Date;
};

export type Category = {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
};

type AppContextType = {
  theme: ThemeType;
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  games: Game[];
  filteredGames: Game[];
  filterGames: (category: string) => void;
  currentFilter: string;
  tokenPrices: TokenPrice[];
  recentWinners: Winner[];
  categories: Category[];
  notificationCount: number;
  isLoading: boolean;
};

const defaultContext: AppContextType = {
  theme: "dark",
  toggleTheme: () => {},
  isSidebarOpen: true,
  toggleSidebar: () => {},
  currency: "MYR",
  setCurrency: () => {},
  language: "EN",
  setLanguage: () => {},
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  games: [],
  filteredGames: [],
  filterGames: () => {},
  currentFilter: "all",
  tokenPrices: [],
  recentWinners: [],
  categories: [],
  notificationCount: 0,
  isLoading: false,
};

const AppContext = createContext<AppContextType>(defaultContext);

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currency, setCurrency] = useState<CurrencyType>("MYR");
  const [language, setLanguage] = useState<LanguageType>("EN");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Login function
  const login = async (email: string, password: string) => {
    // Simulate API call
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
  };

  // Filter games
  const filterGames = (category: string) => {
    setCurrentFilter(category);
    if (category === "all") {
      setFilteredGames(games);
    } else {
      setFilteredGames(games.filter(game => game.category === category));
    }
  };

  // Load mock data
  useEffect(() => {
    const loadMockData = async () => {
      setIsLoading(true);

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
          new Date(Date.now() - 1000 * 60), // 1 minute ago
          new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
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
        { 
          id: "slots", 
          title: "Slots", 
          description: "Classic and video slots with exciting themes", 
          icon: "slots", 
          slug: "slots" 
        },
        { 
          id: "table", 
          title: "Table Games", 
          description: "Poker, Blackjack, Roulette and more", 
          icon: "table", 
          slug: "table" 
        },
        { 
          id: "live", 
          title: "Live Casino", 
          description: "Real-time games with live dealers", 
          icon: "live", 
          slug: "live" 
        },
        { 
          id: "jackpot", 
          title: "Jackpots", 
          description: "Progressive jackpot games with huge prizes", 
          icon: "jackpot", 
          slug: "jackpot" 
        },
        { 
          id: "originals", 
          title: "Originals", 
          description: "Exclusive games only found on our platform", 
          icon: "originals", 
          slug: "originals" 
        },
        { 
          id: "sports", 
          title: "Sports", 
          description: "Sports betting with competitive odds", 
          icon: "sports", 
          slug: "sports" 
        }
      ];

      // Set data with a slight delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTokenPrices(mockTokenPrices);
      setGames(mockGames);
      setFilteredGames(mockGames);
      setRecentWinners(mockWinners);
      setCategories(mockCategories);
      setIsLoading(false);
    };

    loadMockData();
  }, []);

  // Add initial theme setup
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const value = {
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
    isLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
