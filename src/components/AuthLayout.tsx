import { Github } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import GoogleIcon from './GoogleIcon';

interface AuthLayoutProps {
  mode: 'signin' | 'signup';
  title: string;
  description: string;
}

export default function AuthLayout({ mode, title, description }: AuthLayoutProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasNumber;

  const handleGoogleAuth = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  const handleGithubAuth = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/',
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordField && email) {
      setShowPasswordField(true);
      return;
    }
    handleEmailAuth();
  };

  const handleEmailAuth = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Use email username as default name since we don't collect it separately
        const defaultName = email.split('@')[0];
        const result = await authClient.signUp.email({
          email,
          password,
          name: defaultName,
          callbackURL: '/',
        });

        // Check if signup was successful
        if (result.error) {
          setError(result.error.message || 'Signup failed');
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL: '/',
        });

        // Check if signin was successful
        if (result.error) {
          setError(result.error.message || 'Sign in failed');
          return;
        }
      }

      // Only navigate if no errors
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    setShowPasswordField(false);
    setPassword('');
  };

  const switchLink = mode === 'signin'
    ? { to: '/signup', text: "Don't have an account?", action: 'Create your account' }
    : { to: '/signin', text: 'Already have an account?', action: 'Log in' };

  return (
    <div className="flex flex-1 items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleAuth}
            variant="outline"
            className="w-full flex items-center justify-center"
            size="lg"
          >
            <GoogleIcon />
            <span className="ml-3">Continue with Google</span>
          </Button>

          <Button
            onClick={handleGithubAuth}
            variant="outline"
            className="w-full flex items-center justify-center"
            size="lg"
          >
            <Github size={20} />
            <span className="ml-3">Continue with GitHub</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                OR
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {!showPasswordField ? (
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              ) : (
                <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2">
                  <span className="text-sm">{email}</span>
                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="text-sm text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {showPasswordField && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                {mode === 'signup' && (!hasMinLength || !hasNumber) && (
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-1">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {!hasMinLength && <li>at least 8 characters</li>}
                      {!hasNumber && <li>a number (0-9)</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || (mode === 'signup' && showPasswordField && !isPasswordValid)}
            >
              {loading ? 'Loading...' : showPasswordField ? (mode === 'signin' ? 'Log in' : 'Create your account') : 'Continue'}
            </Button>
          </form>

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
