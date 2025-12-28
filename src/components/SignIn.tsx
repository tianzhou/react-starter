import AuthLayout from './AuthLayout';

export default function SignIn() {
  return (
    <AuthLayout
      mode="signin"
      title="Welcome Back"
      description="Sign in to your account to continue"
    />
  );
}
