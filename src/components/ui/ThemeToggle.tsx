
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useApp();
  
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full bg-white/80 backdrop-blur-sm shadow-soft border-gray-200"
      onClick={toggleTheme}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;
