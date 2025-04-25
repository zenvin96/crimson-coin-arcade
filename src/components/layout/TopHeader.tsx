
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Bell, 
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthButtons from "../ui/AuthButtons";
import { Badge } from "@/components/ui/badge";

const languages = [
  { code: "EN", name: "English" },
  { code: "ZH", name: "Chinese" },
  { code: "MS", name: "Malay" },
  { code: "TH", name: "Thai" }
];

const currencies = [
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "BTC", symbol: "₿", name: "Bitcoin" },
  { code: "ETH", symbol: "Ξ", name: "Ethereum" },
];

const TopHeader = () => {
  const { 
    isSidebarOpen, 
    currency,
    setCurrency,
    language,
    setLanguage,
    notificationCount,
    isAuthenticated
  } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);

  const currentLanguage = languages.find(l => l.code === language);
  const currentCurrency = currencies.find(c => c.code === currency);

  return (
    <header className={cn(
      "h-16 bg-white fixed top-0 right-0 flex items-center justify-between border-b border-gray-100 shadow-sm transition-all duration-300 z-10",
      isSidebarOpen ? "left-64" : "left-16"
    )}>
      {/* Left side */}
      <div className="flex items-center px-4">
        {/* Search */}
        <div className={cn(
          "relative flex items-center transition-all",
          searchOpen ? "w-64" : "w-10"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 text-gray-500"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <input 
            type="text" 
            placeholder="Search games..." 
            className={cn(
              "h-9 pl-10 rounded-full bg-gray-100 border-none focus:ring-primary/20 transition-all",
              searchOpen ? "w-full opacity-100" : "w-0 opacity-0"
            )}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 pr-6">
        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm font-medium flex items-center gap-1"
            >
              {currentLanguage?.code}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white">
            <DropdownMenuLabel>Select Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {languages.map((lang) => (
              <DropdownMenuItem 
                key={lang.code}
                onClick={() => setLanguage(lang.code as any)}
                className={cn(
                  "cursor-pointer",
                  language === lang.code && "bg-primary-light/20"
                )}
              >
                {lang.name} ({lang.code})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Currency Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm font-medium flex items-center gap-1"
            >
              {currentCurrency?.code}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white">
            <DropdownMenuLabel>Select Currency</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {currencies.map((curr) => (
              <DropdownMenuItem 
                key={curr.code}
                onClick={() => setCurrency(curr.code as any)}
                className={cn(
                  "cursor-pointer",
                  currency === curr.code && "bg-primary-light/20"
                )}
              >
                <span className="mr-2 font-mono">{curr.symbol}</span> 
                {curr.name} ({curr.code})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-white">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Welcome Bonus</span>
                <span className="text-xs text-gray-500">Claim your 100% welcome bonus now!</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Weekend Tournament</span>
                <span className="text-xs text-gray-500">Join our weekend slots tournament!</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col">
                <span className="font-medium">Account Verification</span>
                <span className="text-xs text-gray-500">Please verify your account.</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              View All Notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Auth Buttons */}
        <AuthButtons />
      </div>
    </header>
  );
};

export default TopHeader;
