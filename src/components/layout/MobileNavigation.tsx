import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Home, Search, Menu, Bell, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import Logo from "../ui/Logo";

const MobileNavigation = () => {
  const { t } = useTranslation();
  const { notificationCount, isAuthenticated } = useApp();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      {/* Mobile bottom navigation */}
      <div className="flex items-center justify-around h-16 px-2">
        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center gap-1 text-foreground"
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">{t("mobileNav.home")}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center gap-1 text-foreground"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">{t("mobileNav.search")}</span>
        </Button>

        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col items-center gap-1 text-foreground"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs">{t("mobileNav.menu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[85%] sm:w-[385px] bg-background"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border">
                <Logo size="md" />
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">
                    {t("mobileNav.mainMenu")}
                  </h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Home className="h-5 w-5 mr-2" /> {t("mobileNav.home")}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Menu className="h-5 w-5 mr-2" />{" "}
                      {t("mobileNav.allGames")}
                    </Button>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">
                      {t("mobileNav.account")}
                    </h3>
                    <div className="flex flex-col gap-2">
                      <Button className="gradient-button w-full">
                        {t("mobileNav.signUp")}
                      </Button>
                      <Button variant="outline" className="w-full">
                        {t("mobileNav.signIn")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center gap-1 text-foreground relative"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 right-0 h-4 w-4 p-0 flex items-center justify-center bg-red-500">
              {notificationCount}
            </Badge>
          )}
          <span className="text-xs">{t("mobileNav.alerts")}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center gap-1 text-foreground"
        >
          <User className="h-5 w-5" />
          <span className="text-xs">{t("mobileNav.account")}</span>
        </Button>
      </div>

      {/* Mobile Search Input */}
      {showSearch && (
        <div className="bg-background p-4 border-t border-border">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="search"
              placeholder={t("mobileNav.searchGamesPlaceholder")}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-muted border-none focus:ring-primary/30"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;
