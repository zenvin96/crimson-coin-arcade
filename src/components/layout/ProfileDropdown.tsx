import {
  Home,
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
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { forwardRef, useState, useEffect } from "react";

interface ProfileDropdownProps {
  avatar?: string;
  username?: string;
}

// 创建一个完全自定义的下拉菜单实现
const ProfileDropdown = ({
  avatar,
  username = "User",
}: ProfileDropdownProps) => {
  const [open, setOpen] = useState(false);

  // 每次状态改变时确保滚动条可见
  useEffect(() => {
    if (open) {
      // 确保在下拉菜单打开时不影响body的滚动
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    // 添加一个直接的CSS覆盖，确保滚动条不会消失
    const styleEl = document.createElement("style");
    styleEl.id = "dropdown-scrollbar-fix";
    styleEl.textContent = `
      body {
        overflow: auto !important;
        padding-right: 0 !important;
        overscroll-behavior: auto !important;
      }
    `;

    document.head.appendChild(styleEl);

    return () => {
      if (document.getElementById("dropdown-scrollbar-fix")) {
        document.getElementById("dropdown-scrollbar-fix")?.remove();
      }
    };
  }, [open]);

  // 阻止点击传播，避免影响body
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative">
      {/* 触发器 */}
      <div
        className="h-12 w-12 rounded-full flex items-center justify-center text-white cursor-pointer border-2 border-pink-500"
        onClick={() => setOpen(!open)}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="h-full w-full object-cover rounded-full"
          />
        ) : (
          <User className="h-5 w-5" />
        )}
      </div>

      {/* 下拉菜单内容 */}
      {open && (
        <>
          {/* 背景遮罩，只处理点击事件不阻止滚动 */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* 菜单内容 */}
          <div
            className="absolute right-0 top-full mt-2 w-56 z-50 bg-[#1a1b1d] text-gray-200 border border-gray-800 rounded-md shadow-xl py-1.5 px-1"
            onClick={stopPropagation}
          >
            {/* 菜单项 */}
            <MenuItem
              icon={<Wallet className="h-4.5 w-4.5 text-gray-400" />}
              label="Wallet"
            />
            <MenuItem
              icon={<ArrowDown className="h-4.5 w-4.5 text-gray-400" />}
              label="Withdraw"
            />
            <MenuItem
              icon={<BarChart3 className="h-4.5 w-4.5 text-gray-400" />}
              label="Transactions"
            />
            <MenuItem
              icon={<Clock className="h-4.5 w-4.5 text-gray-400" />}
              label="Bet History"
            />
            <MenuItem
              icon={<PieChart className="h-4.5 w-4.5 text-gray-400" />}
              label="Rollover Overview"
            />
            <MenuItem
              icon={<Crown className="h-4.5 w-4.5 text-gray-400" />}
              label="VIP Club"
            />
            <MenuItem
              icon={<Lock className="h-4.5 w-4.5 text-gray-400" />}
              label="Vault Pro"
            />
            <MenuItem
              icon={<BarChart3 className="h-4.5 w-4.5 text-gray-400" />}
              label="Affiliate"
            />
            <MenuItem
              icon={<User className="h-4.5 w-4.5 text-gray-400" />}
              label="My Profile"
            />
            <MenuItem
              icon={<Settings className="h-4.5 w-4.5 text-gray-400" />}
              label="Global Settings"
            />
            <MenuItem
              icon={<LogOut className="h-4.5 w-4.5 text-gray-400" />}
              label="Log Out"
            />
          </div>
        </>
      )}
    </div>
  );
};

// 辅助组件：菜单项
const MenuItem = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center gap-3 px-3.5 py-2 hover:bg-gray-800/50 rounded-md cursor-pointer">
    {icon}
    <span className="text-sm">{label}</span>
  </div>
);

export default ProfileDropdown;
