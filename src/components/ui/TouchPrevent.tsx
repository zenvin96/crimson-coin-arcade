import { useEffect } from "react";

/**
 * 此组件用于防止移动设备上的双击缩放行为
 */
const TouchPrevent = () => {
  useEffect(() => {
    // 防止双击缩放
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    // 防止双指缩放
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    // 阻止默认的双击行为
    const handleDoubleTap = (event: Event) => {
      event.preventDefault();
    };

    // 添加事件监听器
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("dblclick", handleDoubleTap, {
      passive: false,
    });

    // 清理函数
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("dblclick", handleDoubleTap);
    };
  }, []);

  return null; // 不渲染任何UI元素
};

export default TouchPrevent;
