import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  // 处理滚动条问题
  useEffect(() => {
    // 确保滚动条保持可见
    if (isOpen) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    // 添加直接的CSS覆盖，确保滚动条不会消失
    const styleEl = document.createElement("style");
    styleEl.id = "language-switcher-scrollbar-fix";
    styleEl.textContent = `
      body {
        overflow: auto !important;
        padding-right: 0 !important;
        overscroll-behavior: auto !important;
      }
    `;

    document.head.appendChild(styleEl);

    return () => {
      if (document.getElementById("language-switcher-scrollbar-fix")) {
        document.getElementById("language-switcher-scrollbar-fix")?.remove();
      }
    };
  }, [isOpen]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  // 阻止点击事件传播
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 p-0 rounded-full"
          aria-label="Language"
          onClick={(_e) => {
            // 点击触发器时确保滚动条保持可见
            document.body.style.overflow = "auto";
            document.body.style.paddingRight = "0";
          }}
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={stopPropagation}
        data-no-scroll-impact="true"
        className="bg-card border border-gray-700"
      >
        <DropdownMenuItem
          className={currentLanguage === "en" ? "bg-muted" : ""}
          onClick={() => changeLanguage("en")}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          className={currentLanguage === "zh" ? "bg-muted" : ""}
          onClick={() => changeLanguage("zh")}
        >
          中文
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
