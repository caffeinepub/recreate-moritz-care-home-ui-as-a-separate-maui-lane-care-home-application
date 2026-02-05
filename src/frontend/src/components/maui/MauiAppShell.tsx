import { Outlet } from '@tanstack/react-router';
import { MauiNav } from './MauiNav';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

export function MauiAppShell() {
  const { clear, identity } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="no-print sticky top-0 z-50 border-b bg-card shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/maui-lane-logo-v2.dim_512x512.png"
              alt="Maui Lane Care Home"
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-xl font-semibold text-foreground">Maui Lane Care Home</h1>
          </div>
          <div className="flex items-center gap-4">
            {identity && (
              <Button variant="ghost" size="sm" onClick={clear}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="no-print">
        <MauiNav />
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="no-print border-t bg-card py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with love using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
