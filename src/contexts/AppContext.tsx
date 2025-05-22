import { createContext, useState, useEffect } from "react";
import { AppContextType } from "./AppContextType";
import {
  ThemeType,
  CurrencyType,
  LanguageType,
  DisplayModeType,
} from "@/types/settings";
import { Game, Winner, Category, TokenPrice } from "@/types/game";
import {
  mockGames,
  mockWinners,
  mockCategories,
  mockTokenPrices,
  USDT_ICON,
  exchangeRates,
} from "@/services/mockData";
import { AppContext } from "./app.context";

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
