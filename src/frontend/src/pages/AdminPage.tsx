import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useIsCallerAdmin } from '@/hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import AccessDenied from '@/components/Auth/AccessDenied';

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();
  const [copied, setCopied] = useState(false);

  const principalId = identity?.getPrincipal().toString() || '';

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(principalId);
    setCopied(true);
    toast.success('Principal ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading admin panel...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <Badge className="gap-1.5 bg-primary/20 text-primary border-primary/30">
              <Shield className="h-3.5 w-3.5" />
              Admin Access
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage administrative settings and view system information
          </p>
        </div>

        {/* Principal ID Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Your Principal ID
            </CardTitle>
            <CardDescription>
              Your unique Internet Identity principal identifier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                {principalId}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPrincipal}
                title="Copy Principal ID"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Status</CardTitle>
            <CardDescription>
              You have full administrative access to this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Super Admin</h3>
                  <p className="text-sm text-muted-foreground">
                    You have been granted super admin privileges. This gives you full access to all administrative features and settings.
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Note:</strong> Admin access was automatically granted when you first logged in as the initial user.
                </p>
                <p>
                  As an admin, you can manage all aspects of the application, including user profiles, matches, and system settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
