
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import LeftSidebar from "./LeftSidebar";
import TopHeader from "./TopHeader";
import MobileNavigation from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "../ui/ThemeToggle";

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isSidebarOpen } = useApp();
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      {/* Left Sidebar - hidden on mobile */}
      {!isMobile && <LeftSidebar />}
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 pb-20",
        isSidebarOpen && !isMobile ? "ml-64" : isMobile ? "ml-0" : "ml-16",
        isMobile && "pt-0" || "pt-16" // Account for fixed header
      )}>
        {/* Top Header - hidden on mobile */}
        {!isMobile && <TopHeader />}
        
        {/* Page Content */}
        <div className="container max-w-7xl mx-auto p-4 md:p-6">
          {children}
        </div>
        
        {/* Theme Toggle */}
        <div className="fixed bottom-20 right-4 md:bottom-4 md:right-4 z-10">
          <ThemeToggle />
        </div>
      </main>
      
      {/* Mobile Navigation - visible only on mobile */}
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default AppLayout;
