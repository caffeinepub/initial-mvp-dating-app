import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DiscoverEmptyStateProps {
  onRefresh: () => void;
}

export default function DiscoverEmptyState({ onRefresh }: DiscoverEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6 rounded-2xl overflow-hidden max-w-md">
        <img
          src="/assets/generated/empty-discover.dim_1200x800.png"
          alt="No more profiles"
          className="w-full h-auto"
        />
      </div>
      <h2 className="text-2xl font-bold mb-2">No More Profiles</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        You've seen all available profiles for now. Check back later for new matches!
      </p>
      <Button onClick={onRefresh} size="lg">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
}
