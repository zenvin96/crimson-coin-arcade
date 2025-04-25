
export type Game = {
  id: string;
  title: string;
  image: string;
  category: string;
  provider: string;
  isHot?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
};

export type Winner = {
  id: string;
  username: string;
  avatar: string;
  game: {
    id: string;
    title: string;
    image: string;
  };
  amount: number;
  currency: string;
  timestamp: Date;
};

export type Category = {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
};

export type TokenPrice = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: string;
};
