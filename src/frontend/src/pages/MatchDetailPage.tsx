import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetUserProfile, useIsBlocked, useBlockUser, useUnblockUser } from '@/hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, MapPin, ArrowLeft, Shield, ShieldOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Principal } from '@icp-sdk/core/principal';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function MatchDetailPage() {
  const { matchId } = useParams({ from: '/layout/matches/$matchId' });
  const navigate = useNavigate();
  
  const matchPrincipal = Principal.fromText(matchId);
  const { data: profile, isLoading } = useGetUserProfile(matchPrincipal);
  const { data: isBlocked, isLoading: isBlockedLoading } = useIsBlocked(matchPrincipal);
  const { mutate: blockUser, isPending: isBlocking } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();

  const handleBlock = () => {
    blockUser(matchPrincipal, {
      onSuccess: () => {
        toast.success('User blocked');
      },
      onError: () => {
        toast.error('Failed to block user');
      }
    });
  };

  const handleUnblock = () => {
    unblockUser(matchPrincipal, {
      onSuccess: () => {
        toast.success('User unblocked');
      },
      onError: () => {
        toast.error('Failed to unblock user');
      }
    });
  };

  if (isLoading || isBlockedLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <Skeleton className="w-full aspect-[3/4] rounded-2xl mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-2xl py-8">
        <p className="text-center text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const initials = profile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container max-w-2xl py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate({ to: '/matches' })}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Matches
      </Button>

      <Card className="overflow-hidden">
        {profile.photos && profile.photos.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {profile.photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-[3/4] bg-muted">
                    <img
                      src={photo}
                      alt={`${profile.displayName} - Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {profile.photos.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="aspect-[3/4] bg-muted flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <CardContent className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {profile.displayName}, {Number(profile.age)}
            </h1>
            {profile.locationText && (
              <div className="flex items-center text-muted-foreground mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                {profile.locationText}
              </div>
            )}
            <div className="flex gap-2">
              <Badge variant="secondary">{profile.gender}</Badge>
            </div>
          </div>

          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          <div className="space-y-3">
            {!isBlocked ? (
              <>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate({ to: '/chat/$matchId', params: { matchId } })}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Send Message
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="lg" className="w-full" disabled={isBlocking}>
                      <Shield className="h-5 w-5 mr-2" />
                      Block User
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Block this user?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You won't be able to see each other's profiles or send messages. This action can be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBlock}>Block</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    You have blocked this user. You cannot send messages while they are blocked.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleUnblock}
                  disabled={isUnblocking}
                >
                  <ShieldOff className="h-5 w-5 mr-2" />
                  Unblock User
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
