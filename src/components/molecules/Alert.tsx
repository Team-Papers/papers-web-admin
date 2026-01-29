import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const config = {
  success: { icon: CheckCircle, bg: 'bg-green-50 border-green-200 text-green-800' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  error: { icon: AlertCircle, bg: 'bg-red-50 border-red-200 text-red-800' },
  info: { icon: Info, bg: 'bg-blue-50 border-blue-200 text-blue-800' },
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
