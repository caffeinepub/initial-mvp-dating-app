import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DatingProfile } from '@/backend';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useBlockUser } from '@/hooks/useQueries';
import { toast } from 'sonner';

interface ProfileCardProps {
  profile: DatingProfile;
  onLike: () => void;
  onPass: () => void;
  isLoading?: boolean;
}

export default function ProfileCard({ profile, onLike, onPass, isLoading }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { mutate: blockUser } = useBlockUser();

  const photos = profile.photos || [];
  const currentPhoto = photos[currentPhotoIndex] || '/assets/generated/avatar-01.dim_512x512.png';

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleBlock = () => {
    blockUser(profile.id, {
      onSuccess: () => {
        toast.success('User blocked');
        onPass();
      },
      onError: () => {
        toast.error('Failed to block user');
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[3/4] bg-muted">
        <img
          src={currentPhoto}
          alt={profile.displayName}
          className="w-full h-full object-cover"
        />
        
        {photos.length > 1 && (
          <>
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all',
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                  )}
                />
              ))}
            </div>

            {currentPhotoIndex > 0 && (
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {currentPhotoIndex < photos.length - 1 && (
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </>
        )}

        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBlock} className="text-destructive">
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
          <h2 className="text-3xl font-bold mb-1">
            {profile.displayName}, {Number(profile.age)}
          </h2>
          {profile.locationText && (
            <div className="flex items-center text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {profile.locationText}
            </div>
          )}
          <div className="flex gap-2 mb-3">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {profile.gender}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {profile.bio && (
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14 rounded-full border-2"
            onClick={onPass}
            disabled={isLoading}
          >
            <X className="h-6 w-6 mr-2" />
            Pass
          </Button>
          <Button
            size="lg"
            className="flex-1 h-14 rounded-full"
            onClick={onLike}
            disabled={isLoading}
          >
            <Heart className="h-6 w-6 mr-2" />
            Like
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
