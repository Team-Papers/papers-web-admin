import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  trend?: { value: number; label: string };
}

export function StatCard({ title, value, icon, color = 'text-primary-400', trend }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn('mt-1 text-sm', trend.value >= 0 ? 'text-success' : 'text-error')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg bg-gray-50 p-3', color)}>{icon}</div>
      </div>
    </div>
  );
}
