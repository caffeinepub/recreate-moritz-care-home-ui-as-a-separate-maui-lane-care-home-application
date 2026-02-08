import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../../hooks/useQueries';
import { useHealthCheck } from '../../hooks/useHealthCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, AlertCircle, User } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';

interface ProfileBootstrapGateProps {
  children: React.ReactNode;
}

export function ProfileBootstrapGate({ children }: ProfileBootstrapGateProps) {
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError, refetch: refetchProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const healthCheck = useHealthCheck(false);
  const [name, setName] = useState('');
  const [hasBootstrapped, setHasBootstrapped] = useState(false);

  // Once profile is loaded successfully (not null), latch the bootstrap state
  useEffect(() => {
    if (isFetched && userProfile !== null && !hasBootstrapped) {
      setHasBootstrapped(true);
    }
  }, [isFetched, userProfile, hasBootstrapped]);

  // If we've already bootstrapped once, don't show the gate again
  if (hasBootstrapped) {
    return <>{children}</>;
  }

  // Show loading state while fetching profile
  if (profileLoading || !isFetched) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Loading Profile</CardTitle>
              <CardDescription>
                Please wait while we load your user profile...
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show error state if profile fetch failed
  if (profileError) {
    const handleRetry = async () => {
      // First, re-check backend health
      const healthResult = await healthCheck.refetch();
      
      if (healthResult.isSuccess) {
        // Backend is reachable, retry profile fetch
        refetchProfile();
      } else {
        toast.error('Backend is still unreachable. Please wait and try again.');
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Profile Loading Failed</CardTitle>
              <CardDescription>
                Unable to load your user profile. This may be a temporary connection issue.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {profileError?.message || 'Failed to load user profile. Please try again.'}
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleRetry}
              className="w-full"
              size="lg"
              disabled={healthCheck.isFetching}
            >
              {healthCheck.isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Connection...
                </>
              ) : (
                'Retry'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show profile setup if user has no profile
  if (userProfile === null) {
    const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!name.trim()) {
        toast.error('Please enter your name');
        return;
      }

      try {
        await saveProfile.mutateAsync({ name: name.trim() });
        toast.success('Profile created successfully!');
        // Profile will be refetched automatically, triggering hasBootstrapped
      } catch (error: any) {
        toast.error(error?.message || 'Failed to save profile. Please try again.');
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
              <CardDescription>
                Please enter your name to complete your profile setup
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saveProfile.isPending}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={saveProfile.isPending || !name.trim()}
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Profile loaded successfully, render children
  return <>{children}</>;
}
