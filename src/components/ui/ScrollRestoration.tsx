import { useEffect, useRef } from "react";

/**
 * ScrollRestoration组件
 * 用于优化页面滚动，特别是当用户向上滚动回到Hero section时的体验
 */
const ScrollRestoration = () => {
  const prevScrollY = useRef(0);

  useEffect(() => {
    // 存储初始滚动位置
    prevScrollY.current = window.scrollY;

    // 处理滚动事件
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 检测是否向上滚动且滚动到顶部附近
      if (prevScrollY.current > currentScrollY && currentScrollY < 300) {
        // 添加CSS属性以提高滚动性能
        document.body.style.willChange = "scroll-position";

        // 当接近顶部时，强制重新渲染以确保元素正确显示
        if (currentScrollY < 50) {
          // 轻微震动以强制浏览器重新计算布局
          window.requestAnimationFrame(() => {
            const scrollElement =
              document.scrollingElement || document.documentElement;
            const currentPos = scrollElement.scrollTop;
            scrollElement.scrollTop = currentPos + 1;

            window.requestAnimationFrame(() => {
              scrollElement.scrollTop = currentPos;
            });
          });
        }
      } else {
        // 不在顶部时，移除性能优化属性
        document.body.style.willChange = "auto";
      }

      // 更新上一次滚动位置
      prevScrollY.current = currentScrollY;
    };

    // 添加滚动事件监听
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 清理函数
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.willChange = "auto";
    };
  }, []);

  // 这个组件不渲染任何可见内容
  return null;
};

export default ScrollRestoration;
