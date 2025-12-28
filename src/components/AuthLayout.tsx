import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

interface AuthLayoutProps {
  mode: 'signin' | 'signup';
  title: string;
  description: string;
}

export default function AuthLayout({ mode, title, description }: AuthLayoutProps) {
  const handleGithubAuth = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/',
    });
  };

  const switchLink = mode === 'signin'
    ? { to: '/signup', text: "Don't have an account?", action: 'Sign up' }
    : { to: '/signin', text: 'Already have an account?', action: 'Sign in' };

  return (
    <div className="flex flex-1 items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGithubAuth}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Github className="mr-2" size={20} />
            Continue with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Secure authentication powered by better-auth
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {switchLink.text}{' '}
            <Link to={switchLink.to} className="text-primary underline-offset-4 hover:underline">
              {switchLink.action}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
