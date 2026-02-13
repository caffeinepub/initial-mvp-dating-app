import { Outlet } from '@tanstack/react-router';
import Header from './Navigation/Header';
import BottomNav from './Navigation/BottomNav';

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 pb-20 md:pb-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
