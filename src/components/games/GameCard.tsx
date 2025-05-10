import { Users } from "lucide-react";

interface GameProps {
  game: {
    id: number;
    name: string;
    players: number;
    color: string;
  };
}

const GameCard = ({ game }: GameProps) => {
  return (
    <div className="flex flex-col h-40 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
      <div
        className={`flex-1 ${game.color} flex items-center justify-center p-4 relative`}
      >
        <div className="absolute top-2 right-2 bg-black/30 rounded-full px-2 py-1 text-xs text-white">
          SLOTS
        </div>
        <div className="text-white text-4xl font-bold">
          {game.name.slice(0, 1)}
        </div>
      </div>
      <div className="bg-card p-2 flex flex-col">
        <div className="text-center font-bold">{game.name}</div>
        <div className="flex items-center justify-center text-xs text-muted-foreground mt-1">
          <Users className="w-3 h-3 mr-1" />
          <span>{game.players}</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
