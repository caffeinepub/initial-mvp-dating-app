import { Link } from '@tanstack/react-router';
import AppLogo from '../Brand/AppLogo';
import AccountMenu from '../Auth/AccountMenu';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <AppLogo />
        </Link>
        <AccountMenu />
      </div>
    </header>
  );
}
