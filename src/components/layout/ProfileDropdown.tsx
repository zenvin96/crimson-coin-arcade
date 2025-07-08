import {
  ArrowDown,
  BarChart3,
  Clock,
  Crown,
  Lock,
  LogOut,
  Settings,
  User,
  Wallet,
  PieChart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/contexts/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

const ProfileDropdown = () => {
  const { t } = useTranslation();
  const { logout } = useApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="h-12 w-12 rounded-full flex items-center justify-center text-white cursor-pointer border-2 border-pink-500 hover:border-pink-400 transition-colors">
          <User className="h-5 w-5" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-neutral-900 border-neutral-700" align="end">
        <DropdownMenuLabel className="text-white font-semibold">
          {t("profileDropdown.myAccount", "My Account")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-700" />
        
        {/* User Info Section */}
        <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
          <div className="flex gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">User123456</p>
              <p className="text-sm text-neutral-300">user@example.com</p>
              <p className="text-xs text-primary mt-1">VIP Gold Member</p>
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-neutral-700" />
        
        <ScrollArea className="h-[400px]">
          {/* Wallet */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <Wallet className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.wallet")}</span>
            </div>
          </DropdownMenuItem>
          
          {/* Withdraw */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <ArrowDown className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.withdraw", "Withdraw")}</span>
            </div>
          </DropdownMenuItem>
          
          {/* Transactions */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <BarChart3 className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.transactions", "Transactions")}</span>
            </div>
          </DropdownMenuItem>
          
          {/* Bet History */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <Clock className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.betHistory", "Bet History")}</span>
            </div>
          </DropdownMenuItem>
          
          {/* Rollover Overview */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <PieChart className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.rolloverOverview", "Rollover Overview")}</span>
            </div>
          </DropdownMenuItem>
          
          {/* VIP Club */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <Crown className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.vipClub")}</span>
            </div>
          </DropdownMenuItem>
          
          {/* Vault Pro */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <Lock className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.vaultPro", "Vault Pro")}</span>
            </div>
          </DropdownMenuItem>
          
          {/* Affiliate */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <BarChart3 className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.affiliate", "Affiliate")}</span>
            </div>
          </DropdownMenuItem>
          
          {/* My Profile */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <User className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.myProfile")}</span>
            </div>
          </DropdownMenuItem>
          
          {/* Settings */}
          <DropdownMenuItem className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors">
            <div className="flex items-center gap-3 w-full">
              <Settings className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-300">{t("profileDropdown.settings")}</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-neutral-700" />
          
          {/* Logout */}
          <DropdownMenuItem 
            className="p-3 hover:bg-neutral-800 cursor-pointer transition-colors"
            onClick={() => logout()}
          >
            <div className="flex items-center gap-3 w-full">
              <LogOut className="h-5 w-5 text-red-400" />
              <span className="text-sm text-red-400">{t("profileDropdown.logout")}</span>
            </div>
          </DropdownMenuItem>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
