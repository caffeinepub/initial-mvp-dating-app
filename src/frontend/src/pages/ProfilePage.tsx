import { useGetCallerUserProfile } from '@/hooks/useQueries';
import ProfileForm from '@/components/Profile/ProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useSearch } from '@tanstack/react-router';

export default function ProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const search = useSearch({ from: '/layout/profile' }) as { onboarding?: string };
  
  const isOnboarding = search.onboarding === 'true';

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>{isOnboarding ? 'Create Your Profile' : 'Edit Profile'}</CardTitle>
          <CardDescription>
            {isOnboarding
              ? 'Tell us about yourself to get started'
              : 'Update your profile information and photos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm 
            existingProfile={userProfile || undefined} 
            isOnboarding={isOnboarding}
            onSuccess={() => {
              if (isOnboarding) {
                navigate({ to: '/' });
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
