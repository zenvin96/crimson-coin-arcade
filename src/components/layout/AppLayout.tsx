import { useEffect, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import LeftSidebar from "./LeftSidebar";
import TopHeader from "./TopHeader";
import MobileNavigation from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import ThemeToggle from "../ui/ThemeToggle";
import useScrollbarFix from "@/hooks/useScrollbarFix";

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isSidebarOpen } = useApp();
  const isMobile = useIsMobile();
  const glowRef = useRef<HTMLDivElement>(null);

  // 使用滚动条修复hook
  useScrollbarFix();

  useEffect(() => {
    if (isMobile) return; // 不在移动设备上启用

    const handleMouseMove = (event: MouseEvent) => {
      if (glowRef.current) {
        requestAnimationFrame(() => {
          glowRef.current!.style.transform = `translate(-50%, -50%) translate(${event.clientX}px, ${event.clientY}px)`;
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]);

  return (
    <div className="flex min-h-screen bg-background ambient-container relative">
      {/* 鼠标跟随光晕效果 */}
      {!isMobile && <div ref={glowRef} className="mouse-follower-glow"></div>}

      {/* Ambient Glow Effects - 确保它们的z-index较低，不会遮挡内容 */}
      <div className="ambient-glow glow-top-right" style={{ zIndex: 0 }}></div>
      <div
        className="ambient-glow glow-bottom-left"
        style={{ zIndex: 0 }}
      ></div>
      <div className="ambient-glow glow-center" style={{ zIndex: 0 }}></div>

      {/* Left Sidebar - hidden on mobile */}
      {!isMobile && <LeftSidebar />}

      {/* Main Content - 确保内容有较高的z-index */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 pb-20 bg-background relative",
          isSidebarOpen && !isMobile ? "ml-64" : isMobile ? "ml-0" : "ml-16",
          (isMobile && "pt-0") || "pt-16" // Account for fixed header
        )}
        style={{ zIndex: 1 }}
      >
        {/* Top Header - hidden on mobile */}
        {!isMobile && <TopHeader />}

        {/* Page Content */}
        <div className="container max-w-7xl mx-auto p-4 md:p-6 relative">
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
