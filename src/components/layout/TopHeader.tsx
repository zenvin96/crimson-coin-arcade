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
  X,
  Check,
  Copy,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import QRCode from "react-qr-code";
import ProfileDropdown from "./ProfileDropdown";
import LanguageSwitcher from "../ui/LanguageSwitcher";

// 加密货币列表
const cryptoCurrencies = [
  { code: "BTC", name: "Bitcoin", icon: "/bitcoin-btc-logo.svg" },
  { code: "ETH", name: "Ethereum", icon: "/ethereum-eth-logo.svg" },
  { code: "USDT", name: "Tether", icon: "/tether-usdt-logo.svg" },
];

// 存款加密货币选项
const depositCryptos = [
  { code: "ETH", name: "ETH", icon: "/ethereum-eth-logo.svg", selected: false },
  { code: "BTC", name: "BTC", icon: "/bitcoin-btc-logo.svg", selected: false },
  { code: "USDT", name: "USDT", icon: "/tether-usdt-logo.svg", selected: true },
];

const TopHeader = () => {
  const { t } = useTranslation();
  const {
    isSidebarOpen,
    isAuthenticated,
    notificationCount = 1,
    balance = 0,
  } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("crypto");
  const [selectedCrypto, setSelectedCrypto] = useState("USDT");
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");

  // 格式化余额显示
  const formatBalance = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 复制地址到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 可以添加提示复制成功的逻辑
      console.log(t("topHeader.addressCopied"));
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

  const depositAddress = "TPKyA6Gt7PFMt8Q8Yw5NDSBhtdA2QawEsZ";

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

          {/* 余额和存款按钮组合 */}
          <div className="flex items-center">
            <DropdownMenu
              modal={false}
              onOpenChange={(open) => {
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
                        $ {formatBalance(0.0)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-card border border-gray-700 min-w-[200px] p-2"
                data-no-scroll-impact="true"
              >
                <DropdownMenuLabel className="px-2 py-1.5">
                  {t("topHeader.selectCurrency")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                {cryptoCurrencies.map((crypto) => (
                  <DropdownMenuItem
                    key={crypto.code}
                    className={`px-3 py-2 rounded hover:bg-gray-800 cursor-pointer ${
                      selectedCurrency === crypto.code
                        ? "bg-gray-800/80 border-l-2 border-primary"
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
                      <span className="ml-auto text-right text-gray-400">
                        ${formatBalance(0.0)}
                      </span>
                      <Badge className="h-5 w-5 rounded-full bg-gray-800 text-[10px] p-0 flex items-center justify-center">
                        0
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem className="px-3 py-2 rounded hover:bg-gray-800">
                  <div className="text-sm text-gray-400 flex items-center gap-2">
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

          {/* 消息图标 */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 relative"
            aria-label={t("topHeader.messages")}
          >
            <Mail className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary">
              1
            </Badge>
          </Button>

          {/* 礼物图标 */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 relative"
            aria-label={t("topHeader.gifts")}
          >
            <Gift className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary">
              1
            </Badge>
          </Button>

          {/* 通知图标 */}
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

          {/* 用户头像，替换为ProfileDropdown组件 */}
          <ProfileDropdown avatar="/images/avatar.png" username="User" />
        </div>
      </div>

      {/* 存款模态框 */}
      <Dialog open={depositModalOpen} onOpenChange={setDepositModalOpen}>
        <DialogContent className="bg-[#1e2124] border-gray-800 text-white p-0 max-w-[500px] max-h-[85vh] overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-800 flex justify-between items-center">
            <DialogTitle className="text-center flex-1 text-white">
              {t("topHeader.depositModalTitle")}
            </DialogTitle>
          </DialogHeader>

          {/* 标签页切换 */}
          <Tabs
            defaultValue="crypto"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full grid grid-cols-2 bg-transparent border-b border-gray-800">
              <TabsTrigger
                value="crypto"
                className={`py-2 rounded-none border-b-2 ${
                  activeTab === "crypto"
                    ? "border-primary text-white"
                    : "border-transparent text-gray-500"
                }`}
              >
                {t("topHeader.cryptoTab")}
              </TabsTrigger>
              <TabsTrigger
                value="fiat"
                className={`py-2 rounded-none border-b-2 ${
                  activeTab === "fiat"
                    ? "border-primary text-white"
                    : "border-transparent text-gray-500"
                }`}
              >
                {t("topHeader.fiatTab")}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(85vh-110px)]" type="always">
              <TabsContent value="crypto" className="p-4 space-y-4 mt-0">
                {/* 加密货币选择 */}
                <div className="flex space-x-2 pb-3">
                  {depositCryptos.map((crypto) => (
                    <button
                      key={crypto.code}
                      className={`flex items-center space-x-1 p-2 rounded-full ${
                        selectedCrypto === crypto.code
                          ? "bg-primary/10 border border-primary"
                          : "bg-gray-800 border border-gray-700"
                      }`}
                      onClick={() => setSelectedCrypto(crypto.code)}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        <img
                          src={crypto.icon}
                          alt={crypto.code}
                          className="w-6 h-6"
                        />
                      </div>
                      <span>{crypto.code}</span>
                    </button>
                  ))}
                  <button className="flex items-center space-x-1 p-2 rounded-full bg-gray-800 border border-gray-700">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                      +
                    </div>
                    <span>{t("topHeader.more")}</span>
                  </button>
                </div>

                {/* 表单区域 */}
                <div className="space-y-3 bg-[#282c30] rounded-md p-4">
                  {/* 存款货币选择 */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      {t("topHeader.depositCurrencyLabel")}
                    </label>
                    <Select defaultValue="USDT">
                      <SelectTrigger className="w-full bg-[#1e2124] border-gray-700 text-white">
                        <div className="flex items-center gap-2">
                          <img
                            src="/tether-usdt-logo.svg"
                            alt="USDT"
                            className="w-6 h-6"
                          />
                          <SelectValue placeholder="USDT" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e2124] border-gray-700 text-white">
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 网络选择 */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      {t("topHeader.chooseNetworkLabel")}
                    </label>
                    <Select defaultValue="tron">
                      <SelectTrigger className="w-full bg-[#1e2124] border-gray-700 text-white">
                        <SelectValue placeholder="Tron (TRC20)" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e2124] border-gray-700 text-white">
                        <SelectItem value="tron">Tron (TRC20)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 奖金选择 */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      {t("topHeader.chooseBonusLabel")}
                    </label>
                    <Select defaultValue="no_bonus">
                      <SelectTrigger className="w-full bg-[#1e2124] border-gray-700 text-white">
                        <SelectValue
                          placeholder={t("topHeader.depositWithoutBonus")}
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e2124] border-gray-700 text-white">
                        <SelectItem value="no_bonus">
                          {t("topHeader.depositWithoutBonus")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 奖金信息 */}
                  <div className="flex items-start gap-2 bg-[#1e2124] p-3 rounded-md border-l-4 border-primary">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {t("topHeader.bonusInfo")}
                      </p>
                      <a
                        href="#"
                        className="text-sm text-primary hover:underline"
                      >
                        {t("topHeader.bonusTerms")}
                      </a>
                    </div>
                    <button className="text-gray-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 存款地址 */}
                <div className="space-y-3 bg-[#282c30] rounded-md p-4">
                  <label className="text-sm text-gray-400 mb-1 block">
                    {t("topHeader.depositAddressLabel")}
                  </label>
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-32 h-32 bg-white p-2 rounded-md flex items-center justify-center">
                        <QRCode
                          value={depositAddress}
                          size={110}
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                          level="H"
                        />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <p className="text-sm text-primary break-all mb-2 flex-1">
                        {depositAddress}
                      </p>
                      <Button
                        onClick={() => copyToClipboard(depositAddress)}
                        className="w-full bg-[#1e2124] hover:bg-gray-700 border border-gray-700"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {t("topHeader.copyAddress")}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 底部警告 */}
                <div className="flex items-start gap-2 bg-[#1e2124] p-3 rounded-md border-l-4 border-primary">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-white">
                    {t("topHeader.depositWarning", {
                      currency: selectedCrypto,
                      minAmount: 1,
                    })}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="fiat" className="p-4">
                <div className="text-center text-gray-400 py-8">
                  <p>{t("topHeader.fiatNotAvailable")}</p>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default TopHeader;
