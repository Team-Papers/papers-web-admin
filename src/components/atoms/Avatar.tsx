import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' };

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizeClasses[size], className)} />;
  }
  return (
    <div className={cn('flex items-center justify-center rounded-full bg-primary-100 font-medium text-primary-700', sizeClasses[size], className)}>
      {initials}
    </div>
  );
}
