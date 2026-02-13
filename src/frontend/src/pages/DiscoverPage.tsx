import { useState } from 'react';
import { useGetDiscoveryFeed, useLikeProfile } from '@/hooks/useQueries';
import ProfileCard from '@/components/Discover/ProfileCard';
import DiscoverEmptyState from '@/components/Discover/DiscoverEmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: profiles, isLoading, refetch } = useGetDiscoveryFeed();
  const { mutate: likeProfile, isPending: isLiking } = useLikeProfile();

  const currentProfile = profiles?.[currentIndex];

  const handleLike = () => {
    if (!currentProfile || isLiking) return;
    
    likeProfile(currentProfile.id, {
      onSuccess: (isMatch) => {
        if (isMatch) {
          // Show match notification
        }
        advanceToNext();
      }
    });
  };

  const handlePass = () => {
    advanceToNext();
  };

  const advanceToNext = () => {
    if (profiles && currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
      </div>
    );
  }

  if (!profiles || profiles.length === 0 || !currentProfile) {
    return (
      <div className="container max-w-2xl py-8">
        <DiscoverEmptyState onRefresh={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Discover</h1>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <ProfileCard
          profile={currentProfile}
          onLike={handleLike}
          onPass={handlePass}
          isLoading={isLiking}
        />

        <div className="text-center text-sm text-muted-foreground">
          {currentIndex + 1} of {profiles.length}
        </div>
      </div>
    </div>
  );
}
