import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
// import { useApp } from "@/contexts/AppContext"; // Removed unused import
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CounterProps {
  value: number;
  duration?: number;
}

const AnimatedCounter = ({ value, duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min(value, 5000);
    const incrementTime = duration / end;
    let timer: NodeJS.Timeout;

    // Reset count on 0
    if (value === 0) {
      setCount(0);
    }

    // Handle count animation
    if (start === end) return;

    const step = () => {
      start = start + 1;
      setCount(start);
      if (start < end) {
        timer = setTimeout(step, incrementTime);
      }
    };

    timer = setTimeout(step, incrementTime);

    return () => clearTimeout(timer);
  }, [value, duration]);

  return <span className="font-bold">{count.toLocaleString()}</span>;
};

const PromotionBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-primary/80 to-accent p-3 md:p-4 rounded-lg text-white shadow-medium flex items-center gap-3 md:gap-4 animate-fade-in border border-accent/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50"></div>
      <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-white/20 flex items-center justify-center relative z-10 flex-shrink-0">
        <img
          src="https://picsum.photos/seed/sportslogo/200"
          alt="Sports Team"
          className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover"
        />
      </div>
      <div className="relative z-10">
        <h3 className="text-sm md:text-lg font-bold">{t("hero.officialPartner")}</h3>
        <p className="text-xs md:text-sm opacity-90">{t("hero.cryptoGamingPartner")}</p>
      </div>
    </div>
  );
};

const SignupOffer = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-card p-3 md:p-6 rounded-lg shadow-soft w-full flex flex-col items-start animate-fade-in border border-border/40 relative overflow-hidden">
      <div className="absolute inset-0 rounded-lg border border-primary/20 opacity-60 pointer-events-none"></div>
      <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-radial from-primary/30 to-transparent rounded-full filter blur-xl"></div>

      <span className="text-xs md:text-sm font-medium text-primary">
        {t("hero.newPlayersOffer")}
      </span>
      <h2 className="text-lg md:text-3xl font-bold mt-1 mb-2 md:mb-4 leading-tight">{t("hero.getBonusText")}</h2>

      <div className="flex flex-col gap-2 md:gap-3 w-full mb-3 md:mb-6">
        <div className="flex items-center justify-between p-2 md:p-3 bg-muted/70 rounded-lg border border-border/30">
          <span className="text-xs md:text-sm">{t("hero.playersOnline")}</span>
          <span className="font-bold text-sm md:text-lg">
            <AnimatedCounter value={1458} />
          </span>
        </div>
        <div className="flex items-center justify-between p-2 md:p-3 bg-muted/70 rounded-lg border border-border/30">
          <span className="text-xs md:text-sm">{t("hero.totalWinningsToday")}</span>
          <span className="font-bold text-sm md:text-lg">
            MYR <AnimatedCounter value={2483945} />
          </span>
        </div>
      </div>

      <Button className="gradient-button hover-scale w-full relative text-sm md:text-base h-10 md:h-12">
        <span className="relative z-10 flex items-center justify-center">
          {t("common.joinNow")}
          <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
        </span>
      </Button>
    </div>
  );
};

const HeroSection = () => {
  const { t } = useTranslation();
  // 引用主hero容器
  const heroRef = useRef<HTMLDivElement>(null);

  // 处理图片预加载
  useEffect(() => {
    // 预加载硬币图片
    const preloadImages = () => {
      const images = ["/bitcoin-btc-logo.svg", "/ethereum-eth-logo.svg"];

      images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    preloadImages();
  }, []);

  return (
    <section className="w-full mb-8 md:mb-10 relative overflow-x-hidden" ref={heroRef}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="relative overflow-x-hidden overflow-y-visible md:overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg h-[260px] md:h-80 lg:h-96 flex items-center shadow-medium border border-border/20 will-change-transform">
            <div className="absolute inset-0">
              <img
                src="/herobg.webp"
                alt="Hero background"
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-black/60"></div>
            </div>
            {/* 确保背景渐变层次正确 */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"
              style={{ zIndex: 1 }}
            ></div>

            {/* 调整模糊圆形的z-index，添加will-change提升性能 - 移动端缩小 */}
            <div
              className="absolute -top-6 -right-6 md:-top-20 md:-right-20 w-20 h-20 md:w-40 md:h-40 bg-primary/10 rounded-full filter blur-xl will-change-transform"
              style={{ zIndex: 2 }}
            ></div>
            <div
              className="absolute -bottom-4 -left-4 md:-bottom-10 md:-left-10 w-16 h-16 md:w-32 md:h-32 bg-accent/10 rounded-full filter blur-xl will-change-transform"
              style={{ zIndex: 2 }}
            ></div>

            {/* 添加Lumi人物图片 - 移动端和桌面端都显示，但大小和位置不同 */}
            <div
              className="absolute right-0 bottom-0 h-[200px] md:bottom-[-30%] md:h-full md:max-h-96 opacity-70 md:opacity-90"
              style={{ zIndex: 3 }}
            >
              <img
                src="/lumi3.webp"
                alt="Lumi Character"
                className="h-full object-contain object-bottom scale-90 md:scale-150"
                loading="eager"
                style={{
                  transformOrigin: "bottom right",
                }}
              />
            </div>

            {/* 内容层，确保最高层级 */}
            <div
              className="relative px-4 md:px-6 lg:px-10 py-6 md:py-8 w-full md:max-w-2xl"
              style={{ zIndex: 5 }}
            >
              <div className="max-w-[60%] md:max-w-full">
                <span className="inline-block bg-primary text-white px-2 md:px-3 py-1 text-xs rounded-full mb-3 md:mb-4 uppercase font-medium animate-pulse">
                  {t("hero.newPlayers")}
                </span>
                <h1 className="text-xl md:text-3xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
                  {t("hero.playWithCrypto")}
                </h1>
                <p className="text-xs md:text-sm lg:text-base text-gray-200 mb-4 md:mb-6">
                  {t("hero.joinDescription")}
                </p>
                <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4">
                  <Button className="gradient-button hover-scale text-sm md:text-base lg:text-lg px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 relative">
                    <span className="relative z-10">{t("common.playNow")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-sm md:text-base lg:text-lg px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 relative overflow-hidden"
                  >
                    <span className="relative z-10">{t("common.learnMore")}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 hover:opacity-100 transition-opacity"></div>
                  </Button>
                </div>
              </div>
            </div>

            {/* 浮动硬币也需要适当的z-index - 移动端隐藏避免溢出 */}
            <div
              className="hidden md:block absolute -bottom-4 -right-4 h-32 w-32 opacity-40 rotate-12"
              style={{ zIndex: 4 }}
            >
              <img
                src="/bitcoin-btc-logo.svg"
                alt="Bitcoin"
                className="h-full w-full"
                loading="eager"
                width="128"
                height="128"
              />
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full filter blur-xl -z-10"></div>
            </div>
            <div
              className="hidden md:block absolute top-10 right-10 h-16 w-16 opacity-30 rotate-12"
              style={{ zIndex: 4 }}
            >
              <img
                src="/ethereum-eth-logo.svg"
                alt="Ethereum"
                className="h-full w-full"
                loading="eager"
                width="64"
                height="64"
              />
              <div className="absolute inset-0 bg-blue-400/20 rounded-full filter blur-xl -z-10"></div>
            </div>
          </div>

          <PromotionBanner />
        </div>

        <div>
          <SignupOffer />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
