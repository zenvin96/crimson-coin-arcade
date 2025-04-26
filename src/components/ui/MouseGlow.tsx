import { useState, useEffect, CSSProperties } from "react";
import { createPortal } from "react-dom";

const MouseGlow = () => {
  // 使用 state 管理光标位置而不是 ref
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  // 追踪组件是否已挂载，避免服务器端渲染问题
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 标记组件已挂载
    setIsMounted(true);

    // 更直接的鼠标事件处理函数
    const handleMouseMove = (e: MouseEvent) => {
      // 立即更新位置，不使用函数式更新以确保最快的响应
      setMousePosition({ x: e.clientX, y: e.clientY });

      // 确保光晕在鼠标移动后可见
      if (!isVisible) {
        setIsVisible(true);
      }
    };

    // 直接在 window 上监听，确保捕获所有鼠标移动
    window.addEventListener("mousemove", handleMouseMove);

    // 打印日志确认事件监听已设置
    console.log("Mouse glow effect activated");

    // 清理函数
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isVisible]); // 仅在 isVisible 变化时重新设置

  // 更小、更微妙的光晕效果
  const glowSize = 200; // 原来是400px，缩小50%
  const glowStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: `${glowSize}px`, // 缩小尺寸
    height: `${glowSize}px`,
    borderRadius: "50%",
    pointerEvents: "none",
    // 使用更微妙的粉色渐变
    background:
      "radial-gradient(circle, rgba(255, 0, 128, 0.2) 0%, rgba(255, 0, 128, 0.1) 40%, transparent 70%)",
    filter: "blur(30px)", // 减小模糊半径
    // 应用准确的位置，中心对准鼠标
    transform: `translate(${mousePosition.x - glowSize / 2}px, ${
      mousePosition.y - glowSize / 2
    }px)`,
    // 使效果位于所有内容之上
    zIndex: 99999,
    opacity: isVisible ? 1 : 0,
    mixBlendMode: "screen", // 使颜色更鲜明
  };

  // 只在客户端渲染，并使用 Portal 直接渲染到 body
  if (typeof window === "undefined" || !isMounted) {
    return null; // 服务器端或未挂载时不渲染
  }

  // 使用 Portal 将组件渲染到 body 的最外层
  return createPortal(
    <div style={glowStyle} id="mouse-glow-effect" />,
    document.body
  );
};

export default MouseGlow;
