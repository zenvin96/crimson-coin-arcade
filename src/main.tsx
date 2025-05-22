import { createRoot } from "react-dom/client";
import { AppProvider } from "./contexts/AppContext";
import App from "./App.tsx";
import "./index.css";
// 引入i18n配置
import "./i18n/i18n";

// 初始化函数，禁用Radix UI滚动锁定的布局偏移
function disableRadixScrollShift() {
  // 计算滚动条宽度并保存为CSS变量
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty(
    "--scrollbar-width",
    `${scrollbarWidth}px`
  );

  // 强制修改Radix UI滚动锁定行为
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ) {
    // 如果是Radix UI尝试添加的scroll事件监听器，则阻止它
    if (type === "scroll" && typeof listener === "function") {
      const originalListener = listener;
      listener = function (event: Event) {
        // 阻止Radix UI滚动锁定时修改margin-right
        if (document.body.hasAttribute("data-radix-scroll-lock")) {
          document.body.style.marginRight = "0px";
        }
        // @ts-expect-error Radix UI scroll lock overrides
        return originalListener(event);
      };
    }
    // @ts-expect-error Radix UI scroll lock overrides
    return originalAddEventListener.call(this, type, listener, options);
  };
}

// 在应用加载时执行初始化
if (typeof window !== "undefined") {
  disableRadixScrollShift();
}

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
