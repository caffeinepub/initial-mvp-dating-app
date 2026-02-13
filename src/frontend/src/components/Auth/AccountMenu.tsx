import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '@/hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, CreditCard, LogOut, Shield } from 'lucide-react';

export default function AccountMenu() {
  const navigate = useNavigate();
  const { clear } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/auth' });
  };

  const displayName = profile?.displayName || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = profile?.photos?.[0] 
    ? `/assets/generated/${profile.photos[0]}`
    : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.age ? `${profile.age} years old` : 'Profile'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
          <User className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: '/payment-methods' })}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Payment Methods</span>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
