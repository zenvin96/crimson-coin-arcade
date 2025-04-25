
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  Menu, 
  Bell, 
  User
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import Logo from "../ui/Logo";
import AuthButtons from "../ui/AuthButtons";
import TokenPriceTracker from "../ui/TokenPriceTracker";

const MobileNavigation = () => {
  const { notificationCount, isAuthenticated } = useApp();
  const [showSearch, setShowSearch] = useState(false);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40">
      {/* Mobile bottom navigation */}
      <div className="flex items-center justify-around h-16 px-2">
        <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 text-gray-600">
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="flex flex-col items-center gap-1 text-gray-600"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">Search</span>
        </Button>
        
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 text-gray-600">
              <Menu className="h-5 w-5" />
              <span className="text-xs">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:w-[385px]">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-100">
                <Logo size="md" />
              </div>
              
              <div className="p-4 border-b border-gray-100">
                <TokenPriceTracker />
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Main Menu</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Home className="h-5 w-5 mr-2" /> Home
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Menu className="h-5 w-5 mr-2" /> All Games
                    </Button>
                  </div>
                </div>
                
                {!isAuthenticated && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Account</h3>
                    <div className="flex flex-col gap-2">
                      <Button className="gradient-button w-full">Sign Up</Button>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 text-gray-600 relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 right-0 h-4 w-4 p-0 flex items-center justify-center bg-red-500">
              {notificationCount}
            </Badge>
          )}
          <span className="text-xs">Alerts</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="flex flex-col items-center gap-1 text-gray-600">
          <User className="h-5 w-5" />
          <span className="text-xs">Account</span>
        </Button>
      </div>
      
      {/* Mobile Search Input */}
      {showSearch && (
        <div className="bg-white p-4 border-t border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search games..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-gray-100 border-none focus:ring-primary/30"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;
