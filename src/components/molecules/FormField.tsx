import { Input } from '@/components/atoms/Input';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function FormField({ label, error, ...props }: FormFieldProps) {
  return <Input label={label} error={error} {...props} />;
}
