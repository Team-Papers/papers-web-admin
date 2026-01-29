import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Spinner } from './Spinner';

const variants = {
  primary: 'bg-primary-400 text-white hover:bg-primary-500',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-error text-white hover:bg-red-600',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
} as const;

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
