import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
  id: number;
  title: string;
  subtitle?: string;
  price?: string;
  bgColor: string;
  category: string;
  image: string;
}

interface GameCarouselProps {
  items: CarouselItem[];
}

const GameCarousel = ({ items }: GameCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % items.length);
  };

  return (
    <div className="relative">
      {/* 轮播容器 */}
      <div className="overflow-hidden rounded-lg relative">
        {/* 轮播幻灯片容器 - 使用flex和translateX实现滑动效果 */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {items.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0">
              <div
                className={`${item.bgColor} p-6 h-32 md:h-40 rounded-lg relative flex items-center`}
              >
                <div className="absolute top-2 right-2 bg-black/30 rounded-full px-2 py-1 text-xs text-white">
                  {item.category}
                </div>
                <div className="text-white z-10">
                  {item.price && (
                    <div className="text-2xl md:text-4xl font-bold mb-1">
                      {item.price}
                    </div>
                  )}
                  {item.subtitle && (
                    <div className="text-xl md:text-3xl font-bold mb-1">
                      {item.subtitle}
                    </div>
                  )}
                  <div className="text-lg md:text-2xl font-semibold">
                    {item.title}
                  </div>
                </div>
                {/* 这里可以使用实际图片，但目前使用占位符 */}
                <div className="absolute right-0 bottom-0 opacity-80">
                  <div className="w-32 h-32 bg-white/10 rounded-full -mb-10 -mr-10"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 左右箭头控制 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50"
          onClick={goToPrevSlide}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50"
          onClick={goToNextSlide}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 导航点 */}
      <div className="flex justify-center mt-4 gap-2">
        {items.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-2 h-2 p-0 rounded-full ${
              index === currentSlide ? "bg-primary" : "bg-muted"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameCarousel;
