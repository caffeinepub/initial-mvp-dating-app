import { Link, useRouterState } from '@tanstack/react-router';
import { Heart, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const navItems = [
    { path: '/', icon: Heart, label: 'Discover' },
    { path: '/matches', icon: MessageCircle, label: 'Matches' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
