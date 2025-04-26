import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  Trophy,
  Gift,
  Zap,
  CircleDollarSign,
  Wallet,
  HeartHandshake,
  Users,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";
import Logo from "../ui/Logo";
import { Badge } from "@/components/ui/badge";

type NavItemProps = {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  badge?: string | number;
  badgeVariant?: "default" | "outline" | "secondary" | "destructive";
  onClick?: () => void;
};

const NavItem = ({
  icon: Icon,
  label,
  isActive = false,
  badge,
  badgeVariant = "default",
  onClick,
}: NavItemProps) => {
  const { isSidebarOpen } = useApp();

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 mb-1 group",
        isActive
          ? "bg-primary-light text-primary-dark hover:bg-primary-light"
          : "hover:bg-primary-light/10",
        isSidebarOpen ? "px-4 py-2" : "px-3 py-2 justify-center"
      )}
      onClick={onClick}
    >
      <Icon
        className={cn(
          "h-5 w-5",
          isActive ? "text-primary-dark" : "text-gray-600"
        )}
      />
      {isSidebarOpen && (
        <span className="text-sm font-medium flex-1 text-left">{label}</span>
      )}
      {badge && isSidebarOpen && (
        <Badge variant={badgeVariant} className="ml-auto">
          {badge}
        </Badge>
      )}
    </Button>
  );
};

const LeftSidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useApp();
  const [activeNav, setActiveNav] = useState("home");

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
  };

  return (
    <aside
      className={cn(
        "h-screen bg-card fixed left-0 flex flex-col border-r border-border shadow-soft transition-all duration-300 z-20",
        isSidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div
          className={cn(
            "transition-opacity",
            isSidebarOpen ? "opacity-100" : "opacity-0 hidden"
          )}
        >
          <Logo size="sm" />
        </div>
        {!isSidebarOpen && (
          <div className="mx-auto">
            <Logo size="icon" />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-muted"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-2 px-3">
        <div className="space-y-1">
          <NavItem
            icon={Home}
            label="Home"
            isActive={activeNav === "home"}
            onClick={() => handleNavClick("home")}
          />
          <NavItem
            icon={Menu}
            label="All Games"
            isActive={activeNav === "games"}
            onClick={() => handleNavClick("games")}
          />
          <NavItem
            icon={Trophy}
            label="Tournaments"
            badge="New"
            badgeVariant="secondary"
            isActive={activeNav === "tournaments"}
            onClick={() => handleNavClick("tournaments")}
          />
        </div>

        <div className="mt-6 mb-2 px-4">
          {isSidebarOpen && (
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              VIP Benefits
            </p>
          )}
          <NavItem
            icon={Zap}
            label="VIP Levels"
            isActive={activeNav === "vip"}
            onClick={() => handleNavClick("vip")}
          />
          <NavItem
            icon={Gift}
            label="Bonuses"
            badge={2}
            badgeVariant="destructive"
            isActive={activeNav === "bonuses"}
            onClick={() => handleNavClick("bonuses")}
          />
        </div>

        <div className="mt-6 mb-2 px-4">
          {isSidebarOpen && (
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              Banking
            </p>
          )}
          <NavItem
            icon={Wallet}
            label="Deposit"
            isActive={activeNav === "deposit"}
            onClick={() => handleNavClick("deposit")}
          />
          <NavItem
            icon={CircleDollarSign}
            label="Withdraw"
            isActive={activeNav === "withdraw"}
            onClick={() => handleNavClick("withdraw")}
          />
        </div>

        <div className="mt-6 mb-2 px-4">
          {isSidebarOpen && (
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              More
            </p>
          )}
          <NavItem
            icon={Users}
            label="Refer Friends"
            badge="2x"
            badgeVariant="outline"
            isActive={activeNav === "refer"}
            onClick={() => handleNavClick("refer")}
          />
          <NavItem
            icon={HeartHandshake}
            label="Promotions"
            isActive={activeNav === "promotions"}
            onClick={() => handleNavClick("promotions")}
          />
        </div>
      </div>

      {/* Bottom Links */}
      <div className="p-3 border-t border-border">
        <NavItem
          icon={HelpCircle}
          label="Support"
          onClick={() => handleNavClick("support")}
        />
        <NavItem
          icon={Settings}
          label="Settings"
          onClick={() => handleNavClick("settings")}
        />
        <NavItem
          icon={LogOut}
          label="Logout"
          onClick={() => handleNavClick("logout")}
        />
      </div>
    </aside>
  );
};

export default LeftSidebar;
