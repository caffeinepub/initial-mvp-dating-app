import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from '@tanstack/react-router';
import MatchesEmptyState from '@/components/Matches/MatchesEmptyState';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MatchesPage() {
  const { data: currentProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();

  // For now, we'll show an empty state since the backend doesn't have a getMatches endpoint
  // In a real implementation, you would fetch matches from the backend
  const matches: any[] = [];
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-2xl font-bold mb-6">Matches</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="container max-w-4xl py-8">
        <MatchesEmptyState />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">Matches ({matches.length})</h1>
      <div className="grid gap-4">
        {matches.map((match) => {
          const initials = match.displayName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <Card
              key={match.id.toString()}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate({ to: '/matches/$matchId', params: { matchId: match.id.toString() } })}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {match.photos?.[0] && <AvatarImage src={match.photos[0]} alt={match.displayName} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">
                    {match.displayName}, {Number(match.age)}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {match.bio || 'No bio yet'}
                  </p>
                </div>
                <Button size="icon" variant="ghost">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
