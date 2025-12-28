import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface UserAvatarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  // Get user's initials from name or email
  const getInitials = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      {user?.image && <AvatarImage src={user.image} alt={user?.name || user?.email || 'User'} />}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
