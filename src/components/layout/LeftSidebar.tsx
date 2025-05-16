import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  HeartHandshake,
  Users,
  HelpCircle,
  Settings,
  LogOut,
  Sparkles,
  Dice3,
  LayoutGrid,
  Clapperboard,
} from "lucide-react";
import Logo from "../ui/Logo";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

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
  const { t } = useTranslation();
  const { isSidebarOpen, toggleSidebar } = useApp();
  const [activeNav, setActiveNav] = useState("home");
  const navigate = useNavigate();

  const handleNavClick = (navId: string) => {
    setActiveNav(navId);

    // 根据导航ID进行路由跳转
    if (navId === "games") {
      navigate("/all-games");
    } else if (navId === "home") {
      navigate("/");
    } else if (navId === "tournaments") {
      navigate("/tournaments");
    } else if (navId === "originalGames") {
      navigate("/original-games");
    } else if (navId === "slotMachines") {
      navigate("/slot-machines");
    } else if (navId === "tableGames") {
      navigate("/table-games");
    } else if (navId === "liveCasino") {
      navigate("/live-casino");
    } else if (navId === "vip") {
      navigate("/vip");
    } else if (navId === "bonuses") {
      navigate("/bonuses");
    } else if (navId === "refer") {
      navigate("/refer-friends");
    } else if (navId === "promotions") {
      navigate("/promotions");
    } else if (navId === "support") {
      navigate("/support");
    } else if (navId === "settings") {
      navigate("/settings");
    } else if (navId === "logout") {
      // Logout logic might be different, e.g., calling a function
      // For now, let's assume it's a route or placeholder
      navigate("/logout");
    }
    // 其他路由跳转可以在这里添加...
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
            label={t("sidebar.home")}
            isActive={activeNav === "home"}
            onClick={() => handleNavClick("home")}
          />
          <NavItem
            icon={Menu}
            label={t("sidebar.allGames")}
            isActive={activeNav === "games"}
            onClick={() => handleNavClick("games")}
          />
          <NavItem
            icon={Trophy}
            label={t("sidebar.tournaments")}
            badge={t("sidebar.new")}
            badgeVariant="secondary"
            isActive={activeNav === "tournaments"}
            onClick={() => handleNavClick("tournaments")}
          />
          <NavItem
            icon={Sparkles}
            label={t("sidebar.originalGames")}
            isActive={activeNav === "originalGames"}
            onClick={() => handleNavClick("originalGames")}
          />
          <NavItem
            icon={Dice3}
            label={t("sidebar.slotMachines")}
            isActive={activeNav === "slotMachines"}
            onClick={() => handleNavClick("slotMachines")}
          />
          <NavItem
            icon={LayoutGrid}
            label={t("sidebar.tableGames")}
            isActive={activeNav === "tableGames"}
            onClick={() => handleNavClick("tableGames")}
          />
          <NavItem
            icon={Clapperboard}
            label={t("sidebar.liveCasino")}
            isActive={activeNav === "liveCasino"}
            onClick={() => handleNavClick("liveCasino")}
          />
        </div>

        {/* <div className="mt-6 mb-2 px-4">
          {isSidebarOpen && (
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              {t("sidebar.vipBenefits")}
            </p>
          )}
          <NavItem
            icon={Zap}
            label={t("sidebar.vipLevels")}
            isActive={activeNav === "vip"}
            onClick={() => handleNavClick("vip")}
          />
          <NavItem
            icon={Gift}
            label={t("sidebar.bonuses")}
            badge={2}
            badgeVariant="destructive"
            isActive={activeNav === "bonuses"}
            onClick={() => handleNavClick("bonuses")}
          />
        </div> */}

        <div className="mt-6 mb-2 px-4">
          {isSidebarOpen && (
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
              {t("sidebar.more")}
            </p>
          )}
          <NavItem
            icon={Users}
            label={t("sidebar.referFriends")}
            badge="2x"
            badgeVariant="outline"
            isActive={activeNav === "refer"}
            onClick={() => handleNavClick("refer")}
          />
          <NavItem
            icon={HeartHandshake}
            label={t("sidebar.promotions")}
            isActive={activeNav === "promotions"}
            onClick={() => handleNavClick("promotions")}
          />
        </div>
      </div>

      {/* Bottom Links */}
      <div className="p-3 border-t border-border">
        <NavItem
          icon={HelpCircle}
          label={t("sidebar.support")}
          onClick={() => handleNavClick("support")}
        />
        <NavItem
          icon={Settings}
          label={t("sidebar.settings")}
          onClick={() => handleNavClick("settings")}
        />
        <NavItem
          icon={LogOut}
          label={t("sidebar.logout")}
          onClick={() => handleNavClick("logout")}
        />
      </div>
    </aside>
  );
};

export default LeftSidebar;
