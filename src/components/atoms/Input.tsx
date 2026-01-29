import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-error focus:border-error focus:ring-error/20',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{rightIcon}</span>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
