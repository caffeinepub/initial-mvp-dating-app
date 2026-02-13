import LoginButton from '@/components/Auth/LoginButton';
import AppLogo from '@/components/Brand/AppLogo';
import { Heart, Sparkles, Shield } from 'lucide-react';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-primary/5 to-chart-1/10 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="relative bg-background rounded-full p-6 shadow-lg">
                <Heart className="h-16 w-16 text-primary fill-primary" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">Spark</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Find meaningful connections, one spark at a time
            </p>
          </div>
        </div>

        <div className="space-y-6 pt-8">
          <div className="grid gap-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-1">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Discover Matches</h3>
                <p className="text-sm text-muted-foreground">
                  Browse profiles and connect with people who share your interests
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-1">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Make Connections</h3>
                <p className="text-sm text-muted-foreground">
                  When you both like each other, it's a match! Start chatting right away
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="shrink-0 mt-1">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Safe & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your privacy matters. Powered by Internet Identity for secure authentication
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <LoginButton />
          </div>

          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
