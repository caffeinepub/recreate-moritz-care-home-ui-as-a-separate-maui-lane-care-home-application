import { useState, useEffect } from 'react';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface BackendReachabilityGateProps {
  children: React.ReactNode;
}

export function BackendReachabilityGate({ children }: BackendReachabilityGateProps) {
  const healthCheck = useHealthCheck(true);
  const [hasSucceeded, setHasSucceeded] = useState(false);

  // Once health check succeeds, latch the success state
  useEffect(() => {
    if (healthCheck.status === 'reachable' && !hasSucceeded) {
      setHasSucceeded(true);
    }
  }, [healthCheck.status, hasSucceeded]);

  // If we've already succeeded once, don't show the gate again
  // (even if background refetches happen)
  if (hasSucceeded) {
    return <>{children}</>;
  }

  // Show loading state while checking backend reachability
  if (healthCheck.status === 'checking' || healthCheck.status === 'idle') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Connecting to Backend</CardTitle>
              <CardDescription>
                Please wait while we establish a connection to the backend canister...
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show error state if backend is unreachable
  if (healthCheck.status === 'unreachable') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Backend Connection Failed</CardTitle>
              <CardDescription>
                Unable to reach the backend canister. This may be temporary.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {healthCheck.error?.message || 'The backend canister is not responding. Please try again.'}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => healthCheck.refetch()}
              className="w-full"
              size="lg"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Backend is reachable, render children
  return <>{children}</>;
}
