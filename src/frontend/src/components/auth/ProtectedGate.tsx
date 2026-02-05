import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';
import { BRAND } from '../../lib/brand';

interface ProtectedGateProps {
  children: React.ReactNode;
}

export function ProtectedGate({ children }: ProtectedGateProps) {
  const { identity, login, loginStatus, isInitializing, isLoggingIn } = useInternetIdentity();

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!identity) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <img
                src={BRAND.logo.path}
                alt={BRAND.logo.alt}
                className="h-24 w-24 object-contain"
              />
            </div>
            <CardTitle className="text-2xl">Welcome to {BRAND.name}</CardTitle>
            <CardDescription>Please sign in to access the application</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            {loginStatus === 'loginError' && (
              <p className="mt-4 text-center text-sm text-destructive">
                Sign in failed. Please try again.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render authenticated content
  return <>{children}</>;
}
