import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  ChevronDown,
  Mail,
  Gift,
  Info,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import ProfileDropdown from "./ProfileDropdown";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import AuthButtons from "../ui/AuthButtons";
import DepositDialog from "../ui/DepositDialog";

// 加密货币列表
const cryptoCurrencies = [
  { code: "BTC", name: "Bitcoin", icon: "/bitcoin-btc-logo.svg" },
  { code: "ETH", name: "Ethereum", icon: "/ethereum-eth-logo.svg" },
  { code: "USDT", name: "Tether", icon: "/tether-usdt-logo.svg" },
];

const TopHeader = () => {
  const { t } = useTranslation();
  const {
    isSidebarOpen,
    isAuthenticated,
    notificationCount = 1,
    balance = 0,
  } = useApp();
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");

  // 格式化余额显示
  const formatBalance = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 获取当前选择的货币图标
  const getCurrencyIcon = (code: string) => {
    const crypto = cryptoCurrencies.find((c) => c.code === code);
    if (crypto && crypto.icon) {
      return <img src={crypto.icon} alt={crypto.name} className="w-6 h-6" />;
    }
    return null;
  };

  return (
    <header
      className={cn(
        "h-16 bg-card fixed top-0 right-0 flex items-center justify-between border-b border-border shadow-sm transition-all duration-300 z-10",
        isSidebarOpen ? "left-64" : "left-16"
      )}
    >
      <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* 左侧搜索栏 */}
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <div className="relative ml-2">
            <input
              type="text"
              placeholder={t("common.searchPlaceholder")}
              className="h-10 w-64 rounded-md bg-black/20 border border-gray-700 px-3 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* 右侧功能区 */}
        <div className="flex items-center gap-2">
          {/* 添加语言切换器 */}
          <LanguageSwitcher />

          {/* 余额和存款按钮组合 - 仅在登录后显示 */}
          {isAuthenticated && (
            <div className="flex items-center">
              <DropdownMenu
                modal={false}
                onOpenChange={(_open) => {
                  // 无论打开还是关闭，都确保滚动条保持可见
                  document.body.style.overflow = "auto";
                  document.body.style.paddingRight = "0";
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-white px-3 py-1 h-10 border border-gray-700 rounded-l-md bg-black/40"
                    onClick={() => {
                      // 点击触发器时确保滚动条保持可见
                      document.body.style.overflow = "auto";
                      document.body.style.paddingRight = "0";
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {getCurrencyIcon(selectedCurrency)}
                      <div className="flex items-center">
                        <span className="text-primary">
                          $ {formatBalance(balance)}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-neutral-900 border border-neutral-700 min-w-[200px] p-2"
                  data-no-scroll-impact="true"
                >
                  <DropdownMenuLabel className="px-2 py-1.5 text-white font-semibold">
                    {t("topHeader.selectCurrency")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 bg-neutral-700" />
                  {cryptoCurrencies.map((crypto) => (
                    <DropdownMenuItem
                      key={crypto.code}
                      className={`px-3 py-2 rounded hover:bg-neutral-800 cursor-pointer transition-colors ${
                        selectedCurrency === crypto.code
                          ? "bg-neutral-800 border-l-2 border-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedCurrency(crypto.code)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="flex-shrink-0 w-6 h-6 relative">
                          <img
                            src={crypto.icon}
                            alt={crypto.name}
                            className="w-6 h-6"
                          />
                        </span>
                        <span
                          className={`font-medium ${
                            selectedCurrency === crypto.code ? "text-primary" : ""
                          }`}
                        >
                          {crypto.code}
                        </span>
                        <span className="ml-auto text-right text-neutral-400">
                          ${formatBalance(balance)}
                        </span>
                        <Badge className="h-5 w-5 rounded-full bg-neutral-700 text-neutral-300 text-[10px] p-0 flex items-center justify-center">
                          0
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem className="px-3 py-2 rounded hover:bg-neutral-800 cursor-pointer transition-colors">
                    <div className="text-sm text-neutral-400 hover:text-white flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      {t("topHeader.viewCurrencies")}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Deposit按钮 - 现在作为组合按钮的一部分 */}
              <Button
                className="bg-primary hover:bg-primary/90 text-white font-medium h-10 rounded-l-none border-l-0"
                onClick={() => setDepositModalOpen(true)}
              >
                {t("topHeader.deposit")}
              </Button>
            </div>
          )}

          {/* 消息图标 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 relative"
                aria-label={t("topHeader.messages")}
              >
                <Mail className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-neutral-900 border-neutral-700" align="end">
              <DropdownMenuLabel className="text-white font-semibold">
                {t("topHeader.messages")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <ScrollArea className="h-[300px]">
                {/* Message 1 */}
                <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
                  <div className="flex gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">CS</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-white">Customer Support</p>
                        <span className="text-xs text-neutral-500">5m ago</span>
                      </div>
                      <p className="text-sm text-neutral-300 truncate">Welcome to CrimsonCoin! How can we help you today?</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                {/* Message 2 */}
                <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
                  <div className="flex gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-500 font-semibold">VIP</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-white">VIP Manager</p>
                        <span className="text-xs text-neutral-500">2h ago</span>
                      </div>
                      <p className="text-sm text-neutral-300 truncate">Your VIP status has been upgraded to Gold!</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                {/* Message 3 */}
                <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
                  <div className="flex gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-500 font-semibold">$</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-white">Payment Team</p>
                        <span className="text-xs text-neutral-500">1d ago</span>
                      </div>
                      <p className="text-sm text-neutral-300 truncate">Your withdrawal has been processed successfully</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </ScrollArea>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer justify-center transition-colors">
                <span className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">View All Messages</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 礼物图标 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 relative"
                aria-label={t("topHeader.gifts")}
              >
                <Gift className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary">
                  2
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-neutral-900 border-neutral-700" align="end">
              <DropdownMenuLabel className="text-white font-semibold">
                {t("topHeader.gifts")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <ScrollArea className="h-[300px]">
                {/* Gift 1 */}
                <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
                  <div className="flex gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Gift className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">Welcome Bonus</p>
                      <p className="text-sm text-neutral-300">100 Free Spins + $50 Bonus</p>
                      <Button className="mt-2 h-7 text-xs bg-primary hover:bg-primary/90">
                        Claim Now
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
                {/* Gift 2 */}
                <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
                  <div className="flex gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Gift className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">Daily Reward</p>
                      <p className="text-sm text-neutral-300">Login streak bonus: Day 7</p>
                      <Button className="mt-2 h-7 text-xs bg-amber-500 hover:bg-amber-500/90">
                        Collect
                      </Button>
                    </div>
                  </div>
                </DropdownMenuItem>
              </ScrollArea>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer justify-center transition-colors">
                <span className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">View All Gifts</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 通知图标 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 relative"
                aria-label={t("topHeader.notifications")}
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary">
                  {notificationCount}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-neutral-900 border-neutral-700" align="end">
              <DropdownMenuLabel className="text-white font-semibold">
                {t("topHeader.notifications")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <ScrollArea className="h-[300px]">
                {/* Notification 1 */}
                <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
                  <div className="flex gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-white">Deposit Successful</p>
                        <span className="text-xs text-neutral-500">Just now</span>
                      </div>
                      <p className="text-sm text-neutral-300">Your deposit of $100 USDT has been confirmed</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                {/* Notification 2 */}
                <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
                  <div className="flex gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-white">Tournament Starting</p>
                        <span className="text-xs text-neutral-500">10m ago</span>
                      </div>
                      <p className="text-sm text-neutral-300">Weekend Slots Tournament starts in 1 hour</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </ScrollArea>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer justify-center transition-colors">
                <span className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">View All Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 根据认证状态显示 AuthButtons 或 ProfileDropdown */}
          {isAuthenticated ? <ProfileDropdown /> : <AuthButtons />}
        </div>
      </div>

      {/* 存款模态框 */}
      <DepositDialog 
        open={depositModalOpen} 
        onOpenChange={setDepositModalOpen} 
      />
    </header>
  );
};

export default TopHeader;
