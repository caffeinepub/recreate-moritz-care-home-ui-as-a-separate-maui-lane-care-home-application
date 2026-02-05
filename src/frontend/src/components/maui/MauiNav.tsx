import { Link, useRouterState } from '@tanstack/react-router';
import { Home, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MauiNav() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/moritz-reference', label: 'Reference Capture', icon: FileText },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <ul className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
