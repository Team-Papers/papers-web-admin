import { cn } from '@/lib/utils/cn';

const variants = {
  success: 'bg-success-container text-success-dark',
  warning: 'bg-warning-container text-warning-dark',
  error: 'bg-error-container text-error-dark',
  info: 'bg-info-container text-info-dark',
  neutral: 'bg-surface-container text-on-surface-variant',
} as const;

interface BadgeProps {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
