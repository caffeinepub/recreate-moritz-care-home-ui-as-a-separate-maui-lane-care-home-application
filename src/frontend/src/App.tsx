import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedGate } from './components/auth/ProtectedGate';
import { MauiAppShell } from './components/maui/MauiAppShell';
import { Dashboard } from './pages/maui/Dashboard';
import { MoritzReferenceCapture } from './pages/references/MoritzReferenceCapture';
import { ResidentProfile } from './pages/maui/residents/ResidentProfile';
import { Toaster } from './components/ui/sonner';

// Configure QueryClient with reduced automatic refetching to prevent
// startup gates from re-triggering during navigation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable automatic refetching on window focus/reconnect by default
      // Individual queries can override this if needed
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Keep queries in cache longer to avoid unnecessary refetches
      staleTime: 30_000, // 30 seconds
      gcTime: 300_000, // 5 minutes
    },
  },
});

const rootRoute = createRootRoute({
  component: MauiAppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const moritzReferenceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/moritz-reference',
  component: MoritzReferenceCapture,
});

const residentProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resident/$residentId',
  component: ResidentProfile,
});

const routeTree = rootRoute.addChildren([indexRoute, moritzReferenceRoute, residentProfileRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProtectedGate>
        <RouterProvider router={router} />
        <Toaster />
      </ProtectedGate>
    </QueryClientProvider>
  );
}

export default App;
