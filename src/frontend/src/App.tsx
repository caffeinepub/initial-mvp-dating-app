import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, Navigate } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppLayout from './components/AppLayout';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import MatchDetailPage from './pages/MatchDetailPage';
import ChatPage from './pages/ChatPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import AdminPage from './pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false
    }
  }
});

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (showProfileSetup) {
    return <Navigate to="/profile" search={{ onboarding: 'true' }} />;
  }

  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RootComponent />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthPage
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: AppLayout
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: DiscoverPage
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/profile',
  component: ProfilePage
});

const matchesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/matches',
  component: MatchesPage
});

const matchDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/matches/$matchId',
  component: MatchDetailPage
});

const chatRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/chat/$matchId',
  component: ChatPage
});

const paymentMethodsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/payment-methods',
  component: PaymentMethodsPage
});

const adminRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/admin',
  component: AdminPage
});

const routeTree = rootRoute.addChildren([
  authRoute,
  layoutRoute.addChildren([
    indexRoute,
    profileRoute,
    matchesRoute,
    matchDetailRoute,
    chatRoute,
    paymentMethodsRoute,
    adminRoute
  ])
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
