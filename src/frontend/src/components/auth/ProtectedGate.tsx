import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';
import { BRAND } from '../../lib/brand';
import { BrandLogo } from '../brand/BrandLogo';
import { BackendReachabilityGate } from '../startup/BackendReachabilityGate';
import { ProfileBootstrapGate } from '../startup/ProfileBootstrapGate';

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
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <BrandLogo size="lg" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">{BRAND.name}</CardTitle>
              <CardDescription>Please sign in to access the application</CardDescription>
            </div>
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

  // After authentication, gate on backend reachability and profile bootstrap
  return (
    <BackendReachabilityGate>
      <ProfileBootstrapGate>
        {children}
      </ProfileBootstrapGate>
    </BackendReachabilityGate>
  );
}
