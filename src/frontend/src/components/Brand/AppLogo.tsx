import { Heart } from 'lucide-react';

export default function AppLogo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Heart className="h-8 w-8 text-primary fill-primary" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
        Spark
      </span>
    </div>
  );
}
