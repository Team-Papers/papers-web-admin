import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: {
    bg: 'bg-success-container',
    border: 'border-success/30',
    icon: 'text-success',
    title: 'text-success',
  },
  error: {
    bg: 'bg-error-container',
    border: 'border-error/30',
    icon: 'text-error',
    title: 'text-error',
  },
  warning: {
    bg: 'bg-warning-container',
    border: 'border-warning/30',
    icon: 'text-warning',
    title: 'text-warning-dark',
  },
  info: {
    bg: 'bg-info-container',
    border: 'border-info/30',
    icon: 'text-info',
    title: 'text-info',
  },
};

export function Toast({ id, type, title, message, duration = 5000, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[type];
  const style = styles[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        ${style.bg} ${style.border}
        ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${style.icon}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${style.title}`}>{title}</p>
        {message && (
          <p className="text-sm text-on-surface-variant mt-0.5">{message}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-lg text-on-surface-variant hover:bg-black/5 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
