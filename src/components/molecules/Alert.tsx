import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const config = {
  success: { icon: CheckCircle, bg: 'bg-success-container border-success text-success-dark' },
  warning: { icon: AlertTriangle, bg: 'bg-warning-container border-warning text-warning-dark' },
  error: { icon: AlertCircle, bg: 'bg-error-container border-error text-error-dark' },
  info: { icon: Info, bg: 'bg-info-container border-info text-info-dark' },
} as const;

interface AlertProps {
  variant: keyof typeof config;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({ variant, children, onDismiss, className }: AlertProps) {
  const { icon: Icon, bg } = config[variant];
  return (
    <div className={cn('flex items-start gap-3 rounded-md border p-4', bg, className)}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
