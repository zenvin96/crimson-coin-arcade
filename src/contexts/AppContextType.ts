import {
  ThemeType,
  CurrencyType,
  LanguageType,
  DisplayModeType,
} from "@/types/settings";
import { Game, Winner, Category, TokenPrice } from "@/types/game";

export type AppContextType = {
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

  // 余额相关
  balance: number;
  displayMode: DisplayModeType;
  setDisplayMode: (mode: DisplayModeType) => void;
  exchangeRates: Record<string, number>;
  // USDT图标
  usdtIcon: string;
};
