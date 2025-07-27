import { User } from '@/lib/auth';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ user, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name || user.email}
        className={`rounded-full ${sizeClasses[size]}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium ${sizeClasses[size]}`}
    >
      {initials}
    </div>
  );
} 