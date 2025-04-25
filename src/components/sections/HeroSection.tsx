
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
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

  return (
    <span className="font-bold">
      {count.toLocaleString()}
    </span>
  );
};

const PromotionBanner = () => {
  const { currency } = useApp();
  
  return (
    <div className="bg-gradient-to-r from-primary/80 to-accent p-4 rounded-lg text-white shadow-medium flex items-center gap-4 animate-fade-in">
      <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
        <img 
          src="https://picsum.photos/seed/sportslogo/200" 
          alt="Sports Team" 
          className="h-10 w-10 rounded-full object-cover"
        />
      </div>
      <div>
        <h3 className="text-lg font-bold">Official Partner</h3>
        <p className="text-sm opacity-90">Official Crypto Gaming Partner of Team XYZ</p>
      </div>
    </div>
  );
};

const SignupOffer = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-soft w-full flex flex-col items-start animate-fade-in">
      <span className="text-sm font-medium text-primary">New Players</span>
      <h2 className="text-3xl font-bold mt-2 mb-4">Get up to <span className="text-primary">₹10,000</span> & <span className="text-primary">100 Free Spins</span></h2>
      
      <div className="flex flex-col gap-3 w-full mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-sm">Players online now</span>
          <span className="font-bold text-lg">
            <AnimatedCounter value={1458} />
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-sm">Total winnings today</span>
          <span className="font-bold text-lg">
            MYR <AnimatedCounter value={2483945} />
          </span>
        </div>
      </div>
      
      <Button size="lg" className="gradient-button hover-scale w-full">
        Join Now
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="w-full mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg h-64 md:h-80 flex items-center shadow-medium">
            {/* Background SVG Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                  <circle id="pattern-circle" cx="10" cy="10" r="2" fill="#fff"></circle>
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)"></rect>
              </svg>
            </div>
            
            <div className="relative z-10 px-6 md:px-10 py-8 max-w-2xl">
              <span className="inline-block bg-primary text-white px-3 py-1 text-xs rounded-full mb-4 uppercase font-medium animate-pulse">New Players Welcome</span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Play with Crypto, Win <span className="text-primary">Real Money</span></h1>
              <p className="text-gray-200 mb-6 max-w-lg">Join thousands of players already winning big with our selection of top crypto games. Start your journey now!</p>
              <div className="flex flex-wrap gap-4">
                <Button className="gradient-button hover-scale text-lg px-8 py-6">
                  Play Now
                </Button>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-lg px-8 py-6">
                  Learn More
                </Button>
              </div>
            </div>
            
            {/* Floating coins */}
            <div className="absolute -bottom-4 -right-4 h-32 w-32 opacity-40 rotate-12">
              <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=029" alt="Bitcoin" className="h-full w-full" />
            </div>
            <div className="absolute top-10 right-10 h-16 w-16 opacity-30 rotate-12">
              <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029" alt="Ethereum" className="h-full w-full" />
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
