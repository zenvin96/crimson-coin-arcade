import { useEffect, useRef } from "react";

/**
 * Hook用于修复模态窗口、下拉菜单等打开时滚动条消失的问题
 */
const useScrollbarFix = () => {
  const initialLoad = useRef(true);

  useEffect(() => {
    // 创建一个MutationObserver监听DOM变化
    const observer = new MutationObserver(() => {
      // 仅当非初始加载时恢复滚动
      if (!initialLoad.current) {
        // 直接将body样式重置为始终允许滚动
        document.body.style.overflow = "auto";
        document.body.style.paddingRight = "0";
      }
    });

    // 监听body的style变化
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // 强制设置CSS样式确保滚动条始终显示
    const styleEl = document.createElement("style");
    styleEl.id = "global-scrollbar-fix";
    styleEl.innerHTML = `
      html, body {
        overflow: auto !important;
        padding-right: 0 !important;
        overscroll-behavior: auto !important;
      }
      
      [data-radix-popper-content-wrapper] {
        z-index: 9999 !important;
      }

      /* 确保在任何情况下滚动条都不会消失 */
      ::-webkit-scrollbar {
        display: block !important;
        width: 10px !important;
        height: 10px !important;
      }
    `;
    document.head.appendChild(styleEl);

    // 确保即使有元素设置了滚动锁定，也不会影响全局滚动条
    const preventScrollLock = () => {
      if (!initialLoad.current) {
        document.body.style.overflow = "auto";
        document.body.style.paddingRight = "0";
      }
    };

    // 监听交互事件来保持滚动条
    document.addEventListener("click", preventScrollLock);
    document.addEventListener("pointerdown", preventScrollLock);
    document.addEventListener("touchstart", preventScrollLock);

    // 创建一个定时器定期检查滚动状态
    const intervalId = setInterval(() => {
      if (!initialLoad.current && document.body.style.overflow === "hidden") {
        document.body.style.overflow = "auto";
        document.body.style.paddingRight = "0";
      }
    }, 100);

    // 页面完全加载后将初始加载标志设置为false
    setTimeout(() => {
      initialLoad.current = false;
    }, 500);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", preventScrollLock);
      document.removeEventListener("pointerdown", preventScrollLock);
      document.removeEventListener("touchstart", preventScrollLock);
      clearInterval(intervalId);
      if (document.getElementById("global-scrollbar-fix")) {
        document.getElementById("global-scrollbar-fix")?.remove();
      }
    };
  }, []);
};

export default useScrollbarFix;
