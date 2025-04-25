
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
};

const Logo = ({ size = "md", className }: LogoProps) => {
  const iconOnly = size === "icon";
  
  return (
    <div className={cn(
      "font-inter font-bold flex items-center",
      size === "sm" && "text-lg",
      size === "md" && "text-xl",
      size === "lg" && "text-2xl",
      size === "icon" && "text-base",
      className
    )}>
      <div className={cn(
        "h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mr-2",
        iconOnly && "mr-0"
      )}>
        C
      </div>
      {!iconOnly && <span>Crimson<span className="text-primary">Coin</span></span>}
    </div>
  );
};

export default Logo;
