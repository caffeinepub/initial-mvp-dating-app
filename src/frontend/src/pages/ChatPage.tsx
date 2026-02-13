import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetUserProfile, useGetMessages, useIsBlocked } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Principal } from '@icp-sdk/core/principal';
import MessageList from '@/components/Chat/MessageList';
import MessageComposer from '@/components/Chat/MessageComposer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ChatPage() {
  const { matchId } = useParams({ from: '/layout/chat/$matchId' });
  const navigate = useNavigate();
  
  const matchPrincipal = Principal.fromText(matchId);
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(matchPrincipal);
  const { data: messages, isLoading: messagesLoading } = useGetMessages(matchPrincipal);
  const { data: isBlocked, isLoading: isBlockedLoading } = useIsBlocked(matchPrincipal);

  if (profileLoading || messagesLoading || isBlockedLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="border-b p-4">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-2/3 ml-auto" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl py-8">
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
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="border-b p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/matches' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            {profile.photos?.[0] && <AvatarImage src={profile.photos[0]} alt={profile.displayName} />}
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{profile.displayName}</h2>
            <p className="text-xs text-muted-foreground">
              {isBlocked ? 'Blocked' : 'Active'}
            </p>
          </div>
        </div>
      </div>

      {isBlocked ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <p className="text-muted-foreground mb-4">
              You cannot send messages to this user because they are blocked.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/matches/$matchId', params: { matchId } })}
            >
              View Profile
            </Button>
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={messages || []} matchPrincipal={matchPrincipal} />
          <MessageComposer matchPrincipal={matchPrincipal} />
        </>
      )}
    </div>
  );
}
