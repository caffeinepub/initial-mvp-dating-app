import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function MatchesEmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 rounded-2xl overflow-hidden max-w-md">
        <img
          src="/assets/generated/empty-matches.dim_1200x800.png"
          alt="No matches yet"
          className="w-full h-auto"
        />
      </div>
      <h2 className="text-2xl font-bold mb-2">No Matches Yet</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start liking profiles to make your first match! When someone likes you back, they'll appear here.
      </p>
      <Button onClick={() => navigate({ to: '/' })} size="lg">
        <Heart className="h-4 w-4 mr-2" />
        Start Discovering
      </Button>
    </div>
  );
}
